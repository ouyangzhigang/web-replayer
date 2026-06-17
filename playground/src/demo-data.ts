import LZString from 'lz-string';

/**
 * Create a valid rrweb v2 demo session for Playground testing.
 *
 * Key rules:
 *   - Every node in FullSnapshot MUST have an `id` field (numeric)
 *   - IncrementalSource values match rrweb v2 enum:
 *     Mutation=0, MouseMove=1, MouseInteraction=2, Scroll=3, Input=5
 *   - MouseInteraction data has x/y as direct fields (not in position sub-object)
 *   - EventType: Meta=4, FullSnapshot=2, IncrementalSnapshot=3
 */
function createDemoSession(stringify: boolean = true): string | any[] {
  const events = [{}];

  return stringify ? JSON.stringify(events) : events;
}

/** LZ-String URI-safe compressed demo data (most common format for URL embedding) */
export const DEMO_DATA_URI = LZString.compressToEncodedURIComponent(createDemoSession() as string);

/** LZ-String UTF-16 compressed demo data (common for localStorage) */
export const DEMO_DATA_UTF16 = LZString.compressToUTF16(createDemoSession() as string);

/** Raw JSON (uncompressed — tests the Raw format detection path) */
export const DEMO_DATA_RAW = createDemoSession();

export const DEMO_DATA_VALUE = createDemoSession(false);
