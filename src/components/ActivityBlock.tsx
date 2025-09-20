import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { ActivityBlock } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';
import { useSnapping } from '../hooks/useSnapping';

type KonvaEvent = {
  target: {
    x(): number;
    y(): number;
    x(value: number): void;
    y(value: number): void;
  };
  cancelBubble: boolean;
};

interface ActivityBlockProps {
  block: ActivityBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function ActivityBlock({ block, onDragStart, onDragEnd }: ActivityBlockProps) {
  const { selectBlock, updateBlock, blocks } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<any>(null);

  const { tripTimeline } = useCanvasStore();
  
  const { snappingResult, handleDragMove, handleDragEnd: handleSnapDragEnd } = useSnapping(
    block,
    blocks,
    (snapResult) => {
      if (snapResult?.shouldSnap) {
        updateBlock(block.id, {
          x: snapResult.snapX,
          y: snapResult.snapY,
        });
      }
    },
    tripTimeline
  );

  const handleClick = (e: KonvaEvent) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
    console.log('ActivityBlock clicked:', block.id);
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
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
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
      {/* Activity rectangle - scaled proportionally to duration */}
      <Rect
        x={0}
        y={0}
        width={block.width}
        height={block.height}
        fill={block.color}
        stroke={isHovered ? '#3b82f6' : '#d1d5db'}
        strokeWidth={isHovered ? 2 : 1}
        cornerRadius={6}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={isHovered ? 6 : 3}
        shadowOffset={{ x: 0, y: 2 }}
        shadowOpacity={1}
        opacity={isDragging ? 0.9 : 1}
      />

      {/* Activity name */}
      <Text
        x={8}
        y={8}
        text={block.title}
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#374151"
        width={block.width - 16}
        align="left"
        listening={false}
      />
      
      {/* Activity date */}
      {block.dateRange && (
        <Text
          x={8}
          y={24}
          text={block.dateRange.start.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
          fontSize={10}
          fontFamily="Inter, system-ui, sans-serif"
          fill="#6b7280"
          width={block.width - 16}
          align="left"
          listening={false}
        />
      )}
      
      {/* Duration */}
      <Text
        x={8}
        y={block.height - 20}
        text={`${block.duration}h`}
        fontSize={10}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#6b7280"
        width={block.width - 16}
        align="left"
        listening={false}
      />
      
    </Group>
  );
}
