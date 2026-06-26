import { describe, it, expect, vi } from 'vitest';
import LZString from 'lz-string';
import { parseEvents, extractMetadata, validateEvents, isChunkedData, mergeChunkedEvents } from '../src/utils/event-parser';
import { RrwebEventType } from '../src/types/events';

describe('parseEvents', () => {
  it('parses valid JSON string into events array', () => {
    const json = JSON.stringify([
      { timestamp: 1000, type: RrwebEventType.Meta, data: { href: 'https://example.com' } },
      { timestamp: 2000, type: RrwebEventType.FullSnapshot, data: { node: {} } },
    ]);
    const events = parseEvents(json);
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe(RrwebEventType.Meta);
    expect(events[1].type).toBe(RrwebEventType.FullSnapshot);
  });

  it('returns empty array for null/undefined input', () => {
    expect(parseEvents(null as unknown as string)).toEqual([]);
    expect(parseEvents(undefined as unknown as string)).toEqual([]);
  });

  it('throws on malformed JSON', () => {
    expect(() => parseEvents('not-json')).toThrow(/parse/i);
  });

  it('throws on non-array JSON', () => {
    expect(() => parseEvents(JSON.stringify({ foo: 'bar' }))).toThrow(/array/i);
  });

  it('filters out events with invalid structure', () => {
    const json = JSON.stringify([
      { timestamp: 1000, type: RrwebEventType.Meta },
      { timestamp: null, type: RrwebEventType.IncrementalSnapshot },
      {},
    ]);
    const events = parseEvents(json);
    expect(events).toHaveLength(1);
  });
});

describe('validateEvents', () => {
  it('returns true for valid events array', () => {
    const events = [
      { timestamp: 1000, type: RrwebEventType.Meta, data: {} },
      { timestamp: 2000, type: RrwebEventType.FullSnapshot, data: { node: {} } },
    ];
    expect(validateEvents(events)).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(validateEvents([])).toBe(false);
  });

  it('returns false for array without Meta event', () => {
    const events = [
      { timestamp: 2000, type: RrwebEventType.FullSnapshot, data: { node: {} } },
    ];
    expect(validateEvents(events)).toBe(false);
  });

  it('returns false for array without FullSnapshot event', () => {
    const events = [
      { timestamp: 1000, type: RrwebEventType.Meta, data: {} },
    ];
    expect(validateEvents(events)).toBe(false);
  });
});

describe('extractMetadata', () => {
  it('extracts metadata from Meta event', () => {
    const events = [
      { timestamp: 1000, type: RrwebEventType.Meta, data: { href: 'https://example.com', width: 1920, height: 1080 } },
      { timestamp: 2000, type: RrwebEventType.FullSnapshot, data: { node: {} } },
    ];
    const meta = extractMetadata(events);
    expect(meta.href).toBe('https://example.com');
    expect(meta.width).toBe(1920);
    expect(meta.height).toBe(1080);
  });

  it('returns default metadata when no Meta event exists', () => {
    const events = [
      { timestamp: 2000, type: RrwebEventType.FullSnapshot, data: { node: {} } },
    ];
    const meta = extractMetadata(events);
    expect(meta.href).toBe('');
    expect(meta.width).toBe(0);
    expect(meta.height).toBe(0);
  });
});

// ── helpers for chunked (business shard) format ──
/** Build a chunk whose fcontent is the LZ-String base64 compression of `events`. */
function makeChunk(events: any[], order: number, count?: number): any {
  const chunk: any = {
    fcontent: LZString.compressToBase64(JSON.stringify(events)),
    fevent_order: order,
  };
  if (count !== undefined) chunk.fevent_count = count;
  return chunk;
}

describe('isChunkedData', () => {
  it('returns true for an array of chunks with string fcontent', () => {
    expect(isChunkedData([{ fcontent: 'abc', fevent_order: 0 }])).toBe(true);
  });

  it('returns false for a raw event array (has timestamp/type, no fcontent)', () => {
    expect(isChunkedData([{ timestamp: 1, type: RrwebEventType.Meta }])).toBe(false);
  });

  it('returns false for an empty array', () => {
    expect(isChunkedData([])).toBe(false);
  });

  it('returns false for non-array values', () => {
    expect(isChunkedData('string')).toBe(false);
    expect(isChunkedData(null)).toBe(false);
    expect(isChunkedData(undefined)).toBe(false);
    expect(isChunkedData({})).toBe(false);
  });

  it('returns false when the first element has a non-string fcontent', () => {
    expect(isChunkedData([{ fcontent: 123 }])).toBe(false);
  });
});

describe('mergeChunkedEvents', () => {
  const meta = { timestamp: 1000, type: RrwebEventType.Meta, data: { href: 'https://x.com' } };
  const snap = { timestamp: 1100, type: RrwebEventType.FullSnapshot, data: { node: {} } };
  const inc1 = { timestamp: 2000, type: RrwebEventType.IncrementalSnapshot, data: {} };
  const inc2 = { timestamp: 3000, type: RrwebEventType.IncrementalSnapshot, data: {} };

  it('merges a single chunk into an event array', () => {
    const events = mergeChunkedEvents([makeChunk([meta, snap, inc1], 0, 3)]);
    expect(events).toHaveLength(3);
  });

  it('orders chunks by fevent_order before merging', () => {
    // Chunks passed in reverse order; inc2 belongs to the later chunk
    const chunkLater = makeChunk([inc2], 1, 1);
    const chunkFirst = makeChunk([meta, snap, inc1], 0, 3);
    const events = mergeChunkedEvents([chunkLater, chunkFirst]);
    // Global timestamp sort yields ascending order regardless of chunk origin
    expect(events.map((e) => e.timestamp)).toEqual([1000, 1100, 2000, 3000]);
  });

  it('sorts the merged result by timestamp globally', () => {
    // Out-of-order events within a single chunk
    const chunk = makeChunk([inc1, snap, meta], 0, 3);
    const events = mergeChunkedEvents([chunk]);
    expect(events.map((e) => e.timestamp)).toEqual([1000, 1100, 2000]);
  });

  it('filters out entries missing timestamp/type', () => {
    const chunk = makeChunk([meta, { foo: 'bar' }, snap], 0);
    const events = mergeChunkedEvents([chunk]);
    expect(events).toHaveLength(2);
  });

  it('warns when fevent_count sum does not match the merged count', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Claims 5 events but actually carries 2
    mergeChunkedEvents([makeChunk([meta, snap], 0, 5)]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/fevent_count/i);
    warnSpy.mockRestore();
  });

  it('does not warn when fevent_count matches', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mergeChunkedEvents([makeChunk([meta, snap, inc1], 0, 3)]);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('throws on invalid base64 fcontent', () => {
    // 'invalid' is not a valid LZ-String base64 stream → decompress returns null
    expect(() => mergeChunkedEvents([{ fcontent: 'invalid', fevent_order: 0 }])).toThrow(
      /invalid base64/i,
    );
  });

  it('throws when decompressed content is not a JSON array', () => {
    const fcontent = LZString.compressToBase64(JSON.stringify({ not: 'array' }));
    expect(() => mergeChunkedEvents([{ fcontent, fevent_order: 0 }])).toThrow(
      /not an array/i,
    );
  });

  it('returns an empty array for empty input', () => {
    expect(mergeChunkedEvents([])).toEqual([]);
  });
});
