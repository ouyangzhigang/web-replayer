# web-replayer

Framework-agnostic Web Component for rrweb session replay with interaction heatmap and operation analytics. Built with [Stencil](https://stenciljs.com/).

## Install

```bash
npm install web-replayer
# or
pnpm add web-replayer
```

## Quick Start

```html
<script type="module">
  import 'web-replayer';
</script>

<!-- Minimal replay -->
<web-replayer data="<compressed rrweb string>"></web-replayer>

<!-- Replay with heatmap overlay and stats panel -->
<web-replayer
  data="<compressed rrweb string>"
  auto-play
  speed="2"
  show-controls
  show-heatmap
  show-stats
></web-replayer>
```

### React / Vue / Angular

Since these are standard Web Components, they work in any framework:

```jsx
// React
import 'web-replayer';

function App() {
  return <web-replayer data={compressedData} auto-play show-controls />;
}
```

```vue
<!-- Vue -->
<template>
  <web-replayer :data="compressedData" auto-play show-controls />
</template>
```

```ts
// Angular (add CUSTOM_ELEMENTS_SCHEMA to your module)
import 'web-replayer';
```

## Components API

### `<web-replayer>` — Main replay component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `string` | *(required)* | LZ-String / pako compressed rrweb events string |
| `width` | `number` | — | Replay area width in px (auto-fits container if unset) |
| `height` | `number` | — | Replay area height in px (auto-fits container if unset) |
| `auto-play` | `boolean` | `false` | Auto-play on data load |
| `speed` | `number` | `1` | Playback speed multiplier |
| `show-controls` | `boolean` | `true` | Show playback control bar |
| `show-heatmap` | `boolean` | `false` | Overlay heatmap on replay canvas |
| `show-stats` | `boolean` | `false` | Show stats panel alongside replay |
| `start-time` | `number` | `0` | Jump to timestamp on load (ms) |

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `replayReady` | `{ replayer, metadata }` | Fired when replay is initialized |
| `replayStart` | `void` | Fired when playback starts |
| `replayPause` | `void` | Fired when playback pauses |
| `replayFinish` | `void` | Fired when replay completes |
| `replayTimeUpdate` | `{ currentTime, totalTime }` | Fired on time position changes |
| `heatmapReady` | `{ heatmapData }` | Fired when heatmap data is computed |
| `statsReady` | `{ statsData }` | Fired when stats data is computed |
| `decompressError` | `{ error, rawInput }` | Fired on decompression failure |

| Method | Signature | Description |
|--------|-----------|-------------|
| `play` | `() => Promise<void>` | Start or resume playback |
| `pause` | `() => Promise<void>` | Pause playback |
| `seek` | `(time: number) => Promise<void>` | Jump to a timestamp (ms) |
| `getEvents` | `() => Promise<RrwebEvent[]>` | Get decompressed event array |
| `getAnalytics` | `() => Promise<AnalyticsData \| null>` | Get computed analytics data |

### `<web-heatmap>` — Interaction heatmap overlay

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `RrwebEvent[]` | *(required)* | Decompressed rrweb events |
| `type` | `'click' \| 'move' \| 'scroll' \| 'all'` | `'all'` | Filter heatmap by interaction type |
| `opacity` | `number` | `0.6` | Heatmap layer transparency (0-1) |
| `color-scheme` | `'warm' \| 'cool' \| 'custom'` | `'warm'` | Color palette for intensity rendering |

### `<web-stats-panel>` — Session analytics panel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `RrwebEvent[]` | *(required)* | Decompressed rrweb events |
| `layout` | `'sidebar' \| 'bottom' \| 'modal'` | `'sidebar'` | Panel layout position |
| `metrics` | `StatsMetric[]` | `['clicks', 'scrolls', 'inputs', 'duration', 'path']` | Which metrics to display |

### `<replayer-controls>` — Playback control bar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `playing` | `boolean` | `false` | Is replay currently playing |
| `current-time` | `number` | `0` | Current playback position (ms) |
| `total-time` | `number` | `0` | Total session duration (ms) |
| `speed` | `number` | `1` | Current speed multiplier |

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `playPause` | `void` | Toggle play/pause |
| `seek` | `number` | Seek to timestamp (ms) |
| `speedChange` | `number` | Change speed multiplier |

## Compression Formats

The decompression engine auto-detects the compression format by probing each decompressor in priority order:

| Format | Identifier | Detection |
|--------|------------|-----------|
| LZ-String URI-safe | `lz-string-uri-safe` | No `=` or `/` characters, probes URI-safe decoder |
| LZ-String UTF-16 | `lz-string-utf16` | Probes UTF-16 decoder, validates JSON-like result |
| LZ-String Base64 | `lz-string-base64` | Contains `=` or `/` characters |
| Pako gzip + Base64 | `pako-base64` | Gzip magic bytes (0x1f 0x8b) in decoded binary |
| Raw JSON | `raw` | Valid JSON parse succeeds |

If auto-detection fails, a brute-force fallback tries all decompressors sequentially.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Development (watch + playground)
pnpm dev

# Run unit tests
pnpm test:unit

# Run all tests (unit + Stencil spec/e2e)
pnpm test

# Lint
pnpm lint

# Format
pnpm format

# Clean build artifacts
pnpm clean
```

## License

MIT


## Reference

[rrweb](https://github.com/rrweb/rrweb)
[Stencil](https://stenciljs.jikun.dev/docs/components/functional-components.html)
[lz-string](https://github.com/rrweb/lz-string)
[pako](https://github.com/rrweb/pako)
