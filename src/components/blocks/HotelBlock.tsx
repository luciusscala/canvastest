import type { HotelBlock as HotelBlockType } from '../../types/index';

interface HotelBlockProps {
  block: HotelBlockType;
}

export function HotelBlock({ block }: HotelBlockProps) {
  const duration = block.endTime.getTime() - block.startTime.getTime();
  const days = Math.ceil(duration / (1000 * 60 * 60 * 24));

  return (
    <div className="text-white">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="font-bold text-lg">🏨 Hotel</span>
      </div>

      <div className="space-y-1">
        <div className="font-semibold text-lg">{block.name}</div>
        <div className="text-green-100 text-sm">{block.location}</div>
        <div className="text-green-100 text-sm">
          {block.startTime.toLocaleDateString()} - {block.endTime.toLocaleDateString()} ({days} nights)
        </div>
      </div>
    </div>
  );
}