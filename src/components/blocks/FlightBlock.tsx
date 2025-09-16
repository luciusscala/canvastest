import { FlightBlock as FlightBlockType } from '../../types';

interface FlightBlockProps {
  block: FlightBlockType;
}

export function FlightBlock({ block }: FlightBlockProps) {
  const duration = block.endTime.getTime() - block.startTime.getTime();
  const hours = Math.round(duration / (1000 * 60 * 60) * 10) / 10;

  return (
    <div
      className="absolute bg-blue-500 text-white p-3 rounded-lg shadow-lg cursor-move min-w-32 border border-blue-600"
      style={{
        left: block.x,
        top: block.y,
        width: Math.max(128, hours * 16), // 16px per hour minimum
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
        <span className="font-semibold text-sm">Flight</span>
      </div>

      <div className="text-sm">
        <div className="font-medium">{block.from} → {block.to}</div>
        {block.flightNumber && (
          <div className="text-blue-100 text-xs">{block.flightNumber}</div>
        )}
        <div className="text-blue-100 text-xs mt-1">
          {block.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
          {block.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({hours}h)
        </div>
      </div>
    </div>
  );
}