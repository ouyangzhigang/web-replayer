/**
 * Component prop type interfaces — public API contracts
 * for each Web Component in the library.
 */

import { RrwebEvent, SessionMetadata } from './events';
import {
  HeatmapData,
  HeatmapType,
  HeatmapColorScheme,
  StatsData,
  StatsMetric,
  StatsPanelLayout,
} from './analytics';

/** <web-replayer> component props */
export interface WebReplayerProps {
  /** Session data — compressed string, JSON string, or event array */
  data: string | any[];
  /** Replay area width in pixels (auto-fits container if unset) */
  width?: number;
  /** Replay area height in pixels (auto-fits container if unset) */
  height?: number;
  /** Auto-play on data load */
  autoPlay?: boolean;
  /** Playback speed multiplier (1 = normal) */
  speed?: number;
  /** Show playback control bar */
  showControls?: boolean;
  /** Overlay heatmap on replay canvas */
  showHeatmap?: boolean;
  /** Show stats panel alongside replay */
  showStats?: boolean;
  /** Jump to specific timestamp on load (ms) */
  startTime?: number;
}

/** <web-heatmap> component props */
export interface WebHeatmapProps {
  /** Decompressed rrweb events to compute heatmap from */
  events: RrwebEvent[];
  /** Overlay heatmap on this element (e.g. the replay container) */
  overlayOn?: HTMLElement;
  /** Filter heatmap by interaction type */
  type?: HeatmapType;
  /** Heatmap layer transparency (0 = invisible, 1 = opaque) */
  opacity?: number;
  /** Color palette for intensity rendering */
  colorScheme?: HeatmapColorScheme;
}

/** <web-stats-panel> component props */
export interface WebStatsPanelProps {
  /** Decompressed rrweb events to compute stats from */
  events: RrwebEvent[];
  /** Panel layout position */
  layout?: StatsPanelLayout;
  /** Which metrics to display */
  metrics?: StatsMetric[];
}

/** Custom event detail types emitted by components */
export interface ReplayReadyDetail {
  replayer: unknown;
  metadata: SessionMetadata;
}

export interface ReplayTimeUpdateDetail {
  currentTime: number;
  totalTime: number;
}

export interface HeatmapReadyDetail {
  heatmapData: HeatmapData;
}

export interface StatsReadyDetail {
  statsData: StatsData;
}

export interface DecompressErrorDetail {
  error: string;
  rawInput: string | any[];
}
