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


// 1. 保存原生的 setAttribute 方法
// const nativeSetAttribute = Element.prototype.setAttribute;

// // 2. 重写 setAttribute 进行拦截
// Element.prototype.setAttribute = function(name, value) {
//   // 拦截 rrweb 创建的 iframe，并修改其 sandbox 属性
//   if (name === 'sandbox' && value === 'allow-same-origin' && this.tagName === 'IFRAME') {
//     // 方案 A：加上 allow-forms allow-popups 权限
//     return nativeSetAttribute.call(this, name, 'allow-same-origin allow-forms allow-popups');
    
//     // 方案 B：如果你想完全移除 sandbox 限制，直接 return 不执行即可
//     // return; 
//   }
//   // 其他情况按原生逻辑执行
//   return nativeSetAttribute.call(this, name, value);
// };
