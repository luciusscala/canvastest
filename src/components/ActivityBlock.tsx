import { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { ActivityBlock } from '../types/index';
import { useCanvasStore } from '../store/useCanvasStore';

interface ActivityBlockProps {
  block: ActivityBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function ActivityBlock({ block, onDragStart, onDragEnd }: ActivityBlockProps) {
  const { selectBlock, updateBlock } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<any>(null);

  const handleClick = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling to stage
    console.log('ActivityBlock clicked:', block.id);
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
