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
      title: 'Sample Flight',
      from: 'NYC',
      to: 'LAX',
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
      title: 'Sample Hotel',
      name: 'Grand Plaza Hotel',
      location: 'Los Angeles, CA',
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
      title: 'Round Trip Flight',
      departureFrom: 'NYC',
      departureTo: 'LAX',
      returnFrom: 'LAX',
      returnTo: 'NYC',
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
      title: 'Sample Activity',
      name: 'Hollywood Tour',
      location: 'Hollywood, CA',
      description: 'Guided tour of famous landmarks',
      startTime,
      endTime,
      duration,
      x: 500,
      y: 100,
    };
    addBlock(activity);
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 flex gap-2">
      <button
        onClick={addSampleFlight}
        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        Add Flight
      </button>
      <button
        onClick={addSampleRoundTripFlight}
        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
      >
        Add Round Trip
      </button>
      <button
        onClick={addSampleHotel}
        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
      >
        Add Hotel
      </button>
      <button
        onClick={addSampleActivity}
        className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
      >
        Add Activity
      </button>
    </div>
  );
}