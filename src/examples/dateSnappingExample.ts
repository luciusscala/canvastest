// Example demonstrating the new date-based snapping system
import { createDateRange, calculateHoursFromTripStart, calculateBlockPosition } from '../utils/timeUtils';
import { createTripTimeline } from '../utils/timeUtils';
import type { FlightBlock, HotelBlock, ActivityBlock } from '../types/index';

// Create a 7-day trip timeline
const tripStart = new Date('2024-12-15T00:00:00');
const tripEnd = new Date('2024-12-22T23:59:59');
const tripTimeline = createTripTimeline(tripStart, tripEnd, 20); // 20 pixels per hour

// Example 1: Flight block (Dec 15 departure, Dec 21 return)
const flightBlock: FlightBlock = {
  id: 'flight-example',
  type: 'flight',
  x: 0, // Will be calculated
  y: 100,
  width: 0, // Will be calculated
  height: 150,
  title: 'Round Trip Flight',
  totalHours: 0, // Will be calculated
  segments: [],
  contextBarHeight: 24,
  segmentHeight: 80,
  departureAirport: 'JFK',
  arrivalAirport: 'JFK',
  color: '#f3f4f6',
  // Date-based properties
  startHour: calculateHoursFromTripStart(new Date('2024-12-15T08:00:00'), tripStart),
  durationHours: calculateHoursFromTripStart(new Date('2024-12-21T18:00:00'), tripStart) - 
                 calculateHoursFromTripStart(new Date('2024-12-15T08:00:00'), tripStart),
  dateRange: createDateRange(new Date('2024-12-15T08:00:00'), new Date('2024-12-21T18:00:00'))
};

// Calculate position based on time
const flightPosition = calculateBlockPosition(
  flightBlock.startHour, 
  flightBlock.durationHours, 
  tripTimeline.scale
);
flightBlock.x = flightPosition.x;
flightBlock.width = flightPosition.width;

// Example 2: Hotel block (Dec 16-19 stay)
const hotelBlock: HotelBlock = {
  id: 'hotel-example',
  type: 'hotel',
  x: 0, // Will be calculated
  y: 200,
  width: 0, // Will be calculated
  height: 100,
  title: 'Grand Hotel',
  totalDays: 3,
  events: [],
  contextBarHeight: 20,
  eventHeight: 60,
  hotelName: 'Grand Hotel',
  location: 'San Francisco',
  color: '#f3f4f6',
  // Date-based properties
  startHour: calculateHoursFromTripStart(new Date('2024-12-16T15:00:00'), tripStart),
  durationHours: calculateHoursFromTripStart(new Date('2024-12-19T11:00:00'), tripStart) - 
                 calculateHoursFromTripStart(new Date('2024-12-16T15:00:00'), tripStart),
  dateRange: createDateRange(new Date('2024-12-16T15:00:00'), new Date('2024-12-19T11:00:00'))
};

// Calculate position based on time
const hotelPosition = calculateBlockPosition(
  hotelBlock.startHour, 
  hotelBlock.durationHours, 
  tripTimeline.scale
);
hotelBlock.x = hotelPosition.x;
hotelBlock.width = hotelPosition.width;

// Example 3: Activity block (2-hour museum visit on Dec 17)
const activityBlock: ActivityBlock = {
  id: 'activity-example',
  type: 'activity',
  x: 0, // Will be calculated
  y: 300,
  width: 0, // Will be calculated
  height: 60,
  title: 'Museum Visit',
  duration: 2, // For backward compatibility
  activityType: 'sightseeing',
  location: 'San Francisco',
  color: '#8b5cf6',
  // Date-based properties
  startHour: calculateHoursFromTripStart(new Date('2024-12-17T10:00:00'), tripStart),
  durationHours: 2,
  dateRange: createDateRange(new Date('2024-12-17T10:00:00'), new Date('2024-12-17T12:00:00'))
};

// Calculate position based on time
const activityPosition = calculateBlockPosition(
  activityBlock.startHour, 
  activityBlock.durationHours, 
  tripTimeline.scale
);
activityBlock.x = activityPosition.x;
activityBlock.width = activityPosition.width;

// Visual representation:
// Timeline: Dec 15 -------- Dec 16 -------- Dec 17 -------- Dec 18 -------- Dec 19 -------- Dec 20 -------- Dec 21 -------- Dec 22
//           |               |               |               |               |               |               |               |
//           |               |               |               |               |               |               |               |
// Flight:   [===============                                                               ===============]
// Hotel:                    [===============================================]
// Activity:                                 [====]

console.log('Date-based snapping example:');
console.log('Flight block:', {
  startHour: flightBlock.startHour,
  durationHours: flightBlock.durationHours,
  x: flightBlock.x,
  width: flightBlock.width,
  dateRange: flightBlock.dateRange
});

console.log('Hotel block:', {
  startHour: hotelBlock.startHour,
  durationHours: hotelBlock.durationHours,
  x: hotelBlock.x,
  width: hotelBlock.width,
  dateRange: hotelBlock.dateRange
});

console.log('Activity block:', {
  startHour: activityBlock.startHour,
  durationHours: activityBlock.durationHours,
  x: activityBlock.x,
  width: activityBlock.width,
  dateRange: activityBlock.dateRange
});

export { flightBlock, hotelBlock, activityBlock, tripTimeline };
