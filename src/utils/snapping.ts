import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock } from '../types/index';

export interface SnappingResult {
  shouldSnap: boolean;
  snapX: number;
  snapY: number;
  parentId?: string;
  snapType: 'none' | 'flight' | 'hotel' | 'activity';
}

// Check if a block can be snapped into a parent context
export function canSnapToParent(
  draggedBlock: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock,
  parentBlock: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock
): boolean {
  // Flight blocks can contain hotels and activities
  if (parentBlock.type === 'flight') {
    return draggedBlock.type === 'hotel' || draggedBlock.type === 'activity';
  }
  
  // Hotel blocks can contain activities
  if (parentBlock.type === 'hotel') {
    return draggedBlock.type === 'activity';
  }
  
  // Regular blocks can contain any type
  if (!('type' in parentBlock)) {
    return true;
  }
  
  return false;
}

// Simplified positioning lookup table
const getSnapPosition = (
  parentType: string,
  childType: string,
  parentBlock: any,
  draggedX: number,
  parentLeft: number,
  parentRight: number,
  draggedBlockWidth: number
) => {
  const snapOffsets: Record<string, (parent: any) => number> = {
    'flight-hotel': (parent) => parent.contextBarHeight + 10,
    'hotel-activity': (parent) => parent.contextBarHeight + 10,
    'flight-activity': (parent) => parent.contextBarHeight + parent.segmentHeight + 10
  };

  const key = `${parentType}-${childType}`;
  const offset = snapOffsets[key]?.(parentBlock) || 0;
  
  return {
    snapY: parentBlock.y + offset,
    snapX: Math.max(parentLeft, Math.min(draggedX, parentRight - draggedBlockWidth))
  };
};

// Calculate if a block should snap to a parent context
export function calculateSnapping(
  draggedBlock: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock,
  parentBlock: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock,
  draggedX: number,
  draggedY: number,
  snapThreshold: number = 50
): SnappingResult {
  if (!canSnapToParent(draggedBlock, parentBlock)) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none'
    };
  }

  // Calculate parent bounds
  const parentLeft = parentBlock.x;
  const parentRight = parentBlock.x + parentBlock.width;
  const parentTop = parentBlock.y;
  const parentBottom = parentBlock.y + parentBlock.height;

  // Calculate dragged block bounds
  const draggedLeft = draggedX;
  const draggedRight = draggedX + draggedBlock.width;
  const draggedTop = draggedY;
  const draggedBottom = draggedY + draggedBlock.height;

  // Check if dragged block is within parent bounds (with threshold)
  const withinHorizontalBounds = 
    draggedLeft >= parentLeft - snapThreshold && 
    draggedRight <= parentRight + snapThreshold;
  
  const withinVerticalBounds = 
    draggedTop >= parentTop - snapThreshold && 
    draggedBottom <= parentBottom + snapThreshold;

  if (withinHorizontalBounds && withinVerticalBounds) {
    // Use simplified positioning logic
    const { snapX, snapY } = getSnapPosition(
      parentBlock.type || 'regular',
      draggedBlock.type || 'regular',
      parentBlock,
      draggedX,
      parentLeft,
      parentRight,
      draggedBlock.width
    );

    return {
      shouldSnap: true,
      snapX,
      snapY,
      parentId: parentBlock.id,
      snapType: draggedBlock.type as 'hotel' | 'activity'
    };
  }

  return {
    shouldSnap: false,
    snapX: draggedX,
    snapY: draggedY,
    snapType: 'none'
  };
}

// Find the best snapping target from all available blocks
export function findBestSnapTarget(
  draggedBlock: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock,
  allBlocks: (CanvasBlock | FlightBlock | HotelBlock | ActivityBlock)[],
  draggedX: number,
  draggedY: number,
  snapThreshold: number = 50
): SnappingResult {
  let bestSnap: SnappingResult = {
    shouldSnap: false,
    snapX: draggedX,
    snapY: draggedY,
    snapType: 'none'
  };

  let closestDistance = Infinity;

  for (const block of allBlocks) {
    if (block.id === draggedBlock.id) continue; // Don't snap to self

    const snapResult = calculateSnapping(draggedBlock, block, draggedX, draggedY, snapThreshold);
    
    if (snapResult.shouldSnap) {
      // Calculate distance to snap point
      const distance = Math.sqrt(
        Math.pow(snapResult.snapX - draggedX, 2) + 
        Math.pow(snapResult.snapY - draggedY, 2)
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        bestSnap = snapResult;
      }
    }
  }

  return bestSnap;
}
