import { useState, useRef } from 'react';
import { Group, Rect } from 'react-konva';
import type { FlightBlock, FlightSegment } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';
import { useSnapping } from '../hooks/useSnapping';
import { UnifiedLabel } from './UnifiedLabel';
import { getBlockColors } from '../utils/colors';

type KonvaEvent = {
  target: {
    x(): number;
    y(): number;
    x(value: number): void;
    y(value: number): void;
  };
  cancelBubble: boolean;
};

interface FlightBlockProps {
  block: FlightBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

// Color mapping for different segment types - will be updated dynamically
const getSegmentColors = (colors: { primary: string; accent: string; textSecondary: string }) => ({
  outbound: colors.primary,
  return: colors.accent,
  connecting: colors.textSecondary
});

export function FlightBlock({ block, onDragStart, onDragEnd }: FlightBlockProps) {
  const { selectBlock, updateBlock, getRelationshipsForBlock, blocks, tripTimeline } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const groupRef = useRef<any>(null);

  // Add snapping functionality
  const { handleDragMove, handleDragEnd: handleSnapDragEnd } = useSnapping(
    block,
    blocks,
    (snapResult) => {
      // Always update the block position, whether snapping or not
      const finalX = snapResult?.snapX ?? block.x;
      const finalY = snapResult?.snapY ?? block.y;
      
      updateBlock(block.id, {
        x: finalX,
        y: finalY,
      });
    },
    tripTimeline
  );

  // Get relationship for this block (optimized from store)
  const currentRelationship = getRelationshipsForBlock(block.id);
  const isPartOfRelationship = currentRelationship !== null;
  
  // Only show label if this block is the PARENT in the relationship (not a child)
  const shouldShowLabel = currentRelationship && currentRelationship.parent.id === block.id;
  
  // Get colors for this block
  const isGrouped = Boolean(currentRelationship && currentRelationship.parent.id === block.id);
  const colors = getBlockColors('flight', isGrouped, currentRelationship?.relationshipType);

  const handleClick = (e: KonvaEvent) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
    console.log('FlightBlock clicked:', block.id);
    selectBlock(block.id);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart(); // Notify parent that we're dragging
  };

  const handleDragEnd = (e: KonvaEvent) => {
    setIsDragging(false);
    onDragEnd(); // Notify parent that we're done dragging
    
    // Use the snapping logic
    handleSnapDragEnd(e);
    
    // Always update the store with the final position to ensure relationships are recalculated
    const finalX = e.target.x();
    const finalY = e.target.y();
    updateBlock(block.id, {
      x: finalX,
      y: finalY,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSegmentClick = (segmentId: string, e: KonvaEvent) => {
    e.cancelBubble = true; // Prevent event bubbling
    setSelectedSegmentId(segmentId);
    selectBlock(block.id);
  };

  // Calculate segment position and width based on startTime and duration
  const getSegmentDimensions = (segment: FlightSegment) => {
    // Ensure we use the block's width consistently
    const contextWidth = block.width || 800;
    const segmentX = (segment.startTime / block.totalHours) * contextWidth;
    const segmentWidth = (segment.duration / block.totalHours) * contextWidth;
    return { x: segmentX, width: segmentWidth };
  };

  return (
    <Group
      ref={groupRef}
      x={block.x}
      y={block.y}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Show unified label - either grouped or individual */}
      <UnifiedLabel
        block={block}
        relationship={currentRelationship}
        x={0}
        y={0}
        width={block.width}
      />
      {/* Context Bar - horizontal rectangle */}
      <Rect
        x={0}
        y={0}
        width={block.width}
        height={block.contextBarHeight}
        fill="#f3f4f6" // Light gray
        stroke={isHovered ? '#3b82f6' : '#d1d5db'}
        strokeWidth={isHovered ? 2 : 1}
        cornerRadius={4}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={isHovered ? 6 : 3}
        shadowOffset={{ x: 0, y: 2 }}
        shadowOpacity={1}
        // Remove scaling effects that might cause width changes
        opacity={isDragging ? 0.9 : 1}
      />

      {/* Flight Segments - vertical rectangles protruding downward */}
      {block.segments.map((segment) => {
        const { x: segmentX, width: segmentWidth } = getSegmentDimensions(segment);
        const isSelected = selectedSegmentId === segment.id;
        const segmentColors = getSegmentColors(colors);
        
        return (
          <Group key={segment.id}>
            {/* Segment rectangle */}
            <Rect
              x={segmentX}
              y={0}
              width={segmentWidth}
              height={block.segmentHeight}
              fill={segmentColors[segment.type]}
              stroke={isSelected ? '#fbbf24' : colors.text} // Yellow outline when selected, otherwise use text color
              strokeWidth={isSelected ? 3 : 1}
              cornerRadius={2}
              onClick={(e) => handleSegmentClick(segment.id, e)}
              shadowColor="rgba(0, 0, 0, 0.2)"
              shadowBlur={4}
              shadowOffset={{ x: 0, y: 1 }}
              shadowOpacity={1}
            />
            
            
          </Group>
        );
      })}

      
    </Group>
  );
}
