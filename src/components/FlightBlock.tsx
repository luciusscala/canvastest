import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { FlightBlock, FlightSegment } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';
import { useSnapping } from '../hooks/useSnapping';
import { FloatingLabel } from './FloatingLabel';

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

// Color mapping for different segment types
const SEGMENT_COLORS = {
  outbound: '#dc2626', // Red
  return: '#2563eb',   // Blue
  connecting: '#059669', // Green
};

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
      {/* Show floating label only if this flight is the PARENT in the relationship */}
      {shouldShowLabel && (
        <FloatingLabel
          relationship={currentRelationship}
          x={0}
          y={0}
          width={block.width}
        />
      )}
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

      {/* Individual label - only show if not part of a relationship or if this is a child */}
      {!isPartOfRelationship && (
        <>
          {/* Color-coded key above the block */}
          <Rect
            x={0}
            y={-80}
            width={block.width}
            height={70}
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
          
          {/* Flight title and dates */}
          <Text
            x={10}
            y={-70}
            text={`${block.title} - ${block.departureAirport} → ${block.arrivalAirport}`}
            fontSize={16}
            fontFamily="Inter, system-ui, sans-serif"
            fill="#1f2937"
            fontStyle="bold"
            listening={false}
          />
          
          {/* Flight dates */}
          {block.dateRange && (
            <Text
              x={10}
              y={-55}
              text={`${block.dateRange.start.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })} - ${block.dateRange.end.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}`}
              fontSize={14}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#6b7280"
              listening={false}
            />
          )}
          
          {/* Flight segments key */}
          {block.segments.map((segment, index) => {
            const keyX = 10 + (index * 200); // Space segments horizontally
            
            return (
              <Group key={`key-${segment.id}`}>
                {/* Color indicator */}
                <Rect
                  x={keyX}
                  y={-30}
                  width={12}
                  height={12}
                  fill={SEGMENT_COLORS[segment.type]}
                  cornerRadius={2}
                  listening={false}
                />
                
                {/* Flight info */}
                <Text
                  x={keyX + 18}
                  y={-28}
                  text={`${segment.flightNumber} (${segment.departure}→${segment.arrival}) - ${segment.duration}h`}
                  fontSize={12}
                  fontFamily="Inter, system-ui, sans-serif"
                  fill="#374151"
                  listening={false}
                />
                
                {/* Date info */}
                {segment.dateRange && (
                  <Text
                    x={keyX + 18}
                    y={-16}
                    text={`${segment.dateRange.start.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })} - ${segment.dateRange.end.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}`}
                    fontSize={10}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="#6b7280"
                    listening={false}
                  />
                )}
                
                {/* Type label */}
                <Text
                  x={keyX + 18}
                  y={-4}
                  text={segment.type.toUpperCase()}
                  fontSize={8}
                  fontFamily="Inter, system-ui, sans-serif"
                  fill="#9ca3af"
                  listening={false}
                />
              </Group>
            );
          })}
        </>
      )}
      
    </Group>
  );
}
