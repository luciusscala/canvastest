// Constants for grid snapping
const GRID_SNAP_SIZE = 20; // pixels for both X and Y axis snapping

export interface SnapResult {
  x: number;
  y: number;
}

export function snapToGrid(x: number, y: number): SnapResult {
  // Snap both X and Y to grid intervals
  const snappedX = Math.round(x / GRID_SNAP_SIZE) * GRID_SNAP_SIZE;
  const snappedY = Math.round(y / GRID_SNAP_SIZE) * GRID_SNAP_SIZE;

  return {
    x: snappedX,
    y: snappedY,
  };
}