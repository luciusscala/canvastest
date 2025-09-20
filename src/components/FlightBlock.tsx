import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { FlightBlock, FlightSegment } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';

interface FlightBlockProps {
  block: FlightBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

// Color mapping for different segment types
const SEGMENT_COLORS = {
  outbound: '#dc2626', // Red
  return: '#2563eb',   // Blue
  connecting: '#059669', // Green
};

export function FlightBlock({ block, onDragStart, onDragEnd }: FlightBlockProps) {
  const { selectBlock, updateBlock } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const groupRef = useRef<any>(null);

  const handleClick = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
    console.log('FlightBlock clicked:', block.id);
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

  const handleSegmentClick = (segmentId: string, e: any) => {
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

      {/* Flight Segments - vertical rectangles protruding downward */}
      {block.segments.map((segment) => {
        const { x: segmentX, width: segmentWidth } = getSegmentDimensions(segment);
        const isSelected = selectedSegmentId === segment.id;
        
        return (
          <Group key={segment.id}>
            {/* Segment rectangle */}
            <Rect
              x={segmentX}
              y={0}
              width={segmentWidth}
              height={block.segmentHeight}
              fill={SEGMENT_COLORS[segment.type]}
              stroke={isSelected ? '#fbbf24' : '#ffffff'} // Yellow outline when selected
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
      
      {/* Flight segments key */}
      {block.segments.map((segment, index) => {
        const keyX = 10 + (index * 200); // Space segments horizontally
        const { x: segmentX, width: segmentWidth } = getSegmentDimensions(segment);
        
        return (
          <Group key={`key-${segment.id}`}>
            {/* Color indicator */}
            <Rect
              x={keyX}
              y={-50}
              width={12}
              height={12}
              fill={SEGMENT_COLORS[segment.type]}
              cornerRadius={2}
              listening={false}
            />
            
            {/* Flight info */}
            <Text
              x={keyX + 18}
              y={-48}
              text={`${segment.flightNumber} (${segment.departure}→${segment.arrival}) - ${segment.duration}h`}
              fontSize={14}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#374151"
              listening={false}
            />
            
            {/* Type label */}
            <Text
              x={keyX + 18}
              y={-36}
              text={segment.type.toUpperCase()}
              fontSize={12}
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
