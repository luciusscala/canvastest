import { useCanvasStore } from '../store/useCanvasStore';
import type { FlightBlock, RoundTripFlightBlock, HotelBlock, ActivityBlock } from '../types/index';

export function Toolbar() {
  const { addBlock } = useCanvasStore();

  const addSampleFlight = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const endTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // 7 hours from now
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Duration in hours
    
    const flight: FlightBlock = {
      id: `flight-${Date.now()}`,
      type: 'flight',
      title: 'JFK → LAX',
      from: 'New York (JFK)',
      to: 'Los Angeles (LAX)',
      flightNumber: 'AA123',
      startTime,
      endTime,
      duration,
      x: 100,
      y: 100,
    };
    addBlock(flight);
  };

  const addSampleHotel = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours from now
    const endTime = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days from now
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Duration in hours
    
    const hotel: HotelBlock = {
      id: `hotel-${Date.now()}`,
      type: 'hotel',
      title: 'The Beverly Hills Hotel',
      name: 'The Beverly Hills Hotel',
      location: 'Beverly Hills, CA',
      startTime,
      endTime,
      duration,
      x: 300,
      y: 100,
    };
    addBlock(hotel);
  };

  const addSampleRoundTripFlight = () => {
    const now = new Date();
    const departureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const returnTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const duration = (returnTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60); // Duration in hours
    
    const roundTripFlight: RoundTripFlightBlock = {
      id: `roundtrip-flight-${Date.now()}`,
      type: 'roundtrip-flight',
      title: 'NYC ↔ LAX',
      departureFrom: 'New York (JFK)',
      departureTo: 'Los Angeles (LAX)',
      returnFrom: 'Los Angeles (LAX)',
      returnTo: 'New York (JFK)',
      departureFlightNumber: 'AA123',
      returnFlightNumber: 'AA456',
      departureTime,
      returnTime,
      startTime: departureTime,
      endTime: returnTime,
      duration,
      x: 100,
      y: 200,
    };
    addBlock(roundTripFlight);
  };

  const addSampleActivity = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
    const endTime = new Date(now.getTime() + 15 * 60 * 60 * 1000); // 15 hours from now
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Duration in hours
    
    const activity: ActivityBlock = {
      id: `activity-${Date.now()}`,
      type: 'activity',
      title: 'Hollywood Studio Tour',
      name: 'Warner Bros. Studio Tour',
      location: 'Burbank, CA',
      description: 'Behind-the-scenes tour of famous movie sets',
      startTime,
      endTime,
      duration,
      x: 500,
      y: 100,
    };
    addBlock(activity);
  };

  const addCompleteTrip = () => {
    const now = new Date();
    
    // Round-trip flight
    const departureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const returnTime = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const flightDuration = (returnTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
    
    const roundTripFlight: RoundTripFlightBlock = {
      id: `trip-flight-${Date.now()}`,
      type: 'roundtrip-flight',
      title: 'NYC ↔ LAX',
      departureFrom: 'New York (JFK)',
      departureTo: 'Los Angeles (LAX)',
      returnFrom: 'Los Angeles (LAX)',
      returnTo: 'New York (JFK)',
      departureFlightNumber: 'AA123',
      returnFlightNumber: 'AA456',
      departureTime,
      returnTime,
      startTime: departureTime,
      endTime: returnTime,
      duration: flightDuration,
      x: 100,
      y: 100,
    };
    addBlock(roundTripFlight);

    // Hotel stay
    const checkInTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const checkOutTime = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const hotelDuration = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    
    const hotel: HotelBlock = {
      id: `trip-hotel-${Date.now()}`,
      type: 'hotel',
      title: 'The Beverly Hills Hotel',
      name: 'The Beverly Hills Hotel',
      location: 'Beverly Hills, CA',
      startTime: checkInTime,
      endTime: checkOutTime,
      duration: hotelDuration,
      x: 100,
      y: 200,
    };
    addBlock(hotel);

    // Activities
    const activities = [
      {
        name: 'Hollywood Sign Hike',
        location: 'Griffith Park, CA',
        description: 'Hike to the famous Hollywood Sign',
        startOffset: 12, // 12 hours after trip start
        duration: 4, // 4 hours
        x: 100,
        y: 300,
      },
      {
        name: 'Santa Monica Pier',
        location: 'Santa Monica, CA',
        description: 'Visit the iconic pier and beach',
        startOffset: 24, // 1 day after trip start
        duration: 6, // 6 hours
        x: 100,
        y: 400,
      },
      {
        name: 'Universal Studios',
        location: 'Universal City, CA',
        description: 'Theme park and studio tour',
        startOffset: 36, // 1.5 days after trip start
        duration: 8, // 8 hours
        x: 100,
        y: 500,
      },
    ];

    activities.forEach((activity, index) => {
      const startTime = new Date(now.getTime() + activity.startOffset * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + activity.duration * 60 * 60 * 1000);
      const duration = activity.duration;
      
      const activityBlock: ActivityBlock = {
        id: `trip-activity-${Date.now()}-${index}`,
        type: 'activity',
        title: activity.name,
        name: activity.name,
        location: activity.location,
        description: activity.description,
        startTime,
        endTime,
        duration,
        x: activity.x,
        y: activity.y,
      };
      addBlock(activityBlock);
    });
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={addSampleFlight}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors"
        >
          Add Flight
        </button>
        <button
          onClick={addSampleRoundTripFlight}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition-colors"
        >
          Add Round Trip
        </button>
        <button
          onClick={addSampleHotel}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium transition-colors"
        >
          Add Hotel
        </button>
        <button
          onClick={addSampleActivity}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm font-medium transition-colors"
        >
          Add Activity
        </button>
      </div>
      <div className="border-t pt-2">
        <button
          onClick={addCompleteTrip}
          className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🎯 Create Complete Trip
        </button>
      </div>
    </div>
  );
}