import type { DateRange, TimeUnit, BlockPosition, TripTimeline } from '../types/index';

// Convert different time units to hours
export const toHours = {
  hours: (h: number): number => h,
  days: (d: number): number => d * 24,
  weeks: (w: number): number => w * 168,
  minutes: (m: number): number => m / 60,
  seconds: (s: number): number => s / 3600,
};

// Convert hours to other units
export const fromHours = {
  hours: (h: number): number => h,
  days: (h: number): number => h / 24,
  weeks: (h: number): number => h / 168,
  minutes: (h: number): number => h * 60,
  seconds: (h: number): number => h * 3600,
};

// Calculate duration between two dates in hours
export function calculateDurationHours(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

// Create a DateRange from start and end dates
export function createDateRange(start: Date, end: Date): DateRange {
  return {
    start,
    end,
    duration: { hours: calculateDurationHours(start, end) }
  };
}

// Calculate hours from trip start date
export function calculateHoursFromTripStart(
  date: Date, 
  tripStartDate: Date
): number {
  return calculateDurationHours(tripStartDate, date);
}

// Calculate block position from time data
export function calculateBlockPosition(
  startHour: number,
  durationHours: number,
  scale: number,
  y: number = 0
): BlockPosition {
  return {
    startHour,
    durationHours,
    x: startHour * scale,
    width: durationHours * scale,
  };
}

// Convert canvas position to time
export function positionToTime(
  x: number,
  scale: number
): number {
  return x / scale; // Returns hours from trip start
}

// Check if two time ranges overlap
export function hasTimeOverlap(
  range1: { startHour: number; durationHours: number },
  range2: { startHour: number; durationHours: number }
): boolean {
  const range1End = range1.startHour + range1.durationHours;
  const range2End = range2.startHour + range2.durationHours;
  
  return !(range1End <= range2.startHour || range2End <= range1.startHour);
}

// Calculate overlap duration between two time ranges
export function calculateOverlapDuration(
  range1: { startHour: number; durationHours: number },
  range2: { startHour: number; durationHours: number }
): number {
  if (!hasTimeOverlap(range1, range2)) return 0;
  
  const overlapStart = Math.max(range1.startHour, range2.startHour);
  const overlapEnd = Math.min(
    range1.startHour + range1.durationHours,
    range2.startHour + range2.durationHours
  );
  
  return Math.max(0, overlapEnd - overlapStart);
}

// Format hours to human-readable string
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  } else if (hours < 24) {
    return `${Math.round(hours * 10) / 10}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days}d`;
    } else {
      return `${days}d ${Math.round(remainingHours)}h`;
    }
  }
}

// Create a trip timeline with unified scale
export function createTripTimeline(
  startDate: Date,
  endDate: Date,
  scale: number = 20 // pixels per hour
): TripTimeline {
  const totalHours = calculateDurationHours(startDate, endDate);
  
  return {
    startDate,
    endDate,
    totalHours,
    scale
  };
}

// Validate that a block fits within trip timeline
export function validateBlockWithinTrip(
  block: { startHour: number; durationHours: number },
  tripTimeline: TripTimeline
): { isValid: boolean; message?: string } {
  if (block.startHour < 0) {
    return { isValid: false, message: 'Block starts before trip begins' };
  }
  
  if (block.startHour + block.durationHours > tripTimeline.totalHours) {
    return { isValid: false, message: 'Block extends beyond trip end' };
  }
  
  return { isValid: true };
}

// Calculate the best snap position for a block within a parent
export function calculateSnapPosition(
  draggedBlock: { startHour: number; durationHours: number },
  parentBlock: { startHour: number; durationHours: number },
  tripTimeline: TripTimeline
): BlockPosition {
  // Ensure the dragged block fits within the parent's time range
  const constrainedStartHour = Math.max(
    draggedBlock.startHour,
    parentBlock.startHour
  );
  
  const maxEndHour = parentBlock.startHour + parentBlock.durationHours;
  const constrainedEndHour = Math.min(
    constrainedStartHour + draggedBlock.durationHours,
    maxEndHour
  );
  
  const constrainedDuration = constrainedEndHour - constrainedStartHour;
  
  return calculateBlockPosition(
    constrainedStartHour,
    constrainedDuration,
    tripTimeline.scale
  );
}

// Check if a block can logically fit within another block
export function canBlockFitWithin(
  childBlock: { startHour: number; durationHours: number },
  parentBlock: { startHour: number; durationHours: number }
): boolean {
  const childEndHour = childBlock.startHour + childBlock.durationHours;
  const parentEndHour = parentBlock.startHour + parentBlock.durationHours;
  
  return childBlock.startHour >= parentBlock.startHour && 
         childEndHour <= parentEndHour;
}
