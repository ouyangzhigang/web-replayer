/**
 * Analytics engine — computes heatmap and statistics data
 * from parsed rrweb events. All functions are pure — no side effects,
 * no DOM access — making them fast and testable.
 *
 * Performance design:
 *   - Single-pass iteration over events (O(n))
 *   - Spatial hashing for heatmap (grid buckets instead of point-by-point)
 *   - Pre-allocated maps for counting (avoid object spread churn)
 */

import {
  RrwebEvent,
  RrwebEventType,
  IncrementalSource,
  IncrementalSnapshotData,
  MouseInteractionType,
} from '../types/events';
import {
  HeatmapData,
  HeatmapPoint,
  HeatmapType,
  StatsData,
  OperationTally,
  DurationEntry,
  PathStep,
  AnalyticsData,
} from '../types/analytics';

/** Grid bucket size for spatial hashing (px) — balances detail vs. memory */
const HEATMAP_GRID_SIZE = 8;

/**
 * Compute heatmap data from events. Uses spatial grid hashing
 * for efficient point aggregation instead of per-pixel comparison.
 */
export function computeHeatmapData(
  events: RrwebEvent[],
  type: HeatmapType = 'all',
): HeatmapData {
  const metaEvent = events.find((e) => e.type === RrwebEventType.Meta);
  const viewportWidth =
    metaEvent && 'data' in metaEvent
      ? ((metaEvent.data as Record<string, unknown>).width as number) || 0
      : 0;
  const viewportHeight =
    metaEvent && 'data' in metaEvent
      ? ((metaEvent.data as Record<string, unknown>).height as number) || 0
      : 0;

  const grid = new Map<string, { x: number; y: number; count: number }>();

  for (const event of events) {
    if (event.type !== RrwebEventType.IncrementalSnapshot) continue;
    const eventData = (event as { data: IncrementalSnapshotData }).data;

    if (!shouldIncludeForHeatmap(eventData.source, type)) continue;

    // For click heatmap type, additionally filter by MouseInteractionType
    if (type === 'click') {
      const interactionType = eventData.data?.type as number;
      if (interactionType !== MouseInteractionType.Click) continue;
    }

    // Get coordinates — in rrweb v2, x and y are direct fields in data.data
    // for mouse interactions, and in data.data for scroll events (as scrollPosition)
    const x = eventData.data?.x as number;
    const y = eventData.data?.y as number;
    if (x == null || y == null) continue;

    // Hash into grid bucket
    const bucketX = Math.floor(x / HEATMAP_GRID_SIZE) * HEATMAP_GRID_SIZE;
    const bucketY = Math.floor(y / HEATMAP_GRID_SIZE) * HEATMAP_GRID_SIZE;
    const key = `${bucketX},${bucketY}`;

    const existing = grid.get(key);
    if (existing) {
      existing.count++;
    } else {
      grid.set(key, { x: bucketX, y: bucketY, count: 1 });
    }
  }

  const maxCount = Math.max(1, ...Array.from(grid.values()).map((p) => p.count));

  const points: HeatmapPoint[] = Array.from(grid.values()).map((p) => ({
    x: p.x,
    y: p.y,
    count: p.count,
    intensity: p.count / maxCount,
  }));

  return { points, viewportWidth, viewportHeight, maxCount };
}

/** Filter interaction source by heatmap type */
function shouldIncludeForHeatmap(source: number, type: HeatmapType): boolean {
  const src = source as IncrementalSource;
  switch (type) {
    case 'click':
      return src === IncrementalSource.MouseInteraction;
    case 'move':
      return src === IncrementalSource.MouseMove || src === IncrementalSource.TouchMove;
    case 'scroll':
      return src === IncrementalSource.Scroll;
    case 'all':
      return (
        src === IncrementalSource.MouseInteraction ||
        src === IncrementalSource.MouseMove ||
        src === IncrementalSource.TouchMove ||
        src === IncrementalSource.Scroll
      );
  }
}

/**
 * Compute statistics data from events. Single-pass counting
 * with categorized tallies and duration extraction.
 */
export function computeStatsData(events: RrwebEvent[]): StatsData {
  const startTime = events[0]?.timestamp ?? 0;
  const endTime = events.length > 0 ? events[events.length - 1].timestamp : 0;
  const totalDuration = endTime - startTime;

  let totalClicks = 0;
  let totalScrolls = 0;
  let totalInputs = 0;
  const tallyMap = new Map<string, number>();
  const pathSteps: PathStep[] = [];
  let currentHref = '';

  for (const event of events) {
    // Track page changes from Meta events
    if (event.type === RrwebEventType.Meta && 'data' in event) {
      const href = (event.data as Record<string, unknown>).href as string;
      if (href && href !== currentHref) {
        currentHref = href;
      }
    }

    if (event.type !== RrwebEventType.IncrementalSnapshot) continue;
    const eventData = (event as { data: IncrementalSnapshotData }).data;
    const source = eventData.source as IncrementalSource;

    // Count by category
    switch (source) {
      case IncrementalSource.MouseInteraction:
        totalClicks++;
        tallyMap.set('click', (tallyMap.get('click') ?? 0) + 1);
        // Record path step for significant clicks
        if (currentHref && eventData.data) {
          const nodeId = eventData.data.id as number;
          pathSteps.push({
            page: currentHref,
            action: `click (id: ${nodeId ?? 'unknown'})`,
            timeOffset: event.timestamp - startTime,
          });
        }
        break;
      case IncrementalSource.Scroll:
        totalScrolls++;
        tallyMap.set('scroll', (tallyMap.get('scroll') ?? 0) + 1);
        break;
      case IncrementalSource.Input:
        totalInputs++;
        tallyMap.set('input', (tallyMap.get('input') ?? 0) + 1);
        break;
      case IncrementalSource.MouseMove:
        tallyMap.set('mousemove', (tallyMap.get('mousemove') ?? 0) + 1);
        break;
    }
  }

  const totalOperations = Array.from(tallyMap.values()).reduce((a, b) => a + b, 0);
  const operationBreakdown: OperationTally[] = Array.from(tallyMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalOperations > 0 ? Math.round((count / totalOperations) * 100) : 0,
    }));

  const durationBreakdown: DurationEntry[] = [
    { page: currentHref || 'unknown', duration: totalDuration, percentage: 100 },
  ];

  return {
    totalDuration,
    totalClicks,
    totalScrolls,
    totalInputs,
    operationBreakdown,
    durationBreakdown,
    interactionPath: pathSteps,
  };
}

/**
 * Compute full analytics (heatmap + stats) in one call.
 * Efficient — events are iterated once for heatmap grid,
 * once for stats tallying (2 x O(n), no redundant work).
 */
export function computeAnalytics(
  events: RrwebEvent[],
  heatmapType: HeatmapType = 'all',
): AnalyticsData {
  return {
    heatmap: computeHeatmapData(events, heatmapType),
    stats: computeStatsData(events),
  };
}
