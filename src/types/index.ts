// Unified time system - everything measured in hours
export interface TimeUnit {
  hours: number; // Always the base unit
}

export interface DateRange {
  start: Date;
  end: Date;
  duration: TimeUnit; // Always in hours
}

export interface TripTimeline {
  startDate: Date;
  endDate: Date;
  totalHours: number; // Total trip duration
  scale: number; // Pixels per hour for rendering
}

export interface BlockPosition {
  startHour: number; // Hours from trip start
  durationHours: number;
  x: number; // Calculated from startHour * scale
  width: number; // Calculated from durationHours * scale
}

export interface CanvasBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  color?: string;
  // New time-based properties
  startHour?: number; // Hours from trip start
  durationHours?: number; // Duration in hours
  dateRange?: DateRange; // Actual dates
}

export interface FlightSegment {
  id: string;
  startTime: number; // Start time in hours from trip start
  duration: number; // Duration in hours
  type: 'outbound' | 'return' | 'connecting';
  flightNumber: string;
  departure: string; // Airport code
  arrival: string; // Airport code
  label?: string;
  // New time-based properties
  startHour?: number; // Hours from trip start
  durationHours?: number; // Duration in hours
  dateRange?: DateRange; // Actual departure/arrival dates
}

export interface FlightBlock extends CanvasBlock {
  type: 'flight';
  totalHours: number; // Total time span in hours
  segments: FlightSegment[];
  contextBarHeight: number;
  segmentHeight: number;
  departureAirport: string;
  arrivalAirport: string;
  // Enhanced time properties
  startHour: number; // Hours from trip start
  durationHours: number; // Total flight duration
  dateRange: DateRange; // Actual departure/arrival dates
}

export interface HotelEvent {
  id: string;
  type: 'checkin' | 'checkout';
  date: string; // Date string (e.g., "Dec 15")
  hotelName: string;
  // New time-based properties
  startHour?: number; // Hours from trip start
  dateRange?: DateRange; // Actual check-in/check-out dates
}

export interface HotelBlock extends CanvasBlock {
  type: 'hotel';
  totalDays: number; // Total stay duration in days (for backward compatibility)
  events: HotelEvent[];
  contextBarHeight: number;
  eventHeight: number;
  hotelName: string;
  location: string;
  // Enhanced time properties
  startHour: number; // Hours from trip start
  durationHours: number; // Total stay duration in hours
  dateRange: DateRange; // Actual check-in/check-out dates
}

export interface ActivityBlock extends CanvasBlock {
  type: 'activity';
  duration: number; // Duration in hours (for backward compatibility)
  activityType: string; // e.g., "sightseeing", "dining", "shopping"
  location: string;
  // Enhanced time properties
  startHour: number; // Hours from trip start
  durationHours: number; // Duration in hours
  dateRange: DateRange; // Actual activity start/end dates
}

// Conflict detection and validation
export interface Conflict {
  type: 'overlap' | 'logical' | 'resource';
  message: string;
  conflictingBlockId: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SnappingValidation {
  isValid: boolean;
  conflicts: Conflict[];
  suggestedPosition?: BlockPosition;
  canSnap: boolean;
}

// Enhanced snapping result with date validation
export interface DateSnappingResult {
  shouldSnap: boolean;
  snapX: number;
  snapY: number;
  parentId?: string;
  snapType: 'none' | 'flight' | 'hotel' | 'activity';
  validation: SnappingValidation;
  calculatedPosition?: BlockPosition;
}