import { useState, useCallback } from 'react';
import { findSnapTarget, validatePlacement } from '../utils/simpleSnapping';
import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock, TripTimeline } from '../types/index';

type SnappingResult = {
  shouldSnap: boolean;
  snapX: number;
  snapY: number;
  parentId?: string;
  snapType: 'none' | 'flight' | 'hotel' | 'activity';
};

export function useSnapping(
  block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock,
  allBlocks: (CanvasBlock | FlightBlock | HotelBlock | ActivityBlock)[],
  onDragEnd: (snapResult: SnappingResult | null) => void,
  tripTimeline?: TripTimeline | null
) {
  const [snappingResult, setSnappingResult] = useState<SnappingResult | null>(null);

  const handleDragMove = useCallback((e: any) => {
    const newX = e.target.x();
    const newY = e.target.y();
    
    // Only try to snap if we have a trip timeline
    if (tripTimeline) {
      const snapResult = findSnapTarget(block, allBlocks, newX, newY, tripTimeline);
      setSnappingResult(snapResult);
    } else {
      setSnappingResult(null);
    }
  }, [block, allBlocks, tripTimeline]);

  const handleDragEnd = useCallback((e: any) => {
    const finalX = e.target.x();
    const finalY = e.target.y();
    
    let snappedX = finalX;
    let snappedY = finalY;
    
    // Check if we should snap to a parent
    if (snappingResult?.shouldSnap) {
      snappedX = snappingResult.snapX;
      snappedY = snappingResult.snapY;
    } else if (tripTimeline) {
      // Validate placement for blocks with time data
      const validation = validatePlacement(block, finalX, finalY, allBlocks, tripTimeline);
      
      if (!validation.isValid) {
        // Revert to correct position for time-based blocks
        if (block.startHour !== undefined && block.durationHours !== undefined) {
          const correctPosition = {
            x: block.startHour * tripTimeline.scale,
            y: finalY
          };
          snappedX = correctPosition.x;
          snappedY = correctPosition.y;
        }
      }
    } else {
      // Snap to grid for blocks without time data
      snappedX = Math.round(finalX / 20) * 20;
      snappedY = Math.round(finalY / 20) * 20;
    }
    
    // Reset position to snapped coordinates
    e.target.x(snappedX);
    e.target.y(snappedY);
    
    // Notify parent of snap result
    onDragEnd(snappingResult);
    
    // Clear snapping result
    setSnappingResult(null);
  }, [snappingResult, onDragEnd, block, allBlocks, tripTimeline]);

  return {
    snappingResult,
    handleDragMove,
    handleDragEnd
  };
}
