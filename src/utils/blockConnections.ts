import type { TravelBlock } from '../types/index';

export interface ConnectionPoint {
  id: string;
  blockId: string;
  type: 'start' | 'end';
  time: Date;
  x: number;
  y: number;
}

export interface BlockConnection {
  from: ConnectionPoint;
  to: ConnectionPoint;
  type: 'sequential' | 'overlapping' | 'conflicting';
}

// Calculate connection points for a block
export function getConnectionPoints(block: TravelBlock): ConnectionPoint[] {
  const startPoint: ConnectionPoint = {
    id: `${block.id}-start`,
    blockId: block.id,
    type: 'start',
    time: block.startTime,
    x: block.x,
    y: block.y + 20, // Center vertically on the block
  };

  const endPoint: ConnectionPoint = {
    id: `${block.id}-end`,
    blockId: block.id,
    type: 'end',
    time: block.endTime,
    x: block.x + getBlockWidth(block),
    y: block.y + 20,
  };

  return [startPoint, endPoint];
}

// Calculate block width based on duration
export function getBlockWidth(block: TravelBlock): number {
  const PIXELS_PER_DAY = 60; // Each day is 60 pixels wide
  const EVENT_BLOCK_WIDTH = 80; // Width of the thick event blocks
  
  if (block.type === 'activity') {
    return 80; // Activities are just single blocks
  }
  
  // For flights and hotels, total width includes two event blocks plus timeline
  return Math.max(160, block.duration * PIXELS_PER_DAY); // Minimum 160px width
}

// Check if two blocks can connect
export function canConnect(block1: TravelBlock, block2: TravelBlock): boolean {
  // Blocks can connect if:
  // 1. One ends when the other starts (sequential)
  // 2. They have overlapping times (parallel activities)
  // 3. They're the same type and can be chained
  
  const time1Start = block1.startTime.getTime();
  const time1End = block1.endTime.getTime();
  const time2Start = block2.startTime.getTime();
  const time2End = block2.endTime.getTime();

  // Sequential connection (one ends when other starts)
  const isSequential = time1End === time2Start || time2End === time1Start;
  
  // Overlapping connection (same time period, different types)
  const isOverlapping = time1Start < time2End && time2Start < time1End;
  
  // Same type chaining (flights, hotels, activities)
  const isSameType = block1.type === block2.type;

  return isSequential || (isOverlapping && !isSameType);
}

// Find nearby connection points
export function findNearbyConnectionPoints(
  draggedBlock: TravelBlock,
  allBlocks: TravelBlock[],
  threshold: number = 40
): ConnectionPoint[] {
  const draggedPoints = getConnectionPoints(draggedBlock);
  const nearbyPoints: ConnectionPoint[] = [];

  for (const block of allBlocks) {
    if (block.id === draggedBlock.id) continue;
    
    const blockPoints = getConnectionPoints(block);
    
    for (const draggedPoint of draggedPoints) {
      for (const blockPoint of blockPoints) {
        const distance = Math.sqrt(
          Math.pow(draggedPoint.x - blockPoint.x, 2) + 
          Math.pow(draggedPoint.y - blockPoint.y, 2)
        );
        
        if (distance <= threshold) {
          nearbyPoints.push({
            ...blockPoint,
            distance // Add distance for sorting
          } as ConnectionPoint & { distance: number });
        }
      }
    }
  }

  // Sort by distance to get the closest points first
  return nearbyPoints.sort((a, b) => (a as any).distance - (b as any).distance);
}

// Calculate snap position for a block
export function calculateSnapPosition(
  draggedBlock: TravelBlock,
  targetPoint: ConnectionPoint,
  snapType: 'start-to-end' | 'end-to-start' | 'start-to-start' | 'end-to-end'
): { x: number; y: number } {
  const blockWidth = getBlockWidth(draggedBlock);
  
  switch (snapType) {
    case 'start-to-end':
      return {
        x: targetPoint.x,
        y: targetPoint.y - 20
      };
    case 'end-to-start':
      return {
        x: targetPoint.x - blockWidth,
        y: targetPoint.y - 20
      };
    case 'start-to-start':
      return {
        x: targetPoint.x,
        y: targetPoint.y - 20
      };
    case 'end-to-end':
      return {
        x: targetPoint.x - blockWidth,
        y: targetPoint.y - 20
      };
    default:
      return { x: draggedBlock.x, y: draggedBlock.y };
  }
}
