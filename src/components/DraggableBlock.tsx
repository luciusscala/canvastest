import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import type { TravelBlock } from '../types/index';
import { FlightBlock } from './blocks/FlightBlock';
import { RoundTripFlightBlock } from './blocks/RoundTripFlightBlock';
import { HotelBlock } from './blocks/HotelBlock';
import { ActivityBlock } from './blocks/ActivityBlock';
import { TimelineBlock } from './TimelineBlock';
import { useCanvasStore } from '../store/useCanvasStore';

interface DraggableBlockProps {
  block: TravelBlock;
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  const { selectBlock } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);

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
    transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  } : {
    transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const handleClick = () => {
    selectBlock(block.id);
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'flight':
        return <FlightBlock block={block as any} />;
      case 'roundtrip-flight':
        return <RoundTripFlightBlock block={block as any} />;
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
      <TimelineBlock
        block={block}
        isSelected={false}
        isHovered={isHovered}
        isDragging={isDragging}
      >
        {renderBlock()}
      </TimelineBlock>
    </div>
  );
}