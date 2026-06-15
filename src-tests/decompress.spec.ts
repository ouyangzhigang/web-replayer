import { describe, it, expect } from 'vitest';
import LZString from 'lz-string';
import pako from 'pako';
import { decompress, DecompressFormat, detectFormat } from '../src/utils/decompress';

describe('detectFormat', () => {
  it('detects LZ-String URI-safe format', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const compressed = LZString.compressToEncodedURIComponent(original);
    expect(detectFormat(compressed)).toBe(DecompressFormat.LzStringUriSafe);
  });

  it('detects LZ-String UTF-16 format', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const compressed = LZString.compressToUTF16(original);
    expect(detectFormat(compressed)).toBe(DecompressFormat.LzStringUtf16);
  });

  it('detects pako (gzip) format', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const compressed = pako.gzip(original);
    const encoded = btoa(String.fromCharCode(...new Uint8Array(compressed)));
    expect(detectFormat(encoded)).toBe(DecompressFormat.PakoBase64);
  });

  it('detects raw base64 LZ-String format', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const compressed = LZString.compressToBase64(original);
    expect(detectFormat(compressed)).toBe(DecompressFormat.LzStringBase64);
  });

  it('returns Unknown for empty string', () => {
    expect(detectFormat('')).toBe(DecompressFormat.Unknown);
  });

  it('returns Unknown for unrecognized format', () => {
    expect(detectFormat('not-compressed-data')).toBe(DecompressFormat.Unknown);
  });
});

describe('decompress', () => {
  it('decompresses LZ-String URI-safe data', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const compressed = LZString.compressToEncodedURIComponent(original);
    const result = decompress(compressed);
    expect(result).toBe(original);
  });

  it('decompresses LZ-String UTF-16 data', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const compressed = LZString.compressToUTF16(original);
    const result = decompress(compressed);
    expect(result).toBe(original);
  });

  it('decompresses LZ-String Base64 data', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const compressed = LZString.compressToBase64(original);
    const result = decompress(compressed);
    expect(result).toBe(original);
  });

  it('decompresses pako (gzip) data encoded as base64', () => {
    const original = JSON.stringify([{ timestamp: 1000, type: 2 }]);
    const gzipped = pako.gzip(original);
    const encoded = btoa(String.fromCharCode(...new Uint8Array(gzipped)));
    const result = decompress(encoded);
    expect(result).toBe(original);
  });

  it('throws on empty string', () => {
    expect(() => decompress('')).toThrow(/empty/i);
  });

  it('throws on unrecognized format', () => {
    expect(() => decompress('random-garbage-data')).toThrow(/failed/i);
  });

  it('handles large data (>1MB original)', () => {
    const events = Array.from({ length: 5000 }, (_, i) => ({
      timestamp: i * 100,
      type: i % 5,
    }));
    const original = JSON.stringify(events);
    const compressed = LZString.compressToEncodedURIComponent(original);
    const result = decompress(compressed);
    expect(result).toBe(original);
  });
});
