import type { ActivityBlock as ActivityBlockType } from '../../types/index';

interface ActivityBlockProps {
  block: ActivityBlockType;
}

export function ActivityBlock({ block }: ActivityBlockProps) {
  const duration = block.endTime.getTime() - block.startTime.getTime();
  const hours = Math.round(duration / (1000 * 60 * 60) * 10) / 10;

  return (
    <div
      className="absolute bg-purple-500 text-white p-3 rounded-lg shadow-lg cursor-move min-w-32 border border-purple-600"
      style={{
        left: block.x,
        top: block.y,
        width: Math.max(128, hours * 20), // 20px per hour minimum
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        </div>
        <span className="font-semibold text-sm">Activity</span>
      </div>

      <div className="text-sm">
        <div className="font-medium">{block.name}</div>
        <div className="text-purple-100 text-xs">{block.location}</div>
        {block.description && (
          <div className="text-purple-100 text-xs mt-1">{block.description}</div>
        )}
        <div className="text-purple-100 text-xs mt-1">
          {block.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
          {block.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({hours}h)
        </div>
      </div>
    </div>
  );
}