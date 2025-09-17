import type { FlightBlock as FlightBlockType } from '../../types/index';

interface FlightBlockProps {
  block: FlightBlockType;
}

export function FlightBlock({ block }: FlightBlockProps) {
  // Duration is already in hours
  const hours = Math.round(block.duration * 10) / 10;

  return (
    <div className="text-black text-center">
      <div className="font-bold text-sm">{block.from} → {block.to}</div>
      {block.flightNumber && (
        <div className="text-xs">{block.flightNumber}</div>
      )}
    </div>
  );
}