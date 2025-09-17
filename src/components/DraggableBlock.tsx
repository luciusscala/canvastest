import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import type { TravelBlock } from '../types/index';
import { FlightBlock } from './blocks/FlightBlock';
import { HotelBlock } from './blocks/HotelBlock';
import { ActivityBlock } from './blocks/ActivityBlock';
import { ScratchBlock } from './ScratchBlock';
import { useCanvasStore } from '../store/useCanvasStore';

interface DraggableBlockProps {
  block: TravelBlock;
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  const { selectBlock, hasTemporalConflict } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const hasConflict = hasTemporalConflict(block);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: block.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleClick = () => {
    selectBlock(block.id);
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'flight':
        return <FlightBlock block={block as any} />;
      case 'hotel':
        return <HotelBlock block={block as any} />;
      case 'activity':
        return <ActivityBlock block={block as any} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ScratchBlock
        block={block}
        isSelected={false}
        isHovered={isHovered}
        isDragging={isDragging}
      >
        {renderBlock()}
      </ScratchBlock>
    </div>
  );
}