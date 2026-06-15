import React, { useState } from 'react';
import { DEMO_DATA_URI, DEMO_DATA_UTF16, DEMO_DATA_RAW } from './demo-data';

type DataFormat = 'uri-safe' | 'utf-16' | 'raw';
const DATA_MAP: Record<DataFormat, string> = { 'uri-safe': DEMO_DATA_URI, 'utf-16': DEMO_DATA_UTF16, raw: DEMO_DATA_RAW };

function App() {
  const [dataFormat, setDataFormat] = useState<DataFormat>('uri-safe');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1);

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
        <web-replayer
          data={DATA_MAP[dataFormat]}
          show-heatmap={showHeatmap ? true : undefined}
          show-stats={showStats ? true : undefined}
          auto-play={autoPlay ? true : undefined}
          speed={speed}
          width={800}
          height={450}
        />
      </main>
      <footer className="playground-footer">
        <p>Switch data format to test auto-detection | Toggle heatmap/stats overlays | Adjust speed</p>
      </footer>
    </div>
  );
}

export default App;
