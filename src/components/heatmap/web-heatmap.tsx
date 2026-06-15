import { Component, Prop, State, Watch, h, Host } from '@stencil/core';
import { RrwebEvent } from '../../types/events';
import { HeatmapData, HeatmapType, HeatmapColorScheme } from '../../types/analytics';
import { computeHeatmapData } from '../../utils/analytics';

@Component({
  tag: 'web-heatmap',
  styleUrl: 'web-heatmap.css',
  shadow: true,
})
export class WebHeatmap {
  @Prop() events!: RrwebEvent[];
  @Prop() type: HeatmapType = 'all';
  @Prop() opacity = 0.6;
  @Prop() colorScheme: HeatmapColorScheme = 'warm';

  @State() heatmapData: HeatmapData | null = null;

  @Watch('events') @Watch('type')
  onEventsChange() {
    if (this.events && this.events.length > 0) {
      this.heatmapData = computeHeatmapData(this.events, this.type);
    }
  }

  componentWillLoad() {
    if (this.events && this.events.length > 0) {
      this.heatmapData = computeHeatmapData(this.events, this.type);
    }
  }

  render() {
    if (!this.heatmapData || this.heatmapData.points.length === 0) {
      return <Host class="heatmap-empty"><p class="no-data">No interaction data for heatmap</p></Host>;
    }
    return (
      <Host class="heatmap-active">
        <heatmap-canvas data={this.heatmapData} opacity={this.opacity} colorScheme={this.colorScheme} />
      </Host>
    );
  }
}
