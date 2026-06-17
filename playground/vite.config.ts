import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { stencilWatchPlugin } from './vite-plugin-stencil-watch';

/**
 * Vite config for the Playground dev app.
 *
 * The alias 'web-replayer' points to register.js, which imports from
 * dist/components/ and calls defineCustomElement() for every component.
 *
 * stencilWatchPlugin handles Stencil rebuilds:
 *   - Watches ../dist/components/ for file changes
 *   - On rebuild, invalidates stale modules and triggers browser full-reload
 *   - Prevents "Failed to resolve import" errors from hash-based chunk filenames
 */
export default defineConfig({
  plugins: [react(), stencilWatchPlugin()],
  resolve: {
    alias: {
      'web-replayer': path.resolve(__dirname, '../register.js'),
    },
  },
  server: {
    port: 4000,
    open: true,
    // Allow Vite to serve files from parent project's dist/ directory
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
});
