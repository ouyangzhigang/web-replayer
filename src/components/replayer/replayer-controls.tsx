import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'replayer-controls',
  styleUrl: 'replayer-controls.css',
  shadow: true,
})
export class ReplayerControls {
  @Prop() playing = false;
  @Prop() currentTime = 0;
  @Prop() totalTime = 0;
  @Prop() speed = 1;

  @Event({ bubbles: true, composed: true }) playPause!: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) seek!: EventEmitter<number>;
  @Event({ bubbles: true, composed: true }) speedChange!: EventEmitter<number>;

  private speedOptions = [0.5, 1, 2, 4, 8];

  private handlePlayPause = () => { this.playPause.emit(); };
  private handleSeek = (e: Event) => { const input = e.target as HTMLInputElement; this.seek.emit(Number(input.value)); };
  private handleSpeedChange = (e: Event) => { const select = e.target as HTMLSelectElement; this.speedChange.emit(Number(select.value)); };

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  render() {
    return (
      <div class="controls-bar">
        <button class="play-pause-btn" onClick={this.handlePlayPause} aria-label={this.playing ? 'Pause' : 'Play'} title={this.playing ? 'Pause' : 'Play'}>
          {this.playing ? '⏸' : '▶'}
        </button>

        <div class="progress-section">
          <input type="range" class="progress-slider" min={0} max={this.totalTime} value={this.currentTime} onInput={this.handleSeek} aria-label="Replay progress" />
          <span class="time-display">{this.formatTime(this.currentTime)} / {this.formatTime(this.totalTime)}</span>
        </div>

        <div class="speed-section">
          <select class="speed-select" onChange={this.handleSpeedChange} aria-label="Playback speed" ref={(el?: HTMLSelectElement) => { if (el) el.value = String(this.speed); }}>
            {this.speedOptions.map((s) => <option value={s}>{s}x</option>)}
          </select>
        </div>
      </div>
    );
  }
}
