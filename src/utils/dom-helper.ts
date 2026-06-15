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
