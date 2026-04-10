import { useRef, useCallback, useEffect } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../hooks/useCanvas';

interface OledCanvasProps {
  pixels: boolean[][];
  previewPixels: [number, number][] | null;
  showGrid: boolean;
  onStartDraw: (x: number, y: number) => void;
  onContinueDraw: (x: number, y: number) => void;
  onEndDraw: (x: number, y: number) => void;
}

const PIXEL_SIZE = 6;
const GRID_COLOR = '#1a1a2e';
const PIXEL_ON_COLOR = '#4fc3f7';
const PIXEL_PREVIEW_COLOR = '#4fc3f780';
const BG_COLOR = '#0a0a0a';

export default function OledCanvas({
  pixels,
  previewPixels,
  showGrid,
  onStartDraw,
  onContinueDraw,
  onEndDraw,
}: OledCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseDownRef = useRef(false);

  const getPixelCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / PIXEL_SIZE);
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return null;
    return { x, y };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isMouseDownRef.current = true;
    const coords = getPixelCoords(e);
    if (coords) onStartDraw(coords.x, coords.y);
  }, [getPixelCoords, onStartDraw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current) return;
    const coords = getPixelCoords(e);
    if (coords) onContinueDraw(coords.x, coords.y);
  }, [getPixelCoords, onContinueDraw]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const coords = getPixelCoords(e);
    if (coords) onEndDraw(coords.x, coords.y);
  }, [getPixelCoords, onEndDraw]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= CANVAS_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * PIXEL_SIZE, 0);
        ctx.lineTo(x * PIXEL_SIZE, CANVAS_HEIGHT * PIXEL_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * PIXEL_SIZE);
        ctx.lineTo(CANVAS_WIDTH * PIXEL_SIZE, y * PIXEL_SIZE);
        ctx.stroke();
      }
    }

    // Draw pixels
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        if (pixels[y]?.[x]) {
          ctx.fillStyle = PIXEL_ON_COLOR;
          ctx.fillRect(
            x * PIXEL_SIZE + (showGrid ? 0.5 : 0),
            y * PIXEL_SIZE + (showGrid ? 0.5 : 0),
            PIXEL_SIZE - (showGrid ? 1 : 0),
            PIXEL_SIZE - (showGrid ? 1 : 0)
          );
        }
      }
    }

    // Draw preview pixels (shape being drawn)
    if (previewPixels) {
      ctx.fillStyle = PIXEL_PREVIEW_COLOR;
      for (const [x, y] of previewPixels) {
        if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT && !pixels[y]?.[x]) {
          ctx.fillRect(
            x * PIXEL_SIZE + (showGrid ? 0.5 : 0),
            y * PIXEL_SIZE + (showGrid ? 0.5 : 0),
            PIXEL_SIZE - (showGrid ? 1 : 0),
            PIXEL_SIZE - (showGrid ? 1 : 0)
          );
        }
      }
    }
  }, [pixels, previewPixels, showGrid]);

  return (
    <div className="oled-glow rounded-lg border-2 border-panel-border bg-oled-bg p-2 inline-block">
      <div className="text-[10px] text-gray-600 mb-1 text-center tracking-widest uppercase">
        SSD1306 OLED 128x64
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH * PIXEL_SIZE}
        height={CANVAS_HEIGHT * PIXEL_SIZE}
        className="cursor-crosshair block rounded"
        style={{ imageRendering: 'pixelated' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { isMouseDownRef.current = false; }}
      />
      <div className="text-[10px] text-gray-600 mt-1 text-center">
        {CANVAS_WIDTH} x {CANVAS_HEIGHT} px
      </div>
    </div>
  );
}
