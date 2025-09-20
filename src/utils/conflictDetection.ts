import type { 
  CanvasBlock, 
  FlightBlock, 
  HotelBlock, 
  ActivityBlock, 
  Conflict, 
  SnappingValidation,
  BlockPosition,
  TripTimeline
} from '../types/index';
import { 
  hasTimeOverlap, 
  calculateOverlapDuration,
  canBlockFitWithin,
  calculateSnapPosition,
  validateBlockWithinTrip
} from './timeUtils';

type AnyBlock = CanvasBlock | FlightBlock | HotelBlock | ActivityBlock;

// Check for time conflicts between two blocks
export function detectTimeConflicts(
  block1: AnyBlock,
  block2: AnyBlock
): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Skip if blocks don't have time data
  if (!block1.startHour || !block1.durationHours || 
      !block2.startHour || !block2.durationHours) {
    return conflicts;
  }
  
  const range1 = {
    startHour: block1.startHour,
    durationHours: block1.durationHours
  };
  
  const range2 = {
    startHour: block2.startHour,
    durationHours: block2.durationHours
  };
  
  // Check for time overlap
  if (hasTimeOverlap(range1, range2)) {
    const overlapDuration = calculateOverlapDuration(range1, range2);
    
    conflicts.push({
      type: 'overlap',
      message: `Time conflict: ${formatOverlapMessage(block1, block2, overlapDuration)}`,
      conflictingBlockId: block2.id,
      severity: 'error'
    });
  }
  
  return conflicts;
}

// Check for logical conflicts (e.g., check-out before check-in)
export function detectLogicalConflicts(block: AnyBlock): Conflict[] {
  const conflicts: Conflict[] = [];
  
  if (block.type === 'hotel') {
    const hotelBlock = block as HotelBlock;
    const checkinEvent = hotelBlock.events.find(e => e.type === 'checkin');
    const checkoutEvent = hotelBlock.events.find(e => e.type === 'checkout');
    
    if (checkinEvent && checkoutEvent && 
        checkinEvent.startHour && checkoutEvent.startHour &&
        checkinEvent.startHour >= checkoutEvent.startHour) {
      conflicts.push({
        type: 'logical',
        message: 'Hotel check-out must be after check-in',
        conflictingBlockId: block.id,
        severity: 'error'
      });
    }
  }
  
  if (block.type === 'flight') {
    const flightBlock = block as FlightBlock;
    const outboundSegment = flightBlock.segments.find(s => s.type === 'outbound');
    const returnSegment = flightBlock.segments.find(s => s.type === 'return');
    
    if (outboundSegment && returnSegment &&
        outboundSegment.startHour && returnSegment.startHour &&
        outboundSegment.startHour >= returnSegment.startHour) {
      conflicts.push({
        type: 'logical',
        message: 'Return flight must be after outbound flight',
        conflictingBlockId: block.id,
        severity: 'error'
      });
    }
  }
  
  return conflicts;
}

// Check for resource conflicts (e.g., same hotel room, overlapping flights)
export function detectResourceConflicts(
  draggedBlock: AnyBlock,
  existingBlocks: AnyBlock[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  
  for (const existingBlock of existingBlocks) {
    if (existingBlock.id === draggedBlock.id) continue;
    
    // Check for hotel room conflicts
    if (draggedBlock.type === 'hotel' && existingBlock.type === 'hotel') {
      const draggedHotel = draggedBlock as HotelBlock;
      const existingHotel = existingBlock as HotelBlock;
      
      if (draggedHotel.hotelName === existingHotel.hotelName &&
          hasTimeOverlap(
            { startHour: draggedHotel.startHour, durationHours: draggedHotel.durationHours },
            { startHour: existingHotel.startHour, durationHours: existingHotel.durationHours }
          )) {
        conflicts.push({
          type: 'resource',
          message: `Same hotel (${draggedHotel.hotelName}) already booked for overlapping dates`,
          conflictingBlockId: existingBlock.id,
          severity: 'error'
        });
      }
    }
    
    // Check for flight conflicts (same flight number)
    if (draggedBlock.type === 'flight' && existingBlock.type === 'flight') {
      const draggedFlight = draggedBlock as FlightBlock;
      const existingFlight = existingBlock as FlightBlock;
      
      const hasCommonFlight = draggedFlight.segments.some(ds => 
        existingFlight.segments.some(es => 
          ds.flightNumber === es.flightNumber &&
          hasTimeOverlap(
            { startHour: ds.startHour || 0, durationHours: ds.durationHours || 0 },
            { startHour: es.startHour || 0, durationHours: es.durationHours || 0 }
          )
        )
      );
      
      if (hasCommonFlight) {
        conflicts.push({
          type: 'resource',
          message: 'Same flight already booked for overlapping time',
          conflictingBlockId: existingBlock.id,
          severity: 'error'
        });
      }
    }
  }
  
  return conflicts;
}

// Validate if a block can be placed at a specific position
export function validateBlockPlacement(
  draggedBlock: AnyBlock,
  targetPosition: { x: number; y: number },
  existingBlocks: AnyBlock[],
  tripTimeline: TripTimeline
): SnappingValidation {
  const conflicts: Conflict[] = [];
  
  // Convert position to time
  const startHour = targetPosition.x / tripTimeline.scale;
  const durationHours = draggedBlock.durationHours || 1;
  
  // Create a temporary block with the target position
  const tempBlock = {
    ...draggedBlock,
    startHour,
    durationHours
  };
  
  // Validate within trip timeline
  const tripValidation = validateBlockWithinTrip(tempBlock, tripTimeline);
  if (!tripValidation.isValid) {
    conflicts.push({
      type: 'logical',
      message: tripValidation.message || 'Invalid placement',
      conflictingBlockId: draggedBlock.id,
      severity: 'error'
    });
  }
  
  // Check for conflicts with existing blocks
  for (const existingBlock of existingBlocks) {
    if (existingBlock.id === draggedBlock.id) continue;
    
    conflicts.push(...detectTimeConflicts(tempBlock, existingBlock));
    conflicts.push(...detectResourceConflicts(tempBlock, [existingBlock]));
  }
  
  // Check for logical conflicts within the block itself
  conflicts.push(...detectLogicalConflicts(tempBlock));
  
  const hasErrors = conflicts.some(c => c.severity === 'error');
  const canSnap = !hasErrors;
  
  return {
    isValid: !hasErrors,
    conflicts,
    canSnap,
    suggestedPosition: canSnap ? {
      startHour,
      durationHours,
      x: targetPosition.x,
      width: durationHours * tripTimeline.scale
    } : undefined
  };
}

// Validate if a block can be snapped to a parent
export function validateSnapToParent(
  draggedBlock: AnyBlock,
  parentBlock: AnyBlock,
  tripTimeline: TripTimeline
): SnappingValidation {
  const conflicts: Conflict[] = [];
  
  // Check if blocks have time data
  if (!draggedBlock.startHour || !draggedBlock.durationHours ||
      !parentBlock.startHour || !parentBlock.durationHours) {
    return {
      isValid: false,
      conflicts: [{
        type: 'logical',
        message: 'Missing time data for validation',
        conflictingBlockId: draggedBlock.id,
        severity: 'error'
      }],
      canSnap: false
    };
  }
  
  // Check if child can fit within parent
  if (!canBlockFitWithin(
    { startHour: draggedBlock.startHour, durationHours: draggedBlock.durationHours },
    { startHour: parentBlock.startHour, durationHours: parentBlock.durationHours }
  )) {
    conflicts.push({
      type: 'logical',
      message: `${draggedBlock.type} cannot fit within ${parentBlock.type} time range`,
      conflictingBlockId: parentBlock.id,
      severity: 'error'
    });
  }
  
  // Check for time conflicts
  conflicts.push(...detectTimeConflicts(draggedBlock, parentBlock));
  
  // Check for resource conflicts
  conflicts.push(...detectResourceConflicts(draggedBlock, [parentBlock]));
  
  const hasErrors = conflicts.some(c => c.severity === 'error');
  const canSnap = !hasErrors;
  
  let suggestedPosition: BlockPosition | undefined;
  if (canSnap) {
    suggestedPosition = calculateSnapPosition(
      { startHour: draggedBlock.startHour, durationHours: draggedBlock.durationHours },
      { startHour: parentBlock.startHour, durationHours: parentBlock.durationHours },
      tripTimeline
    );
  }
  
  return {
    isValid: !hasErrors,
    conflicts,
    canSnap,
    suggestedPosition
  };
}

// Helper function to format overlap messages
function formatOverlapMessage(
  block1: AnyBlock, 
  block2: AnyBlock, 
  overlapDuration: number
): string {
  const duration = Math.round(overlapDuration * 10) / 10;
  return `${block1.type} overlaps with ${block2.type} by ${duration}h`;
}

// Get all conflicts for a specific block
export function getAllConflicts(
  block: AnyBlock,
  allBlocks: AnyBlock[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Check for logical conflicts within the block
  conflicts.push(...detectLogicalConflicts(block));
  
  // Check for conflicts with other blocks
  for (const otherBlock of allBlocks) {
    if (otherBlock.id === block.id) continue;
    
    conflicts.push(...detectTimeConflicts(block, otherBlock));
    conflicts.push(...detectResourceConflicts(block, [otherBlock]));
  }
  
  return conflicts;
}
