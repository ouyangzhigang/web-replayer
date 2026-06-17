# @lotus/web-replayer

Framework-agnostic Web Component for rrweb session replay with interaction heatmap and operation analytics. Built with [Stencil](https://stenciljs.com/).

<p align="center">
  <img src="https://img.shields.io/npm/v/@lotus/web-replayer" alt="npm version" />
  <img src="https://img.shields.io/npm/l/@lotus/web-replayer" alt="license" />
</p>

## Features

- 🎬 **Session Replay** — Playback rrweb-recorded sessions with polished player controls (play/pause/replay, seek, speed, frame step, skip-inactive, fullscreen)
- 🔥 **Heatmap Overlay** — Visualize user interactions (click, scroll, move, input) as color intensity layers on the replayed page
- 📊 **Stats Panel** — Sidebar analytics showing click counts, scroll distances, input events, interaction paths and duration
- 📦 **Multi-format Data** — Auto-detects and processes: compressed strings (LZ-String/pako), JSON-serialized strings, or raw event arrays
- ⌨️ **Keyboard Shortcuts** — Space/k play/pause, j/l seek, Arrow keys, f fullscreen, ,/. frame step
- 🎨 **Polished UI** — Glassmorphism controls bar, SVG icons with ripple effects, custom progress slider, speed pill buttons
- 🖱️ **Interact Mode** — After playback, explore the replayed UI visually (scroll, hover) without triggering broken JS
- 🚀 **High Performance** — rAF-based time polling, direct DOM updates bypassing Stencil re-renders, throttled events
- ♿ **Accessible** — ARIA labels, keyboard focus indicators, screen reader live regions
- 🌐 **Framework-agnostic** — Works with React, Vue, Angular, Svelte, or plain HTML (Web Component standard)

## Install

```bash
npm install @lotus/web-replayer
# or
pnpm add @lotus/web-replayer
```

## Quick Start

### Plain HTML

```html
<script type="module">
  import '@lotus/web-replayer';
</script>

<!-- Minimal replay -->
<web-replayer data="<compressed rrweb string>"></web-replayer>

<!-- With options -->
<web-replayer
  data="<compressed rrweb string>"
  width="85%"
  height="600px"
  auto-play
  speed="2"
  show-controls
  show-heatmap
  show-stats
></web-replayer>
```

### React

```jsx
import '@lotus/web-replayer';
import { useRef, useEffect } from 'react';

function App() {
  const ref = useRef(null);

  useEffect(() => {
    // Set props as JS properties — avoids HTML attribute truncation for large data
    ref.current.data = compressedData;
    ref.current.speed = 2;
    ref.current.showStats = true;
  }, [compressedData]);

  return <web-replayer ref={ref} width="85%" height="600px" />;
}
```

### Vue

```vue
<template>
  <web-replayer ref="replayer" width="85%" height="600px" />
</template>

<script setup>
import '@lotus/web-replayer';
import { ref, onMounted, watch } from 'vue';

const replayer = ref(null);
const data = ref(compressedData);

watch(data, (val) => {
  replayer.value.data = val;
});

onMounted(() => {
  replayer.value.data = data.value;
});
</script>
```

### Angular

```ts
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

// component
import '@lotus/web-replayer';
```

```html
<web-replayer [attr.data]="compressedData" width="85%" height="600px"></web-replayer>
```

> **Note**: For large compressed data strings, use a JS property setter instead of HTML attributes to avoid truncation. See the React example above.

## Data Formats

The `data` prop accepts three input formats with automatic detection:

| Format | Example | Processing |
|--------|---------|-----------|
| Compressed string | LZ-String / pako compressed | `decompress → parseEvents` |
| JSON-serialized string | `JSON.stringify(events)` | `JSON.parse → parseEvents` |
| Raw event array | `[{timestamp, type, data}]` | `parseEvents` (zero parsing) |

Detection logic:
- `Array.isArray(data)` → direct array path (fastest)
- String starts with `[` → JSON string path (skips decompress)
- Otherwise → compressed string path (full pipeline)

```js
// Compressed string (from @lotus/web-recorder)
el.data = LZString.compressToEncodedURIComponent(JSON.stringify(events));

// JSON string
el.data = JSON.stringify(events);

// Raw array
el.data = events;
```

## Component API

### `<web-replayer>` — Main replay component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `string \| any[]` | *(required)* | Session data — compressed string, JSON string, or event array |
| `width` | `string` | — | Component width — CSS values ("85%", "800px", "50vw") or bare number ("800" → 800px) |
| `height` | `string` | — | Component height — CSS values ("888px", "60vh") or bare number ("888" → 888px) |
| `auto-play` | `boolean` | `false` | Auto-play on data load |
| `speed` | `number` | `1` | Playback speed multiplier (0.5, 1, 2, 4, 8) |
| `show-controls` | `boolean` | `true` | Show playback control bar |
| `show-heatmap` | `boolean` | `false` | Overlay heatmap on replay canvas |
| `show-stats` | `boolean` | `false` | Show stats panel alongside replay |
| `start-time` | `number` | `0` | Seek to timestamp on load (ms, does NOT trigger playback) |
| `auto-hide-controls` | `boolean` | `false` | Auto-hide controls bar when mouse is idle during playback |
| `unsafe-allow-scripts` | `boolean` | `true` | Allow scripts execution in the replay iframe |
| `interact` | `boolean` | `false` | Enable visual interaction with the replayed UI after playback |

#### Events

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `replayReady` | `{ replayer, metadata }` | Fired when replay is initialized |
| `replayStart` | `void` | Fired when playback starts |
| `replayPause` | `void` | Fired when playback pauses |
| `replayFinish` | `void` | Fired when replay completes |
| `replayTimeUpdate` | `{ currentTime, totalTime }` | Fired on time position changes (250ms throttle) |
| `heatmapReady` | `{ heatmapData }` | Fired when heatmap data is computed |
| `statsReady` | `{ statsData }` | Fired when stats data is computed |
| `decompressError` | `{ error, rawInput }` | Fired on decompression/parsing failure |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `play` | `() => Promise<void>` | Start or resume playback (from beginning if finished) |
| `pause` | `() => Promise<void>` | Pause playback |
| `seek` | `(time: number) => Promise<void>` | Jump to a timestamp (ms) |
| `getEvents` | `() => Promise<RrwebEvent[]>` | Get decompressed event array |
| `getAnalytics` | `() => Promise<AnalyticsData \| null>` | Get computed analytics data |

#### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `k` | Play / Pause |
| `j` | Seek backward 10s |
| `l` | Seek forward 10s |
| `←` | Seek backward 5s |
| `→` | Seek forward 5s |
| `↑` | Increase speed |
| `↓` | Decrease speed |
| `f` | Toggle fullscreen |
| `,` | Step backward 1 frame (100ms) |
| `.` | Step forward 1 frame (100ms) |
| `Home` | Jump to start |
| `End` | Jump to end |

### `<replayer-controls>` — Playback control bar

Used internally by `<web-replayer>`. Can also be used standalone.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `playing` | `boolean` | `false` | Is replay currently playing |
| `speed` | `number` | `1` | Current speed multiplier |
| `skip-inactive` | `boolean` | `true` | Skip inactive periods |
| `finished` | `boolean` | `false` | Has replay finished |
| `total-time` | `number` | `0` | Total session duration (ms) |

| Event | Detail | Description |
|-------|--------|-------------|
| `playPause` | `void` | Toggle play/pause |
| `seek` | `number` | Seek to timestamp (ms) |
| `speedChange` | `number` | Change speed multiplier |
| `stepForward` | `void` | Step forward 1 frame |
| `stepBackward` | `void` | Step backward 1 frame |
| `fullscreenToggle` | `void` | Toggle fullscreen |
| `skipInactiveToggle` | `boolean` | Toggle skip-inactive mode |

| Method | Signature | Description |
|--------|-----------|-------------|
| `updateTimeDisplay` | `(currentTime, totalTime) => Promise<void>` | Direct DOM update for slider/time (bypasses re-render) |

### `<web-heatmap>` — Interaction heatmap overlay

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `RrwebEvent[]` | *(required)* | Decompressed rrweb events |
| `overlay-on` | `HTMLElement` | — | Element to overlay the heatmap on |
| `type` | `'click' \| 'move' \| 'scroll' \| 'all'` | `'all'` | Filter heatmap by interaction type |
| `opacity` | `number` | `0.6` | Heatmap layer transparency (0–1) |
| `color-scheme` | `'warm' \| 'cool' \| 'custom'` | `'warm'` | Color palette for intensity rendering |

### `<web-stats-panel>` — Session analytics panel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `RrwebEvent[]` | *(required)* | Decompressed rrweb events |
| `layout` | `'sidebar' \| 'bottom'` | `'sidebar'` | Panel layout position |
| `metrics` | `StatsMetric[]` | all metrics | Which metrics to display |

## Interact Mode

When playback finishes (or is paused), the component automatically enables interact mode — the replayed page becomes visually explorable (scroll, hover, CSS transitions) without executing JavaScript inside the iframe.

This works by:
1. Setting `pointer-events: auto` on the replay iframe (allows mouse/touch input)
2. Removing `allow-scripts` from the iframe sandbox (prevents JS handlers from firing and crashing in the restricted sandbox)

When playback resumes, scripts are re-enabled for proper replay operation.

You can also force interact mode via the `interact` prop:
```html
<web-replayer data="..." interact />
```

## Compression Formats

The decompression engine auto-detects the compression format:

| Format | Detection Method |
|--------|------------------|
| LZ-String URI-safe | Probes URI-safe decoder, validates JSON result |
| LZ-String UTF-16 | Probes UTF-16 decoder, validates JSON result |
| LZ-String Base64 | Contains `=` or `/` (Base64 markers) |
| Pako gzip + Base64 | Gzip magic bytes (0x1f 0x8b) in decoded binary |
| Raw JSON | Valid JSON parse succeeds |

If auto-detection fails, a brute-force fallback tries all decompressors sequentially.

## Architecture

### Performance Strategy

| Concern | Solution |
|---------|----------|
| currentTime re-renders | Plain property (not @State) + rAF polling + `updateTimeDisplay()` @Method for direct DOM updates |
| Seek responsiveness | Visual feedback immediate (fill bar), actual seek throttled (100ms) |
| Time update events | Throttled to 250ms intervals |
| CSS containment | `contain: content` on replay container |
| Viewport scaling | `transform: scale()` + ResizeObserver for dynamic container sizing |

### Component Structure

```
<web-replayer>
  ├── <div class="player-viewport">
  │     ├── <div class="replay-container">   ← rrweb Replayer iframe
  │     └── <replayer-controls>              ← playback controls bar
  ├── <web-heatmap>  (optional overlay)
  └── <web-stats-panel> (optional sidebar)
```

## License

MIT
