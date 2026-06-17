/**
 * Auto-registration entry for web-replayer custom elements.
 *
 * Importing this file as a side-effect (import 'web-replayer')
 * registers all Web Components with the browser's CustomElements registry.
 *
 * <web-replayer>, <replayer-controls>, <web-heatmap>,
 * <web-stats-panel>, <wr-tooltip> become available as HTML tags
 * without further setup.
 *
 * This file lives at the project root.  For the Playground dev server
 * (Vite alias 'web-replayer' → this file), imports resolve against the
 * root so they use ./dist/components/… paths.  A copy with adjusted
 * relative paths is placed in dist/components/ during `stencil build`.
 */

import { defineCustomElement as defineWebReplayer } from './dist/components/web-replayer.js';
import { defineCustomElement as defineReplayerControls } from './dist/components/replayer-controls.js';
import { defineCustomElement as defineWebHeatmap } from './dist/components/web-heatmap.js';
import { defineCustomElement as defineHeatmapCanvas } from './dist/components/heatmap-canvas.js';
import { defineCustomElement as defineWebStatsPanel } from './dist/components/web-stats-panel.js';
import { defineCustomElement as defineStatsChart } from './dist/components/stats-chart.js';
import { defineCustomElement as defineWrTooltip } from './dist/components/wr-tooltip.js';

defineWebReplayer();
defineReplayerControls();
defineWebHeatmap();
defineHeatmapCanvas();
defineWebStatsPanel();
defineStatsChart();
defineWrTooltip();
