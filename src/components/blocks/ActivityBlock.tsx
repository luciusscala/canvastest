import type { ActivityBlock as ActivityBlockType } from '../../types/index';

interface ActivityBlockProps {
  block: ActivityBlockType;
}

export function ActivityBlock({ block }: ActivityBlockProps) {
  // Activity blocks are simple single blocks, no duration calculation needed

  return (
    <div className="text-white">
      <div className="font-bold text-sm drop-shadow-sm">{block.name}</div>
      <div className="text-xs drop-shadow-sm">{block.location}</div>
    </div>
  );
}