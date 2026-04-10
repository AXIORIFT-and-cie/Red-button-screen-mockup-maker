import { useState, useCallback, useRef } from 'react';

export const CANVAS_WIDTH = 128;
export const CANVAS_HEIGHT = 64;

export type Tool = 'pencil' | 'eraser' | 'fill' | 'line' | 'rect' | 'circle';

function createEmptyGrid(): boolean[][] {
  return Array.from({ length: CANVAS_HEIGHT }, () =>
    Array.from({ length: CANVAS_WIDTH }, () => false)
  );
}

function cloneGrid(grid: boolean[][]): boolean[][] {
  return grid.map(row => [...row]);
}

function floodFill(grid: boolean[][], startX: number, startY: number, fillValue: boolean): boolean[][] {
  const newGrid = cloneGrid(grid);
  const targetValue = newGrid[startY][startX];
  if (targetValue === fillValue) return newGrid;

  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) continue;
    if (newGrid[y][x] !== targetValue) continue;
    newGrid[y][x] = fillValue;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return newGrid;
}

function getLinePixels(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pixels: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0, cy = y0;
  while (true) {
    pixels.push([cx, cy]);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
  return pixels;
}

function getRectPixels(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pixels: [number, number][] = [];
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  for (let x = minX; x <= maxX; x++) {
    pixels.push([x, minY], [x, maxY]);
  }
  for (let y = minY + 1; y < maxY; y++) {
    pixels.push([minX, y], [maxX, y]);
  }
  return pixels;
}

function getCirclePixels(cx: number, cy: number, ex: number, ey: number): [number, number][] {
  const pixels: [number, number][] = [];
  const r = Math.round(Math.sqrt((ex - cx) ** 2 + (ey - cy) ** 2));
  if (r === 0) {
    pixels.push([cx, cy]);
    return pixels;
  }

  let x = r, y = 0, d = 1 - r;
  const addSymmetric = (px: number, py: number) => {
    pixels.push(
      [cx + px, cy + py], [cx - px, cy + py],
      [cx + px, cy - py], [cx - px, cy - py],
      [cx + py, cy + px], [cx - py, cy + px],
      [cx + py, cy - px], [cx - py, cy - px]
    );
  };

  while (x >= y) {
    addSymmetric(x, y);
    y++;
    if (d <= 0) {
      d += 2 * y + 1;
    } else {
      x--;
      d += 2 * (y - x) + 1;
    }
  }
  return pixels;
}

function applyBrush(grid: boolean[][], cx: number, cy: number, size: number, value: boolean): boolean[][] {
  const newGrid = cloneGrid(grid);
  const half = Math.floor(size / 2);
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const px = cx + dx;
      const py = cy + dy;
      if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT) {
        newGrid[py][px] = value;
      }
    }
  }
  return newGrid;
}

const MAX_HISTORY = 50;

export function useCanvas() {
  const [pixels, setPixels] = useState<boolean[][]>(createEmptyGrid);
  const [history, setHistory] = useState<boolean[][][]>([]);
  const [redoStack, setRedoStack] = useState<boolean[][][]>([]);
  const [tool, setTool] = useState<Tool>('pencil');
  const [brushSize, setBrushSize] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeStart, setShapeStart] = useState<[number, number] | null>(null);
  const [previewPixels, setPreviewPixels] = useState<[number, number][] | null>(null);

  const drawingGridRef = useRef<boolean[][] | null>(null);
  const preDrawGridRef = useRef<boolean[][] | null>(null);

  const pushHistory = useCallback((grid: boolean[][]) => {
    setHistory(h => {
      const newH = [...h, grid];
      if (newH.length > MAX_HISTORY) newH.shift();
      return newH;
    });
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const newH = [...h];
      const prev = newH.pop()!;
      setRedoStack(r => [...r, pixels]);
      setPixels(prev);
      return newH;
    });
  }, [pixels]);

  const redo = useCallback(() => {
    setRedoStack(r => {
      if (r.length === 0) return r;
      const newR = [...r];
      const next = newR.pop()!;
      setHistory(h => [...h, pixels]);
      setPixels(next);
      return newR;
    });
  }, [pixels]);

  const clear = useCallback(() => {
    pushHistory(pixels);
    setPixels(createEmptyGrid());
  }, [pixels, pushHistory]);

  const invertAll = useCallback(() => {
    pushHistory(pixels);
    setPixels(prev => prev.map(row => row.map(v => !v)));
  }, [pixels, pushHistory]);

  const startDraw = useCallback((x: number, y: number) => {
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return;
    setIsDrawing(true);

    if (tool === 'fill') {
      pushHistory(pixels);
      const fillValue = !pixels[y][x];
      setPixels(floodFill(pixels, x, y, fillValue));
      setIsDrawing(false);
      return;
    }

    if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      setShapeStart([x, y]);
      preDrawGridRef.current = cloneGrid(pixels);
      return;
    }

    // pencil or eraser
    const value = tool === 'pencil';
    pushHistory(pixels);
    const newGrid = applyBrush(pixels, x, y, brushSize, value);
    drawingGridRef.current = newGrid;
    setPixels(newGrid);
  }, [tool, pixels, brushSize, pushHistory]);

  const continueDraw = useCallback((x: number, y: number) => {
    if (!isDrawing) return;
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return;

    if ((tool === 'line' || tool === 'rect' || tool === 'circle') && shapeStart) {
      let shapePixels: [number, number][];
      if (tool === 'line') {
        shapePixels = getLinePixels(shapeStart[0], shapeStart[1], x, y);
      } else if (tool === 'rect') {
        shapePixels = getRectPixels(shapeStart[0], shapeStart[1], x, y);
      } else {
        shapePixels = getCirclePixels(shapeStart[0], shapeStart[1], x, y);
      }
      setPreviewPixels(shapePixels);
      return;
    }

    // freehand drawing
    const value = tool === 'pencil';
    const currentGrid = drawingGridRef.current || pixels;
    const newGrid = applyBrush(currentGrid, x, y, brushSize, value);
    drawingGridRef.current = newGrid;
    setPixels(newGrid);
  }, [isDrawing, tool, shapeStart, pixels, brushSize]);

  const endDraw = useCallback((x: number, y: number) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if ((tool === 'line' || tool === 'rect' || tool === 'circle') && shapeStart && preDrawGridRef.current) {
      pushHistory(preDrawGridRef.current);
      let shapePixels: [number, number][];
      if (tool === 'line') {
        shapePixels = getLinePixels(shapeStart[0], shapeStart[1], x, y);
      } else if (tool === 'rect') {
        shapePixels = getRectPixels(shapeStart[0], shapeStart[1], x, y);
      } else {
        shapePixels = getCirclePixels(shapeStart[0], shapeStart[1], x, y);
      }

      const newGrid = cloneGrid(preDrawGridRef.current);
      for (const [px, py] of shapePixels) {
        if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT) {
          newGrid[py][px] = true;
        }
      }
      setPixels(newGrid);
      setPreviewPixels(null);
      setShapeStart(null);
      preDrawGridRef.current = null;
    }

    drawingGridRef.current = null;
  }, [isDrawing, tool, shapeStart, pushHistory]);

  return {
    pixels,
    setPixels,
    tool,
    setTool,
    brushSize,
    setBrushSize,
    showGrid,
    setShowGrid,
    isDrawing,
    previewPixels,
    startDraw,
    continueDraw,
    endDraw,
    undo,
    redo,
    clear,
    invertAll,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
  };
}
