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

/** Incremental snapshot data — mirrors rrweb v2 incrementalData structure.
 *  Coordinates (x, y) are direct fields in the data object for mouse/scroll events,
 *  matching rrweb's actual format (no separate `position` sub-object). */
export interface IncrementalSnapshotData {
  source: IncrementalSource;
  /** Payload varies by source — kept as unknown for flexibility */
  data: Record<string, unknown>;
}

/** Incremental source types — matches rrweb v2 IncrementalSource enum exactly */
export enum IncrementalSource {
  Mutation = 0,
  MouseMove = 1,
  MouseInteraction = 2,
  Scroll = 3,
  ViewportResize = 4,
  Input = 5,
  TouchMove = 6,
  MediaInteraction = 7,
  StyleSheetRule = 8,
  CanvasMutation = 9,
  Font = 10,
  Log = 11,
  Drag = 12,
  StyleDeclaration = 13,
  Selection = 14,
  AdoptedStyleSheet = 15,
  CustomElement = 16,
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
