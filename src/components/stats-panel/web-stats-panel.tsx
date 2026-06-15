import { Component, Prop, State, Watch, h, Host } from '@stencil/core';
import { RrwebEvent } from '../../types/events';
import { StatsData, StatsMetric, StatsPanelLayout } from '../../types/analytics';
import { computeStatsData } from '../../utils/analytics';

@Component({
  tag: 'web-stats-panel',
  styleUrl: 'web-stats-panel.css',
  shadow: true,
})
export class WebStatsPanel {
  @Prop() events!: RrwebEvent[];
  @Prop() layout: StatsPanelLayout = 'sidebar';
  @Prop() metrics: StatsMetric[] = ['clicks', 'scrolls', 'inputs', 'duration', 'path'];

  @State() statsData: StatsData | null = null;

  @Watch('events')
  onEventsChange() {
    if (this.events && this.events.length > 0) { this.statsData = computeStatsData(this.events); }
  }

  componentWillLoad() {
    if (this.events && this.events.length > 0) { this.statsData = computeStatsData(this.events); }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  private shouldShow(metric: StatsMetric): boolean { return this.metrics.includes(metric); }

  render() {
    if (!this.statsData) return <Host class="empty"><p class="no-data">No statistics data</p></Host>;
    const data = this.statsData;
    return (
      <Host class={`layout-${this.layout}`}>
        <div class="panel">
          <h3 class="panel-title">Session Analytics</h3>
          {this.shouldShow('duration') && (
            <section class="metric-section"><div class="metric-card"><span class="metric-label">Duration</span><span class="metric-value">{this.formatDuration(data.totalDuration)}</span></div></section>
          )}
          {this.shouldShow('clicks') && (
            <section class="metric-section"><div class="metric-card"><span class="metric-label">Clicks</span><span class="metric-value">{data.totalClicks}</span></div></section>
          )}
          {this.shouldShow('scrolls') && (
            <section class="metric-section"><div class="metric-card"><span class="metric-label">Scrolls</span><span class="metric-value">{data.totalScrolls}</span></div></section>
          )}
          {this.shouldShow('inputs') && (
            <section class="metric-section"><div class="metric-card"><span class="metric-label">Inputs</span><span class="metric-value">{data.totalInputs}</span></div></section>
          )}
          <section class="chart-section"><stats-chart breakdown={data.operationBreakdown} /></section>
          {this.shouldShow('path') && data.interactionPath.length > 0 && (
            <section class="path-section">
              <h4 class="section-title">Interaction Path</h4>
              <ol class="path-list">
                {data.interactionPath.slice(0, 20).map((step) => (
                  <li class="path-step" key={`${step.timeOffset}-${step.action}`}>
                    <span class="step-time">{this.formatDuration(step.timeOffset)}</span>
                    <span class="step-action">{step.action}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </Host>
    );
  }
}
