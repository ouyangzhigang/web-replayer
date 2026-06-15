import { describe, it, expect } from 'vitest';
import {
  computeHeatmapData,
  computeStatsData,
  computeAnalytics,
} from '../src/utils/analytics';
import { RrwebEvent, RrwebEventType, IncrementalSource, MouseInteractionType } from '../src/types/events';
import { HeatmapType } from '../src/types/analytics';

/** Helper: create a mock incremental event */
function makeIncrementalEvent(
  timestamp: number,
  source: IncrementalSource,
  data: Record<string, unknown>,
  position?: { x: number; y: number },
): RrwebEvent {
  return {
    timestamp,
    type: RrwebEventType.IncrementalSnapshot,
    data: {
      source,
      data,
      position: position ? { ...position, id: 0 } : undefined,
    },
  } as unknown as RrwebEvent;
}

describe('computeHeatmapData', () => {
  const metaEvent: RrwebEvent = {
    timestamp: 0,
    type: RrwebEventType.Meta,
    data: { href: 'https://example.com', width: 1024, height: 768 },
  } as RrwebEvent;

  it('computes click heatmap with correct points', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(3000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 300, y: 400 }),
    ];
    const heatmap = computeHeatmapData(events, 'click');
    expect(heatmap.viewportWidth).toBe(1024);
    expect(heatmap.viewportHeight).toBe(768);
    expect(heatmap.points.length).toBe(2); // two distinct positions
    expect(heatmap.maxCount).toBe(2); // position (100,200) has 2 clicks
  });

  it('returns empty points for move-only events when type is click', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.MouseMove }, { x: 100, y: 200 }),
    ];
    const heatmap = computeHeatmapData(events, 'click');
    expect(heatmap.points.length).toBe(0);
  });

  it('aggregates all types when type is all', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.Scroll, { id: 0 }, { x: 50, y: 300 }),
      makeIncrementalEvent(3000, IncrementalSource.MouseMove, { id: 0 }, { x: 200, y: 100 }),
    ];
    const heatmap = computeHeatmapData(events, 'all');
    expect(heatmap.points.length).toBeGreaterThanOrEqual(3);
  });
});

describe('computeStatsData', () => {
  const metaEvent: RrwebEvent = {
    timestamp: 0,
    type: RrwebEventType.Meta,
    data: { href: 'https://example.com', width: 1024, height: 768 },
  } as RrwebEvent;

  it('computes total counts correctly', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 200, y: 300 }),
      makeIncrementalEvent(3000, IncrementalSource.Scroll, { id: 0 }),
      makeIncrementalEvent(4000, IncrementalSource.Input, { id: 0 }),
    ];
    const stats = computeStatsData(events);
    expect(stats.totalClicks).toBe(2);
    expect(stats.totalScrolls).toBe(1);
    expect(stats.totalInputs).toBe(1);
  });

  it('computes operation breakdown percentages', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.Scroll, { id: 0 }),
    ];
    const stats = computeStatsData(events);
    expect(stats.operationBreakdown.length).toBeGreaterThanOrEqual(2);
    // Percentages should sum to ~100
    const totalPct = stats.operationBreakdown.reduce((sum, t) => sum + t.percentage, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });
});

describe('computeAnalytics', () => {
  it('computes combined heatmap + stats', () => {
    const events: RrwebEvent[] = [
      { timestamp: 0, type: RrwebEventType.Meta, data: { href: 'https://example.com', width: 1024, height: 768 } } as RrwebEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(3000, IncrementalSource.Scroll, { id: 0 }),
    ];
    const analytics = computeAnalytics(events);
    expect(analytics.heatmap).toBeDefined();
    expect(analytics.stats).toBeDefined();
    expect(analytics.heatmap.points.length).toBeGreaterThan(0);
  });
});
