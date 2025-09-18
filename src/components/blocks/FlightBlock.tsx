import type { FlightBlock as FlightBlockType } from '../../types/index';

interface FlightBlockProps {
  block: FlightBlockType;
}

export function FlightBlock({ block }: FlightBlockProps) {
  return (
    <div className="text-white text-center">
      <div className="font-bold text-sm drop-shadow-sm">{block.from} → {block.to}</div>
      {block.flightNumber && (
        <div className="text-xs opacity-90 font-medium">{block.flightNumber}</div>
      )}
    </div>
  );
}