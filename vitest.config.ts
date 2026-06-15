import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src-tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@types': new URL('./src/types', import.meta.url).pathname,
    },
  },
});
