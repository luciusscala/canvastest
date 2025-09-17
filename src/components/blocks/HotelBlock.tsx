import type { HotelBlock as HotelBlockType } from '../../types/index';

interface HotelBlockProps {
  block: HotelBlockType;
}

export function HotelBlock({ block }: HotelBlockProps) {
  // Use the duration property from the block
  const days = block.duration;

  return (
    <div className="text-black text-center">
      <div className="font-bold text-sm">{block.name}</div>
      <div className="text-xs">{block.location}</div>
    </div>
  );
}