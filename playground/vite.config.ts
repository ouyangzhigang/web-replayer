import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vite config for the Playground dev app.
 * Uses dist/components/ (custom elements bundle) instead of dist/ (lazy-loading bundle)
 * because Vite's bundler can't resolve Stencil's lazy-loaded entry files.
 * The custom elements bundle auto-registers all components as Custom Elements on import.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'web-replayer': path.resolve(__dirname, '../dist/components/index.js'),
    },
  },
  server: {
    port: 4000,
    open: true,
  },
});
