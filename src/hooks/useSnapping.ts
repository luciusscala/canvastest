import { useState, useCallback } from 'react';
import { findBestSnapTarget } from '../utils/snapping';
import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock } from '../types/index';

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
  onDragEnd: (snapResult: SnappingResult | null) => void
) {
  const [snappingResult, setSnappingResult] = useState<SnappingResult | null>(null);

  const handleDragMove = useCallback((e: any) => {
    const newX = e.target.x();
    const newY = e.target.y();
    
    // Check for snapping opportunities
    const snapResult = findBestSnapTarget(block, allBlocks, newX, newY, 50);
    setSnappingResult(snapResult);
  }, [block, allBlocks]);

  const handleDragEnd = useCallback((e: any) => {
    const finalX = e.target.x();
    const finalY = e.target.y();
    
    let snappedX = finalX;
    let snappedY = finalY;
    
    // Check if we should snap to a parent
    if (snappingResult?.shouldSnap) {
      snappedX = snappingResult.snapX;
      snappedY = snappingResult.snapY;
    } else {
      // Snap to grid
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
  }, [snappingResult, onDragEnd]);

  return {
    snappingResult,
    handleDragMove,
    handleDragEnd
  };
}
