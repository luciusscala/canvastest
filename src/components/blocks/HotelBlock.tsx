import type { HotelBlock as HotelBlockType } from '../../types/index';

interface HotelBlockProps {
  block: HotelBlockType;
}

export function HotelBlock({ block }: HotelBlockProps) {
  const duration = block.endTime.getTime() - block.startTime.getTime();
  const days = Math.ceil(duration / (1000 * 60 * 60 * 24));

  return (
    <div
      className="absolute bg-green-500 text-white p-3 rounded-lg shadow-lg cursor-move min-w-48 border border-green-600"
      style={{
        left: block.x,
        top: block.y,
        width: Math.max(192, days * 96), // 96px per day minimum
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
          <div className="w-2 h-2 bg-green-500"></div>
        </div>
        <span className="font-semibold text-sm">Hotel</span>
      </div>

      <div className="text-sm">
        <div className="font-medium">{block.name}</div>
        <div className="text-green-100 text-xs">{block.location}</div>
        <div className="text-green-100 text-xs mt-1">
          {block.startTime.toLocaleDateString()} - {block.endTime.toLocaleDateString()} ({days} nights)
        </div>
      </div>
    </div>
  );
}