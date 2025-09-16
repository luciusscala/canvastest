// Constants for grid snapping
const HOUR_WIDTH = 16; // pixels per hour on timeline
const GRID_SNAP_SIZE = 20; // pixels for Y-axis snapping

export interface SnapResult {
  x: number;
  y: number;
}

export function snapToGrid(x: number, y: number): SnapResult {
  // Snap X to hourly intervals
  const snappedX = Math.round(x / HOUR_WIDTH) * HOUR_WIDTH;

  // Snap Y to grid intervals
  const snappedY = Math.round(y / GRID_SNAP_SIZE) * GRID_SNAP_SIZE;

  return {
    x: snappedX,
    y: snappedY,
  };
}

export function timeFromPosition(x: number, startDate: Date): Date {
  const hoursFromStart = x / HOUR_WIDTH;
  const result = new Date(startDate);
  result.setHours(result.getHours() + hoursFromStart);
  return result;
}

export function positionFromTime(time: Date, startDate: Date): number {
  const hoursDiff = (time.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff * HOUR_WIDTH;
}