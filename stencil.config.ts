import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'WebReplayer',
  srcDir: 'src',
  outputTargets: [
    { type: 'dist', },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    { type: 'docs-readme' },
    { type: 'docs-json', file: 'docs/docs.json' },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  extras: {
    experimentalScopedSlotChanges: true,
  },
  testing: {
    testMatch: ['../src-tests/**/*'],
  },
};
