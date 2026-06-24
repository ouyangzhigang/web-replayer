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
  /** Component width — CSS value ("85%", "800px") or bare number ("800" → 800px) */
  width?: string;
  /** Component height — CSS value ("888px", "60vh") or bare number ("888" → 888px) */
  height?: string;
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
  /** Auto-hide controls bar when mouse is idle during playback */
  autoHideControls?: boolean;
  /** Maximum scale ratio in fullscreen mode (default 1.15).
   *  Prevents small recorded pages from being blown up too large.
   *  When the contain-mode scale exceeds this ratio, the replay is
   *  capped at original size × fullscreenMaxRatio and centered.
   *  Only applies in fullscreen — non-fullscreen scaling is unchanged.
   */
  fullscreenMaxRatio?: number;
  /** Allow scripts execution in the replay iframe (default true) */
  unsafeAllowScripts?: boolean;
  /** Enable user interaction with the replayed UI after playback (default false) */
  interact?: boolean;
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

export interface ReplayFullscreenChangeDetail {
  /** Whether the <web-replayer> host is currently in fullscreen mode */
  isFullscreen: boolean;
}
