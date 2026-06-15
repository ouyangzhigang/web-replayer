import { describe, it, expect } from 'vitest';
import { parseEvents, extractMetadata, validateEvents } from '../src/utils/event-parser';
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
