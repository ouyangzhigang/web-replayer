/**
 * web-replayer library entry point.
 *
 * Exports all Web Components and utility functions for npm consumers.
 * Stencil compiler uses this file to generate the dist/ output.
 */

// ── Component exports ──
export { WebReplayer } from './components/replayer/web-replayer';
export { ReplayerControls } from './components/replayer/replayer-controls';
export { WebHeatmap } from './components/heatmap/web-heatmap';
export { HeatmapCanvas } from './components/heatmap/heatmap-canvas';
export { WebStatsPanel } from './components/stats-panel/web-stats-panel';
export { StatsChart } from './components/stats-panel/stats-chart';
export { WrTooltip } from './components/shared/tooltip';

// ── Utility exports ──
export { decompress, detectFormat, DecompressFormat } from './utils/decompress';
export { parseEvents, validateEvents, extractMetadata } from './utils/event-parser';
export { computeHeatmapData, computeStatsData, computeAnalytics } from './utils/analytics';

// ── Type exports ──
export type { RrwebEvent, RrwebEventBase, SessionMetadata } from './types/events';
export { RrwebEventType, IncrementalSource, MouseInteractionType } from './types/events';
export type { HeatmapData, HeatmapPoint, StatsData, OperationTally, DurationEntry, PathStep, AnalyticsData, HeatmapType, HeatmapColorScheme, StatsMetric, StatsPanelLayout } from './types/analytics';
export type { WebReplayerProps, WebHeatmapProps, WebStatsPanelProps, ReplayReadyDetail, ReplayTimeUpdateDetail, HeatmapReadyDetail, StatsReadyDetail, DecompressErrorDetail } from './types/component-props';
