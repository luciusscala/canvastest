export interface TravelBlock {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  startTime: Date;
  endTime: Date;
  x: number;
  y: number;
  title: string;
}

export interface FlightBlock extends TravelBlock {
  type: 'flight';
  from: string;
  to: string;
  flightNumber?: string;
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