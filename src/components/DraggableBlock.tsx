import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { Group as KonvaGroup } from 'konva/lib/Group';
import type { CanvasBlock } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';
import { useSnapping } from '../hooks/useSnapping';
import { SnappingIndicator } from './SnappingIndicator';

type KonvaEvent = {
  target: {
    x(): number;
    y(): number;
    x(value: number): void;
    y(value: number): void;
  };
  cancelBubble: boolean;
};


interface DraggableBlockProps {
  block: CanvasBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function DraggableBlock({ block, onDragStart, onDragEnd }: DraggableBlockProps) {
  const { selectBlock, updateBlock, blocks } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<KonvaGroup>(null);

  const { snappingResult, handleDragMove, handleDragEnd: handleSnapDragEnd } = useSnapping(
    block,
    blocks,
    (snapResult) => {
      // Handle snap result if needed
      if (snapResult?.shouldSnap) {
        // Update block position
        updateBlock(block.id, {
          x: snapResult.snapX,
          y: snapResult.snapY,
        });
      }
    }
  );

  const handleClick = (e: KonvaEvent) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
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
      {/* Block background */}
      <Rect
        width={block.width}
        height={block.height}
        fill={block.color || '#ffffff'}
        stroke={isHovered ? '#3b82f6' : '#e2e8f0'}
        strokeWidth={isHovered ? 2 : 1}
        cornerRadius={6}
        shadowColor="rgba(0, 0, 0, 0.08)"
        shadowBlur={isHovered ? 8 : 4}
        shadowOffset={{ x: 0, y: 2 }}
        shadowOpacity={1}
        scaleX={isDragging ? 1.02 : 1}
        scaleY={isDragging ? 1.02 : 1}
        opacity={isDragging ? 0.9 : 1}
      />
      
      {/* Block text */}
      <Text
        x={12}
        y={block.height / 2 - 7}
        width={block.width - 24}
        height={14}
        text={block.title}
        fontSize={13}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#1f2937"
        align="center"
        verticalAlign="middle"
        wrap="none"
        ellipsis={true}
      />
      
      {/* Snapping indicator */}
      {snappingResult && (
        <SnappingIndicator
          snappingResult={snappingResult}
          blockWidth={block.width}
          blockHeight={block.height}
        />
      )}
    </Group>
  );
}