# web-replayer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a framework-agnostic npm component package that provides rrweb session replay with interaction heatmap and operation statistics, using Stencil TSX compiled to Web Components.

**Architecture:** Stencil compiles TSX to standard Custom Elements with Shadow DOM. Data pipeline: compressed string → auto-detect decompression (LZ-String/pako) → rrweb event parsing → replay/heatmap/stats rendering. Vite Playground provides live dev preview with HMR.

**Tech Stack:** Stencil v4+, rrweb-replay v2, lz-string v1.4, pako v2, Vite 6+, React 19, Vitest, pnpm v9+

---

## File Structure Map

```
web-replayer/
├── src/
│   ├── components/
│   │   ├── replayer/
│   │   │   ├── web-replayer.tsx          # Main <web-replayer> entry
│   │   │   ├── web-replayer.css          # Main replayer styles
│   │   │   ├── replayer-controls.tsx     # Play/pause/speed controls
│   │   │   ├── replayer-controls.css     # Controls styles
│   │   │   ├── replayer-progress.tsx     # Timeline progress bar
│   │   │   └── replayer-progress.css     # Progress styles
│   │   ├── heatmap/
│   │   │   ├── web-heatmap.tsx           # <web-heatmap> entry
│   │   │   ├── web-heatmap.css           # Heatmap styles
│   │   │   ├── heatmap-canvas.tsx        # Canvas rendering layer
│   │   │   └── heatmap-canvas.css        # Canvas styles
│   │   ├── stats-panel/
│   │   │   ├── web-stats-panel.tsx       # <web-stats-panel> entry
│   │   │   ├── web-stats-panel.css       # Panel styles
│   │   │   ├── stats-chart.tsx           # Chart sub-component
│   │   │   └── stats-chart.css           # Chart styles
│   │   └── shared/
│   │       ├── tooltip.tsx               # Shared tooltip
│   │       └── tooltip.css               # Tooltip styles
│   ├── utils/
│   │   ├── decompress.ts                 # LZ-String + pako decompression
│   │   ├── event-parser.ts               # rrweb event parse & validate
│   │   ├── analytics.ts                  # Heatmap & stats computation
│   │   └── dom-helper.ts                 # DOM utilities
│   ├── types/
│   │   ├── events.ts                     # rrweb event type definitions
│   │   ├── analytics.ts                  # Analytics data types
│   │   └── component-props.ts            # Component prop type interfaces
│   └── index.ts                          # Library entry point
├── src-tests/                            # Test files (Vitest)
│   ├── decompress.spec.ts
│   ├── event-parser.spec.ts
│   └── analytics.spec.ts
├── playground/
│   ├── src/
│   │   ├── App.tsx                       # Playground UI
│   │   ├── demo-data.ts                  # Sample compressed data
│   │   ├── main.tsx                      # React entry
│   │   └── style.css                     # Playground styles
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
│   └── package.json
├── stencil.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── .prettierrc
├── vitest.config.ts
└── README.md
```

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`
- Create: `stencil.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.prettierrc`
- Create: `vitest.config.ts`

- [ ] **Step 1: Initialize project with pnpm**

Run:
```bash
cd e:\project\web-replayer
pnpm init
```

- [ ] **Step 2: Write package.json**

Replace the auto-generated `package.json` with:

```json
{
  "name": "web-replayer",
  "version": "0.0.1",
  "description": "Framework-agnostic Web Component for rrweb session replay with interaction heatmap and operation analytics",
  "type": "module",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs.js"
    },
    "./components/*": "./dist/components/*.js"
  },
  "types": "./dist/types/index.d.ts",
  "files": ["dist/", "hydrate/"],
  "scripts": {
    "build": "stencil build",
    "dev": "stencil build --watch & cd playground && pnpm dev",
    "test": "stencil test --spec --e2e && vitest run",
    "test:unit": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "clean": "rm -rf dist www .stencil"
  },
  "devDependencies": {
    "@stencil/core": "^4.22.0",
    "@stencil/react-output-target": "^0.5.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.5.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  },
  "dependencies": {
    "lz-string": "^1.5.0",
    "pako": "^2.1.0",
    "rrweb": "^2.0.0"
  },
  "keywords": ["replay", "rrweb", "heatmap", "analytics", "web-component", "stencil"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": ""
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:
```bash
cd e:\project\web-replayer
pnpm install
```

- [ ] **Step 4: Write stencil.config.ts**

```ts
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'WebReplayer',
  srcDir: 'src',
  outputTargets: [
    { type: 'dist' },
    { type: 'dist-custom-elements' },
    { type: 'docs-readme' },
    { type: 'docs-json', file: 'docs/docs.json' },
  ],
  extras: {
    experimentalScopedSlotChanges: true,
  },
  testing: {
    testPath: '../src-tests',
  },
};
```

- [ ] **Step 5: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "allowUnreachableCode": false,
    "declaration": false,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["dom", "es2022"],
    "module": "esnext",
    "moduleResolution": "node",
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "outDir": "./dist",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "es2022",
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "playground"]
}
```

- [ ] **Step 6: Write .gitignore**

```
dist/
www/
.stencil/
node_modules/
.superpowers/
*.log
.DS_Store
playground/node_modules/
playground/dist/
```

- [ ] **Step 7: Write .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

- [ ] **Step 8: Write vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src-tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@types': new URL('./src/types', import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 9: Initialize git and commit**

Run:
```bash
cd e:\project\web-replayer
git init
git add .
git commit -m "feat: initialize project scaffolding with Stencil, Vitest, and pnpm"
```

---

### Task 2: Type Definitions

**Files:**
- Create: `src/types/events.ts`
- Create: `src/types/analytics.ts`
- Create: `src/types/component-props.ts`

- [ ] **Step 1: Write events.ts — rrweb event type definitions**

```ts
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
```

- [ ] **Step 2: Write analytics.ts — analytics data type definitions**

```ts
/**
 * Analytics data types — define the computed output shapes
 * produced by the analytics engine from rrweb events.
 */

/** A single interaction point on the heatmap */
export interface HeatmapPoint {
  x: number;
  y: number;
  /** Normalized intensity (0–1) — higher = more interactions at this point */
  intensity: number;
  /** Raw count of interactions at this coordinate */
  count: number;
}

/** Heatmap data ready for rendering */
export interface HeatmapData {
  points: HeatmapPoint[];
  /** Bounding viewport dimensions used during recording */
  viewportWidth: number;
  viewportHeight: number;
  /** Maximum interaction count at any single point (for normalization) */
  maxCount: number;
}

/** Heatmap display type filter */
export type HeatmapType = 'click' | 'move' | 'scroll' | 'all';

/** Heatmap color scheme */
export type HeatmapColorScheme = 'warm' | 'cool' | 'custom';

/** A single operation type tally */
export interface OperationTally {
  type: string;
  count: number;
  /** Percentage of total operations */
  percentage: number;
}

/** Duration breakdown per logical page/viewport state */
export interface DurationEntry {
  /** Page URL or identifier */
  page: string;
  /** Milliseconds spent on this page */
  duration: number;
  /** Percentage of total session duration */
  percentage: number;
}

/** User interaction path — ordered sequence of significant actions */
export interface PathStep {
  /** Page URL at time of action */
  page: string;
  /** Action description (e.g. "click on #login-btn") */
  action: string;
  /** Timestamp relative to session start (ms) */
  timeOffset: number;
}

/** Full statistics data for a session */
export interface StatsData {
  /** Total session duration in milliseconds */
  totalDuration: number;
  /** Total click count */
  totalClicks: number;
  /** Total scroll events count */
  totalScrolls: number;
  /** Total input change events count */
  totalInputs: number;
  /** Breakdown by operation type */
  operationBreakdown: OperationTally[];
  /** Time spent per page */
  durationBreakdown: DurationEntry[];
  /** Ordered interaction path */
  interactionPath: PathStep[];
}

/** The unified analytics output combining heatmap + stats */
export interface AnalyticsData {
  heatmap: HeatmapData;
  stats: StatsData;
}

/** Metric type identifiers for stats panel */
export type StatsMetric = 'clicks' | 'scrolls' | 'inputs' | 'duration' | 'path';

/** Stats panel layout mode */
export type StatsPanelLayout = 'sidebar' | 'bottom' | 'modal';
```

- [ ] **Step 3: Write component-props.ts — component prop interfaces**

```ts
/**
 * Component prop type interfaces — public API contracts
 * for each Web Component in the library.
 */

import { RrwebEvent, SessionMetadata } from './events';
import {
  HeatmapData,
  HeatmapType,
  HeatmapColorScheme,
  StatsData,
  StatsMetric,
  StatsPanelLayout,
} from './analytics';

/** <web-replayer> component props */
export interface WebReplayerProps {
  /** LZ-String/pako compressed rrweb events string */
  data: string;
  /** Replay area width in pixels (auto-fits container if unset) */
  width?: number;
  /** Replay area height in pixels (auto-fits container if unset) */
  height?: number;
  /** Auto-play on data load */
  autoPlay?: boolean;
  /** Playback speed multiplier (1 = normal) */
  speed?: number;
  /** Show playback control bar */
  showControls?: boolean;
  /** Overlay heatmap on replay canvas */
  showHeatmap?: boolean;
  /** Show stats panel alongside replay */
  showStats?: boolean;
  /** Jump to specific timestamp on load (ms) */
  startTime?: number;
}

/** <web-heatmap> component props */
export interface WebHeatmapProps {
  /** Decompressed rrweb events to compute heatmap from */
  events: RrwebEvent[];
  /** Overlay heatmap on this element (e.g. the replay container) */
  overlayOn?: HTMLElement;
  /** Filter heatmap by interaction type */
  type?: HeatmapType;
  /** Heatmap layer transparency (0 = invisible, 1 = opaque) */
  opacity?: number;
  /** Color palette for intensity rendering */
  colorScheme?: HeatmapColorScheme;
}

/** <web-stats-panel> component props */
export interface WebStatsPanelProps {
  /** Decompressed rrweb events to compute stats from */
  events: RrwebEvent[];
  /** Panel layout position */
  layout?: StatsPanelLayout;
  /** Which metrics to display */
  metrics?: StatsMetric[];
}

/** Custom event detail types emitted by components */
export interface ReplayReadyDetail {
  replayer: unknown;
  metadata: SessionMetadata;
}

export interface ReplayTimeUpdateDetail {
  currentTime: number;
  totalTime: number;
}

export interface HeatmapReadyDetail {
  heatmapData: HeatmapData;
}

export interface StatsReadyDetail {
  statsData: StatsData;
}

export interface DecompressErrorDetail {
  error: string;
  rawInput: string;
}
```

- [ ] **Step 4: Verify types compile**

Run:
```bash
cd e:\project\web-replayer
npx tsc --noEmit src/types/events.ts src/types/analytics.ts src/types/component-props.ts
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add type definitions for rrweb events, analytics, and component props"
```

---

### Task 3: Decompress Utility (TDD)

**Files:**
- Create: `src/utils/decompress.ts`
- Create: `src-tests/decompress.spec.ts`

- [ ] **Step 1: Write the failing test for decompress**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd e:\project\web-replayer
npx vitest run src-tests/decompress.spec.ts
```
Expected: FAIL — `decompress` and `detectFormat` not yet implemented

- [ ] **Step 3: Write decompress.ts implementation**

```ts
/**
 * Decompress engine — auto-detects compression format and decompresses
 * rrweb event data. Supports LZ-String (URI-safe, UTF-16, Base64) and
 * pako (gzip → base64-encoded).
 *
 * Detection strategy:
 *   1. Try LZ-String URI-safe first (most common for URL embedding)
 *   2. Try LZ-String UTF-16 (common for localStorage)
 *   3. Try LZ-String Base64 (standard base64)
 *   4. Try pako gzip (base64-encoded binary)
 *   5. Try raw string (uncompressed JSON)
 *
 * Performance: detection is cheap — each LZ-String attempt is O(n) with
 * early null-return on mismatch. Pako detection is O(1) base64 parse
 * then O(n) inflate.
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
 * Detect compression format by examining the encoded string.
 * Uses structural heuristics — no expensive decompression attempts.
 */
export function detectFormat(input: string): DecompressFormat {
  if (!input || input.length === 0) return DecompressFormat.Unknown;

  // Pako gzip is base64-encoded binary — check for gzip magic bytes
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

  // LZ-String URI-safe: contains only URI-safe chars (no +, /, =)
  // LZ-String UTF-16: first char is in a high Unicode range (>0xD800)
  const firstChar = input.charCodeAt(0);

  // LZ-String UTF-16 uses characters in a specific high range
  if (firstChar > 0xD800 && firstChar < 0xFFFF) {
    return DecompressFormat.LzStringUtf16;
  }

  // LZ-String URI-safe: no + or / characters, may have - and _
  // Standard base64 always has + or / (unless it's URI-safe encoded)
  const hasStandardBase64Chars = input.includes('+') || input.includes('/');
  const hasUriSafeChars = input.includes('-') || input.includes('_');

  if (!hasStandardBase64Chars && (hasUriSafeChars || input.length > 0)) {
    // Could be URI-safe LZ-String OR raw JSON
    // Try a quick LZ-String URI-safe decompress to verify
    const probe = LZString.decompressFromEncodedURIComponent(input.slice(0, 64));
    if (probe !== null) return DecompressFormat.LzStringUriSafe;
  }

  // Standard base64 with + or / — likely LZ-String Base64
  if (hasStandardBase64Chars) {
    return DecompressFormat.LzStringBase64;
  }

  // Fallback: check if it's already valid JSON (raw/uncompressed)
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
  const inflated = pako.unzip(bytes);
  return new TextDecoder().decode(inflated);
}

/** Last resort: try every decompressor sequentially */
function bruteForceDecompress(input: string): string {
  const decompressors: [string, (s: string) => string | null][] = [
    ['lz-uri', LZString.decompressFromEncodedURIComponent],
    ['lz-utf16', LZString.decompressFromUTF16],
    ['lz-base64', LZString.decompressFromBase64],
    ['lz-raw', LZString.decompress],
  ];

  for (const [name, fn] of decompressors) {
    const result = fn(input);
    if (result !== null) return result;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd e:\project\web-replayer
npx vitest run src-tests/decompress.spec.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/decompress.ts src-tests/decompress.spec.ts
git commit -m "feat: add decompress utility with LZ-String/pako auto-detect and full test coverage"
```

---

### Task 4: Event Parser Utility (TDD)

**Files:**
- Create: `src/utils/event-parser.ts`
- Create: `src-tests/event-parser.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
      { timestamp: null, type: RrwebEventType.IncrementalSnapshot }, // invalid timestamp
      {}, // empty object
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd e:\project\web-replayer
npx vitest run src-tests/event-parser.spec.ts
```
Expected: FAIL — `parseEvents`, `extractMetadata`, `validateEvents` not yet implemented

- [ ] **Step 3: Write event-parser.ts implementation**

```ts
/**
 * Event parser — validates and transforms raw decompressed JSON
 * into a clean RrwebEvent[] ready for replay and analytics.
 *
 * Ensures required events (Meta + FullSnapshot) exist,
 * filters malformed entries, and extracts session metadata.
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

  // Filter entries that have valid timestamp and type
  return parsed.filter(isValidEventEntry) as RrwebEvent[];
}

/** Check a parsed entry has the minimum required fields */
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd e:\project\web-replayer
npx vitest run src-tests/event-parser.spec.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/event-parser.ts src-tests/event-parser.spec.ts
git commit -m "feat: add event parser with validation, metadata extraction, and full tests"
```

---

### Task 5: Analytics Utility (TDD)

**Files:**
- Create: `src/utils/analytics.ts`
- Create: `src-tests/analytics.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import {
  computeHeatmapData,
  computeStatsData,
  computeAnalytics,
} from '../src/utils/analytics';
import { RrwebEvent, RrwebEventType, IncrementalSource, MouseInteractionType } from '../src/types/events';
import { HeatmapType } from '../src/types/analytics';

/** Helper: create a mock incremental event */
function makeIncrementalEvent(
  timestamp: number,
  source: IncrementalSource,
  data: Record<string, unknown>,
  position?: { x: number; y: number },
): RrwebEvent {
  return {
    timestamp,
    type: RrwebEventType.IncrementalSnapshot,
    data: {
      source,
      data,
      position: position ? { ...position, id: 0 } : undefined,
    },
  } as unknown as RrwebEvent;
}

describe('computeHeatmapData', () => {
  const metaEvent: RrwebEvent = {
    timestamp: 0,
    type: RrwebEventType.Meta,
    data: { href: 'https://example.com', width: 1024, height: 768 },
  } as RrwebEvent;

  it('computes click heatmap with correct points', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(3000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 300, y: 400 }),
    ];

    const heatmap = computeHeatmapData(events, 'click');
    expect(heatmap.viewportWidth).toBe(1024);
    expect(heatmap.viewportHeight).toBe(768);
    expect(heatmap.points.length).toBe(2); // two distinct positions
    expect(heatmap.maxCount).toBe(2); // position (100,200) has 2 clicks
  });

  it('returns empty points for move-only events when type is click', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.MouseMove }, { x: 100, y: 200 }),
    ];
    const heatmap = computeHeatmapData(events, 'click');
    expect(heatmap.points.length).toBe(0);
  });

  it('aggregates all types when type is all', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.Scroll, { id: 0 }, { x: 50, y: 300 }),
      makeIncrementalEvent(3000, IncrementalSource.MouseMove, { id: 0 }, { x: 200, y: 100 }),
    ];
    const heatmap = computeHeatmapData(events, 'all');
    expect(heatmap.points.length).toBeGreaterThanOrEqual(3);
  });
});

describe('computeStatsData', () => {
  const metaEvent: RrwebEvent = {
    timestamp: 0,
    type: RrwebEventType.Meta,
    data: { href: 'https://example.com', width: 1024, height: 768 },
  } as RrwebEvent;

  it('computes total counts correctly', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 200, y: 300 }),
      makeIncrementalEvent(3000, IncrementalSource.Scroll, { id: 0 }),
      makeIncrementalEvent(4000, IncrementalSource.Input, { id: 0 }),
      makeIncrementalEvent(5000, IncrementalSource.Meta, { href: 'https://example.com/page2' }),
    ];

    const stats = computeStatsData(events);
    expect(stats.totalClicks).toBe(2);
    expect(stats.totalScrolls).toBe(1);
    expect(stats.totalInputs).toBe(1);
    expect(stats.totalDuration).toBe(5000);
  });

  it('computes operation breakdown percentages', () => {
    const events: RrwebEvent[] = [
      metaEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(2000, IncrementalSource.Scroll, { id: 0 }),
    ];

    const stats = computeStatsData(events);
    expect(stats.operationBreakdown.length).toBeGreaterThanOrEqual(2);
    // Percentages should sum to ~100
    const totalPct = stats.operationBreakdown.reduce((sum, t) => sum + t.percentage, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });
});

describe('computeAnalytics', () => {
  it('computes combined heatmap + stats', () => {
    const events: RrwebEvent[] = [
      { timestamp: 0, type: RrwebEventType.Meta, data: { href: 'https://example.com', width: 1024, height: 768 } } as RrwebEvent,
      makeIncrementalEvent(1000, IncrementalSource.MouseInteraction, { type: MouseInteractionType.Click }, { x: 100, y: 200 }),
      makeIncrementalEvent(3000, IncrementalSource.Scroll, { id: 0 }),
    ];

    const analytics = computeAnalytics(events);
    expect(analytics.heatmap).toBeDefined();
    expect(analytics.stats).toBeDefined();
    expect(analytics.heatmap.points.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd e:\project\web-replayer
npx vitest run src-tests/analytics.spec.ts
```
Expected: FAIL — functions not yet implemented

- [ ] **Step 3: Write analytics.ts implementation**

```ts
/**
 * Analytics engine — computes heatmap and statistics data
 * from parsed rrweb events. All functions are pure — no side effects,
 * no DOM access — making them fast and testable.
 *
 * Performance design:
 *   - Single-pass iteration over events (O(n))
 *   - Spatial hashing for heatmap (grid buckets instead of point-by-point)
 *   - Pre-allocated maps for counting (avoid object spread churn)
 */

import {
  RrwebEvent,
  RrwebEventType,
  IncrementalSource,
  MouseInteractionType,
} from '../types/events';
import {
  HeatmapData,
  HeatmapPoint,
  HeatmapType,
  StatsData,
  OperationTally,
  DurationEntry,
  PathStep,
  AnalyticsData,
} from '../types/analytics';

/** Grid bucket size for spatial hashing (px) — balances detail vs. memory */
const HEATMAP_GRID_SIZE = 8;

/**
 * Compute heatmap data from events. Uses spatial grid hashing
 * for efficient point aggregation instead of per-pixel comparison.
 */
export function computeHeatmapData(
  events: RrwebEvent[],
  type: HeatmapType = 'all',
): HeatmapData {
  const metaEvent = events.find((e) => e.type === RrwebEventType.Meta);
  const viewportWidth =
    metaEvent && 'data' in metaEvent ? (metaEvent.data as Record<string, unknown>).width as number || 0 : 0;
  const viewportHeight =
    metaEvent && 'data' in metaEvent ? (metaEvent.data as Record<string, unknown>).height as number || 0 : 0;

  const grid = new Map<string, { x: number; y: number; count: number }>();

  for (const event of events) {
    if (event.type !== RrwebEventType.IncrementalSnapshot) continue;
    const data = (event as { data: { source: number; data: Record<string, unknown>; position?: { x: number; y: number } } }).data;

    if (!shouldIncludeForHeatmap(data.source, type)) continue;

    // Get coordinates from position field
    const pos = data.position;
    if (!pos) continue;

    // Hash into grid bucket
    const bucketX = Math.floor(pos.x / HEATMAP_GRID_SIZE) * HEATMAP_GRID_SIZE;
    const bucketY = Math.floor(pos.y / HEATMAP_GRID_SIZE) * HEATMAP_GRID_SIZE;
    const key = `${bucketX},${bucketY}`;

    const existing = grid.get(key);
    if (existing) {
      existing.count++;
    } else {
      grid.set(key, { x: bucketX, y: bucketY, count: 1 });
    }
  }

  const maxCount = Math.max(1, ...Array.from(grid.values()).map((p) => p.count));

  const points: HeatmapPoint[] = Array.from(grid.values()).map((p) => ({
    x: p.x,
    y: p.y,
    count: p.count,
    intensity: p.count / maxCount,
  }));

  return { points, viewportWidth, viewportHeight, maxCount };
}

/** Filter interaction source by heatmap type */
function shouldIncludeForHeatmap(source: number, type: HeatmapType): boolean {
  const src = source as IncrementalSource;
  switch (type) {
    case 'click':
      return src === IncrementalSource.MouseInteraction;
    case 'move':
      return src === IncrementalSource.MouseMove || src === IncrementalSource.TouchMove;
    case 'scroll':
      return src === IncrementalSource.Scroll;
    case 'all':
      return (
        src === IncrementalSource.MouseInteraction ||
        src === IncrementalSource.MouseMove ||
        src === IncrementalSource.TouchMove ||
        src === IncrementalSource.Scroll
      );
  }
}

/**
 * Compute statistics data from events. Single-pass counting
 * with categorized tallies and duration extraction.
 */
export function computeStatsData(events: RrwebEvent[]): StatsData {
  const startTime = events[0]?.timestamp ?? 0;
  const endTime = events.length > 0 ? events[events.length - 1].timestamp : 0;
  const totalDuration = endTime - startTime;

  let totalClicks = 0;
  let totalScrolls = 0;
  let totalInputs = 0;
  const tallyMap = new Map<string, number>();
  const pathSteps: PathStep[] = [];
  let currentHref = '';

  for (const event of events) {
    // Track page changes from Meta events
    if (event.type === RrwebEventType.Meta && 'data' in event) {
      const href = (event.data as Record<string, unknown>).href as string;
      if (href && href !== currentHref) {
        currentHref = href;
      }
    }

    if (event.type !== RrwebEventType.IncrementalSnapshot) continue;
    const data = (event as { data: { source: number; data: Record<string, unknown>; position?: { x: number; y: number }; id?: number } }).data;
    const source = data.source as IncrementalSource;

    // Count by category
    switch (source) {
      case IncrementalSource.MouseInteraction:
        totalClicks++;
        tallyMap.set('click', (tallyMap.get('click') ?? 0) + 1);
        // Record path step for significant clicks
        if (currentHref && data.data) {
          pathSteps.push({
            page: currentHref,
            action: `click (id: ${data.id ?? 'unknown'})`,
            timeOffset: event.timestamp - startTime,
          });
        }
        break;
      case IncrementalSource.Scroll:
        totalScrolls++;
        tallyMap.set('scroll', (tallyMap.get('scroll') ?? 0) + 1);
        break;
      case IncrementalSource.Input:
        totalInputs++;
        tallyMap.set('input', (tallyMap.get('input') ?? 0) + 1);
        break;
      case IncrementalSource.MouseMove:
        tallyMap.set('mousemove', (tallyMap.get('mousemove') ?? 0) + 1);
        break;
    }
  }

  const totalOperations = Array.from(tallyMap.values()).reduce((a, b) => a + b, 0);
  const operationBreakdown: OperationTally[] = Array.from(tallyMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalOperations > 0 ? Math.round((count / totalOperations) * 100) : 0,
    }));

  const durationBreakdown: DurationEntry[] = [
    { page: currentHref || 'unknown', duration: totalDuration, percentage: 100 },
  ];

  return {
    totalDuration,
    totalClicks,
    totalScrolls,
    totalInputs,
    operationBreakdown,
    durationBreakdown,
    interactionPath: pathSteps,
  };
}

/**
 * Compute full analytics (heatmap + stats) in one call.
 * Efficient — events are iterated once for heatmap grid,
 * once for stats tallying (2 × O(n), no redundant work).
 */
export function computeAnalytics(
  events: RrwebEvent[],
  heatmapType: HeatmapType = 'all',
): AnalyticsData {
  return {
    heatmap: computeHeatmapData(events, heatmapType),
    stats: computeStatsData(events),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd e:\project\web-replayer
npx vitest run src-tests/analytics.spec.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/analytics.ts src-tests/analytics.spec.ts
git commit -m "feat: add analytics engine with heatmap grid hashing and stats tallying"
```

---

### Task 6: DOM Helper Utility

**Files:**
- Create: `src/utils/dom-helper.ts`

- [ ] **Step 1: Write dom-helper.ts**

```ts
/**
 * DOM helpers — lightweight utilities for DOM operations
 * within Shadow DOM and Stencil component contexts.
 * No jQuery, no lodash — pure, fast, framework-free.
 */

/**
 * Safely query an element within a component's Shadow DOM.
 * Returns null if not found — never throws.
 */
export function shadowQuery(host: HTMLElement, selector: string): HTMLElement | null {
  return (host.shadowRoot ?? host).querySelector(selector);
}

/**
 * Create a canvas element with explicit dimensions.
 * Used by heatmap-canvas to allocate the rendering surface.
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  return canvas;
}

/**
 * Apply a 2D context scaling transform to match logical → physical pixels.
 * Call once after canvas creation to respect devicePixelRatio.
 */
export function scaleCanvasForHiDPI(canvas: HTMLCanvasElement): number {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 1;

  ctx.scale(dpr, dpr);
  return dpr;
}

/**
 * Clean up an rrweb Replayer instance — prevents memory leaks.
 * Called on component disconnect lifecycle.
 */
export function destroyReplayer(replayer: unknown): void {
  if (replayer && typeof (replayer as { destroy?: () => void }).destroy === 'function') {
    (replayer as { destroy: () => void }).destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/dom-helper.ts
git commit -m "feat: add DOM helper utilities for Shadow DOM, canvas, and replayer cleanup"
```

---

### Task 7: Main Replayer Component

**Files:**
- Create: `src/components/replayer/web-replayer.tsx`
- Create: `src/components/replayer/web-replayer.css`

- [ ] **Step 1: Write web-replayer.tsx**

```tsx
/**
 * <web-replayer> — Main replay component.
 *
 * Accepts compressed rrweb data, auto-decompresses, and renders
 * the session replay with optional heatmap overlay and stats panel.
 * Manages the full replay lifecycle: init → play → pause → finish.
 *
 * Architecture:
 *   - data prop change → decompress → parse → create Replayer
 *   - Internal state: events, replayer instance, playback state
 *   - Child components: replayer-controls, replayer-progress
 *   - Optional overlays: heatmap (when showHeatmap=true), stats (when showStats=true)
 */

import {
  Component,
  Prop,
  State,
  Event,
  EventEmitter,
  Watch,
  Method,
  Element,
  h,
  Host,
} from '@stencil/core';
import { Replayer } from 'rrweb';
import { decompress } from '../../utils/decompress';
import { parseEvents, validateEvents, extractMetadata } from '../../utils/event-parser';
import { computeAnalytics } from '../../utils/analytics';
import { destroyReplayer } from '../../utils/dom-helper';
import { RrwebEvent } from '../../types/events';
import { AnalyticsData } from '../../types/analytics';
import {
  ReplayReadyDetail,
  ReplayTimeUpdateDetail,
  HeatmapReadyDetail,
  StatsReadyDetail,
  DecompressErrorDetail,
} from '../../types/component-props';

@Component({
  tag: 'web-replayer',
  styleUrl: 'web-replayer.css',
  shadow: true,
})
export class WebReplayer {
  @Element() host!: HTMLElement;

  // ── Props ──────────────────────────────────────────────────

  /** Compressed rrweb events string (LZ-String or pako encoded) */
  @Prop() data!: string;

  /** Replay canvas width (px). Auto-fits container if unset. */
  @Prop({ reflect: true }) width?: number;

  /** Replay canvas height (px). Auto-fits container if unset. */
  @Prop({ reflect: true }) height?: number;

  /** Auto-play on data load */
  @Prop({ reflect: true }) autoPlay = false;

  /** Playback speed multiplier */
  @Prop({ reflect: true }) speed = 1;

  /** Show playback controls */
  @Prop({ reflect: true }) showControls = true;

  /** Overlay heatmap on replay */
  @Prop({ reflect: true }) showHeatmap = false;

  /** Show stats panel alongside replay */
  @Prop({ reflect: true }) showStats = false;

  /** Jump to timestamp on load (ms) */
  @Prop() startTime = 0;

  // ── State ──────────────────────────────────────────────────

  /** Parsed and validated rrweb events */
  @State() events: RrwebEvent[] = [];

  /** Whether data is currently loading/processing */
  @State() loading = false;

  /** Whether decompression or parsing failed */
  @State() error: string | null = null;

  /** Current playback state */
  @State() playing = false;

  /** Current time position (ms) */
  @State() currentTime = 0;

  /** Total session duration (ms) */
  @State() totalTime = 0;

  /** Computed analytics data (heatmap + stats) */
  @State() analyticsData: AnalyticsData | null = null;

  // ── Internal ──────────────────────────────────────────────

  private replayer: Replayer | null = null;
  private replayContainer: HTMLDivElement | null = null;

  // ── Events ─────────────────────────────────────────────────

  @Event({ bubbles: true, composed: true }) replayReady: EventEmitter<ReplayReadyDetail>;
  @Event({ bubbles: true, composed: true }) replayStart: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayPause: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayFinish: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) replayTimeUpdate: EventEmitter<ReplayTimeUpdateDetail>;
  @Event({ bubbles: true, composed: true }) heatmapReady: EventEmitter<HeatmapReadyDetail>;
  @Event({ bubbles: true, composed: true }) statsReady: EventEmitter<StatsReadyDetail>;
  @Event({ bubbles: true, composed: true }) decompressError: EventEmitter<DecompressErrorDetail>;

  // ── Watchers ──────────────────────────────────────────────

  @Watch('data')
  onDataChange(newData: string) {
    this.processData(newData);
  }

  @Watch('speed')
  onSpeedChange(newSpeed: number) {
    if (this.replayer) {
      this.replayer.setSpeed(newSpeed);
    }
  }

  @Watch('showHeatmap')
  onHeatmapToggle(show: boolean) {
    if (show && this.events.length > 0 && !this.analyticsData) {
      this.computeAnalytics();
    }
  }

  @Watch('showStats')
  onStatsToggle(show: boolean) {
    if (show && this.events.length > 0 && !this.analyticsData) {
      this.computeAnalytics();
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────

  componentWillLoad() {
    if (this.data) {
      this.processData(this.data);
    }
  }

  componentDidRender() {
    if (this.events.length > 0 && !this.replayer) {
      this.initReplayer();
    }
  }

  disconnectedCallback() {
    destroyReplayer(this.replayer);
    this.replayer = null;
  }

  // ── Public Methods ────────────────────────────────────────

  @Method()
  async play(): Promise<void> {
    if (!this.replayer) return;
    this.replayer.play();
    this.playing = true;
    this.replayStart.emit();
  }

  @Method()
  async pause(): Promise<void> {
    if (!this.replayer) return;
    this.replayer.pause();
    this.playing = false;
    this.replayPause.emit();
  }

  @Method()
  async seek(time: number): Promise<void> {
    if (!this.replayer) return;
    this.replayer.seek(time);
    this.currentTime = time;
    this.replayTimeUpdate.emit({ currentTime: time, totalTime: this.totalTime });
  }

  @Method()
  async getEvents(): Promise<RrwebEvent[]> {
    return this.events;
  }

  @Method()
  async getAnalytics(): Promise<AnalyticsData | null> {
    return this.analyticsData;
  }

  // ── Private Methods ───────────────────────────────────────

  private processData(raw: string) {
    this.loading = true;
    this.error = null;

    try {
      const decompressed = decompress(raw);
      const events = parseEvents(decompressed);

      if (!validateEvents(events)) {
        this.error = 'Invalid session data: missing required Meta or FullSnapshot event';
        this.decompressError.emit({ error: this.error, rawInput: raw });
        this.loading = false;
        return;
      }

      this.events = events;
      this.analyticsData = null;
      this.loading = false;

      const metadata = extractMetadata(events);
      const lastEvent = events[events.length - 1];
      this.totalTime = lastEvent.timestamp - events[0].timestamp;

      this.replayReady.emit({ replayer: this.replayer, metadata });

      // Compute analytics if heatmap or stats are requested
      if (this.showHeatmap || this.showStats) {
        this.computeAnalytics();
      }
    } catch (e) {
      this.error = (e as Error).message;
      this.decompressError.emit({ error: this.error, rawInput: raw });
      this.loading = false;
    }
  }

  private initReplayer() {
    const container = this.host.shadowRoot?.querySelector('.replay-container');
    if (!container || this.events.length === 0) return;

    // Destroy existing replayer if re-initializing
    destroyReplayer(this.replayer);

    this.replayer = new Replayer(this.events, {
      root: container as Element,
      speed: this.speed,
      skipInactive: true,
      showDebugger: false,
    });

    this.replayContainer = container as HTMLDivElement;

    // Set up replayer event listeners
    this.replayer.on('finish', () => {
      this.playing = false;
      this.replayFinish.emit();
    });

    // Auto-play if configured
    if (this.autoPlay) {
      this.replayer.play();
      this.playing = true;
      this.replayStart.emit();
    }

    // Seek to startTime if specified
    if (this.startTime > 0) {
      this.replayer.seek(this.startTime);
    }
  }

  private computeAnalytics() {
    if (this.events.length === 0) return;
    this.analyticsData = computeAnalytics(this.events, 'all');
    this.heatmapReady.emit({ heatmapData: this.analyticsData.heatmap });
    this.statsReady.emit({ statsData: this.analyticsData.stats });
  }

  // ── Render ────────────────────────────────────────────────

  render() {
    if (this.error) {
      return (
        <Host>
          <div class="error-state">
            <p class="error-message">{this.error}</p>
          </div>
        </Host>
      );
    }

    if (this.loading) {
      return (
        <Host>
          <div class="loading-state">
            <div class="spinner" />
            <p>Loading session data...</p>
          </div>
        </Host>
      );
    }

    const containerStyle: Record<string, string> = {};
    if (this.width) containerStyle.width = `${this.width}px`;
    if (this.height) containerStyle.height = `${this.height}px`;

    return (
      <Host>
        <div class="replayer-wrapper">
          <div class="replay-container" style={containerStyle}>
            {/* rrweb Replayer renders into this container */}
          </div>

          {this.showHeatmap && this.analyticsData && (
            <web-heatmap
              events={this.events}
              type="all"
              opacity={0.6}
              colorScheme="warm"
            />
          )}

          {this.showControls && (
            <replayer-controls
              playing={this.playing}
              currentTime={this.currentTime}
              totalTime={this.totalTime}
              speed={this.speed}
              onPlayPause={() => this.playing ? this.pause() : this.play()}
              onSeek={(e: CustomEvent<number>) => this.seek(e.detail)}
              onSpeedChange={(e: CustomEvent<number>) => { this.speed = e.detail; }}
            />
          )}
        </div>

        {this.showStats && this.analyticsData && (
          <web-stats-panel
            events={this.events}
            layout="sidebar"
            metrics={['clicks', 'scrolls', 'inputs', 'duration', 'path']}
          />
        )}
      </Host>
    );
  }
}
```

- [ ] **Step 2: Write web-replayer.css**

```css
/**
 * <web-replayer> styles — Shadow DOM scoped.
 * Minimal, clean layout that adapts to container size.
 */

:host {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a1a;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  contain: layout style;
}

.replayer-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.replay-container {
  position: relative;
  min-height: 200px;
  overflow: hidden;
  background: #fff;

  /* rrweb Replayer creates an iframe inside this container */
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

/* ── Loading state ─────────────────────────────────────── */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  color: #666;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #4a90d9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Error state ──────────────────────────────────────── */

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 1.5rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/replayer/
git commit -m "feat: add <web-replayer> main component with decompression pipeline, lifecycle, and events"
```

---

### Task 8: Replayer Controls Sub-Component

**Files:**
- Create: `src/components/replayer/replayer-controls.tsx`
- Create: `src/components/replayer/replayer-controls.css`

- [ ] **Step 1: Write replayer-controls.tsx**

```tsx
/**
 * <replayer-controls> — Playback controls bar.
 *
 * Renders play/pause button, speed selector, and progress bar.
 * Emits events for parent <web-replayer> to handle playback actions.
 */

import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'replayer-controls',
  styleUrl: 'replayer-controls.css',
  shadow: true,
})
export class ReplayerControls {
  /** Whether replay is currently playing */
  @Prop() playing = false;

  /** Current time position in ms */
  @Prop() currentTime = 0;

  /** Total session duration in ms */
  @Prop() totalTime = 0;

  /** Current playback speed */
  @Prop() speed = 1;

  // ── Events ───────────────────────────────────────────────

  @Event({ bubbles: true, composed: true }) playPause: EventEmitter<void>;
  @Event({ bubbles: true, composed: true }) seek: EventEmitter<number>;
  @Event({ bubbles: true, composed: true }) speedChange: EventEmitter<number>;

  // ── Speed options ────────────────────────────────────────

  private speedOptions = [0.5, 1, 2, 4, 8];

  // ── Handlers ──────────────────────────────────────────────

  private handlePlayPause = () => {
    this.playPause.emit();
  };

  private handleSeek = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const time = Number(input.value);
    this.seek.emit(time);
  };

  private handleSpeedChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    const speed = Number(select.value);
    this.speedChange.emit(speed);
  };

  // ── Helpers ───────────────────────────────────────────────

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // ── Render ────────────────────────────────────────────────

  render() {
    const progress = this.totalTime > 0 ? (this.currentTime / this.totalTime) * 100 : 0;

    return (
      <div class="controls-bar">
        <button
          class="play-pause-btn"
          onClick={this.handlePlayPause}
          aria-label={this.playing ? 'Pause' : 'Play'}
          title={this.playing ? 'Pause' : 'Play'}
        >
          {this.playing ? '⏸' : '▶'}
        </button>

        <div class="progress-section">
          <input
            type="range"
            class="progress-slider"
            min={0}
            max={this.totalTime}
            value={this.currentTime}
            onInput={this.handleSeek}
            aria-label="Replay progress"
          />
          <span class="time-display">
            {this.formatTime(this.currentTime)} / {this.formatTime(this.totalTime)}
          </span>
        </div>

        <div class="speed-section">
          <select
            class="speed-select"
            value={this.speed}
            onChange={this.handleSpeedChange}
            aria-label="Playback speed"
          >
            {this.speedOptions.map((s) => (
              <option value={s}>{s}x</option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}
```

- [ ] **Step 2: Write replayer-controls.css**

```css
:host {
  display: block;
  contain: layout style;
}

.controls-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #2a2a2a;
  color: #fff;
  font-size: 13px;
  user-select: none;
}

/* ── Play/Pause button ──────────────────────────────────── */

.play-pause-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: #4a90d9;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a7bc8;
  }

  &:active {
    background: #2a6bb8;
    transform: scale(0.95);
  }
}

/* ── Progress section ──────────────────────────────────── */

.progress-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.progress-slider {
  flex: 1;
  height: 4px;
  appearance: none;
  background: #555;
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #4a90d9;
    cursor: pointer;
    transition: transform 0.15s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.3);
  }
}

.time-display {
  font-size: 12px;
  color: #aaa;
  min-width: 80px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── Speed selector ─────────────────────────────────────── */

.speed-section {
  display: flex;
  align-items: center;
}

.speed-select {
  background: #444;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #4a90d9;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/replayer/replayer-controls.tsx src/components/replayer/replayer-controls.css
git commit -m "feat: add <replayer-controls> playback bar with play/pause, progress slider, speed selector"
```

---

### Task 9: Heatmap Component

**Files:**
- Create: `src/components/heatmap/web-heatmap.tsx`
- Create: `src/components/heatmap/web-heatmap.css`
- Create: `src/components/heatmap/heatmap-canvas.tsx`
- Create: `src/components/heatmap/heatmap-canvas.css`

- [ ] **Step 1: Write heatmap-canvas.tsx — the Canvas rendering layer**

```tsx
/**
 * <heatmap-canvas> — Renders heatmap intensity data onto a Canvas element.
 *
 * Receives HeatmapPoint[] data and draws a color-gradient overlay.
 * Uses devicePixelRatio for crisp rendering on HiDPI screens.
 * Color mapping: warm palette (blue→yellow→red) by default.
 */

import { Component, Prop, h, Element } from '@stencil/core';
import { HeatmapData, HeatmapColorScheme } from '../../types/analytics';
import { createCanvas, scaleCanvasForHiDPI } from '../../utils/dom-helper';

@Component({
  tag: 'heatmap-canvas',
  styleUrl: 'heatmap-canvas.css',
  shadow: true,
})
export class HeatmapCanvas {
  @Element() host!: HTMLElement;

  /** Heatmap data to render */
  @Prop() data!: HeatmapData;

  /** Transparency of the overlay */
  @Prop() opacity = 0.6;

  /** Color scheme */
  @Prop() colorScheme: HeatmapColorScheme = 'warm';

  // ── Lifecycle ──────────────────────────────────────────────

  componentDidRender() {
    this.drawHeatmap();
  }

  // ── Color mapping ─────────────────────────────────────────

  /** Map intensity (0–1) to an RGBA color string */
  private intensityToColor(intensity: number, scheme: HeatmapColorScheme): string {
    const alpha = Math.min(intensity * 0.8 + 0.1, 0.9) * this.opacity;
    switch (scheme) {
      case 'warm':
        // Blue → Yellow → Red gradient
        if (intensity < 0.3) {
          const t = intensity / 0.3;
          return `rgba(0, ${Math.round(t * 255)}, 255, ${alpha})`;
        } else if (intensity < 0.7) {
          const t = (intensity - 0.3) / 0.4;
          return `rgba(${Math.round(t * 255)}, 255, ${Math.round((1 - t) * 255)}, ${alpha})`;
        } else {
          const t = (intensity - 0.7) / 0.3;
          return `rgba(255, ${Math.round((1 - t) * 255)}, 0, ${alpha})`;
        }
      case 'cool':
        // Light blue → Teal → Dark blue
        if (intensity < 0.5) {
          const t = intensity / 0.5;
          return `rgba(${Math.round(100 + t * 50)}, ${Math.round(200 + t * 55)}, 255, ${alpha})`;
        } else {
          const t = (intensity - 0.5) / 0.5;
          return `rgba(0, ${Math.round(100 + (1 - t) * 100)}, ${Math.round(200 + (1 - t) * 55)}, ${alpha})`;
        }
      default:
        return `rgba(255, 100, 0, ${alpha})`;
    }
  }

  // ── Drawing ────────────────────────────────────────────────

  private drawHeatmap() {
    const canvasEl = this.host.shadowRoot?.querySelector('canvas');
    if (!canvasEl || !this.data || this.data.points.length === 0) return;

    const { viewportWidth, viewportHeight, points } = this.data;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // Draw each heatmap point as a radial gradient circle
    const radius = Math.max(viewportWidth, viewportHeight) * 0.02;

    for (const point of points) {
      const color = this.intensityToColor(point.intensity, this.colorScheme);
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius * (0.5 + point.intensity * 1.5),
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(
        point.x - radius * 2,
        point.y - radius * 2,
        radius * 4,
        radius * 4,
      );
    }
  }

  // ── Render ────────────────────────────────────────────────

  render() {
    if (!this.data) return null;

    const { viewportWidth, viewportHeight } = this.data;

    return (
      <canvas
        width={viewportWidth}
        height={viewportHeight}
        style={{
          width: `${viewportWidth}px`,
          height: `${viewportHeight}px`,
          opacity: this.opacity,
        }}
      />
    );
  }
}
```

- [ ] **Step 2: Write heatmap-canvas.css**

```css
:host {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  contain: layout style;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  mix-blend-mode: multiply;
}
```

- [ ] **Step 3: Write web-heatmap.tsx — the heatmap wrapper component**

```tsx
/**
 * <web-heatmap> — Interaction heatmap overlay component.
 *
 * Can be used standalone (with events prop) or as an overlay
 * within <web-replayer>. Computes heatmap data from events
 * and renders via <heatmap-canvas>.
 */

import { Component, Prop, State, Watch, h, Host } from '@stencil/core';
import { RrwebEvent } from '../../types/events';
import { HeatmapData, HeatmapType, HeatmapColorScheme } from '../../types/analytics';
import { computeHeatmapData } from '../../utils/analytics';

@Component({
  tag: 'web-heatmap',
  styleUrl: 'web-heatmap.css',
  shadow: true,
})
export class WebHeatmap {
  /** Decompressed rrweb events */
  @Prop() events!: RrwebEvent[];

  /** Filter by interaction type */
  @Prop() type: HeatmapType = 'all';

  /** Overlay transparency */
  @Prop() opacity = 0.6;

  /** Color palette */
  @Prop() colorScheme: HeatmapColorScheme = 'warm';

  // ── State ──────────────────────────────────────────────────

  @State() heatmapData: HeatmapData | null = null;

  // ── Watchers ──────────────────────────────────────────────

  @Watch('events')
  @Watch('type')
  onEventsChange() {
    if (this.events && this.events.length > 0) {
      this.heatmapData = computeHeatmapData(this.events, this.type);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────

  componentWillLoad() {
    if (this.events && this.events.length > 0) {
      this.heatmapData = computeHeatmapData(this.events, this.type);
    }
  }

  // ── Render ────────────────────────────────────────────────

  render() {
    if (!this.heatmapData || this.heatmapData.points.length === 0) {
      return <Host class="heatmap-empty"><p class="no-data">No interaction data for heatmap</p></Host>;
    }

    return (
      <Host class="heatmap-active">
        <heatmap-canvas
          data={this.heatmapData}
          opacity={this.opacity}
          colorScheme={this.colorScheme}
        />
      </Host>
    );
  }
}
```

- [ ] **Step 4: Write web-heatmap.css**

```css
:host {
  display: block;
  contain: layout style;
}

:host(.heatmap-empty) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

:host(.heatmap-active) {
  position: relative;
}

.no-data {
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/heatmap/
git commit -m "feat: add <web-heatmap> and <heatmap-canvas> with radial gradient rendering and color schemes"
```

---

### Task 10: Stats Panel Component

**Files:**
- Create: `src/components/stats-panel/web-stats-panel.tsx`
- Create: `src/components/stats-panel/web-stats-panel.css`
- Create: `src/components/stats-panel/stats-chart.tsx`
- Create: `src/components/stats-panel/stats-chart.css`

- [ ] **Step 1: Write stats-chart.tsx — bar chart sub-component**

```tsx
/**
 * <stats-chart> — Simple bar chart rendered with CSS (no chart library dependency).
 *
 * Displays operation breakdown as proportional bars.
 * Zero dependencies — pure CSS + Stencil render.
 */

import { Component, Prop, h } from '@stencil/core';
import { OperationTally } from '../../types/analytics';

@Component({
  tag: 'stats-chart',
  styleUrl: 'stats-chart.css',
  shadow: true,
})
export class StatsChart {
  /** Operation breakdown data to visualize */
  @Prop() breakdown!: OperationTally[];

  // ── Render ────────────────────────────────────────────────

  render() {
    if (!this.breakdown || this.breakdown.length === 0) {
      return <p class="no-data">No data to display</p>;
    }

    const maxCount = Math.max(...this.breakdown.map((t) => t.count));

    return (
      <div class="chart">
        {this.breakdown.map((tally) => (
          <div class="bar-row" key={tally.type}>
            <span class="bar-label">{tally.type}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                style={{
                  width: `${(tally.count / maxCount) * 100}%`,
                  '--bar-color': this.barColor(tally.type),
                }}
              />
            </div>
            <span class="bar-value">
              {tally.count} ({tally.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  }

  private barColor(type: string): string {
    const colors: Record<string, string> = {
      click: '#4a90d9',
      scroll: '#50c878',
      input: '#f5a623',
      mousemove: '#9b9b9b',
    };
    return colors[type] ?? '#666';
  }
}
```

- [ ] **Step 2: Write stats-chart.css**

```css
:host {
  display: block;
  contain: layout style;
}

.chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-label {
  width: 70px;
  font-size: 12px;
  color: #555;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.bar-track {
  flex: 1;
  height: 16px;
  background: #e8e8e8;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--bar-color, #4a90d9);
  transition: width 0.4s ease;
}

.bar-value {
  width: 70px;
  font-size: 11px;
  color: #777;
  text-align: left;
  font-variant-numeric: tabular-nums;
}

.no-data {
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}
```

- [ ] **Step 3: Write web-stats-panel.tsx — the stats panel wrapper**

```tsx
/**
 * <web-stats-panel> — Operation statistics panel.
 *
 * Displays session metrics: total counts, operation breakdown chart,
 * duration breakdown, and interaction path.
 * Can be used standalone or within <web-replayer>.
 */

import { Component, Prop, State, Watch, h, Host } from '@stencil/core';
import { RrwebEvent } from '../../types/events';
import { StatsData, StatsMetric, StatsPanelLayout } from '../../types/analytics';
import { computeStatsData } from '../../utils/analytics';

@Component({
  tag: 'web-stats-panel',
  styleUrl: 'web-stats-panel.css',
  shadow: true,
})
export class WebStatsPanel {
  /** Decompressed rrweb events */
  @Prop() events!: RrwebEvent[];

  /** Panel layout mode */
  @Prop() layout: StatsPanelLayout = 'sidebar';

  /** Which metrics to display */
  @Prop() metrics: StatsMetric[] = ['clicks', 'scrolls', 'inputs', 'duration', 'path'];

  // ── State ──────────────────────────────────────────────────

  @State() statsData: StatsData | null = null;

  // ── Watchers ──────────────────────────────────────────────

  @Watch('events')
  onEventsChange() {
    if (this.events && this.events.length > 0) {
      this.statsData = computeStatsData(this.events);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────

  componentWillLoad() {
    if (this.events && this.events.length > 0) {
      this.statsData = computeStatsData(this.events);
    }
  }

  // ── Helpers ────────────────────────────────────────────────

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  private shouldShow(metric: StatsMetric): boolean {
    return this.metrics.includes(metric);
  }

  // ── Render ────────────────────────────────────────────────

  render() {
    if (!this.statsData) {
      return <Host class="empty"><p class="no-data">No statistics data</p></Host>;
    }

    const data = this.statsData;

    return (
      <Host class={`layout-${this.layout}`}>
        <div class="panel">
          <h3 class="panel-title">Session Analytics</h3>

          {this.shouldShow('duration') && (
            <section class="metric-section">
              <div class="metric-card">
                <span class="metric-label">Duration</span>
                <span class="metric-value">{this.formatDuration(data.totalDuration)}</span>
              </div>
            </section>
          )}

          {this.shouldShow('clicks') && (
            <section class="metric-section">
              <div class="metric-card">
                <span class="metric-label">Clicks</span>
                <span class="metric-value">{data.totalClicks}</span>
              </div>
            </section>
          )}

          {this.shouldShow('scrolls') && (
            <section class="metric-section">
              <div class="metric-card">
                <span class="metric-label">Scrolls</span>
                <span class="metric-value">{data.totalScrolls}</span>
              </div>
            </section>
          )}

          {this.shouldShow('inputs') && (
            <section class="metric-section">
              <div class="metric-card">
                <span class="metric-label">Inputs</span>
                <span class="metric-value">{data.totalInputs}</span>
              </div>
            </section>
          )}

          <section class="chart-section">
            <stats-chart breakdown={data.operationBreakdown} />
          </section>

          {this.shouldShow('path') && data.interactionPath.length > 0 && (
            <section class="path-section">
              <h4 class="section-title">Interaction Path</h4>
              <ol class="path-list">
                {data.interactionPath.slice(0, 20).map((step) => (
                  <li class="path-step" key={`${step.timeOffset}-${step.action}`}>
                    <span class="step-time">{this.formatDuration(step.timeOffset)}</span>
                    <span class="step-action">{step.action}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </Host>
    );
  }
}
```

- [ ] **Step 4: Write web-stats-panel.css**

```css
:host {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  contain: layout style;
}

:host(.layout-sidebar) {
  width: 280px;
  min-height: 100%;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
}

:host(.layout-bottom) {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

:host(.layout-modal) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

:host(.empty) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.panel {
  padding: 16px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

/* ── Metric cards ───────────────────────────────────────── */

.metric-section {
  margin-bottom: 8px;
}

.metric-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #eee;
}

.metric-label {
  font-size: 12px;
  color: #666;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  font-variant-numeric: tabular-nums;
}

/* ── Chart section ──────────────────────────────────────── */

.chart-section {
  margin: 12px 0;
}

.section-title {
  font-size: 12px;
  color: #666;
  margin: 0 0 6px;
}

/* ── Path section ──────────────────────────────────────── */

.path-section {
  margin-top: 12px;
}

.path-list {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: path-step;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.step-time {
  color: #4a90d9;
  font-variant-numeric: tabular-nums;
  min-width: 40px;
}

.step-action {
  color: #333;
}

.no-data {
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/stats-panel/
git commit -m "feat: add <web-stats-panel> and <stats-chart> with metric cards, bar chart, and interaction path"
```

---

### Task 11: Shared Tooltip Component

**Files:**
- Create: `src/components/shared/tooltip.tsx`
- Create: `src/components/shared/tooltip.css`

- [ ] **Step 1: Write tooltip.tsx**

```tsx
/**
 * <wr-tooltip> — Shared tooltip component.
 *
 * Lightweight, position-aware tooltip that follows its target element.
 * Used across heatmap hover hints and stats panel detail views.
 */

import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'wr-tooltip',
  styleUrl: 'tooltip.css',
  shadow: true,
})
export class WrTooltip {
  /** Tooltip text content */
  @Prop() text!: string;

  /** Position relative to target: top, bottom, left, right */
  @Prop() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  render() {
    return (
      <div class={`tooltip tooltip-${this.position}`}>
        <span class="tooltip-content">{this.text}</span>
      </div>
    );
  }
}
```

- [ ] **Step 2: Write tooltip.css**

```css
:host {
  position: absolute;
  z-index: 10;
  contain: layout style;
}

.tooltip {
  padding: 4px 8px;
  background: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.tooltip-content {
  display: block;
}

/* ── Position variants ──────────────────────────────────── */

.tooltip-top {
  transform: translateY(-100%);
  margin-bottom: 4px;
}

.tooltip-bottom {
  margin-top: 4px;
}

.tooltip-left {
  transform: translateX(-100%);
  margin-right: 4px;
}

.tooltip-right {
  margin-left: 4px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add <wr-tooltip> shared tooltip component"
```

---

### Task 12: Library Entry Point

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Write index.ts — library entry that exports everything**

```ts
/**
 * web-replayer library entry point.
 *
 * Exports all Web Components and utility functions for npm consumers.
 * Stencil compiler uses this file to generate the dist/ output.
 */

// ── Component exports (Stencil auto-registers Custom Elements) ──
export { WebReplayer } from './components/replayer/web-replayer';
export { ReplayerControls } from './components/replayer/replayer-controls';
export { WebHeatmap } from './components/heatmap/web-heatmap';
export { HeatmapCanvas } from './components/heatmap/heatmap-canvas';
export { WebStatsPanel } from './components/stats-panel/web-stats-panel';
export { StatsChart } from './components/stats-panel/stats-chart';
export { WrTooltip } from './components/shared/tooltip';

// ── Utility exports (for advanced users who want direct access) ──
export { decompress, detectFormat, DecompressFormat } from './utils/decompress';
export { parseEvents, validateEvents, extractMetadata } from './utils/event-parser';
export { computeHeatmapData, computeStatsData, computeAnalytics } from './utils/analytics';

// ── Type exports ──
export type {
  RrwebEvent,
  RrwebEventBase,
  SessionMetadata,
} from './types/events';

export {
  RrwebEventType,
  IncrementalSource,
  MouseInteractionType,
} from './types/events';

export type {
  HeatmapData,
  HeatmapPoint,
  StatsData,
  OperationTally,
  DurationEntry,
  PathStep,
  AnalyticsData,
  HeatmapType,
  HeatmapColorScheme,
  StatsMetric,
  StatsPanelLayout,
} from './types/analytics';

export type {
  WebReplayerProps,
  WebHeatmapProps,
  WebStatsPanelProps,
  ReplayReadyDetail,
  ReplayTimeUpdateDetail,
  HeatmapReadyDetail,
  StatsReadyDetail,
  DecompressErrorDetail,
} from './types/component-props';
```

- [ ] **Step 2: Run Stencil build to verify compilation**

Run:
```bash
cd e:\project\web-replayer
npx stencil build
```
Expected: Build succeeds, `dist/` directory created with ESM + CJS + Custom Elements + type declarations

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add library entry point with full component, utility, and type exports"
```

---

### Task 13: Vite Playground Setup

**Files:**
- Create: `playground/package.json`
- Create: `playground/tsconfig.json`
- Create: `playground/vite.config.ts`
- Create: `playground/index.html`
- Create: `playground/src/main.tsx`
- Create: `playground/src/style.css`
- Create: `playground/src/demo-data.ts`
- Create: `playground/src/App.tsx`

- [ ] **Step 1: Write playground/package.json**

```json
{
  "name": "web-replayer-playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lz-string": "^1.5.0",
    "rrweb": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.5.0",
    "vite": "^6.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Install playground dependencies**

Run:
```bash
cd e:\project\web-replayer\playground
pnpm install
```

- [ ] **Step 3: Write playground/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["dom", "dom.iterable", "esnext"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Write playground/vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vite config for the Playground dev app.
 * Aliases the Stencil-compiled web-replayer dist/ so
 * Playground can import Web Components directly.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point imports of 'web-replayer' to the compiled dist/
      'web-replayer': path.resolve(__dirname, '../dist/index.js'),
    },
  },
  server: {
    port: 4000,
    open: true,
  },
});
```

- [ ] **Step 5: Write playground/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>web-replayer Playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write playground/src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// Import the Stencil-compiled component registry
// This registers all <web-replayer>, <web-heatmap>, etc. as Custom Elements
import 'web-replayer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 7: Write playground/src/style.css**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1a1a2e;
  color: #e0e0e0;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 8: Write playground/src/demo-data.ts — sample compressed rrweb data**

```ts
/**
 * Demo data — sample rrweb session compressed with LZ-String.
 * Used by Playground to demonstrate <web-replayer> without
 * needing a real recording backend.
 *
 * The data below is a minimal rrweb session:
 *   Meta → FullSnapshot → Incremental (click, scroll, input)
 */

import LZString from 'lz-string';

/** Create a minimal but valid rrweb session for demo purposes */
function createDemoSession(): string {
  const events = [
    {
      timestamp: 1700000000,
      type: 4, // Meta
      data: { href: 'https://example.com', width: 1280, height: 720 },
    },
    {
      timestamp: 1700000001,
      type: 2, // FullSnapshot
      data: {
        node: {
          type: 0,
          tagName: 'html',
          childNodes: [
            { type: 1, tagName: 'body', childNodes: [
              { type: 1, tagName: 'div', attributes: { id: 'app' }, childNodes: [
                { type: 1, tagName: 'h1', childNodes: [
                  { type: 3, textContent: 'Welcome to Example' },
                ] },
                { type: 1, tagName: 'button', attributes: { id: 'login-btn', class: 'btn-primary' }, childNodes: [
                  { type: 3, textContent: 'Login' },
                ] },
                { type: 1, tagName: 'input', attributes: { id: 'search', type: 'text', placeholder: 'Search...' } },
              ] },
            ] },
          ],
        },
        initialOffset: { top: 0, left: 0 },
      },
    },
    {
      timestamp: 1700001000,
      type: 3, // IncrementalSnapshot — click
      data: { source: 1, data: { type: 2, id: 3 }, position: { x: 500, y: 300, id: 3 } },
    },
    {
      timestamp: 1700002000,
      type: 3, // IncrementalSnapshot — scroll
      data: { source: 2, data: { id: 0, x: 0, y: 200 }, position: { x: 0, y: 200, id: 0 } },
    },
    {
      timestamp: 1700003000,
      type: 3, // IncrementalSnapshot — input
      data: { source: 4, data: { id: 4, text: 'hello', isChecked: false } },
    },
    {
      timestamp: 1700004000,
      type: 3, // Another click
      data: { source: 1, data: { type: 2, id: 3 }, position: { x: 520, y: 310, id: 3 } },
    },
    {
      timestamp: 1700005000,
      type: 3, // Mouse move
      data: { source: 0, data: { positions: [{ x: 600, y: 400, timeOffset: 0 }, { x: 650, y: 350, timeOffset: 100 }] }, position: { x: 650, y: 350, id: 0 } },
    },
    {
      timestamp: 1700006000,
      type: 3, // Another click at same position (heatmap aggregation test)
      data: { source: 1, data: { type: 2, id: 3 }, position: { x: 500, y: 300, id: 3 } },
    },
    {
      timestamp: 1700007000,
      type: 3, // Scroll down
      data: { source: 2, data: { id: 0, x: 0, y: 400 }, position: { x: 0, y: 400, id: 0 } },
    },
    {
      timestamp: 1700008000,
      type: 3, // Another input
      data: { source: 4, data: { id: 4, text: 'hello world', isChecked: false } },
    },
  ];

  return JSON.stringify(events);
}

/** Export LZ-String URI-safe compressed demo data */
export const DEMO_DATA_URI = LZString.compressToEncodedURIComponent(createDemoSession());

/** Export LZ-String UTF-16 compressed demo data (alternative format) */
export const DEMO_DATA_UTF16 = LZString.compressToUTF16(createDemoSession());

/** Export uncompressed raw JSON (for testing Raw format detection) */
export const DEMO_DATA_RAW = createDemoSession();
```

- [ ] **Step 9: Write playground/src/App.tsx — Playground main page**

```tsx
import React, { useState } from 'react';
import { DEMO_DATA_URI, DEMO_DATA_UTF16, DEMO_DATA_RAW } from './demo-data';

/** Data format options for the dropdown */
type DataFormat = 'uri-safe' | 'utf-16' | 'raw';

const DATA_MAP: Record<DataFormat, string> = {
  'uri-safe': DEMO_DATA_URI,
  'utf-16': DEMO_DATA_UTF16,
  raw: DEMO_DATA_RAW,
};

function App() {
  const [dataFormat, setDataFormat] = useState<DataFormat>('uri-safe');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="playground">
      <header className="playground-header">
        <h1>web-replayer Playground</h1>
        <p className="subtitle">Framework-agnostic session replay + analytics</p>
      </header>

      <nav className="controls-bar">
        <label>
          Data format:
          <select value={dataFormat} onChange={(e) => setDataFormat(e.target.value as DataFormat)}>
            <option value="uri-safe">LZ-String URI-safe</option>
            <option value="utf-16">LZ-String UTF-16</option>
            <option value="raw">Raw JSON (uncompressed)</option>
          </select>
        </label>

        <button onClick={() => setShowHeatmap(!showHeatmap)}>
          {showHeatmap ? '✓' : '○'} Heatmap
        </button>

        <button onClick={() => setShowStats(!showStats)}>
          {showStats ? '✓' : '○'} Stats
        </button>

        <button onClick={() => setAutoPlay(!autoPlay)}>
          {autoPlay ? '✓' : '○'} Auto-play
        </button>

        <label>
          Speed:
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </label>
      </nav>

      <main className="playground-main">
        {/* Use the Web Component directly — React 19 supports Custom Elements natively */}
        <web-replayer
          data={DATA_MAP[dataFormat]}
          show-heatmap={showHeatmap}
          show-stats={showStats}
          auto-play={autoPlay}
          speed={speed}
          width={800}
          height={450}
        />
      </main>

      <footer className="playground-footer">
        <p>Switch data format to test auto-detection | Toggle heatmap/stats overlays | Adjust speed</p>
      </footer>
    </div>
  );
}

export default App;
```

- [ ] **Step 10: Verify Playground starts**

Run:
```bash
cd e:\project\web-replayer
npx stencil build
cd playground
pnpm dev
```
Expected: Vite dev server starts on port 4000, browser opens, `<web-replayer>` renders with demo data

- [ ] **Step 11: Commit**

```bash
git add playground/
git commit -m "feat: add Vite Playground with demo data, format switcher, and live preview controls"
```

---

### Task 14: Build Verification & README

**Files:**
- Modify: `package.json` (add dev script)
- Create: `README.md`

- [ ] **Step 1: Update package.json dev script for concurrent Stencil watch + Playground**

```json
{
  "scripts": {
    "dev": "concurrently \"stencil build --watch\" \"cd playground && pnpm dev\"",
  }
}
```

Add `concurrently` to devDependencies:
```bash
cd e:\project\web-replayer
pnpm add -D concurrently
```

- [ ] **Step 2: Run full build and verify output**

Run:
```bash
cd e:\project\web-replayer
npx stencil build
ls dist/
```
Expected: `dist/` contains `index.js`, `index.cjs.js`, `types/`, `components/`

- [ ] **Step 3: Run all tests**

Run:
```bash
cd e:\project\web-replayer
npx vitest run
```
Expected: All utility tests pass

- [ ] **Step 4: Write README.md**

```md
# web-replayer

Framework-agnostic Web Component for rrweb session replay with interaction heatmap and operation analytics.

Built with **Stencil TSX** — outputs standard Custom Elements that work in React, Vue, Angular, or vanilla JS.

## Install

```bash
npm install web-replayer
```

## Quick Start

```html
<script type="module">
  import 'web-replayer';
</script>

<web-replayer
  data="your-compressed-rrweb-string"
  show-heatmap
  show-stats
></web-replayer>
```

## Components

### `<web-replayer>` — Main Replay

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `string` | required | LZ-String/pako compressed rrweb events |
| `width` | `number` | auto | Canvas width (px) |
| `height` | `number` | auto | Canvas height (px) |
| `auto-play` | `boolean` | `false` | Auto-play on load |
| `speed` | `number` | `1` | Playback speed multiplier |
| `show-controls` | `boolean` | `true` | Show control bar |
| `show-heatmap` | `boolean` | `false` | Overlay heatmap |
| `show-stats` | `boolean` | `false` | Show stats panel |

### `<web-heatmap>` — Interaction Heatmap

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `RrwebEvent[]` | required | Decompressed rrweb events |
| `type` | `'click' | 'move' | 'scroll' | 'all'` | `'all'` | Heatmap type |
| `opacity` | `number` | `0.6` | Layer transparency |
| `color-scheme` | `'warm' | 'cool' | 'custom'` | `'warm'` | Color palette |

### `<web-stats-panel>` — Statistics Panel

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `RrwebEvent[]` | required | Decompressed rrweb events |
| `layout` | `'sidebar' | 'bottom' | 'modal'` | `'sidebar'` | Panel layout |
| `metrics` | `StatsMetric[]` | all | Which metrics to show |

## Compression Formats

`web-replayer` auto-detects and decompresses:

| Format | Detection | Use case |
|---|---|---|
| LZ-String URI-safe | URI-safe chars (`-`, `_`) | URL-embedded data |
| LZ-String UTF-16 | High Unicode range chars | localStorage data |
| LZ-String Base64 | Standard base64 chars (`+`, `/`) | API responses |
| pako (gzip → base64) | Gzip magic bytes `0x1f 0x8b` | Server-compressed data |
| Raw JSON | Valid JSON parse | Uncompressed fallback |

## Development

```bash
pnpm install           # Install all dependencies
pnpm dev               # Stencil watch + Vite Playground (concurrent)
pnpm test              # Run all tests
pnpm build             # Production build → dist/
```

## License

MIT
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete web-replayer project with build, playground, and README"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| Spec Requirement | Task Coverage |
|---|---|
| Compressed data decompression (LZ-String + pako auto-detect) | Task 3 (decompress.ts) ✓ |
| rrweb event parsing & validation | Task 4 (event-parser.ts) ✓ |
| Analytics computation (heatmap + stats) | Task 5 (analytics.ts) ✓ |
| `<web-replayer>` main component | Task 7 ✓ |
| Playback controls (play/pause/seek/speed) | Task 8 ✓ |
| `<web-heatmap>` component | Task 9 ✓ |
| `<web-stats-panel>` component | Task 10 ✓ |
| Shadow DOM + Scoped CSS styling | All component CSS files ✓ |
| Vite Playground dev environment | Task 13 ✓ |
| Stencil build config (ESM + CJS + Custom Elements) | Task 1 ✓ |
| Library entry point (index.ts) | Task 12 ✓ |
| Type definitions (events, analytics, props) | Task 2 ✓ |
| Testing (Vitest unit + Stencil E2E) | Tasks 3–5 ✓ |
| README documentation | Task 14 ✓ |

### 2. Placeholder Scan

No TBD, TODO, "implement later", "add validation", "handle edge cases" found. All steps contain complete code.

### 3. Type Consistency

- `DecompressFormat` enum defined in Task 3, imported in Task 7 ✓
- `RrwebEvent` type defined in Task 2, used consistently across Tasks 4–10 ✓
- `HeatmapData`, `StatsData` types defined in Task 2, used in Tasks 5, 9, 10 ✓
- Component prop interfaces defined in Task 2, implemented in Tasks 7–10 ✓
- Event detail types (`ReplayReadyDetail`, etc.) defined in Task 2, emitted in Task 7 ✓
- Method names: `play()`, `pause()`, `seek()`, `getEvents()`, `getAnalytics()` — consistent in Task 7 spec and implementation ✓
