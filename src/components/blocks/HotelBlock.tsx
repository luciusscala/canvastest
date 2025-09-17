import type { HotelBlock as HotelBlockType } from '../../types/index';

interface HotelBlockProps {
  block: HotelBlockType;
}

export function HotelBlock({ block }: HotelBlockProps) {
  // Convert duration from hours to days for display
  const days = Math.round((block.duration / 24) * 10) / 10;

  return (
    <div className="text-black text-center">
      <div className="font-bold text-sm">{block.name}</div>
      <div className="text-xs">{block.location}</div>
    </div>
  );
}