export interface CanvasBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  color?: string;
}

export interface FlightSegment {
  id: string;
  startDay: number; // Day within the trip (0-based)
  duration: number; // Duration in days
  type: 'outbound' | 'return' | 'layover';
  flightNumber?: string;
  label?: string;
}

export interface FlightBlock extends CanvasBlock {
  type: 'flight';
  totalDays: number;
  segments: FlightSegment[];
  contextBarHeight: number;
  segmentHeight: number;
}