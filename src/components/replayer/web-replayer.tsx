/**
 * <web-replayer> — Main replay component.
 *
 * Accepts compressed rrweb data, auto-decompresses, and renders
 * the session replay with optional heatmap overlay and stats panel.
 *
 * Lifecycle strategy:
 *   - processData() decompresses/parses data and sets events + needInit flag
 *   - componentDidUpdate() checks needInit flag and creates Replayer
 *   - This avoids componentDidRender's re-init-on-every-render problem
 *   - Data changes properly destroy old Replayer before creating new one
 *
 * Performance strategy:
 *   - currentTime is a plain property (NOT @State) — no re-render on time changes
 *   - requestAnimationFrame loop polls replayer.getCurrentTime()
 *   - Direct DOM updates on controls child via updateTimeDisplay() @Method
 *   - replayTimeUpdate event throttled to 250ms intervals
 */

import {
  Component,
  Prop,
  State,
  Event,
  EventEmitter,
  Watch,
  Method,
  Element,
  h,
  Host,
} from '@stencil/core';
import { Replayer, eventWithTime } from 'rrweb';
import { decompress } from '../../utils/decompress';
import { parseEvents, validateEvents, extractMetadata, isChunkedData, mergeChunkedEvents } from '../../utils/event-parser';
import { computeAnalytics } from '../../utils/analytics';
import { destroyReplayer } from '../../utils/dom-helper';
import { RrwebEvent } from '../../types/events';
import { AnalyticsData, HeatmapType } from '../../types/analytics';
import {
  ReplayReadyDetail,
  ReplayTimeUpdateDetail,
  HeatmapReadyDetail,
  StatsReadyDetail,
  DecompressErrorDetail,
  ReplayFullscreenChangeDetail,
  ReplayDblClickDetail,
} from '../../types/component-props';

@Component({
  tag: 'web-replayer',
  styleUrl: 'web-replayer.css',
  shadow: true,
})
export class WebReplayer {
  @Element() host!: HTMLElement;

  // ── Props ──
  /** Session data — accepts multiple formats:
   *  - Compressed string (LZ-String URI-safe/UTF-16/Base64, pako gzip base64)
   *  - JSON-serialized string (JSON.stringify of an event array)
   *  - Raw event array (RrwebEvent[] or any[] with timestamp+type fields)
   *  - Chunked shard array: each element has a `fcontent` string (LZ-String
   *    base64 compressed event fragment), `fevent_order`, `fevent_count`.
   *    Chunks are ordered by `fevent_order`, decompressed, merged into one
   *    event array (see mergeChunkedEvents).
   *  Auto-detection picks the optimal path: chunk arrays decompress+merge,
   *  raw arrays skip decompress+parse, JSON strings skip decompress,
   *  compressed strings go through full pipeline.
   */
  @Prop() data!: string | any[];
  /** Component width — accepts CSS values: "85%", "800px", "50vw", or bare number "800" (treated as px). */
  @Prop({ reflect: true }) width?: string;
  /** Component height — accepts CSS values: "888px", "60vh", or bare number "888" (treated as px). */
  @Prop({ reflect: true }) height?: string;
  @Prop({ reflect: true }) autoPlay = false;
  @Prop({ reflect: true }) speed = 1;
  @Prop({ reflect: true }) showControls = true;
  /** Show heatmap overlay. Default false. */
  @Prop({ reflect: true }) showHeatmap = false;
  /** Show stats panel. Default false. */
  @Prop({ reflect: true }) showStats = false;
  /** Auto-hide controls when mouse idle for a while. Default false. */
  @Prop({ reflect: true }) autoHideControls = false;
  /** Maximum scale ratio in fullscreen mode (default 1.15).
   *  Prevents small recorded pages from being blown up too large.
   *  When the contain-mode scale exceeds this ratio, the replay is
   *  capped at original size × fullscreenMaxRatio and centered in the container.
   *  Only applies in fullscreen — non-fullscreen scaling is unchanged.
   */
  @Prop({ reflect: true }) fullscreenMaxRatio = 1.15;
  @Prop() startTime = 0;
  /** Allow scripts execution in the replay iframe. Default false for security.
   *  When true, rrweb creates iframe with sandbox="allow-same-origin allow-scripts".
   *  When false, rrweb uses sandboxed iframe with only "allow-same-origin" (scripts blocked).
   *  The "Blocked script execution" console warning when unsafeAllowScripts=false is expected —
   *  rrweb rebuilds the DOM via mutations, not by executing recorded scripts.
   */
  @Prop({ reflect: true }) unsafeAllowScripts = true;
  /** Enable user interaction with the replayed UI (clicks, inputs, scrolling).
   *  Default false — replay is non-interactive for stability.
   *  When true, calls replayer.enableInteract() which sets pointer-events: auto
   *  on the replay iframe. Note: enabling interaction may cause instability
   *  (e.g., navigating away via external links). Use with caution.
   */
  @Prop({ reflect: true }) interact = false;

  // ── State ──
  @State() events: RrwebEvent[] = [];
  @State() loading = false;
  @State() error: string | null = null;
  @State() playing = false;
  @State() finished = false;
  @State() totalTime = 0;
  @State() analyticsData: AnalyticsData | null = null;
  @State() controlsVisible = true;
  @State() keyboardFocus = false;
  @State() skipInactive = true;
  @State() isFullscreen = false;

  // ── Internal (NOT @State — avoid re-render) ──
  private replayer: Replayer | null = null;
  private currentTime = 0;
  /** Flag set by processData when events change — triggers Replayer init in componentDidUpdate */
  private needInit = false;
  /** rAF polling loop id */
  private rafId: number | null = null;
  /** Mouse idle timer for auto-hiding controls */
  private mouseIdleTimer: number | null = null;
  /** Throttle timer for replayTimeUpdate event emission */
  private lastEmitTime = 0;
  private EMIT_INTERVAL = 250;
  /** Frame step duration in ms */
  private FRAME_STEP_MS = 100;
  /** Speed steps for keyboard shortcuts */
  private speedSteps = [0.5, 1, 2, 4, 8];

  /**
   * Normalize a CSS dimension value:
   *   - "85%" → "85%"
   *   - "800px" → "800px"
   *   - "50vw" → "50vw"
   *   - "800" → "800px" (bare number gets px appended)
   */
  private cssDimension(value: string | undefined): string | undefined {
    if (!value) return undefined;
    // If it already contains a CSS unit, use it as-is
    if (/^[\d.]+(%|px|vw|vh|rem|em|cm|mm|in|pt|pc|ch|vmin|vmax|fr)$/.test(value)) {
      return value;
    }
    // Bare number → append px
    if (/^[\d.]+$/.test(value)) {
      return `${value}px`;
    }
    // Anything else (e.g., "calc(...)") → use as-is
    return value;
  }
  /** ResizeObserver for replay-container dimension monitoring */
  private resizeObserver: ResizeObserver | null = null;
  /** Original viewport dimensions from rrweb meta event */
  private viewportWidth = 0;
  private viewportHeight = 0;

  // ── Events ──
  @Event({ bubbles: true, composed: true }) replayReady!: EventEmitter<ReplayReadyDetail>;
  @Event({ bubbles: true, composed: true }) replayStart!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayPause!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayFinish!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayTimeUpdate!: EventEmitter<ReplayTimeUpdateDetail>;
  @Event({ bubbles: true, composed: true }) heatmapReady!: EventEmitter<HeatmapReadyDetail>;
  @Event({ bubbles: true, composed: true }) statsReady!: EventEmitter<StatsReadyDetail>;
  @Event({ bubbles: true, composed: true }) decompressError!: EventEmitter<DecompressErrorDetail>;
  @Event({ bubbles: true, composed: true }) replayFullscreenChange!: EventEmitter<ReplayFullscreenChangeDetail>;
  /** Emitted when the replay viewport is double-clicked.
   *  Carries the current fullscreen state so listeners can react
   *  (e.g., toggle fullscreen) without a separate query. */
  @Event({ bubbles: true, composed: true }) replayDblClick!: EventEmitter<ReplayDblClickDetail>;

  // ── Watchers ──

  @Watch('data')
  onDataChange(newData: string | any[]) {
    this.processData(newData);
  }

  @Watch('speed')
  onSpeedChange(newSpeed: number) {
    if (this.replayer) {
      this.replayer.setConfig({ speed: newSpeed });
    }
  }

  @Watch('fullscreenMaxRatio')
  onFullscreenMaxRatioChange() {
    this.reScaleReplayer();
  }

  @Watch('interact')
  onInteractChange(interact: boolean) {
    // When interact prop is set externally, sync sandbox + pointer-events
    this.syncInteract(!interact);
  }

  @Watch('showHeatmap')
  onHeatmapToggle(show: boolean) {
    if (show && this.events.length > 0 && !this.analyticsData) {
      this.computeAnalytics();
    }
  }

  @Watch('showStats')
  onStatsToggle(show: boolean) {
    if (show && this.events.length > 0 && !this.analyticsData) {
      this.computeAnalytics();
    }
  }

  // ── Lifecycle ──

  componentWillLoad() {
    if (this.data) {
      this.processData(this.data);
    }
  }

  componentDidUpdate() {
    if (this.needInit && this.events.length > 0) {
      this.needInit = false;
      this.initReplayer();
    }
  }

  disconnectedCallback() {
    this.stopTimePolling();
    this.clearMouseIdleTimer();
    this.stopResizeObserver();
    destroyReplayer(this.replayer);
    this.replayer = null;
  }

  // ── Public Methods ──

  @Method()
  async play(): Promise<void> {
    if (!this.replayer) return;
    // If finished, replay from start (currentTime should already be reset to 0 by caller)
    const startTime = this.finished ? 0 : this.currentTime;
    this.replayer.play(startTime);
    this.currentTime = startTime;
    this.playing = true;
    this.finished = false;
    this.syncInteract(true);
    this.startTimePolling();
    this.updateControlsDirect(startTime, this.totalTime);
    this.replayStart.emit();
  }

  @Method()
  async pause(): Promise<void> {
    if (!this.replayer) return;
    this.replayer.pause();
    this.playing = false;
    this.syncInteract(false);
    this.stopTimePolling();
    this.replayPause.emit();
  }

  @Method()
  async seek(time: number): Promise<void> {
    if (!this.replayer) return;
    this.currentTime = time;
    if (this.playing) {
      this.replayer.play(time);
    } else {
      this.replayer.pause();
      // Use play then pause to seek while paused
      this.replayer.play(time);
      this.replayer.pause();
    }
    this.finished = false;
    this.replayTimeUpdate.emit({ currentTime: time, totalTime: this.totalTime });
    this.updateControlsDirect(time, this.totalTime);
  }

  @Method()
  async getEvents(): Promise<RrwebEvent[]> {
    return this.events;
  }

  @Method()
  async getAnalytics(): Promise<AnalyticsData | null> {
    return this.analyticsData;
  }

  /** Whether the <web-replayer> host is currently in fullscreen mode. */
  @Method()
  async getIsFullscreen(): Promise<boolean> {
    return this.isFullscreen;
  }

  // ── Private Methods ──

  /**
   * Sync interact state with playing state:
   *   - Playing → disable interact (replay must be stable, no user interaction)
   *   - Paused/Finished → enable interact (user can explore the replayed UI)
   *
   * Key insight: "interact" means VISUAL exploration (scroll, hover, CSS effects),
   * NOT executing the replayed page's JavaScript. The replayed page's JS runs in
   * a sandboxed iframe and may crash when trying to communicate with the parent
   * window (postMessage, accessing parent DOM, etc.).
   *
   * Strategy:
   *   - When enabling interact (paused/finished): set pointer-events: auto AND
   *     remove 'allow-scripts' from iframe sandbox. This allows visual interaction
   *     (scrolling, hover effects, CSS transitions) but prevents JS event handlers
   *     from firing and crashing inside the restricted sandbox.
   *   - When disabling interact (playing): set pointer-events: none AND restore
   *     'allow-scripts' to sandbox if unsafeAllowScripts is true. rrweb needs
   *     scripts during playback for canvas replay and DOM mutation processing.
   *
   * Note: Changing the sandbox attribute on an existing iframe does NOT reload it
   * in modern browsers (Chrome, Firefox, Safari). The new restrictions apply
   * immediately to the already-loaded content.
   */
  private syncInteract(playing: boolean) {
    const shouldInteract = !playing;
    if (this.interact === shouldInteract) return; // No change needed
    this.interact = shouldInteract;

    if (!this.replayer) return;

    const iframe = this.replayer.iframe as HTMLIFrameElement | null;
    if (!iframe) return;

    if (shouldInteract) {
      // Enable visual interaction + block JS execution
      this.replayer.enableInteract();
      // Remove allow-scripts from sandbox to prevent JS errors from user clicks
      // The replayed page's JS handlers are sandboxed and can't safely communicate
      // with the parent window — clicking triggers them → crash.
      // Without allow-scripts, clicks still reach the iframe for visual effects
      // (hover, scroll, CSS) but JS handlers won't execute.
      const sandbox = iframe.getAttribute('sandbox') || '';
      const safeSandbox = sandbox
        .split(' ')
        .filter(token => token !== 'allow-scripts')
        .join(' ')
        .trim();
      iframe.setAttribute('sandbox', safeSandbox || 'allow-same-origin');
    } else {
      // Disable interaction + restore JS for playback
      this.replayer.disableInteract();
      // Re-add allow-scripts if configured, so rrweb can replay canvas/mutations
      if (this.unsafeAllowScripts) {
        const sandbox = iframe.getAttribute('sandbox') || '';
        if (!sandbox.includes('allow-scripts')) {
          iframe.setAttribute('sandbox', sandbox + ' allow-scripts');
        }
      }
    }
  }

  /**
   * Process session data — auto-detects format and picks the optimal path:
   *
   *   1. Array input  → parseEvents(array)   (zero decompress/JSON.parse)
   *   2. JSON string  → JSON.parse → parseEvents  (zero decompress)
   *   3. Compressed string → decompress → parseEvents  (full pipeline)
   *
   * Quick heuristic for JSON detection:
   *   - Trimmed string starts with '[' → likely a JSON array
   *   - Compressed strings never start with '[' (LZ-String/pako produce
   *     non-JSON characters), so this check is safe and cheap.
   */
  private processData(raw: string | any[]) {
    this.loading = true;
    this.error = null;
    this.finished = false;

    // Destroy old Replayer when data changes
    this.stopTimePolling();
    destroyReplayer(this.replayer);
    this.replayer = null;

    if (!raw) {
      this.error = 'No session data provided';
      this.decompressError.emit({ error: this.error, rawInput: raw });
      this.loading = false;
      return;
    }

    try {
      let events: RrwebEvent[];

      // ── Path 1: Array input ──
      //   - Chunked shard array (fcontent per element) → decompress + merge
      //   - Raw event array → filter directly (zero parsing overhead)
      if (Array.isArray(raw)) {
        events = isChunkedData(raw) ? mergeChunkedEvents(raw) : parseEvents(raw);
      } else {
        // ── Path 2/3: String input ──
        const trimmed = typeof raw === 'string' ? raw.trimStart() : '';

        if (trimmed.startsWith('[')) {
          // Path 2: JSON-serialized string — skip decompress
          events = parseEvents(raw);
        } else {
          // Path 3: Compressed string — full decompress + parse pipeline
          const decompressed = decompress(raw);
          events = parseEvents(decompressed);
        }
      }

      if (!validateEvents(events)) {
        this.error = 'Invalid session data: missing required Meta or FullSnapshot event';
        this.decompressError.emit({ error: this.error, rawInput: raw });
        this.loading = false;
        return;
      }

      this.events = events;
      this.analyticsData = null;
      this.loading = false;
      this.needInit = true;

      const metadata = extractMetadata(events);
      const lastEvent = events[events.length - 1];
      this.totalTime = lastEvent.timestamp - events[0].timestamp;
      this.currentTime = 0;
      this.playing = false;
      this.syncInteract(false);
      this.viewportWidth = metadata.width;
      this.viewportHeight = metadata.height;

      this.replayReady.emit({ replayer: this.replayer, metadata });

      if (this.showHeatmap || this.showStats) {
        this.computeAnalytics();
      }
    } catch (e) {
      this.error = (e as Error).message;
      this.decompressError.emit({ error: this.error, rawInput: raw });
      this.loading = false;
    }
  }

  private initReplayer() {
    const container = this.host.shadowRoot?.querySelector('.replay-container');
    if (!container) return;

    try {
      this.replayer = new Replayer(
        this.events as unknown as Array<eventWithTime | string>,
        {
          root: container as Element,
          speed: this.speed,
          skipInactive: this.skipInactive,
          showDebug: false,
          mouseTail: false,
          UNSAFE_replayCanvas: this.unsafeAllowScripts,
        },
      );
    } catch (e) {
      this.error = `Replayer init failed: ${(e as Error).message}`;
      this.decompressError.emit({ error: this.error, rawInput: '' });
      this.replayer = null;
      return;
    }

    // Scale the rrweb iframe/wrapper to fit the container while preserving aspect ratio
    this.scaleReplayerToContainer(container as HTMLElement);

    // Watch for container size changes and re-scale
    this.startResizeObserver(container as HTMLElement);

    // Apply initial interact state
    // syncInteract handles both enableInteract/disableInteract AND sandbox management
    this.syncInteract(this.playing);

    // Listen for playback finish
    this.replayer.on('finish', () => {
      this.playing = false;
      this.finished = true;
      this.syncInteract(false);
      this.currentTime = this.totalTime;
      this.stopTimePolling();
      this.updateControlsDirect(this.totalTime, this.totalTime);
      this.replayFinish.emit();
      console.info('Replayer finished');
    });

    // Auto-play if configured
    if (this.autoPlay) {
      // Start from startTime if specified, otherwise from beginning
      const startOffset = this.startTime > 0 ? this.startTime : 0;
      this.replayer.play(startOffset);
      this.currentTime = startOffset;
      this.playing = true;
      this.syncInteract(true);
      this.startTimePolling();
      this.updateControlsDirect(startOffset, this.totalTime);
      this.replayStart.emit();
    } else if (this.startTime > 0) {
      // Not auto-playing — just seek to startTime without starting playback
      // Use play() + immediate pause() to seek while paused
      this.replayer.play(this.startTime);
      this.replayer.pause();
      this.currentTime = this.startTime;
      this.updateControlsDirect(this.startTime, this.totalTime);
    }
  }

  private computeAnalytics() {
    if (this.events.length === 0) return;
    this.analyticsData = computeAnalytics(this.events, 'all' as HeatmapType);
    this.heatmapReady.emit({ heatmapData: this.analyticsData.heatmap });
    this.statsReady.emit({ statsData: this.analyticsData.stats });
  }

  // ── rAF Time Polling ──

  private startTimePolling() {
    if (this.rafId) return;
    const poll = () => {
      if (!this.replayer) return;
      const currentTime = this.replayer.getCurrentTime();
      this.currentTime = currentTime;

      // Direct DOM update — no Stencil re-render
      this.updateControlsDirect(currentTime, this.totalTime);

      // Throttled event emission
      if (currentTime - this.lastEmitTime >= this.EMIT_INTERVAL) {
        this.replayTimeUpdate.emit({ currentTime, totalTime: this.totalTime });
        this.lastEmitTime = currentTime;
      }

      this.rafId = requestAnimationFrame(poll);
    };
    this.rafId = requestAnimationFrame(poll);
  }

  private stopTimePolling() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Update controls child directly via @Method — avoids Stencil prop-driven re-render */
  private updateControlsDirect(currentTime: number, totalTime: number) {
    const controlsEl = this.host.shadowRoot?.querySelector('replayer-controls') as any;
    if (controlsEl && controlsEl.updateTimeDisplay) {
      controlsEl.updateTimeDisplay(currentTime, totalTime);
    }
  }

  // ── Replayer Scaling (fit iframe to container, preserve aspect ratio) ──

  /**
   * Scale the rrweb wrapper/iframe to fit the replay container while preserving
   * the original aspect ratio. The replay content is centered within the container.
   *
   * In fullscreen mode, the scale factor is capped at `fullscreenMaxRatio` to
   * prevent small recorded pages from being blown up too large. When the cap
   * kicks in, the replay is centered in the remaining space.
   */
  private scaleReplayerToContainer(container: HTMLElement) {
    const rrwebWrapper = container.querySelector('.replayer-wrapper') as HTMLElement;
    const rrwebIframe = container.querySelector('iframe') as HTMLElement;
    if (!rrwebWrapper || this.viewportWidth <= 0 || this.viewportHeight <= 0) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth <= 0 || containerHeight <= 0) return;

    // Set the rrweb wrapper to the original viewport dimensions
    rrwebWrapper.style.width = `${this.viewportWidth}px`;
    rrwebWrapper.style.height = `${this.viewportHeight}px`;
    rrwebWrapper.style.position = 'absolute';

    // Also set the iframe to the exact viewport dimensions
    if (rrwebIframe) {
      rrwebIframe.style.width = `${this.viewportWidth}px`;
      rrwebIframe.style.height = `${this.viewportHeight}px`;
    }

    // Compute contain-mode scale (fill as much as possible without cropping)
    const scaleX = containerWidth / this.viewportWidth;
    const scaleY = containerHeight / this.viewportHeight;
    const containScale = Math.min(scaleX, scaleY);

    // In fullscreen, cap the scale at fullscreenMaxRatio to prevent excessive enlargement
    const isFullscreen = document.fullscreenElement === this.host;
    const maxScale = isFullscreen ? this.fullscreenMaxRatio : Infinity;
    const scale = Math.min(containScale, maxScale);

    rrwebWrapper.style.transform = `scale(${scale})`;
    rrwebWrapper.style.transformOrigin = '0 0';

    // Center the scaled content within the container
    const scaledWidth = this.viewportWidth * scale;
    const scaledHeight = this.viewportHeight * scale;
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;

    rrwebWrapper.style.left = `${offsetX}px`;
    rrwebWrapper.style.top = `${offsetY}px`;
  }

  private startResizeObserver(container: HTMLElement) {
    this.stopResizeObserver();
    // Observe both the replay-container AND the player-viewport,
    // so we re-scale when controls bar appears/disappears (viewport height changes).
    const viewport = this.host.shadowRoot?.querySelector('.player-viewport');
    this.resizeObserver = new ResizeObserver(() => {
      this.scaleReplayerToContainer(container);
    });
    this.resizeObserver.observe(container);
    if (viewport) this.resizeObserver.observe(viewport);
    // Listen for fullscreen changes to re-scale (cap logic differs in fullscreen)
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  private stopResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  /** Re-scale the replayer — used when fullscreenMaxRatio changes while replay is active */
  private reScaleReplayer() {
    const container = this.host.shadowRoot?.querySelector('.replay-container') as HTMLElement;
    if (container) this.scaleReplayerToContainer(container);
  }

  private onFullscreenChange = () => {
    // Fullscreen toggle may not immediately trigger ResizeObserver
    // (especially exit fullscreen), so explicitly re-scale
    this.isFullscreen = document.fullscreenElement === this.host;
    this.reScaleReplayer();
    // Notify consumers of enter/exit — covers ESC and programmatic toggles,
    // not just the built-in controls button.
    this.replayFullscreenChange.emit({ isFullscreen: this.isFullscreen });
  };

  // ── Mouse Idle Detection (auto-hide controls) ──

  private clearMouseIdleTimer() {
    if (this.mouseIdleTimer) {
      clearTimeout(this.mouseIdleTimer);
      this.mouseIdleTimer = null;
    }
  }

  private handleMouseMove = () => {
    if (!this.autoHideControls) return;
    this.controlsVisible = true;
    this.clearMouseIdleTimer();
    this.mouseIdleTimer = window.setTimeout(() => {
      if (this.playing) this.controlsVisible = false;
    }, 3000);
  };

  private handleMouseLeave = () => {
    if (!this.autoHideControls) return;
    if (this.playing) {
      this.clearMouseIdleTimer();
      this.mouseIdleTimer = window.setTimeout(() => {
        this.controlsVisible = false;
      }, 1000);
    }
  };

  // ── Keyboard Shortcuts ──

  private handleKeyDown = (e: KeyboardEvent) => {
    // Don't intercept when user is typing in an input inside the replay iframe
    if (e.target !== this.host) return;

    switch (e.key) {
      case ' ':           // Play/Pause
      case 'k':           // YouTube-style
        e.preventDefault();
        this.playing ? this.pause() : this.play();
        break;
      case 'ArrowLeft':   // Seek backward 5s
        e.preventDefault();
        this.seek(Math.max(this.currentTime - 5000, 0));
        break;
      case 'ArrowRight':  // Seek forward 5s
        e.preventDefault();
        this.seek(Math.min(this.currentTime + 5000, this.totalTime));
        break;
      case 'j':           // Seek backward 10s (YouTube-style)
        e.preventDefault();
        this.seek(Math.max(this.currentTime - 10000, 0));
        break;
      case 'l':           // Seek forward 10s (YouTube-style)
        e.preventDefault();
        this.seek(Math.min(this.currentTime + 10000, this.totalTime));
        break;
      case 'Home':
        e.preventDefault();
        this.seek(0);
        break;
      case 'End':
        e.preventDefault();
        this.seek(this.totalTime);
        break;
      case 'ArrowUp':     // Speed up
        e.preventDefault();
        this.changeSpeed(1);
        break;
      case 'ArrowDown':   // Speed down
        e.preventDefault();
        this.changeSpeed(-1);
        break;
      case 'f':           // Fullscreen
        e.preventDefault();
        this.handleFullscreenToggle();
        break;
      case ',':           // Step backward 1 frame
        e.preventDefault();
        this.handleStepBackward();
        break;
      case '.':           // Step forward 1 frame
        e.preventDefault();
        this.handleStepForward();
        break;
    }
  };

  private handleFocus = () => {
    this.keyboardFocus = true;
  };

  private handleBlur = () => {
    this.keyboardFocus = false;
  };

  private changeSpeed(direction: number) {
    const idx = this.speedSteps.indexOf(this.speed);
    const newIdx = Math.max(0, Math.min(this.speedSteps.length - 1, idx + direction));
    this.speed = this.speedSteps[newIdx];
    if (this.replayer) {
      this.replayer.setConfig({ speed: this.speed });
    }
  }

  // ── Additional Control Handlers ──

  private handleStepForward = () => {
    if (this.playing) this.pause();
    const newTime = Math.min(this.currentTime + this.FRAME_STEP_MS, this.totalTime);
    this.seek(newTime);
  };

  private handleStepBackward = () => {
    if (this.playing) this.pause();
    const newTime = Math.max(this.currentTime - this.FRAME_STEP_MS, 0);
    this.seek(newTime);
  };

  private handleFullscreenToggle = () => {
    if (document.fullscreenElement === this.host) {
      document.exitFullscreen();
    } else {
      this.host.requestFullscreen();
    }
  };

  /** Double-click on the replay viewport — emit event with current fullscreen state.
   *  Does NOT toggle fullscreen itself; listeners decide what to do (if anything). */
  private handleDblClick = () => {
    this.replayDblClick.emit({ isFullscreen: this.isFullscreen });
  };

  private handleSkipInactiveToggle = (skip: boolean) => {
    this.skipInactive = skip;
    if (this.replayer) {
      this.replayer.setConfig({ skipInactive: skip });
    }
  };

  // ── Error icon (SVG via h()) ──

  private renderErrorIcon() {
    return (
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }

  // ── Render ──

  render() {
    if (this.error) {
      return (
        <Host>
          <div class="error-state">
            {this.renderErrorIcon()}
            <p class="error-message">{this.error}</p>
            <p class="error-subtext">Check your session data and try again</p>
            <button class="retry-btn" onClick={() => this.processData(this.data)}>
              Retry
            </button>
          </div>
        </Host>
      );
    }

    if (this.loading) {
      return (
        <Host>
          <div class="loading-state">
            <div class="spinner" />
            <p>Loading session data...</p>
          </div>
        </Host>
      );
    }

    const controlsClass = this.controlsVisible ? 'controls-visible' : 'controls-hidden';

    const w = this.cssDimension(this.width);
    const ht = this.cssDimension(this.height);
    const hostStyle: Record<string, string> = {};
    if (w) hostStyle.width = w;
    if (ht) hostStyle.height = ht;

    return (
      <Host
        style={hostStyle}
        class={{
          'with-stats': this.showStats,
          'keyboard-focus': this.keyboardFocus,
        }}
        tabindex={0}
        role="application"
        aria-label="Session replay player"
        aria-keyshortcuts="Space k j l f ArrowLeft ArrowRight ArrowUp ArrowDown , ."
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      >
        <div class="player-viewport"
          onMouseMove={this.handleMouseMove}
          onMouseLeave={this.handleMouseLeave}
          onDblClick={this.handleDblClick}>
          <div class="replay-container">
            {/* rrweb Replayer renders into this container */}
          </div>

          {this.showHeatmap && this.analyticsData && (
            <web-heatmap
              events={this.events}
              type="all"
              opacity={0.6}
              colorScheme="warm"
            />
          )}

          {this.showControls && (
            <replayer-controls
              class={controlsClass}
              playing={this.playing}
              speed={this.speed}
              skipInactive={this.skipInactive}
              finished={this.finished}
              fullscreen={this.isFullscreen}
              totalTime={this.totalTime}
              onPlayPause={() => {
                if (this.finished) {
                  // Replay from start
                  this.currentTime = 0;
                  this.finished = false;
                  this.updateControlsDirect(0, this.totalTime);
                  this.play();
                } else if (this.playing) {
                  this.pause();
                } else {
                  this.play();
                }
              }}
              onSeek={(e: CustomEvent<number>) => this.seek(e.detail)}
              onSpeedChange={(e: CustomEvent<number>) => { this.speed = e.detail; if (this.replayer) this.replayer.setConfig({ speed: e.detail }); }}
              onStepForward={() => this.handleStepForward()}
              onStepBackward={() => this.handleStepBackward()}
              onFullscreenToggle={() => this.handleFullscreenToggle()}
              onSkipInactiveToggle={(e: CustomEvent<boolean>) => this.handleSkipInactiveToggle(e.detail)}
            />
          )}
        </div>

        {this.showStats && this.analyticsData && (
          <web-stats-panel
            events={this.events}
            layout="sidebar"
            metrics={['clicks', 'scrolls', 'inputs', 'duration', 'path']}
          />
        )}
      </Host>
    );
  }
}
