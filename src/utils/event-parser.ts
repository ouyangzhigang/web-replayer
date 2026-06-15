/**
 * Event parser — validates and transforms raw decompressed JSON
 * into a clean RrwebEvent[] ready for replay and analytics.
 */

import { RrwebEvent, RrwebEventType, SessionMetadata } from '../types/events';

const DEFAULT_METADATA: SessionMetadata = { href: '', width: 0, height: 0 };

/**
 * Parse a decompressed JSON string into a validated event array.
 * Filters out entries missing required fields (timestamp, type).
 */
export function parseEvents(raw: string | null | undefined): RrwebEvent[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Event parse error: invalid JSON — ${(e as Error).message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Event parse error: expected array, got ${typeof parsed}`);
  }

  return parsed.filter(isValidEventEntry) as RrwebEvent[];
}

function isValidEventEntry(entry: unknown): boolean {
  if (typeof entry !== 'object' || entry === null) return false;
  const obj = entry as Record<string, unknown>;
  return typeof obj.timestamp === 'number' && typeof obj.type === 'number';
}

/**
 * Validate that an event array contains the minimum required events
 * for replay: at least one Meta event and one FullSnapshot.
 */
export function validateEvents(events: RrwebEvent[]): boolean {
  if (events.length === 0) return false;
  const hasMeta = events.some((e) => e.type === RrwebEventType.Meta);
  const hasSnapshot = events.some((e) => e.type === RrwebEventType.FullSnapshot);
  return hasMeta && hasSnapshot;
}

/**
 * Extract session metadata from the first Meta event.
 * Returns defaults if no Meta event is found.
 */
export function extractMetadata(events: RrwebEvent[]): SessionMetadata {
  const metaEvent = events.find((e) => e.type === RrwebEventType.Meta);
  if (!metaEvent || !('data' in metaEvent)) return DEFAULT_METADATA;
  const data = (metaEvent as { data: Record<string, unknown> }).data;
  return {
    href: typeof data.href === 'string' ? data.href : '',
    width: typeof data.width === 'number' ? data.width : 0,
    height: typeof data.height === 'number' ? data.height : 0,
    userAgent: typeof data.userAgent === 'string' ? data.userAgent : undefined,
  };
}
