import type { RoundTripFlightBlock as RoundTripFlightBlockType } from '../../types/index';

interface RoundTripFlightBlockProps {
  block: RoundTripFlightBlockType;
}

export function RoundTripFlightBlock({ block }: RoundTripFlightBlockProps) {
  return (
    <div className="text-white text-center">
      <div className="font-bold text-sm drop-shadow-sm">{block.departureFrom} → {block.departureTo}</div>
      <div className="text-xs opacity-90 font-medium">{block.returnFrom} → {block.returnTo}</div>
    </div>
  );
}
