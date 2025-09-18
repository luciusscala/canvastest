import type { HotelBlock as HotelBlockType } from '../../types/index';

interface HotelBlockProps {
  block: HotelBlockType;
}

export function HotelBlock({ block }: HotelBlockProps) {
  return (
    <div className="text-white text-center">
      <div className="font-bold text-sm drop-shadow-sm">{block.name}</div>
      <div className="text-xs opacity-90 font-medium">{block.location}</div>
    </div>
  );
}