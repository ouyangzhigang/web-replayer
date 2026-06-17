/* React 19 uses React.JSX namespace, not global JSX */
declare namespace React.JSX {
  interface IntrinsicElements {
    'web-replayer': any;
    'replayer-controls': any;
    'web-heatmap': any;
    'heatmap-canvas': any;
    'web-stats-panel': any;
    'stats-chart': any;
    'wr-tooltip': any;
  }
}

/* Allow side-effect import of the Stencil component bundle */
declare module 'web-replayer' {
  const _: void;
  export default _;
}

declare module '*.css' {
  const _: void;
  export default _;
}
