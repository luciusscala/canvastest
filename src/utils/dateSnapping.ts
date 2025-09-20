import type { 
  CanvasBlock, 
  FlightBlock, 
  HotelBlock, 
  ActivityBlock, 
  DateSnappingResult,
  TripTimeline,
  BlockPosition
} from '../types/index';
import { 
  calculateBlockPosition,
  positionToTime,
  canBlockFitWithin,
  calculateSnapPosition
} from './timeUtils';
import { 
  validateBlockPlacement,
  validateSnapToParent
} from './conflictDetection';

type AnyBlock = CanvasBlock | FlightBlock | HotelBlock | ActivityBlock;

// Check if a block can be snapped into a parent context (enhanced with date validation)
export function canSnapToParentWithDates(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock
): boolean {
  // Basic type compatibility check
  if (parentBlock.type === 'flight') {
    return draggedBlock.type === 'hotel' || draggedBlock.type === 'activity';
  }
  
  if (parentBlock.type === 'hotel') {
    return draggedBlock.type === 'activity';
  }
  
  if (!('type' in parentBlock)) {
    return true;
  }
  
  return false;
}

// Calculate date-based snapping with conflict validation
export function calculateDateSnapping(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock,
  draggedX: number,
  draggedY: number,
  tripTimeline: TripTimeline,
  snapThreshold: number = 50
): DateSnappingResult {
  // Check basic compatibility
  if (!canSnapToParentWithDates(draggedBlock, parentBlock)) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none',
      validation: {
        isValid: false,
        conflicts: [{
          type: 'logical',
          message: `${draggedBlock.type} cannot be placed within ${parentBlock.type}`,
          conflictingBlockId: parentBlock.id,
          severity: 'error'
        }],
        canSnap: false
      }
    };
  }

  // Check if blocks have required time data
  if (!draggedBlock.startHour || !draggedBlock.durationHours || 
      !parentBlock.startHour || !parentBlock.durationHours) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none',
      validation: {
        isValid: false,
        conflicts: [{
          type: 'logical',
          message: 'Missing time data for snapping',
          conflictingBlockId: draggedBlock.id,
          severity: 'error'
        }],
        canSnap: false
      }
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
  
  if (!withinHorizontalBounds || !withinVerticalBounds) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none',
      validation: {
        isValid: true,
        conflicts: [],
        canSnap: false
      }
    };
  }
  
  // Calculate the time position within the parent block
  const parentStartHour = parentBlock.startHour;
  const parentDurationHours = parentBlock.durationHours;
  const parentStartX = parentBlock.x;
  const parentWidth = parentBlock.width;
  
  // Calculate relative position within parent (0 to 1)
  const relativeX = Math.max(0, Math.min((draggedX - parentStartX) / parentWidth, 1));
  
  // Calculate the child's start hour within the parent's time range
  const childStartHour = parentStartHour + (relativeX * parentDurationHours);
  const childDurationHours = Math.min(
    draggedBlock.durationHours,
    parentDurationHours - (childStartHour - parentStartHour)
  );
  
  // Ensure the child block fits within the parent
  if (childDurationHours <= 0) {
    return {
      shouldSnap: false,
      snapX: draggedX,
      snapY: draggedY,
      snapType: 'none',
      validation: {
        isValid: false,
        conflicts: [{
          type: 'logical',
          message: 'Block does not fit within parent time range',
          conflictingBlockId: parentBlock.id,
          severity: 'error'
        }],
        canSnap: false
      }
    };
  }
  
  // Calculate the actual snap position
  const snapPosition = calculateBlockPosition(
    childStartHour,
    childDurationHours,
    tripTimeline.scale
  );
  
  // Calculate Y position based on block type hierarchy
  const snapY = calculateVerticalSnapPosition(
    draggedBlock.type || 'regular',
    parentBlock,
    draggedY
  );
  
  // Create validation result
  const validation = {
    isValid: true,
    conflicts: [],
    canSnap: true,
    suggestedPosition: snapPosition
  };
  
  return {
    shouldSnap: true,
    snapX: snapPosition.x,
    snapY,
    parentId: parentBlock.id,
    snapType: draggedBlock.type as 'hotel' | 'activity',
    validation,
    calculatedPosition: snapPosition
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

// Find the best date-based snapping target
export function findBestDateSnapTarget(
  draggedBlock: AnyBlock,
  allBlocks: AnyBlock[],
  draggedX: number,
  draggedY: number,
  tripTimeline: TripTimeline,
  snapThreshold: number = 50
): DateSnappingResult {
  let bestSnap: DateSnappingResult = {
    shouldSnap: false,
    snapX: draggedX,
    snapY: draggedY,
    snapType: 'none',
    validation: {
      isValid: true,
      conflicts: [],
      canSnap: false
    }
  };
  
  let closestDistance = Infinity;
  
  for (const block of allBlocks) {
    if (block.id === draggedBlock.id) continue;
    
    const snapResult = calculateDateSnapping(
      draggedBlock, 
      block, 
      draggedX, 
      draggedY, 
      tripTimeline, 
      snapThreshold
    );
    
    if (snapResult.shouldSnap && snapResult.validation.canSnap) {
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

// Validate free-form placement (not snapping to parent)
export function validateFreePlacement(
  draggedBlock: AnyBlock,
  targetX: number,
  targetY: number,
  allBlocks: AnyBlock[],
  tripTimeline: TripTimeline
): DateSnappingResult {
  // For blocks with time data, only allow placement if they have valid time constraints
  if (draggedBlock.startHour !== undefined && draggedBlock.durationHours !== undefined) {
    // Calculate position based on time
    const position = calculateBlockPosition(
      draggedBlock.startHour,
      draggedBlock.durationHours,
      tripTimeline.scale
    );
    
    // Only allow placement at the calculated time-based position
    const timeBasedX = position.x;
    const snapThreshold = 50;
    
    if (Math.abs(targetX - timeBasedX) > snapThreshold) {
      return {
        shouldSnap: false,
        snapX: targetX,
        snapY: targetY,
        snapType: 'none',
        validation: {
          isValid: false,
          conflicts: [{
            type: 'logical',
            message: 'Block must be placed at its correct time position',
            conflictingBlockId: draggedBlock.id,
            severity: 'error'
          }],
          canSnap: false
        }
      };
    }
    
    return {
      shouldSnap: false,
      snapX: timeBasedX,
      snapY: targetY,
      snapType: 'none',
      validation: {
        isValid: true,
        conflicts: [],
        canSnap: true,
        suggestedPosition: position
      },
      calculatedPosition: position
    };
  }
  
  // For blocks without time data, allow free placement
  const targetPosition = { x: targetX, y: targetY };
  const validation = validateBlockPlacement(
    draggedBlock,
    targetPosition,
    allBlocks,
    tripTimeline
  );
  
  return {
    shouldSnap: false,
    snapX: targetX,
    snapY: targetY,
    snapType: 'none',
    validation,
    calculatedPosition: validation.suggestedPosition
  };
}

// Calculate proportional position within a parent block
export function calculateProportionalPosition(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock,
  draggedX: number,
  tripTimeline: TripTimeline
): BlockPosition {
  if (!parentBlock.startHour || !parentBlock.durationHours) {
    // Fallback to basic positioning
    return {
      startHour: positionToTime(draggedX, tripTimeline.scale),
      durationHours: draggedBlock.durationHours || 1,
      x: draggedX,
      width: (draggedBlock.durationHours || 1) * tripTimeline.scale
    };
  }
  
  // Calculate the relative position within the parent
  const parentStartX = parentBlock.x;
  const parentWidth = parentBlock.width;
  const relativeX = Math.max(0, Math.min(draggedX - parentStartX, parentWidth));
  
  // Convert to time within parent's range
  const relativeTimeRatio = relativeX / parentWidth;
  const parentStartHour = parentBlock.startHour;
  const parentDurationHours = parentBlock.durationHours;
  
  const childStartHour = parentStartHour + (relativeTimeRatio * parentDurationHours);
  const childDurationHours = Math.min(
    draggedBlock.durationHours || 1,
    parentDurationHours - (childStartHour - parentStartHour)
  );
  
  return calculateBlockPosition(
    childStartHour,
    childDurationHours,
    tripTimeline.scale
  );
}
