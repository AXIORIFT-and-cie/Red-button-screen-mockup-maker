import { useEffect, useRef, useState } from 'react';
import OledCanvas from './components/OledCanvas';
import Toolbar from './components/Toolbar';
import CodePanel from './components/CodePanel';
import { useCanvas } from './hooks/useCanvas';
import { Monitor, Code2 } from 'lucide-react';

type Tab = 'canvas' | 'code';

function App() {
  const canvas = useCanvas();
  const [tab, setTab] = useState<Tab>('canvas');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); canvas.undo(); }
        if (e.key === 'y') { e.preventDefault(); canvas.redo(); }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'b': canvas.setTool('pencil'); break;
        case 'e': canvas.setTool('eraser'); break;
        case 'g': canvas.setTool('fill'); break;
        case 'l': canvas.setTool('line'); break;
        case 'r': canvas.setTool('rect'); break;
        case 'c': canvas.setTool('circle'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canvas]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="border-b border-panel-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor size={20} className="text-accent" />
          <div>
            <h1 className="text-sm font-bold text-gray-200 tracking-wide">
              OLED Screen Mockup Maker
            </h1>
            <p className="text-[10px] text-gray-500">
              SSD1306 128x64 I2C OLED Display Editor
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors ${
              tab === 'canvas'
                ? 'border-accent text-accent bg-accent/10'
                : 'border-panel-border text-gray-500 hover:text-gray-300 hover:border-gray-500'
            }`}
          >
            <Monitor size={12} /> Canvas
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors ${
              tab === 'code'
                ? 'border-accent text-accent bg-accent/10'
                : 'border-panel-border text-gray-500 hover:text-gray-300 hover:border-gray-500'
            }`}
          >
            <Code2 size={12} /> Code
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex">
        {tab === 'canvas' ? (
          <div className="flex-1 flex gap-4 p-4">
            {/* Toolbar */}
            <Toolbar
              tool={canvas.tool}
              setTool={canvas.setTool}
              brushSize={canvas.brushSize}
              setBrushSize={canvas.setBrushSize}
              showGrid={canvas.showGrid}
              setShowGrid={canvas.setShowGrid}
              onUndo={canvas.undo}
              onRedo={canvas.redo}
              onClear={canvas.clear}
              onInvert={canvas.invertAll}
              canUndo={canvas.canUndo}
              canRedo={canvas.canRedo}
            />

            {/* Canvas */}
            <div className="flex-1 flex items-start justify-center pt-4">
              <OledCanvas
                pixels={canvas.pixels}
                previewPixels={canvas.previewPixels}
                showGrid={canvas.showGrid}
                onStartDraw={canvas.startDraw}
                onContinueDraw={canvas.continueDraw}
                onEndDraw={canvas.endDraw}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-4 p-4">
            {/* Mini preview */}
            <div className="flex flex-col gap-4">
              <div className="bg-panel-bg border border-panel-border rounded-lg p-3">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Preview</div>
                <MiniPreview pixels={canvas.pixels} />
              </div>
            </div>

            {/* Code panel */}
            <div className="flex-1">
              <CodePanel pixels={canvas.pixels} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniPreview({ pixels }: { pixels: boolean[][] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#4fc3f7';
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 128; x++) {
        if (pixels[y]?.[x]) {
          ctx.fillRect(x * 2, y * 2, 2, 2);
        }
      }
    }
  }, [pixels]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={128}
      className="rounded border border-panel-border block"
      style={{ imageRendering: 'pixelated', width: 200, height: 100 }}
    />
  );
}

export default App;
