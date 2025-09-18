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
  startTime: number; // Start time in hours (0-24)
  duration: number; // Duration in hours
  type: 'outbound' | 'return' | 'connecting';
  flightNumber: string;
  departure: string; // Airport code
  arrival: string; // Airport code
  label?: string;
}

export interface FlightBlock extends CanvasBlock {
  type: 'flight';
  totalHours: number; // Total time span in hours (e.g., 24 for a day)
  segments: FlightSegment[];
  contextBarHeight: number;
  segmentHeight: number;
  departureAirport: string;
  arrivalAirport: string;
}