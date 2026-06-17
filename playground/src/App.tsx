import React, { useEffect, useRef, useState } from 'react';
import { DEMO_DATA_URI, DEMO_DATA_UTF16, DEMO_DATA_RAW, DEMO_DATA_VALUE } from './demo-data';

type DataFormat = 'uri-safe' | 'utf-16' | 'raw' | 'value';
const DATA_MAP: Record<DataFormat, string | any[]> = {
  'uri-safe': DEMO_DATA_URI,
  'utf-16': DEMO_DATA_UTF16,
  raw: DEMO_DATA_RAW as string,
  value: DEMO_DATA_VALUE as any,
};

function App() {
  const [dataFormat, setDataFormat] = useState<DataFormat>('uri-safe');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1);

  const replayerRef = useRef<HTMLElement>(null);

  // Set properties directly on the Custom Element via ref — avoids
  // HTML attribute truncation issues with very long compressed strings.
  // In Stencil, setting a JS property bypasses attribute parsing.
  useEffect(() => {
    const el = replayerRef.current;
    if (!el) return;
    // Stencil props can be set as JS properties directly
    (el as any).data = DATA_MAP[dataFormat];
    (el as any).speed = speed;
    (el as any).showHeatmap = showHeatmap;
    (el as any).showStats = showStats;
    (el as any).autoPlay = autoPlay;
    (el as any).startTime = 1000;
  }, [dataFormat, speed, showHeatmap, showStats, autoPlay]);

  return (
    <div className="playground">
      <header className="playground-header">
        <h1>web-replayer Playground</h1>
        <p className="subtitle">Framework-agnostic session replay + analytics</p>
      </header>
      <nav className="controls-bar">
        <label>Data format:
          <select value={dataFormat} onChange={(e) => setDataFormat(e.target.value as DataFormat)}>
            <option value="uri-safe">LZ-String URI-safe</option>
            <option value="utf-16">LZ-String UTF-16</option>
            <option value="raw">Raw JSON</option>
            <option value="value">Value array</option>
          </select>
        </label>
        <button onClick={() => setShowHeatmap(!showHeatmap)}>{showHeatmap ? '✓' : '○'} Heatmap</button>
        <button onClick={() => setShowStats(!showStats)}>{showStats ? '✓' : '○'} Stats</button>
        <button onClick={() => setAutoPlay(!autoPlay)}>{autoPlay ? '✓' : '○'} Auto-play</button>
        <label>Speed:
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </label>
      </nav>
      <main className="playground-main">
        {/* Use ref to set props directly as JS properties — bypasses attribute parsing */}
        <web-replayer ref={replayerRef} width="85%" height="888" showStats={true} interact={true} />
      </main>
      <footer className="playground-footer">
        <p>Switch data format to test auto-detection | Toggle heatmap/stats overlays | Adjust speed</p>
      </footer>
    </div>
  );
}

export default App;
