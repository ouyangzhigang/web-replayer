import { Component, Prop, h } from '@stencil/core';
import { OperationTally } from '../../types/analytics';

@Component({
  tag: 'stats-chart',
  styleUrl: 'stats-chart.css',
  shadow: true,
})
export class StatsChart {
  @Prop() breakdown!: OperationTally[];

  private barColor(type: string): string {
    const colors: Record<string, string> = {
      click: 'var(--wr-color-chart-click)',
      scroll: 'var(--wr-color-chart-scroll)',
      input: 'var(--wr-color-chart-input)',
      mousemove: 'var(--wr-color-chart-move)',
    };
    return colors[type] ?? 'var(--wr-color-text-muted)';
  }

  render() {
    if (!this.breakdown || this.breakdown.length === 0) return <p class="no-data">No data to display</p>;
    const maxCount = Math.max(...this.breakdown.map((t) => t.count));
    return (
      <div class="chart">
        {this.breakdown.map((tally) => (
          <div class="bar-row" key={tally.type}>
            <span class="bar-label">{tally.type}</span>
            <div class="bar-track">
              <div class="bar-fill" style={{ width: `${(tally.count / maxCount) * 100}%`, '--bar-color': this.barColor(tally.type) }} />
            </div>
            <span class="bar-value">{tally.count} ({tally.percentage}%)</span>
          </div>
        ))}
      </div>
    );
  }
}
