/**
 * rrweb event types — mirrors the rrweb v2 event structure.
 * These types define the shape of recorded session data that flows
 * through the decompression and parsing pipeline.
 */

/** Every rrweb event carries a numeric timestamp and a type discriminator */
export interface RrwebEventBase {
  timestamp: number;
  type: RrwebEventType;
}

/** The full event type enum from rrweb v2 */
export enum RrwebEventType {
  DomContentLoaded = 0,
  Load = 1,
  FullSnapshot = 2,
  IncrementalSnapshot = 3,
  Meta = 4,
  Custom = 5,
  Font = 6,
}

/** Incremental snapshot data payloads */
export interface IncrementalSnapshotData {
  source: IncrementalSource;
  /** Payload varies by source — kept as unknown for flexibility */
  data: Record<string, unknown>;
  /** Position info for mouse/interaction events */
  position?: { x: number; y: number; id: number };
  /** Source node ID for interaction events */
  id?: number;
}

/** Incremental source types (subset relevant for analytics) */
export enum IncrementalSource {
  MouseMove = 0,
  MouseInteraction = 1,
  Scroll = 2,
  ViewportResize = 3,
  Input = 4,
  TouchMove = 5,
  MediaInteraction = 6,
  StyleDeclaration = 7,
  CanvasMutation = 8,
  Font = 9,
  Log = 10,
  Drag = 11,
  StyleMutation = 12,
  Selection = 13,
  AdoptedStyleSheet = 14,
  CustomElementAnnotation = 15,
}

/** Mouse interaction types within MouseInteraction source */
export enum MouseInteractionType {
  MouseUp = 0,
  MouseDown = 1,
  Click = 2,
  ContextMenu = 3,
  DoubleClick = 4,
  Focus = 5,
  Blur = 6,
  TouchStart = 7,
  TouchEnd = 8,
}

/** A full rrweb event with all possible payloads */
export type RrwebEvent = RrwebEventBase &
  (
    | { type: RrwebEventType.FullSnapshot; data: { node: unknown; initialOffset: unknown } }
    | { type: RrwebEventType.IncrementalSnapshot; data: IncrementalSnapshotData }
    | { type: RrwebEventType.Meta; data: Record<string, unknown> }
    | { type: RrwebEventType.DomContentLoaded; data: Record<string, unknown> }
    | { type: RrwebEventType.Load; data: Record<string, unknown> }
    | { type: RrwebEventType.Custom; data: Record<string, unknown> }
    | { type: RrwebEventType.Font; data: Record<string, unknown> }
  );

/** Metadata extracted from the first Meta event in a session */
export interface SessionMetadata {
  href: string;
  width: number;
  height: number;
  userAgent?: string;
}
