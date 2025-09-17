import type { RoundTripFlightBlock as RoundTripFlightBlockType } from '../../types/index';

interface RoundTripFlightBlockProps {
  block: RoundTripFlightBlockType;
}

export function RoundTripFlightBlock({ block }: RoundTripFlightBlockProps) {
  return (
    <div className="text-black text-center">
      <div className="font-bold text-sm">{block.departureFrom} → {block.departureTo}</div>
      <div className="text-xs">{block.returnFrom} → {block.returnTo}</div>
    </div>
  );
}
