import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { CanvasBlock } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';

interface DraggableBlockProps {
  block: CanvasBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function DraggableBlock({ block, onDragStart, onDragEnd }: DraggableBlockProps) {
  const { selectBlock, updateBlock } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<any>(null);

  const handleClick = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
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
    </Group>
  );
}