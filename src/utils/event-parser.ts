/**
 * Event parser — normalizes input into a validated RrwebEvent[] ready for
 * replay and analytics.
 *
 * Accepts four input formats:
 *   - any[]      → direct array of event objects (zero parsing overhead)
 *   - chunk[]    → business shard array; each `fcontent` is LZ-String base64
 *                  compressed events — decompress, order by `fevent_order`,
 *                  merge (see mergeChunkedEvents)
 *   - string     → JSON.parse then validate
 *   - null/undef → returns empty array
 *
 * Filters out entries missing required fields (timestamp, type).
 */

import LZString from 'lz-string';
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

/**
 * Detect whether a value is a chunked data array (business shard format),
 * where each element carries a compressed `fcontent` fragment rather than
 * a single event. Used to route input to `mergeChunkedEvents` vs `parseEvents`.
 *
 * Detection: non-empty array whose first element is an object with a string
 * `fcontent` field. Raw event arrays have `timestamp`/`type` on their first
 * element instead, so the two formats never overlap.
 */
export function isChunkedData(raw: unknown): boolean {
  if (!Array.isArray(raw) || raw.length === 0) return false;
  const first = raw[0];
  if (typeof first !== 'object' || first === null) return false;
  return typeof (first as Record<string, unknown>).fcontent === 'string';
}

/**
 * Merge a chunked data array (business shard format) into a single
 * RrwebEvent[] ready for replay.
 *
 * Each chunk's `fcontent` is an LZ-String base64-compressed JSON array of
 * rrweb events. Chunks are ordered by `fevent_order` (ascending, stable),
 * decompressed, parsed, and concatenated. The result is filtered to valid
 * event entries and stably sorted by `timestamp` so the global timeline is
 * strictly increasing (rrweb requires this for playback).
 *
 * `fevent_count`, when present on every chunk, is used only as a sanity
 * check: a mismatch logs a warning but does not abort.
 */
export function mergeChunkedEvents(chunks: any[]): RrwebEvent[] {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];

  // 1. Stable sort by fevent_order when every chunk carries the field
  const hasOrder = chunks.every(
    (c) => c && typeof c === 'object' && typeof c.fevent_order === 'number',
  );
  const ordered = hasOrder
    ? [...chunks].sort(
        (a, b) => (a.fevent_order as number) - (b.fevent_order as number),
      )
    : chunks;

  // 2. Decompress + parse each chunk, concatenate
  const merged: any[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const chunk = ordered[i];
    const compressed = chunk?.fcontent;
    if (typeof compressed !== 'string') {
      throw new Error(`Merge failed: chunk ${i} missing string fcontent`);
    }
    const decompressed = LZString.decompressFromBase64(compressed);
    if (decompressed === null) {
      throw new Error(
        `Merge failed: chunk ${i} fcontent is invalid base64`,
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(decompressed);
    } catch (e) {
      throw new Error(
        `Merge failed: chunk ${i} fcontent is not valid JSON — ${(e as Error).message}`,
      );
    }
    if (!Array.isArray(parsed)) {
      throw new Error(
        `Merge failed: chunk ${i} decompressed content is not an array (got ${typeof parsed})`,
      );
    }
    merged.push(...parsed);
  }

  // 3. Filter to valid event entries (reuse parseEvents' guard)
  const events = merged.filter(isValidEventEntry) as RrwebEvent[];

  // 4. Stable sort by timestamp so the global timeline is increasing
  events.sort((a, b) => a.timestamp - b.timestamp);

  // 5. Optional fevent_count sanity check (warn-only, never abort)
  const hasCount = chunks.every(
    (c) => c && typeof c === 'object' && typeof c.fevent_count === 'number',
  );
  if (hasCount) {
    const expected = ordered.reduce(
      (sum, c) => sum + (c.fevent_count as number),
      0,
    );
    if (expected !== events.length) {
      console.warn(
        `mergeChunkedEvents: fevent_count sum (${expected}) does not match merged event count (${events.length})`,
      );
    }
  }

  return events;
}
