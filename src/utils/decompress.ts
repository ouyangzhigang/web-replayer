/**
 * Decompress engine — auto-detects compression format and decompresses
 * rrweb event data. Supports LZ-String (URI-safe, UTF-16, Base64) and
 * pako (gzip → base64-encoded).
 *
 * Detection strategy (probe + heuristic-based):
 *   1. Check pako gzip magic bytes (0x1f 0x8b) in base64
 *   2. Probe UTF-16 decompress (validates result is JSON-like)
 *   3. Heuristic: if string has '=' or '/' → LZ-String Base64 markers
 *      (URI-safe NEVER produces '=' or '/', so these are definitive)
 *   4. Probe URI-safe decompress (only if no Base64 markers found)
 *   5. Probe Base64 decompress
 *   6. Check raw JSON (valid JSON parse)
 *   7. Unknown — decompress() will brute-force
 */

import LZString from 'lz-string';
import pako from 'pako';

/** Supported compression format identifiers */
export enum DecompressFormat {
  Unknown = 'unknown',
  LzStringUriSafe = 'lz-string-uri-safe',
  LzStringUtf16 = 'lz-string-utf16',
  LzStringBase64 = 'lz-string-base64',
  PakoBase64 = 'pako-base64',
  Raw = 'raw',
}

/** Base64-encoded gzip binary has distinctive byte patterns */
const GZIP_MAGIC_BYTES = [0x1f, 0x8b]; // gzip header magic

/**
 * Quick check whether a string looks like valid JSON content
 * (starts with [ or {) — used to filter out false-positive decompressions.
 */
function looksLikeJson(input: string | null): boolean {
  if (!input || input.length === 0) return false;
  const first = input.charAt(0);
  return first === '[' || first === '{';
}

/**
 * Detect compression format by probing each decompressor.
 * Order matters: UTF-16 and URI-safe are tried before Base64 because
 * Base64's keystring overlaps with URI-safe (both share '+' at position 62).
 */
export function detectFormat(input: string): DecompressFormat {
  if (!input || input.length === 0) return DecompressFormat.Unknown;

  // 1. Pako gzip is base64-encoded binary — check for gzip magic bytes
  try {
    const binary = atob(input);
    const firstByte = binary.charCodeAt(0);
    const secondByte = binary.charCodeAt(1);
    if (firstByte === GZIP_MAGIC_BYTES[0] && secondByte === GZIP_MAGIC_BYTES[1]) {
      return DecompressFormat.PakoBase64;
    }
  } catch {
    // Not valid base64 — skip pako detection
  }

  // 2. Probe LZ-String UTF-16 — validate result is JSON-like
  const utf16Probe = LZString.decompressFromUTF16(input);
  if (looksLikeJson(utf16Probe)) {
    return DecompressFormat.LzStringUtf16;
  }

  // 3. Check for LZ-String Base64 distinctive markers:
  //    '=' (padding) or '/' (position 63). URI-safe NEVER produces these.
  //    If present, skip URI-safe probe and go straight to Base64.
  const hasBase64Markers = input.includes('=') || input.includes('/');
  if (!hasBase64Markers) {
    // Probe LZ-String URI-safe — must be tried before Base64
    // because Base64 decompressor can also handle URI-safe strings
    // that don't contain '/' or '='.
    const uriSafeProbe = LZString.decompressFromEncodedURIComponent(input);
    if (looksLikeJson(uriSafeProbe)) {
      return DecompressFormat.LzStringUriSafe;
    }
  }

  // 4. Probe LZ-String Base64
  const base64Probe = LZString.decompressFromBase64(input);
  if (looksLikeJson(base64Probe)) {
    return DecompressFormat.LzStringBase64;
  }

  // 5. Check if it's already valid JSON (raw/uncompressed)
  try {
    JSON.parse(input);
    return DecompressFormat.Raw;
  } catch {
    return DecompressFormat.Unknown;
  }
}

/**
 * Decompress a compressed string into the original JSON string.
 * Auto-detects format, then applies the matching decompression.
 * Throws on empty input or irrecoverable decompression failure.
 */
export function decompress(input: string): string {
  if (!input || input.length === 0) {
    throw new Error('Decompress failed: empty input');
  }

  const format = detectFormat(input);

  switch (format) {
    case DecompressFormat.LzStringUriSafe:
      return tryLzString(input, LZString.decompressFromEncodedURIComponent);

    case DecompressFormat.LzStringUtf16:
      return tryLzString(input, LZString.decompressFromUTF16);

    case DecompressFormat.LzStringBase64:
      return tryLzString(input, LZString.decompressFromBase64);

    case DecompressFormat.PakoBase64:
      return tryPako(input);

    case DecompressFormat.Raw:
      return input;

    case DecompressFormat.Unknown:
      // Final fallback: brute-force try all decompressors
      return bruteForceDecompress(input);

    default:
      throw new Error(`Decompress failed: unknown format "${format}"`);
  }
}

/** Try an LZ-String decompressor, throw on null result */
function tryLzString(input: string, decompressor: (s: string) => string | null): string {
  const result = decompressor(input);
  if (result === null) {
    throw new Error(`Decompress failed: LZ-String returned null for input length ${input.length}`);
  }
  return result;
}

/** Decode base64 → Uint8Array → pako inflate → TextDecoder → string */
function tryPako(input: string): string {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const inflated = pako.inflate(bytes, { raw: false });
  return new TextDecoder().decode(inflated);
}

/** Last resort: try every decompressor sequentially */
function bruteForceDecompress(input: string): string {
  const decompressors: [string, (s: string) => string | null][] = [
    ['lz-uri', LZString.decompressFromEncodedURIComponent],
    ['lz-utf16', LZString.decompressFromUTF16],
    ['lz-base64', LZString.decompressFromBase64],
    ['lz-raw', LZString.decompress],
    ['raw', (s) => s],
  ];

  for (const [, fn] of decompressors) {
    const result = fn(input);
    if (result !== null && looksLikeJson(result)) return result;
  }

  // Try pako (base64-encoded binary)
  try {
    return tryPako(input);
  } catch {
    // pako also failed
  }

  // Try raw JSON parse
  try {
    JSON.parse(input);
    return input;
  } catch {
    // nothing worked
  }

  throw new Error(
    `Decompress failed: no decompressor matched input (length ${input.length}, first chars "${input.slice(0, 20)}")`,
  );
}
