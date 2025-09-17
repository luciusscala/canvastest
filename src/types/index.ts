export interface TravelBlock {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'roundtrip-flight';
  startTime: Date;
  endTime: Date;
  x: number;
  y: number;
  title: string;
  duration: number; // Duration in hours
}

export interface FlightBlock extends TravelBlock {
  type: 'flight';
  from: string;
  to: string;
  flightNumber?: string;
}

export interface RoundTripFlightBlock extends TravelBlock {
  type: 'roundtrip-flight';
  departureFrom: string;
  departureTo: string;
  returnFrom: string;
  returnTo: string;
  departureFlightNumber?: string;
  returnFlightNumber?: string;
  departureTime: Date;
  returnTime: Date;
}

export interface HotelBlock extends TravelBlock {
  type: 'hotel';
  name: string;
  location: string;
}

export interface ActivityBlock extends TravelBlock {
  type: 'activity';
  name: string;
  location: string;
  description?: string;
}