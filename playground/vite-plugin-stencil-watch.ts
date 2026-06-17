/**
 * vite-plugin-stencil-watch — Robust handling of Stencil rebuilds in Vite dev server.
 *
 * Problem: Stencil's `dist-custom-elements` output uses content-hashed chunk filenames
 * (p-DCtFCsuU.js, etc). Each rebuild changes ALL hashes. Vite's module graph caches
 * old transformed modules that reference old hashes, but those files no longer exist
 * on disk → "Failed to resolve import" errors.
 *
 * Root cause analysis:
 *   1. Vite pre-bundles dependencies into node_modules/.vite/deps/ — stale cache
 *   2. Vite's per-request transform cache returns old module versions during debounce window
 *   3. HMR incremental updates can't handle structural import-graph changes
 *
 * Solution (multi-layer):
 *   1. optimizeDeps.exclude — prevent Vite from pre-bundling dist/ files
 *   2. Immediate full invalidation — on ANY dist change, invalidate ALL dist-related
 *      modules AND their importers in one sweep (no stale cache left behind)
 *   3. Debounced full-reload — coalesce rapid multi-file changes from one rebuild
 *      into a single browser refresh, but modules are already invalidated so
 *      mid-debounce requests get fresh files from disk
 *   4. HMR bypass — return [] for dist files; structural changes can't be hot-patched
 *   5. Dep cache busting — clear Vite's optimizeDeps cache on dist changes so
 *      next page load re-processes everything fresh
 */
import type { Plugin, ViteDevServer, HmrContext } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

const PLUGIN_NAME = 'stencil-watch';

export function stencilWatchPlugin(): Plugin {
  let distDir: string;
  let rootDir: string;

  return {
    name: PLUGIN_NAME,

    configResolved(config) {
      rootDir = config.root;
      distDir = path.resolve(config.root, '../dist/components');
    },

    /**
     * Prevent Vite from pre-bunding dist/ files into node_modules/.vite/deps/.
     * Pre-bundled files are frozen at startup — Stencil rebuilds can't update them.
     * Without this, Vite serves stale pre-bundled chunks even after invalidation.
     */
    config() {
      return {
        optimizeDeps: {
          exclude: ['web-replayer'],
        },
      };
    },

    configureServer(server: ViteDevServer) {
      // Add dist/components/ to Vite's chokidar watcher
      // Vite only watches files inside project root by default;
      // dist/ is in the parent project, so we must add it explicitly.
      if (fs.existsSync(distDir)) {
        server.watcher.add(distDir);
      } else {
        // If dist doesn't exist yet, watch parent dir and add dist when it appears
        const parentDist = path.resolve(rootDir, '../dist');
        server.watcher.add(parentDist);
      }

      // Also watch register.js (root-level, references dist/components/)
      const registerJs = path.resolve(rootDir, '../register.js');
      if (fs.existsSync(registerJs)) {
        server.watcher.add(registerJs);
      }

      // ── Debounce full-reload ──
      // Stencil rebuilds touch 10+ files in rapid succession (delete old chunks,
      // create new chunks, update component files). We need ONE reload after
      // the rebuild settles, not 10 reloads with broken intermediate states.
      let reloadTimer: ReturnType<typeof setTimeout> | null = null;

      const onDistChange = (file: string) => {
        const normalizedFile = file.replace(/\\/g, '/');
        const normalizedDistDir = distDir.replace(/\\/g, '/');
        const normalizedRegisterJs = registerJs.replace(/\\/g, '/');

        // Only react to dist/components/ files and register.js
        if (!normalizedFile.startsWith(normalizedDistDir) &&
            normalizedFile !== normalizedRegisterJs) {
          return;
        }

        // IMMEDIATELY invalidate ALL dist-related modules (not debounced)
        // This ensures any module request during the debounce window gets
        // fresh files from disk, not stale cached versions.
        invalidateAllDistModules(server, normalizedDistDir);

        // Debounce the browser reload signal only
        if (reloadTimer) clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
          // Clear Vite's dep optimization cache so next load is fresh
          clearDepOptimizationCache(server);
          server.ws.send({ type: 'full-reload' });
          reloadTimer = null;
        }, 800);
      };

      server.watcher.on('change', onDistChange);
      server.watcher.on('unlink', onDistChange);
      server.watcher.on('add', onDistChange);
    },

    handleHotUpdate(ctx: HmrContext) {
      const normalizedFile = ctx.file.replace(/\\/g, '/');
      const normalizedDistDir = distDir.replace(/\\/g, '/');
      const normalizedRegisterJs = path.resolve(rootDir, '../register.js').replace(/\\/g, '/');

      // For dist/components/ files and register.js:
      // Skip HMR entirely — structural import-graph changes can't be hot-patched.
      // The watcher listener above handles full invalidation + debounced reload.
      if (normalizedFile.startsWith(normalizedDistDir) ||
          normalizedFile === normalizedRegisterJs) {
        // Modules are already invalidated by the watcher listener,
        // just skip the HMR update pipeline for this file.
        return [];
      }
    },
  };
}

/**
 * Invalidate ALL modules in Vite's module graph that are from dist/components/
 * or that import from dist/components/ (including register.js, App.tsx, etc).
 *
 * This is a FULL sweep — not just the changed file. Because when Stencil
 * rebuilds, ALL hash filenames change, so every dist module's imports are
 * stale. A partial invalidation leaves stale references that cause errors.
 */
function invalidateAllDistModules(server: ViteDevServer, normalizedDistDir: string) {
  const invalidated = new Set<string>();

  for (const mod of server.moduleGraph.idToModuleMap.values()) {
    const modPath = (mod.id ?? mod.file ?? '').replace(/\\/g, '/');

    // Direct dist/ modules: component files, shared chunks, index.js
    if (modPath.includes('/dist/components/') || modPath.includes(normalizedDistDir)) {
      invalidated.add(mod.id ?? mod.file ?? '');
      server.moduleGraph.invalidateModule(mod);

      // Walk up the importer chain — register.js → App.tsx → etc
      invalidateImporters(mod, invalidated, server);
    }
  }

  // Also invalidate register.js module (it imports dist/components/*)
  // Its path might be the alias-resolved path, not just the file path
  for (const mod of server.moduleGraph.idToModuleMap.values()) {
    const modPath = (mod.id ?? mod.file ?? '').replace(/\\/g, '/');
    if (modPath.includes('register.js') && !invalidated.has(mod.id ?? mod.file ?? '')) {
      server.moduleGraph.invalidateModule(mod);
      invalidateImporters(mod, invalidated, server);
    }
  }
}

/**
 * Recursively invalidate all modules that import the given module.
 * This ensures the stale cache is cleared all the way up to App.tsx.
 */
function invalidateImporters(
  mod: any,
  invalidated: Set<string>,
  server: ViteDevServer,
) {
  for (const importer of mod.importers) {
    const importerId = importer.id ?? importer.file ?? '';
    if (!invalidated.has(importerId)) {
      invalidated.add(importerId);
      server.moduleGraph.invalidateModule(importer);
      invalidateImporters(importer, invalidated, server);
    }
  }
}

/**
 * Clear Vite's dependency optimization cache for web-replayer.
 * When dist files change, the pre-bundled cache in node_modules/.vite/deps/
 * may contain stale versions. Clearing forces Vite to re-process on next load.
 */
function clearDepOptimizationCache(server: ViteDevServer) {
  // Invalidate the optimized deps metadata so Vite re-processes on next request
  // This is the clean way to bust the cache without restarting the server
  try {
    // Access the internal _depsOptimizer to invalidate the dep cache
    const optimizer = (server as any)._depsOptimizer;
    if (optimizer) {
      optimizer.resetDepsOptimizer?.();
    }
  } catch {
    // If the internal API changes, silently skip — the module invalidation
    // above is the primary mechanism; this is just an extra safety net.
  }
}
