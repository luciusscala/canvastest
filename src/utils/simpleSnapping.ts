import type { 
  CanvasBlock, 
  FlightBlock, 
  HotelBlock, 
  ActivityBlock
} from '../types/index';

type AnyBlock = CanvasBlock | FlightBlock | HotelBlock | ActivityBlock;

// Type guard to check if a block has contextBarHeight
function hasContextBarHeight(block: AnyBlock): block is FlightBlock | HotelBlock {
  return 'contextBarHeight' in block;
}

// Type guard to check if a block has segmentHeight
function hasSegmentHeight(block: AnyBlock): block is FlightBlock {
  return 'segmentHeight' in block;
}

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
  if ('type' in parentBlock && parentBlock.type === 'flight') {
    return ('type' in draggedBlock) && (draggedBlock.type === 'hotel' || draggedBlock.type === 'activity');
  }
  
  // Hotel blocks can contain activities
  if ('type' in parentBlock && parentBlock.type === 'hotel') {
    return ('type' in draggedBlock) && draggedBlock.type === 'activity';
  }
  
  // Regular blocks can contain any type
  if (!('type' in parentBlock)) {
    return true;
  }
  
  return false;
}

// Check for temporal conflicts when snapping
export function hasTemporalConflict(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock,
  allBlocks: AnyBlock[]
): boolean {
  if (!draggedBlock.dateRange || !parentBlock.dateRange) {
    return false; // No temporal data, no conflict
  }

  // Check if child fits within parent's time range
  const childStart = draggedBlock.dateRange.start;
  const childEnd = draggedBlock.dateRange.end;
  const parentStart = parentBlock.dateRange.start;
  const parentEnd = parentBlock.dateRange.end;
  
  // Child must be completely within parent's time range
  if (childStart < parentStart || childEnd > parentEnd) {
    return true; // Temporal conflict - child outside parent's range
  }

  // Check for conflicts with other children of the same parent
  const parentChildren = allBlocks.filter(block => 
    block.id !== draggedBlock.id && 
    block.id !== parentBlock.id &&
    // Check if this block is already a child of the parent
    // This would need to be tracked in the relationship system
    false // For now, skip this check
  );

  return false; // No conflicts found
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
  draggedY: number
): SimpleSnapResult {
  // Check if blocks have time data
  if (!draggedBlock.dateRange || !parentBlock.dateRange) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none'
    };
  }
  
  // Check if child can fit within parent's time range
  const childStart = draggedBlock.dateRange.start;
  const childEnd = draggedBlock.dateRange.end;
  const parentStart = parentBlock.dateRange.start;
  const parentEnd = parentBlock.dateRange.end;
  
  // Child must be completely within parent's time range
  if (childStart < parentStart || childEnd > parentEnd) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none'
    };
  }
  
  // Calculate position within parent based on actual dates
  const parentDuration = parentEnd.getTime() - parentStart.getTime();
  const childOffset = childStart.getTime() - parentStart.getTime();
  const relativePosition = childOffset / parentDuration;
  
  // Calculate X position within parent
  const snapX = parentBlock.x + (relativePosition * parentBlock.width);
  
  // Calculate Y position based on block type hierarchy
  const snapY = calculateVerticalSnapPosition(
    ('type' in draggedBlock) ? draggedBlock.type : 'regular',
    parentBlock
  );
  
  return {
    shouldSnap: true,
    snapX,
    snapY,
    parentId: parentBlock.id,
    snapType: (('type' in draggedBlock) ? draggedBlock.type : 'regular') as 'hotel' | 'activity'
  };
}

// Calculate vertical snap position based on block hierarchy
function calculateVerticalSnapPosition(
  childType: string,
  parentBlock: AnyBlock
): number {
  const snapOffsets: Record<string, (parent: AnyBlock) => number> = {
    'hotel': (parent) => hasContextBarHeight(parent) ? parent.contextBarHeight + 10 : 10,
    'activity': (parent) => {
      if ('type' in parent && parent.type === 'hotel') {
        return hasContextBarHeight(parent) ? parent.contextBarHeight + 10 : 10;
      } else if ('type' in parent && parent.type === 'flight') {
        return hasContextBarHeight(parent) && hasSegmentHeight(parent)
          ? parent.contextBarHeight + parent.segmentHeight + 10 
          : 10;
      }
      return hasContextBarHeight(parent) ? parent.contextBarHeight + 10 : 10;
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
  draggedY: number
): SimpleSnapResult {
  // Only look for parent blocks to snap to
  for (const block of allBlocks) {
    if (block.id === draggedBlock.id) continue;
    
    // Check if we can snap to this block
    if (!canSnapToParent(draggedBlock, block)) continue;
    
    // Check if we're over this block
    if (!isOverParent(draggedBlock, block, draggedX, draggedY)) continue;
    
    // Check for temporal conflicts
    if (hasTemporalConflict(draggedBlock, block, allBlocks)) {
      continue; // Skip this parent due to temporal conflict
    }
    
    // Calculate snap position
    const snapResult = calculateSnapPosition(draggedBlock, block, draggedX, draggedY);
    
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
  allBlocks: AnyBlock[]
): { isValid: boolean; message?: string } {
  // Only check for actual spatial conflicts, not time-based positioning
  // For free movement, blocks can be placed anywhere unless there are real conflicts
  
  // Check for spatial overlaps with other blocks
  for (const block of allBlocks) {
    if (block.id === draggedBlock.id) continue;
    
    // Check if blocks overlap spatially
    const draggedLeft = targetX;
    const draggedRight = targetX + draggedBlock.width;
    const draggedTop = targetY;
    const draggedBottom = targetY + draggedBlock.height;
    
    const blockLeft = block.x;
    const blockRight = block.x + block.width;
    const blockTop = block.y;
    const blockBottom = block.y + block.height;
    
    // Check for spatial overlap
    if (!(draggedRight <= blockLeft || 
          draggedLeft >= blockRight || 
          draggedBottom <= blockTop || 
          draggedTop >= blockBottom)) {
      return {
        isValid: false,
        message: `Spatial conflict with ${('type' in block) ? block.type : 'regular'} block`
      };
    }
  }
  
  return { isValid: true };
}
