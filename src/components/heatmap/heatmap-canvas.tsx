import { Component, Prop, h, Element } from '@stencil/core';
import { HeatmapData, HeatmapColorScheme } from '../../types/analytics';

@Component({
  tag: 'heatmap-canvas',
  styleUrl: 'heatmap-canvas.css',
  shadow: true,
})
export class HeatmapCanvas {
  @Element() host!: HTMLElement;
  @Prop() data!: HeatmapData;
  @Prop() opacity = 0.6;
  @Prop() colorScheme: HeatmapColorScheme = 'warm';

  componentDidRender() { this.drawHeatmap(); }

  private intensityToColor(intensity: number, scheme: HeatmapColorScheme): string {
    const alpha = Math.min(intensity * 0.8 + 0.1, 0.9) * this.opacity;
    switch (scheme) {
      case 'warm':
        if (intensity < 0.3) { const t = intensity / 0.3; return `rgba(0, ${Math.round(t * 255)}, 255, ${alpha})`; }
        else if (intensity < 0.7) { const t = (intensity - 0.3) / 0.4; return `rgba(${Math.round(t * 255)}, 255, ${Math.round((1 - t) * 255)}, ${alpha})`; }
        else { const t = (intensity - 0.7) / 0.3; return `rgba(255, ${Math.round((1 - t) * 255)}, 0, ${alpha})`; }
      case 'cool':
        if (intensity < 0.5) { const t = intensity / 0.5; return `rgba(${Math.round(100 + t * 50)}, ${Math.round(200 + t * 55)}, 255, ${alpha})`; }
        else { const t = (intensity - 0.5) / 0.5; return `rgba(0, ${Math.round(100 + (1 - t) * 100)}, ${Math.round(200 + (1 - t) * 55)}, ${alpha})`; }
      default: return `rgba(255, 100, 0, ${alpha})`;
    }
  }

  private drawHeatmap() {
    const canvasEl = this.host.shadowRoot?.querySelector('canvas');
    if (!canvasEl || !this.data || this.data.points.length === 0) return;
    const { viewportWidth, viewportHeight, points } = this.data;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    const radius = Math.max(viewportWidth, viewportHeight) * 0.02;
    for (const point of points) {
      const color = this.intensityToColor(point.intensity, this.colorScheme);
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * (0.5 + point.intensity * 1.5));
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - radius * 2, point.y - radius * 2, radius * 4, radius * 4);
    }
  }

  render() {
    if (!this.data) return null;
    const { viewportWidth, viewportHeight } = this.data;
    return <canvas width={viewportWidth} height={viewportHeight} style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px`, opacity: String(this.opacity) }} />;
  }
}
