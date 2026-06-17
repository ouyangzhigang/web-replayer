/**
 * vite-plugin-stencil-watch — Handles Stencil rebuilds in Vite dev server.
 *
 * Problem: Stencil's `dist-custom-elements` output uses content-hashed chunk
 * filenames (p-DCtFCsuU.js, p-BtJ13Srl.js, etc.). Each Stencil rebuild changes
 * ALL hashes. Vite's module graph caches old transformed modules that reference
 * old hashes, causing "Failed to resolve import" errors.
 *
 * Solution: Watch dist/components/ for changes. On any change:
 *   1. Invalidate all dist-related modules in Vite's module graph
 *   2. Force a full-page reload (not HMR — import graph structure changes)
 *
 * This makes source → Stencil rebuild → browser refresh seamless.
 */
import type { Plugin, ViteDevServer } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

const PLUGIN_NAME = 'stencil-watch';

export function stencilWatchPlugin(): Plugin {
  let distDir: string;

  return {
    name: PLUGIN_NAME,

    configResolved(config) {
      // Resolve dist/components/ relative to Vite root (playground directory)
      distDir = path.resolve(config.root, '../dist/components');
    },

    configureServer(server: ViteDevServer) {
      // Add dist/components/ to Vite's chokidar watcher
      // Vite only watches files inside project root by default;
      // dist/ is in the parent project, so we must add it explicitly.
      if (fs.existsSync(distDir)) {
        server.watcher.add(distDir);
      }

      // Debounce full-reloads — Stencil rebuilds touch many files rapidly,
      // we only want ONE reload after the rebuild settles.
      let reloadTimer: ReturnType<typeof setTimeout> | null = null;

      server.watcher.on('change', (file: string) => {
        if (!file.startsWith(distDir)) return;
        triggerReload(server, file, distDir, reloadTimer, (t) => { reloadTimer = t; });
      });

      server.watcher.on('unlink', (file: string) => {
        if (!file.startsWith(distDir)) return;
        triggerReload(server, file, distDir, reloadTimer, (t) => { reloadTimer = t; });
      });

      server.watcher.on('add', (file: string) => {
        if (!file.startsWith(distDir)) return;
        triggerReload(server, file, distDir, reloadTimer, (t) => { reloadTimer = t; });
      });
    },

    handleHotUpdate({ file, server }) {
      // For dist/components/ files, skip HMR and rely on the full-reload
      // triggered by the watcher listener above.
      // HMR can't handle structural import-graph changes (new hash filenames).
      if (file.startsWith(distDir)) {
        // Invalidate the specific module so Vite doesn't serve stale cached version
        const mod = server.moduleGraph.getModuleById(file);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }
        // Return empty array → skip HMR update for this file
        // The full-reload will be triggered by the watcher listener (debounced)
        return [];
      }
    },
  };
}

/**
 * Debounced full-reload: wait 500ms after the last dist/ change
 * before reloading the browser. This coalesces rapid multi-file
 * changes from a single Stencil rebuild into one reload.
 */
function triggerReload(
  server: ViteDevServer,
  _file: string,
  distDir: string,
  existingTimer: ReturnType<typeof setTimeout> | null,
  setTimer: (t: ReturnType<typeof setTimeout> | null) => void,
) {
  // Invalidate all modules that import from dist/components/
  invalidateDistModules(server, distDir);

  // Debounce: 500ms after last change → full reload
  if (existingTimer) clearTimeout(existingTimer);
  const timer = setTimeout(() => {
    server.ws.send({ type: 'full-reload' });
    setTimer(null);
  }, 500);
  setTimer(timer);
}

/**
 * Invalidate all modules in Vite's module graph that are from
 * dist/components/ or import from dist/components/.
 * This ensures stale cached transformations (with old hash references)
 * are discarded so the next page load reads fresh files from disk.
 */
function invalidateDistModules(server: ViteDevServer, distDir: string) {
  const normalizedDistDir = distDir.replace(/\\/g, '/');

  for (const mod of server.moduleGraph.idToModuleMap.values()) {
    const modPath = (mod.id ?? mod.file ?? '').replace(/\\/g, '/');

    // Direct dist/modules: component files, shared chunks, index.js, register.js
    if (modPath.includes(normalizedDistDir) || modPath.includes('/dist/components/')) {
      server.moduleGraph.invalidateModule(mod);

      // Also invalidate all importers (modules that import this dist module)
      // e.g., register.js imports dist/components/web-replayer.js
      // e.g., App.tsx (via Vite transform) imports register.js
      for (const importer of mod.importers) {
        server.moduleGraph.invalidateModule(importer);
      }
    }
  }
}
