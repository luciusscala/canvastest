import type { ActivityBlock as ActivityBlockType } from '../../types/index';

interface ActivityBlockProps {
  block: ActivityBlockType;
}

export function ActivityBlock({ block }: ActivityBlockProps) {
  return (
    <div className="text-white text-center">
      <div className="font-bold text-sm drop-shadow-sm">{block.name}</div>
      <div className="text-xs opacity-90 font-medium">{block.location}</div>
    </div>
  );
}