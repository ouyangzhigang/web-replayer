# web-replayer — Design Specification

**Date**: 2026-06-15
**Status**: Approved

## Overview

**web-replayer** is a framework-agnostic npm component package that provides rrweb session replay with data analytics capabilities. Built with Stencil TSX, it outputs standard Web Components (Custom Elements) usable in any frontend framework.

### Core Capabilities

1. **Session Replay** — Receive LZ-String/pako compressed rrweb recording data, auto-decompress, and replay with full player controls
2. **Interaction Heatmap** — Overlay click/move/scroll heatmaps on the replay canvas for visual interaction analysis
3. **Operation Statistics Panel** — Display click counts, page dwell time, operation type distribution via charts and tables

### Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| Component framework | Stencil (TSX → Web Component) | Only mature compiler for TSX → Custom Elements |
| Styling | Shadow DOM + Scoped CSS | Zero-dependency style isolation, ideal for component libraries |
| Data input | Compressed string direct input | Simplest integration; component handles decompression internally |
| Dev environment | Stencil watch + Vite Playground | Stencil handles build; Vite provides HMR playground for live preview |
| Package manager | pnpm v9+ | Fast, disk-efficient, strict dependency resolution |
| Build output | Stencil (ESM + CJS + Custom Elements + .d.ts) | Stencil's built-in output targets cover all distribution needs |

## Architecture

### Approach: Stencil + Vite Playground (Approved)

```
                    ┌─────────────────────────────────┐
                    │         npm package build        │
                    │     Stencil → dist/ (ESM/CJS)    │
                    │     + .d.ts + Custom Elements    │
                    └─────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │        Dev Environment           │
                    │  Stencil --watch → dist/         │
                    │  Vite Playground ← reads dist/   │
                    │  HMR: TSX change → recompile →   │
                    │  Playground live refresh          │
                    └─────────────────────────────────┘
```

### Data Processing Pipeline

```
data prop (compressed string)
    ↓
decompress.ts → Auto-detect: LZ-String URI-safe? LZ-String UTF-16? pako?
    ↓
event-parser.ts → Validate + parse → rrwebEvent[]
    ↓
   ┌──────────────────────────────────────────┐
   │         Main data distribution            │
   │                                           │
   │  → <web-replayer> → Render replay canvas  │
   │  → <web-heatmap> → Compute heatmap data   │
   │                    → Canvas render overlay │
   │  → <web-stats-panel> → Compute stats      │
   │                        → Chart/table render│
   └──────────────────────────────────────────┘
```

## Project Structure

```
web-replayer/
├── src/                          # Component library source (Stencil TSX)
│   ├── components/
│   │   ├── replayer/             # Main replay component
│   │   │   ├── web-replayer.tsx       # <web-replayer> main entry
│   │   │   ├── web-replayer.css       # Main styles
│   │   │   ├── replayer-controls.tsx  # Playback controls bar
│   │   │   ├── replayer-controls.css
│   │   │   └── replayer-progress.tsx  # Progress bar
│   │   │   └── replayer-progress.css
│   │   ├── heatmap/              # Interaction heatmap component
│   │   │   ├── web-heatmap.tsx
│   │   │   ├── web-heatmap.css
│   │   │   ├── heatmap-canvas.tsx     # Canvas render layer
│   │   │   └── heatmap-canvas.css
│   │   ├── stats-panel/          # Stats panel component
│   │   │   ├── web-stats-panel.tsx
│   │   │   ├── web-stats-panel.css
│   │   │   ├── stats-chart.tsx        # Chart sub-component
│   │   │   └── stats-chart.css
│   │   └── shared/               # Shared sub-components
│   │       ├── tooltip.tsx
│   │       └── tooltip.css
│   ├── utils/                    # Utility functions
│   │   ├── decompress.ts             # LZ-String + pako decompression engine
│   │   ├── event-parser.ts           # rrweb event parse & validate
│   │   ├── analytics.ts              # Analytics data computation (heatmap, stats)
│   │   └── dom-helper.ts             # DOM operation helpers
│   ├── types/                    # TypeScript type definitions
│   │   ├── events.ts                 # rrweb event types
│   │   ├── analytics.ts              # Analytics data types
│   │   └── component-props.ts        # Component Prop types
│   └── index.ts                  # Library entry (export all components)
├── playground/                   # Vite dev Playground
│   ├── src/
│   │   ├── App.tsx                  # Playground main page
│   │   ├── demo-data.ts             # Sample compressed data
│   │   ├── main.tsx
│   │   └── style.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json               # Playground independent package (devDependencies)
├── stencil.config.ts             # Stencil build config
├── package.json                   # Main package (npm publish source)
├── tsconfig.json
└── README.md
```

## Component API

### `<web-replayer>` — Main Replayer

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `string` | — | LZ-String/pako compressed rrweb events string |
| `width` | `number` | auto | Replay area width |
| `height` | `number` | auto | Replay area height |
| `autoPlay` | `boolean` | `false` | Auto-play on data load |
| `speed` | `number` | `1` | Playback speed multiplier |
| `showControls` | `boolean` | `true` | Show control bar |
| `showHeatmap` | `boolean` | `false` | Overlay heatmap on replay |
| `showStats` | `boolean` | `false` | Show stats panel |
| `startTime` | `number` | `0` | Jump to specific time (ms) |

**Custom Events:**

| Event | Detail | Description |
|---|---|---|
| `replayReady` | `{ replayer: Replayer }` | Replayer initialized |
| `replayStart` | `{}` | Playback started |
| `replayPause` | `{}` | Playback paused |
| `replayFinish` | `{}` | Playback completed |
| `replayTimeUpdate` | `{ currentTime: number }` | Time progress update |
| `heatmapReady` | `{ heatmapData: HeatmapData }` | Heatmap data computed |
| `statsReady` | `{ statsData: StatsData }` | Stats data computed |

**Methods (public):**

- `play(): void` — Start/resume playback
- `pause(): void` — Pause playback
- `seek(time: number): void` — Jump to timestamp (ms)
- `getEvents(): rrwebEvent[]` — Get decompressed events
- `getAnalytics(): AnalyticsData` — Get computed analytics data

### `<web-heatmap>` — Interaction Heatmap

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `rrwebEvent[]` | — | Decompressed rrweb events |
| `overlayOn` | `HTMLElement` | — | Overlay on specified element |
| `type` | `'click' \| 'move' \| 'scroll' \| 'all'` | `'all'` | Heatmap type |
| `opacity` | `number` | `0.6` | Heatmap transparency |
| `colorScheme` | `'warm' \| 'cool' \| 'custom'` | `'warm'` | Color scheme |

### `<web-stats-panel>` — Operation Statistics Panel

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `rrwebEvent[]` | — | Decompressed rrweb events |
| `layout` | `'sidebar' \| 'bottom' \| 'modal'` | `'sidebar'` | Panel layout mode |
| `metrics` | `('clicks' \| 'scrolls' \| 'inputs' \| 'duration' \| 'path')[]` | all | Which metrics to display |

## Build Configuration

### Stencil Config

```ts
export const config: Config = {
  namespace: 'WebReplayer',
  srcDir: 'src',
  outputTargets: [
    { type: 'dist' },                          // ESM + lazy-loaded chunks
    { type: 'dist-custom-elements' },           // Standalone Custom Elements bundle
    { type: 'docs-readme' },                    // Auto-generated README docs
    { type: 'docs-json' },                      // JSON format docs
  ],
  extras: { experimentalScopedSlotChanges: true },
};
```

### package.json Key Fields

```json
{
  "name": "web-replayer",
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
  "files": ["dist/", "hydrate/"]
}
```

## Tech Stack

| Category | Technology | Target Version |
|---|---|---|
| Component compiler | Stencil | v4+ |
| Component language | TSX (Stencil) | — |
| Replay engine | rrweb-replay | v2+ |
| Compression | lz-string + pako | latest |
| Dev playground | Vite + React (TSX) | Vite 6+, React 19 |
| Styling | Shadow DOM + Scoped CSS | — |
| Package manager | pnpm | v9+ |
| TypeScript | strict mode | v5.5+ |
| Testing | Vitest + Stencil test utils | — |
| Documentation | Stencil auto-docs + README | — |

## Testing Strategy

| Level | Tool | Coverage |
|---|---|---|
| Unit tests | Vitest | utils/ — decompress, event-parser, analytics pure function logic |
| Component tests | Stencil E2E test | Each Web Component render, Props, Events |
| Integration tests | Vitest + jsdom | Full replay flow: compress → decompress → replay → heatmap → stats |
| Manual verification | Browser (Playground) | Visual behavior and effect verification |

**Critical test scenarios:**

- `decompress.ts`: Auto-detect 3 formats (LZ-String URI-safe, LZ-String UTF-16, pako) + edge cases (empty, corrupt data)
- `event-parser.ts`: Empty events, malformed events, oversized events boundary handling
- `<web-replayer>`: Replay lifecycle (init → play → pause → finish)
- `<web-heatmap>`: Different type modes (click/move/scroll/all) rendering
- `<web-stats-panel>`: Different layout and metrics combinations

## Release Flow

```
pnpm build               → Stencil compile → dist/ output
pnpm test                 → Vitest + Stencil tests all pass
pnpm lint                 → ESLint + Prettier check
pnpm version <semver>     → npm version bump
pnpm publish              → npm publish (auto includes dist/)
```

CI/CD: Optional GitHub Actions — auto lint + test + build on push, publish only manual trigger.

## Dev Workflow

1. Run `pnpm dev` — starts Stencil watch mode + Vite Playground concurrently
2. Edit TSX in `src/components/` — Stencil auto-recompiles → Vite HMR refreshes Playground
3. Open browser at Playground URL to see live component preview
4. Toggle heatmap/stats, adjust props, swap demo data in Playground UI
5. Run `pnpm test` to verify before commit

## Scope Boundaries

**In scope (v1):**
- Compressed data decompression (LZ-String + pako auto-detect)
- Session replay with controls (play/pause/seek/speed)
- Interaction heatmap overlay (click/move/scroll/all)
- Operation statistics panel (sidebar/bottom/modal layout)
- Vite Playground dev environment
- npm package publishing setup

**Out of scope (v1):**
- Recording capability (only replay)
- Remote URL data loading (only direct string input)
- Anomaly behavior detection
- User path/flow chart visualization
- SSR/hydrate support
- Storybook integration
- CI/CD pipeline setup
