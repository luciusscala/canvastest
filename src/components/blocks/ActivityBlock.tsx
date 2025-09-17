import type { ActivityBlock as ActivityBlockType } from '../../types/index';

interface ActivityBlockProps {
  block: ActivityBlockType;
}

export function ActivityBlock({ block }: ActivityBlockProps) {
  const duration = block.endTime.getTime() - block.startTime.getTime();
  const hours = Math.round(duration / (1000 * 60 * 60) * 10) / 10;

  return (
    <div className="text-white">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
        </div>
        <span className="font-bold text-lg">🎯 Activity</span>
      </div>

      <div className="space-y-1">
        <div className="font-semibold text-lg">{block.name}</div>
        <div className="text-purple-100 text-sm">{block.location}</div>
        {block.description && (
          <div className="text-purple-100 text-sm">{block.description}</div>
        )}
        <div className="text-purple-100 text-sm">
          {block.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
          {block.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({hours}h)
        </div>
      </div>
    </div>
  );
}