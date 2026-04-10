import {
  Pencil,
  Eraser,
  PaintBucket,
  Minus,
  Square,
  Circle,
  Undo2,
  Redo2,
  Trash2,
  Grid3x3,
  SunMoon,
} from 'lucide-react';
import type { Tool } from '../hooks/useCanvas';

interface ToolbarProps {
  tool: Tool;
  setTool: (t: Tool) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  showGrid: boolean;
  setShowGrid: (g: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onInvert: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { id: Tool; icon: typeof Pencil; label: string }[] = [
  { id: 'pencil', icon: Pencil, label: 'Pencil' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'fill', icon: PaintBucket, label: 'Fill' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
];

const brushSizes = [1, 2, 3, 5];

export default function Toolbar({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  showGrid,
  setShowGrid,
  onUndo,
  onRedo,
  onClear,
  onInvert,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4 bg-panel-bg border border-panel-border rounded-lg p-3 w-[200px]">
      {/* Tools */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Tools</div>
        <div className="grid grid-cols-3 gap-1.5">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`tool-btn flex flex-col items-center gap-0.5 p-2 rounded border text-[10px] ${
                tool === id
                  ? 'active'
                  : 'border-panel-border text-gray-400'
              }`}
              title={label}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Size */}
      {(tool === 'pencil' || tool === 'eraser') && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
            Brush Size: {brushSize}px
          </div>
          <div className="flex gap-1.5">
            {brushSizes.map(s => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className={`tool-btn flex items-center justify-center rounded border w-9 h-9 ${
                  brushSize === s
                    ? 'active'
                    : 'border-panel-border text-gray-400'
                }`}
                title={`${s}px`}
              >
                <div
                  className="bg-current rounded-sm"
                  style={{
                    width: Math.min(s * 4, 20),
                    height: Math.min(s * 4, 20),
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Actions</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="tool-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-panel-border text-gray-400 text-xs flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} /> Undo
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="tool-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-panel-border text-gray-400 text-xs flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={14} /> Redo
            </button>
          </div>
          <button
            onClick={onClear}
            className="tool-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-panel-border text-gray-400 text-xs"
            title="Clear canvas"
          >
            <Trash2 size={14} /> Clear All
          </button>
          <button
            onClick={onInvert}
            className="tool-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-panel-border text-gray-400 text-xs"
            title="Invert all pixels"
          >
            <SunMoon size={14} /> Invert
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`tool-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs ${
              showGrid
                ? 'active'
                : 'border-panel-border text-gray-400'
            }`}
            title="Toggle grid"
          >
            <Grid3x3 size={14} /> Grid {showGrid ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="border-t border-panel-border pt-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Shortcuts</div>
        <div className="text-[10px] text-gray-600 space-y-0.5">
          <div><kbd className="text-gray-400">B</kbd> Pencil</div>
          <div><kbd className="text-gray-400">E</kbd> Eraser</div>
          <div><kbd className="text-gray-400">G</kbd> Fill</div>
          <div><kbd className="text-gray-400">L</kbd> Line</div>
          <div><kbd className="text-gray-400">R</kbd> Rectangle</div>
          <div><kbd className="text-gray-400">C</kbd> Circle</div>
          <div><kbd className="text-gray-400">Ctrl+Z</kbd> Undo</div>
          <div><kbd className="text-gray-400">Ctrl+Y</kbd> Redo</div>
        </div>
      </div>
    </div>
  );
}
