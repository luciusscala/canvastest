import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { HotelBlock } from '../types/index';
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

interface HotelBlockProps {
  block: HotelBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

// Color mapping for hotel events - will be updated dynamically
const getHotelEventColors = (colors: { primary: string; accent: string }) => ({
  checkin: colors.primary,
  checkout: colors.accent
});

export function HotelBlock({ block, onDragStart, onDragEnd }: HotelBlockProps) {
  const { selectBlock, updateBlock, blocks, getRelationshipsForBlock } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const groupRef = useRef<any>(null);

  const { tripTimeline } = useCanvasStore();
  
  const { snappingResult, handleDragMove, handleDragEnd: handleSnapDragEnd } = useSnapping(
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
  
  // Get colors for this block - always use individual hotel colors
  const colors = getBlockColors('hotel', false, null);

  const handleClick = (e: KonvaEvent) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
    console.log('HotelBlock clicked:', block.id);
    selectBlock(block.id);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart(); // Notify parent that we're dragging
  };

  const handleDragEnd = (e: KonvaEvent) => {
    setIsDragging(false);
    onDragEnd(); // Notify parent that we're done dragging
    
    // Use the simplified snapping logic
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

  const handleEventClick = (eventId: string, e: any) => {
    e.cancelBubble = true; // Prevent event bubbling
    setSelectedEventId(eventId);
    selectBlock(block.id);
  };

  // Calculate event position - check-in at start, check-out at end
  const getEventDimensions = (event: any) => {
    const contextWidth = block.width || 800;
    if (event.type === 'checkin') {
      return { x: 0, width: 20 }; // Check-in at the very start
    } else {
      return { x: contextWidth - 20, width: 20 }; // Check-out at the very end
    }
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

      {/* Hotel Events - check-in and check-out rectangles */}
      {block.events.map((event) => {
        const { x: eventX, width: eventWidth } = getEventDimensions(event);
        const isSelected = selectedEventId === event.id;
        const eventColors = getHotelEventColors(colors);
        
        return (
          <Group key={event.id}>
            {/* Event rectangle */}
            <Rect
              x={eventX}
              y={0}
              width={eventWidth}
              height={block.eventHeight}
              fill={eventColors[event.type]}
              stroke={isSelected ? '#fbbf24' : colors.text} // Yellow outline when selected, otherwise use text color
              strokeWidth={isSelected ? 3 : 1}
              cornerRadius={2}
              onClick={(e) => handleEventClick(event.id, e)}
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
