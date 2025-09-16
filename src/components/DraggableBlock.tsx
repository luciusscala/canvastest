import { useDraggable } from '@dnd-kit/core';
import { TravelBlock } from '../types';
import { FlightBlock } from './blocks/FlightBlock';
import { HotelBlock } from './blocks/HotelBlock';
import { ActivityBlock } from './blocks/ActivityBlock';
import { ResizableBlock } from './ResizableBlock';
import { useCanvasStore } from '../store/useCanvasStore';

interface DraggableBlockProps {
  block: TravelBlock;
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  const { selectBlock, hasTemporalConflict } = useCanvasStore();
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
      className={`${isDragging ? 'opacity-50' : ''} ${hasConflict ? 'ring-2 ring-red-500' : ''}`}
    >
      <ResizableBlock block={block}>
        {renderBlock()}
      </ResizableBlock>
    </div>
  );
}