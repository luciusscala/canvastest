import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { HotelBlock } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';

interface HotelBlockProps {
  block: HotelBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

// Color mapping for hotel events
const HOTEL_COLORS = {
  checkin: '#059669', // Green
  checkout: '#dc2626', // Red
};

export function HotelBlock({ block, onDragStart, onDragEnd }: HotelBlockProps) {
  const { selectBlock, updateBlock } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const groupRef = useRef<any>(null);

  const handleClick = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
    console.log('HotelBlock clicked:', block.id);
    selectBlock(block.id);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart(); // Notify parent that we're dragging
  };

  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    onDragEnd(); // Notify parent that we're done dragging
    
    // Get the final position
    const finalX = e.target.x();
    const finalY = e.target.y();
    
    // Snap to grid
    const snappedX = Math.round(finalX / 20) * 20;
    const snappedY = Math.round(finalY / 20) * 20;
    
    // Update block position in store
    updateBlock(block.id, {
      x: snappedX,
      y: snappedY,
    });
    
    // Reset position to snapped coordinates
    e.target.x(snappedX);
    e.target.y(snappedY);
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
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
        
        return (
          <Group key={event.id}>
            {/* Event rectangle */}
            <Rect
              x={eventX}
              y={0}
              width={eventWidth}
              height={block.eventHeight}
              fill={HOTEL_COLORS[event.type]}
              stroke={isSelected ? '#fbbf24' : '#ffffff'} // Yellow outline when selected
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

      {/* Color-coded key above the block */}
      <Rect
        x={0}
        y={-60}
        width={block.width}
        height={50}
        fill="#ffffff"
        stroke="#e5e7eb"
        strokeWidth={1}
        cornerRadius={6}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={4}
        shadowOffset={{ x: 0, y: 2 }}
        shadowOpacity={1}
        listening={false}
      />
      
      {/* Hotel events key */}
      {block.events.map((event, index) => {
        const keyX = 10 + (index * 200); // Space events horizontally
        
        return (
          <Group key={`key-${event.id}`}>
            {/* Color indicator */}
            <Rect
              x={keyX}
              y={-50}
              width={12}
              height={12}
              fill={HOTEL_COLORS[event.type]}
              cornerRadius={2}
              listening={false}
            />
            
            {/* Event info */}
            <Text
              x={keyX + 18}
              y={-48}
              text={`${event.type.toUpperCase()} - ${event.date}`}
              fontSize={10}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#374151"
              listening={false}
            />
            
            {/* Hotel name */}
            <Text
              x={keyX + 18}
              y={-36}
              text={event.hotelName}
              fontSize={8}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#6b7280"
              listening={false}
            />
          </Group>
        );
      })}
    </Group>
  );
}
