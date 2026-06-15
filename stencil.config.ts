import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'WebReplayer',
  srcDir: 'src',
  outputTargets: [
    { type: 'dist' },
    { type: 'dist-custom-elements' },
    { type: 'docs-readme' },
    { type: 'docs-json', file: 'docs/docs.json' },
  ],
  extras: {
    experimentalScopedSlotChanges: true,
  },
  testing: {
    testPath: '../src-tests',
  },
};
