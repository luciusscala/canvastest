import React, { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { CanvasBlock } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';

interface DraggableBlockProps {
  block: CanvasBlock;
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  const { selectBlock, updateBlock } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<any>(null);

  const handleClick = () => {
    selectBlock(block.id);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    
    // Snap to grid
    const snappedX = Math.round(e.target.x() / 20) * 20;
    const snappedY = Math.round(e.target.y() / 20) * 20;
    
    // Update block position
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
        stroke={isHovered ? '#60a5fa' : '#d1d5db'}
        strokeWidth={2}
        cornerRadius={8}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={isHovered ? 10 : 5}
        shadowOffset={{ x: 0, y: 2 }}
        shadowOpacity={1}
        scaleX={isDragging ? 1.05 : 1}
        scaleY={isDragging ? 1.05 : 1}
        opacity={isDragging ? 0.8 : 1}
      />
      
      {/* Block text */}
      <Text
        x={12}
        y={block.height / 2 - 8}
        width={block.width - 24}
        height={16}
        text={block.title}
        fontSize={14}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#374151"
        align="center"
        verticalAlign="middle"
        wrap="none"
        ellipsis={true}
      />
    </Group>
  );
}