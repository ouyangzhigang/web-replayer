import { Component, Prop, Event, EventEmitter, Method, Element, State, h } from '@stencil/core';

/**
 * <replayer-controls> — Overlay-style playback controls for the web-replayer.
 *
 * Features:
 *   - SVG icons for play/pause/replay with ripple effect
 *   - Custom progress slider with fill bar + hover tooltip
 *   - Speed pill buttons (one-click switching)
 *   - Frame step (forward/backward)
 *   - Skip-inactive toggle + fullscreen toggle
 *   - Keyboard-friendly, accessible (ARIA)
 */

@Component({
  tag: 'replayer-controls',
  styleUrl: 'replayer-controls.css',
  shadow: true,
})
export class ReplayerControls {
  @Element() host!: HTMLElement;

  // ── Props (controlled by parent) ──
  @Prop() playing = false;
  @Prop() speed = 1;
  @Prop() skipInactive = true;
  @Prop() finished = false;
  /** Total duration in ms — set once when data loads, passed as @Prop (low-frequency change) */
  @Prop() totalTime = 0;

  // ── Events ──
  @Event({ bubbles: true, composed: true }) playPause!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) seek!: EventEmitter<number>;
  @Event({ bubbles: true, composed: true }) speedChange!: EventEmitter<number>;
  @Event({ bubbles: true, composed: true }) stepForward!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) stepBackward!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) fullscreenToggle!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) skipInactiveToggle!: EventEmitter<boolean>;

  // ── Internal state (not driven by @Prop from parent) ──
  @State() showTooltip = false;
  @State() tooltipPosition = 0;
  @State() tooltipTime = '';

  private currentTimeInternal = 0;
  private speedOptions = [0.5, 1, 2, 4, 8];

  // ── Seek throttle ──
  private seekThrottleTimer: number | null = null;
  private lastSeekValue = 0;

  // ── SVG Icons (JSX h() approach for Shadow DOM safety) ──

  private renderPlayIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }

  private renderPauseIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    );
  }

  private renderReplayIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
      </svg>
    );
  }

  private renderStepBackIcon() {
    // ◁◁ — double left-pointing arrows (fast rewind)
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.5 18L3 12l8.5-6v12zm9 0L12 12l8.5-6v12z" />
      </svg>
    );
  }

  private renderStepForwardIcon() {
    // ▷▷ — double right-pointing arrows (fast forward)
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 18l8.5-6L4 6v12zm9 0l8.5-6L13 6v12z" />
      </svg>
    );
  }

  private renderSkipInactiveIcon() {
    // Lightning bolt ⚡ — skip over idle time
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    );
  }

  private renderFullscreenIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
      </svg>
    );
  }

  // ── Public Method: Direct DOM update for time (no re-render) ──

  @Method()
  async updateTimeDisplay(currentTime: number, totalTime: number): Promise<void> {
    this.currentTimeInternal = currentTime;
    this.totalTime = totalTime;

    // Direct DOM updates — bypass Stencil's render cycle
    const root = this.host.shadowRoot;
    if (!root) return;

    const slider = root.querySelector('.progress-slider') as HTMLInputElement;
    const fill = root.querySelector('.slider-fill') as HTMLElement;
    const timeCurrent = root.querySelector('.time-current') as HTMLElement;

    if (slider && totalTime > 0) {
      slider.value = String(Math.floor(currentTime));
    }
    if (fill && totalTime > 0) {
      fill.style.width = `${(currentTime / totalTime) * 100}%`;
    }
    if (timeCurrent) {
      timeCurrent.textContent = this.formatTimeDetailed(currentTime);
    }
  }

  // ── Handlers ──

  private handlePlayPause = (e: MouseEvent) => {
    this.createRipple(e);
    this.playPause.emit();
  };

  private createRipple(e: MouseEvent) {
    const btn = e.currentTarget as HTMLElement;
    const root = this.host.shadowRoot;
    if (!root) return;

    const container = root.querySelector('.ripple-container');
    if (!container) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    container.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  private handleSeek = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.lastSeekValue = Number(input.value);

    // Update slider fill immediately for responsive visual feedback
    const root = this.host.shadowRoot;
    if (root) {
      const fill = root.querySelector('.slider-fill') as HTMLElement;
      if (fill && this.totalTime > 0) {
        fill.style.width = `${(this.lastSeekValue / this.totalTime) * 100}%`;
      }
      const timeCurrent = root.querySelector('.time-current') as HTMLElement;
      if (timeCurrent) {
        timeCurrent.textContent = this.formatTimeDetailed(this.lastSeekValue);
      }
    }

    // Throttle actual seek event emission
    if (!this.seekThrottleTimer) {
      this.seek.emit(this.lastSeekValue);
      this.seekThrottleTimer = window.setTimeout(() => {
        this.seekThrottleTimer = null;
      }, 100);
    }
  };

  private handleSliderHover = (e: MouseEvent) => {
    const input = e.currentTarget as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const timeAtPosition = percent * this.totalTime;
    this.showTooltip = true;
    this.tooltipPosition = percent * 100;
    this.tooltipTime = this.formatTimeDetailed(timeAtPosition);
  };

  private handleSliderLeave = () => {
    this.showTooltip = false;
  };

  private handleSpeedPill = (s: number) => {
    this.speedChange.emit(s);
  };

  private handleStepForward = () => {
    this.stepForward.emit();
  };

  private handleStepBackward = () => {
    this.stepBackward.emit();
  };

  private handleFullscreenToggle = () => {
    this.fullscreenToggle.emit();
  };

  private handleSkipInactiveToggle = () => {
    this.skipInactiveToggle.emit(!this.skipInactive);
  };

  // ── Time formatting ──

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private formatTimeDetailed(ms: number): string {
    if (ms < 0) ms = 0;
    const totalSeconds = ms / 1000;
    if (this.totalTime < 10000 && this.totalTime > 0) {
      // Short clips: show 2 decimal places
      return totalSeconds.toFixed(2) + 's';
    }
    const seconds = Math.floor(totalSeconds);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // ── Render ──

  render() {
    const fillPercent = this.totalTime > 0
      ? (this.currentTimeInternal / this.totalTime) * 100
      : 0;

    const mainIcon = this.finished
      ? this.renderReplayIcon()
      : this.playing
        ? this.renderPauseIcon()
        : this.renderPlayIcon();

    return (
      <div class="controls-bar">
        {/* Play / Pause / Replay */}
        <button class="play-pause-btn" onClick={this.handlePlayPause}
          aria-label={this.finished ? 'Replay' : this.playing ? 'Pause' : 'Play'}
          title={this.finished ? 'Replay' : this.playing ? 'Pause' : 'Play'}>
          <div class="btn-icon">{mainIcon}</div>
          <span class="ripple-container" />
        </button>

        {/* Frame step controls */}
        <div class="step-controls">
          <button class="step-btn" onClick={this.handleStepBackward}
            aria-label="Step backward" title="Step back 1 frame">
            <div class="btn-icon">{this.renderStepBackIcon()}</div>
          </button>
          <button class="step-btn" onClick={this.handleStepForward}
            aria-label="Step forward" title="Step forward 1 frame">
            <div class="btn-icon">{this.renderStepForwardIcon()}</div>
          </button>
        </div>

        {/* Progress slider */}
        <div class="progress-section">
          <div class="slider-track">
            <div class="slider-fill" style={{ width: `${fillPercent}%` }} />
          </div>
          <input type="range" class="progress-slider"
            min={0} max={this.totalTime} value={this.currentTimeInternal}
            onInput={this.handleSeek}
            onMouseMove={this.handleSliderHover}
            onMouseLeave={this.handleSliderLeave}
            aria-label="Replay progress"
            aria-valuetext={this.formatTimeDetailed(this.currentTimeInternal)} />
          {this.showTooltip && (
            <div class="slider-tooltip" style={{ left: `${this.tooltipPosition}%` }}>
              {this.tooltipTime}
            </div>
          )}
        </div>

        {/* Time display */}
        <span class="time-display">
          <span class="time-current">{this.formatTimeDetailed(this.currentTimeInternal)}</span>
          <span class="time-separator">/</span>
          <span class="time-total">{this.formatTime(this.totalTime)}min</span>
        </span>

        {/* Speed pills */}
        <div class="speed-section">
          {this.speedOptions.map((s) => (
            <button
              class={{ 'speed-pill': true, 'speed-pill-active': s === this.speed }}
              onClick={() => this.handleSpeedPill(s)}
              aria-label={`${s}x speed`}
              aria-pressed={s === this.speed}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Skip inactive toggle */}
        <button
          class={{ 'toggle-btn': true, 'skip-inactive-btn': true, 'toggle-active': this.skipInactive }}
          onClick={this.handleSkipInactiveToggle}
          aria-label="Skip inactive periods"
          aria-pressed={this.skipInactive}
          title={this.skipInactive ? 'Skipping inactive (click to disable)' : 'Show inactive (click to skip)'}
        >
          <div class="btn-icon">{this.renderSkipInactiveIcon()}</div>
          <span class="ripple-container" />
        </button>

        {/* Fullscreen toggle */}
        <button class="toggle-btn fullscreen-btn"
          onClick={this.handleFullscreenToggle}
          aria-label="Fullscreen"
          title="Fullscreen">
          <div class="btn-icon">{this.renderFullscreenIcon()}</div>
        </button>

        {/* Screen reader live region */}
        <div class="sr-only" aria-live="polite" role="status">
          {this.playing ? 'Playing' : 'Paused'} at {this.formatTimeDetailed(this.currentTimeInternal)}
        </div>
      </div>
    );
  }
}
