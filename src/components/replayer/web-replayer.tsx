/**
 * <web-replayer> — Main replay component.
 *
 * Accepts compressed rrweb data, auto-decompresses, and renders
 * the session replay with optional heatmap overlay and stats panel.
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
import { parseEvents, validateEvents, extractMetadata } from '../../utils/event-parser';
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
} from '../../types/component-props';

@Component({
  tag: 'web-replayer',
  styleUrl: 'web-replayer.css',
  shadow: true,
})
export class WebReplayer {
  @Element() host!: HTMLElement;

  // ── Props ──
  @Prop() data!: string;
  @Prop({ reflect: true }) width?: number;
  @Prop({ reflect: true }) height?: number;
  @Prop({ reflect: true }) autoPlay = false;
  @Prop({ reflect: true }) speed = 1;
  @Prop({ reflect: true }) showControls = true;
  @Prop({ reflect: true }) showHeatmap = false;
  @Prop({ reflect: true }) showStats = false;
  @Prop() startTime = 0;

  // ── State ──
  @State() events: RrwebEvent[] = [];
  @State() loading = false;
  @State() error: string | null = null;
  @State() playing = false;
  @State() currentTime = 0;
  @State() totalTime = 0;
  @State() analyticsData: AnalyticsData | null = null;

  // ── Internal ──
  private replayer: Replayer | null = null;

  // ── Events ──
  @Event({ bubbles: true, composed: true }) replayReady!: EventEmitter<ReplayReadyDetail>;
  @Event({ bubbles: true, composed: true }) replayStart!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayPause!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayFinish!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayTimeUpdate!: EventEmitter<ReplayTimeUpdateDetail>;
  @Event({ bubbles: true, composed: true }) heatmapReady!: EventEmitter<HeatmapReadyDetail>;
  @Event({ bubbles: true, composed: true }) statsReady!: EventEmitter<StatsReadyDetail>;
  @Event({ bubbles: true, composed: true }) decompressError!: EventEmitter<DecompressErrorDetail>;

  // ── Watchers ──
  @Watch('data')
  onDataChange(newData: string) {
    this.processData(newData);
  }

  @Watch('speed')
  onSpeedChange(newSpeed: number) {
    if (this.replayer) {
      this.replayer.setConfig({ speed: newSpeed });
    }
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

  componentDidRender() {
    if (this.events.length > 0 && !this.replayer) {
      this.initReplayer();
    }
  }

  disconnectedCallback() {
    destroyReplayer(this.replayer);
    this.replayer = null;
  }

  // ── Public Methods ──
  @Method()
  async play(): Promise<void> {
    if (!this.replayer) return;
    this.replayer.play();
    this.playing = true;
    this.replayStart.emit();
  }

  @Method()
  async pause(): Promise<void> {
    if (!this.replayer) return;
    this.replayer.pause();
    this.playing = false;
    this.replayPause.emit();
  }

  @Method()
  async seek(time: number): Promise<void> {
    if (!this.replayer) return;
    this.replayer.play(time);
    this.currentTime = time;
    this.replayTimeUpdate.emit({ currentTime: time, totalTime: this.totalTime });
  }

  @Method()
  async getEvents(): Promise<RrwebEvent[]> {
    return this.events;
  }

  @Method()
  async getAnalytics(): Promise<AnalyticsData | null> {
    return this.analyticsData;
  }

  // ── Private Methods ──
  private processData(raw: string) {
    this.loading = true;
    this.error = null;

    try {
      const decompressed = decompress(raw);
      const events = parseEvents(decompressed);

      if (!validateEvents(events)) {
        this.error = 'Invalid session data: missing required Meta or FullSnapshot event';
        this.decompressError.emit({ error: this.error, rawInput: raw });
        this.loading = false;
        return;
      }

      this.events = events;
      this.analyticsData = null;
      this.loading = false;

      const metadata = extractMetadata(events);
      const lastEvent = events[events.length - 1];
      this.totalTime = lastEvent.timestamp - events[0].timestamp;

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
    if (!container || this.events.length === 0) return;

    destroyReplayer(this.replayer);

    this.replayer = new Replayer(this.events as unknown as Array<eventWithTime | string>, {
      root: container as Element,
      speed: this.speed,
      skipInactive: true,
      showDebug: false,
    });

    this.replayer.on('finish', () => {
      this.playing = false;
      this.replayFinish.emit();
    });

    if (this.autoPlay) {
      this.replayer.play();
      this.playing = true;
      this.replayStart.emit();
    }

    if (this.startTime > 0) {
      this.replayer.play(this.startTime);
    }
  }

  private computeAnalytics() {
    if (this.events.length === 0) return;
    this.analyticsData = computeAnalytics(this.events, 'all' as HeatmapType);
    this.heatmapReady.emit({ heatmapData: this.analyticsData.heatmap });
    this.statsReady.emit({ statsData: this.analyticsData.stats });
  }

  // ── Render ──
  render() {
    if (this.error) {
      return (
        <Host>
          <div class="error-state">
            <p class="error-message">{this.error}</p>
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

    const containerStyle: Record<string, string> = {};
    if (this.width) containerStyle.width = `${this.width}px`;
    if (this.height) containerStyle.height = `${this.height}px`;

    return (
      <Host class={this.showStats ? 'with-stats' : ''}>
        <div class="replayer-wrapper">
          <div class="replay-container" style={containerStyle}>
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
              playing={this.playing}
              currentTime={this.currentTime}
              totalTime={this.totalTime}
              speed={this.speed}
              onPlayPause={() => this.playing ? this.pause() : this.play()}
              onSeek={(e: CustomEvent<number>) => this.seek(e.detail)}
              onSpeedChange={(e: CustomEvent<number>) => { this.speed = e.detail; }}
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
