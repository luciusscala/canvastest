import type { 
  CanvasBlock, 
  FlightBlock, 
  HotelBlock, 
  ActivityBlock, 
  TripTimeline
} from '../types/index';
import { calculateBlockPosition } from './timeUtils';

type AnyBlock = CanvasBlock | FlightBlock | HotelBlock | ActivityBlock;

export interface SimpleSnapResult {
  shouldSnap: boolean;
  snapX: number;
  snapY: number;
  parentId?: string;
  snapType: 'none' | 'flight' | 'hotel' | 'activity';
}

// Check if a block can be snapped into a parent context
export function canSnapToParent(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock
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

// Check if dragged block is over a parent block
export function isOverParent(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock,
  draggedX: number,
  draggedY: number
): boolean {
  const parentLeft = parentBlock.x;
  const parentRight = parentBlock.x + parentBlock.width;
  const parentTop = parentBlock.y;
  const parentBottom = parentBlock.y + parentBlock.height;
  
  const draggedLeft = draggedX;
  const draggedRight = draggedX + draggedBlock.width;
  const draggedTop = draggedY;
  const draggedBottom = draggedY + draggedBlock.height;
  
  // Check if dragged block overlaps with parent block
  return !(draggedRight < parentLeft || 
           draggedLeft > parentRight || 
           draggedBottom < parentTop || 
           draggedTop > parentBottom);
}

// Calculate snap position within parent based on time constraints
export function calculateSnapPosition(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock,
  draggedX: number,
  draggedY: number,
  tripTimeline: TripTimeline
): SimpleSnapResult {
  // Check if blocks have time data
  if (!draggedBlock.startHour || !draggedBlock.durationHours ||
      !parentBlock.startHour || !parentBlock.durationHours) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none'
    };
  }
  
  // Check if child can fit within parent's time range
  const childStartHour = draggedBlock.startHour;
  const childEndHour = childStartHour + draggedBlock.durationHours;
  const parentStartHour = parentBlock.startHour;
  const parentEndHour = parentStartHour + parentBlock.durationHours;
  
  // Child must be completely within parent's time range
  if (childStartHour < parentStartHour || childEndHour > parentEndHour) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none'
    };
  }
  
  // Calculate position within parent
  const relativeStartHour = childStartHour - parentStartHour;
  const parentWidth = parentBlock.width;
  const parentDurationHours = parentBlock.durationHours;
  
  // Calculate X position within parent
  const snapX = parentBlock.x + (relativeStartHour / parentDurationHours) * parentWidth;
  
  // Calculate Y position based on block type hierarchy
  const snapY = calculateVerticalSnapPosition(
    draggedBlock.type || 'regular',
    parentBlock,
    draggedY
  );
  
  return {
    shouldSnap: true,
    snapX,
    snapY,
    parentId: parentBlock.id,
    snapType: draggedBlock.type as 'hotel' | 'activity'
  };
}

// Calculate vertical snap position based on block hierarchy
function calculateVerticalSnapPosition(
  childType: string,
  parentBlock: AnyBlock,
  draggedY: number
): number {
  const snapOffsets: Record<string, (parent: any) => number> = {
    'hotel': (parent) => parent.contextBarHeight + 10,
    'activity': (parent) => {
      if (parent.type === 'hotel') {
        return parent.contextBarHeight + 10;
      } else if (parent.type === 'flight') {
        return parent.contextBarHeight + parent.segmentHeight + 10;
      }
      return parent.contextBarHeight + 10;
    }
  };
  
  const offset = snapOffsets[childType]?.(parentBlock) || 0;
  return parentBlock.y + offset;
}

// Find the best snapping target when dragging over other blocks
export function findSnapTarget(
  draggedBlock: AnyBlock,
  allBlocks: AnyBlock[],
  draggedX: number,
  draggedY: number,
  tripTimeline: TripTimeline
): SimpleSnapResult {
  // Only look for parent blocks to snap to
  for (const block of allBlocks) {
    if (block.id === draggedBlock.id) continue;
    
    // Check if we can snap to this block
    if (!canSnapToParent(draggedBlock, block)) continue;
    
    // Check if we're over this block
    if (!isOverParent(draggedBlock, block, draggedX, draggedY)) continue;
    
    // Calculate snap position
    const snapResult = calculateSnapPosition(draggedBlock, block, draggedX, draggedY, tripTimeline);
    
    if (snapResult.shouldSnap) {
      return snapResult;
    }
  }
  
  // No valid snap target found
  return {
    shouldSnap: false,
    snapX: draggedX,
    snapY: draggedY,
    snapType: 'none'
  };
}

// Validate that a block can be placed at a specific position
export function validatePlacement(
  draggedBlock: AnyBlock,
  targetX: number,
  targetY: number,
  allBlocks: AnyBlock[],
  tripTimeline: TripTimeline
): { isValid: boolean; message?: string } {
  // For blocks with time data, check if they're at their correct time position
  if (draggedBlock.startHour !== undefined && draggedBlock.durationHours !== undefined) {
    const correctPosition = calculateBlockPosition(
      draggedBlock.startHour,
      draggedBlock.durationHours,
      tripTimeline.scale
    );
    
    const snapThreshold = 50;
    
    if (Math.abs(targetX - correctPosition.x) > snapThreshold) {
      return {
        isValid: false,
        message: 'Block must be placed at its correct time position'
      };
    }
  }
  
  // Check for conflicts with other blocks
  for (const block of allBlocks) {
    if (block.id === draggedBlock.id) continue;
    
    // Check for time conflicts
    if (draggedBlock.startHour !== undefined && draggedBlock.durationHours !== undefined &&
        block.startHour !== undefined && block.durationHours !== undefined) {
      
      const draggedStart = draggedBlock.startHour;
      const draggedEnd = draggedStart + draggedBlock.durationHours;
      const blockStart = block.startHour;
      const blockEnd = blockStart + block.durationHours;
      
      // Check for overlap
      if (!(draggedEnd <= blockStart || blockEnd <= draggedStart)) {
        return {
          isValid: false,
          message: `Time conflict with ${block.type} block`
        };
      }
    }
  }
  
  return { isValid: true };
}
