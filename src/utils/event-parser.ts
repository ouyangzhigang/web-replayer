/**
 * Event parser — normalizes input into a validated RrwebEvent[] ready for
 * replay and analytics.
 *
 * Accepts three input formats:
 *   - any[]      → direct array of event objects (zero parsing overhead)
 *   - string     → JSON.parse then validate
 *   - null/undef → returns empty array
 *
 * Filters out entries missing required fields (timestamp, type).
 */

import { RrwebEvent, RrwebEventType, SessionMetadata } from '../types/events';

const DEFAULT_METADATA: SessionMetadata = { href: '', width: 0, height: 0 };

/**
 * Normalize input into a validated event array.
 *   - Array input: filter directly (no JSON.parse)
 *   - String input: JSON.parse then filter
 *   - null/undefined: return []
 */
export function parseEvents(raw: string | null | undefined | any[]): RrwebEvent[] {
  if (!raw) return [];

  // Direct array — zero JSON.parse overhead
  if (Array.isArray(raw)) {
    return raw.filter(isValidEventEntry) as RrwebEvent[];
  }

  // String — must be JSON-serialized
  if (typeof raw === 'string') {
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

  // Unrecognized type
  return [];
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
