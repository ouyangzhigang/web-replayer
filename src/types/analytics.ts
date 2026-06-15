/**
 * Analytics data types — define the computed output shapes
 * produced by the analytics engine from rrweb events.
 */

/** A single interaction point on the heatmap */
export interface HeatmapPoint {
  x: number;
  y: number;
  /** Normalized intensity (0–1) — higher = more interactions at this point */
  intensity: number;
  /** Raw count of interactions at this coordinate */
  count: number;
}

/** Heatmap data ready for rendering */
export interface HeatmapData {
  points: HeatmapPoint[];
  /** Bounding viewport dimensions used during recording */
  viewportWidth: number;
  viewportHeight: number;
  /** Maximum interaction count at any single point (for normalization) */
  maxCount: number;
}

/** Heatmap display type filter */
export type HeatmapType = 'click' | 'move' | 'scroll' | 'all';

/** Heatmap color scheme */
export type HeatmapColorScheme = 'warm' | 'cool' | 'custom';

/** A single operation type tally */
export interface OperationTally {
  type: string;
  count: number;
  /** Percentage of total operations */
  percentage: number;
}

/** Duration breakdown per logical page/viewport state */
export interface DurationEntry {
  /** Page URL or identifier */
  page: string;
  /** Milliseconds spent on this page */
  duration: number;
  /** Percentage of total session duration */
  percentage: number;
}

/** User interaction path — ordered sequence of significant actions */
export interface PathStep {
  /** Page URL at time of action */
  page: string;
  /** Action description (e.g. "click on #login-btn") */
  action: string;
  /** Timestamp relative to session start (ms) */
  timeOffset: number;
}

/** Full statistics data for a session */
export interface StatsData {
  /** Total session duration in milliseconds */
  totalDuration: number;
  /** Total click count */
  totalClicks: number;
  /** Total scroll events count */
  totalScrolls: number;
  /** Total input change events count */
  totalInputs: number;
  /** Breakdown by operation type */
  operationBreakdown: OperationTally[];
  /** Time spent per page */
  durationBreakdown: DurationEntry[];
  /** Ordered interaction path */
  interactionPath: PathStep[];
}

/** The unified analytics output combining heatmap + stats */
export interface AnalyticsData {
  heatmap: HeatmapData;
  stats: StatsData;
}

/** Metric type identifiers for stats panel */
export type StatsMetric = 'clicks' | 'scrolls' | 'inputs' | 'duration' | 'path';

/** Stats panel layout mode */
export type StatsPanelLayout = 'sidebar' | 'bottom' | 'modal';
