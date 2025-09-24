import { useState } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import type { FlightBlock, HotelBlock, FlightSegment, HotelEvent } from '../types/index';
import { createDateRange, calculateHoursFromTripStart, calculateBlockPosition } from '../utils/timeUtils';

interface ControlPanelProps {
  onClose: () => void;
}

export function ControlPanel({ onClose }: ControlPanelProps) {
  console.log('ControlPanel rendered');
  const { addBlock, tripTimeline } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel'>('flight');
  const [isCreating, setIsCreating] = useState(false);

  // Flight form state
  const [flightForm, setFlightForm] = useState({
    title: '',
    departureDate: '2024-12-15',
    departureTime: '08:00',
    returnDate: '2024-12-21',
    returnTime: '18:00',
    departureAirport: 'JFK',
    arrivalAirport: 'LAX',
    segments: [
      { flightNumber: 'AA123', departure: 'JFK', arrival: 'LAX', duration: '2.5', type: 'outbound' as 'outbound' | 'return' | 'connecting' }
    ]
  });

  // Hotel form state
  const [hotelForm, setHotelForm] = useState({
    hotelName: 'Grand Hotel',
    location: 'San Francisco',
    checkinDate: '2024-12-16',
    checkinTime: '15:00',
    checkoutDate: '2024-12-19',
    checkoutTime: '11:00'
  });

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Flight form submitted');

    setIsCreating(true);
    
    try {
      const departureDateTime = new Date(`${flightForm.departureDate}T${flightForm.departureTime}`);
      const returnDateTime = new Date(`${flightForm.returnDate}T${flightForm.returnTime}`);
      const durationHours = (returnDateTime.getTime() - departureDateTime.getTime()) / (1000 * 60 * 60);

      // Create flight segments
      const segments: FlightSegment[] = flightForm.segments.map((segment, index) => ({
        id: `segment-${Date.now()}-${index}`,
        startTime: index * 2, // Simple distribution for now
        duration: parseFloat(segment.duration) || 2,
        type: segment.type,
        flightNumber: segment.flightNumber,
        departure: segment.departure,
        arrival: segment.arrival,
        label: segment.flightNumber,
        startHour: index * 2,
        durationHours: parseFloat(segment.duration) || 2,
        dateRange: createDateRange(
          new Date(departureDateTime.getTime() + index * 2 * 60 * 60 * 1000),
          new Date(departureDateTime.getTime() + (index * 2 + parseFloat(segment.duration)) * 60 * 60 * 1000)
        )
      }));

      const flightBlock: FlightBlock = {
        id: `flight-${Date.now()}`,
        type: 'flight',
        x: 100 + (Math.random() * 200), // Random position on canvas
        y: 100 + (Math.random() * 200),
        width: Math.max(200, durationHours * 5), // Width based on duration using same scale as test blocks (5 pixels per hour)
        height: 150,
        title: flightForm.title || 'Custom Flight',
        totalHours: durationHours,
        segments,
        contextBarHeight: 24,
        segmentHeight: 80,
        departureAirport: flightForm.departureAirport,
        arrivalAirport: flightForm.arrivalAirport,
        color: '#f3f4f6',
        startHour: 0, // Not used for positioning
        durationHours,
        dateRange: createDateRange(departureDateTime, returnDateTime)
      };

      console.log('Adding flight block:', flightBlock);
      addBlock(flightBlock);
      console.log('Flight block added successfully');
    } catch (error) {
      console.error('Error creating flight block:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Hotel form submitted');

    setIsCreating(true);
    
    try {
      const checkinDateTime = new Date(`${hotelForm.checkinDate}T${hotelForm.checkinTime}`);
      const checkoutDateTime = new Date(`${hotelForm.checkoutDate}T${hotelForm.checkoutTime}`);
      const durationHours = (checkoutDateTime.getTime() - checkinDateTime.getTime()) / (1000 * 60 * 60);

      const events: HotelEvent[] = [
        {
          id: `event-${Date.now()}-1`,
          type: 'checkin',
          date: checkinDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          hotelName: hotelForm.hotelName,
          startHour: 0,
          dateRange: createDateRange(checkinDateTime, checkinDateTime)
        },
        {
          id: `event-${Date.now()}-2`,
          type: 'checkout',
          date: checkoutDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          hotelName: hotelForm.hotelName,
          startHour: durationHours,
          dateRange: createDateRange(checkoutDateTime, checkoutDateTime)
        }
      ];

      const hotelBlock: HotelBlock = {
        id: `hotel-${Date.now()}`,
        type: 'hotel',
        x: 100 + (Math.random() * 200), // Random position on canvas
        y: 200 + (Math.random() * 200),
        width: Math.max(150, durationHours * 5), // Width based on duration using same scale as test blocks (5 pixels per hour)
        height: 100,
        title: hotelForm.hotelName,
        totalDays: Math.ceil(durationHours / 24),
        events,
        contextBarHeight: 20,
        eventHeight: 60,
        hotelName: hotelForm.hotelName,
        location: hotelForm.location,
        color: '#f3f4f6',
        startHour: 0, // Not used for positioning
        durationHours,
        dateRange: createDateRange(checkinDateTime, checkoutDateTime)
      };

      console.log('Adding hotel block:', hotelBlock);
      addBlock(hotelBlock);
      console.log('Hotel block added successfully');
    } catch (error) {
      console.error('Error creating hotel block:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const addFlightSegment = () => {
    setFlightForm(prev => ({
      ...prev,
      segments: [...prev.segments, { flightNumber: '', departure: '', arrival: '', duration: '', type: 'connecting' as 'outbound' | 'return' | 'connecting' }]
    }));
  };

  const removeFlightSegment = (index: number) => {
    setFlightForm(prev => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index)
    }));
  };

  const updateFlightSegment = (index: number, field: string, value: string) => {
    setFlightForm(prev => ({
      ...prev,
      segments: prev.segments.map((segment, i) => 
        i === index ? { ...segment, [field]: value } : segment
      )
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Create New Block</h2>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('flight')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'flight'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✈️ Flight
            </button>
            <button
              onClick={() => setActiveTab('hotel')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'hotel'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏨 Hotel
            </button>
          </div>

          {/* Flight Form */}
          {activeTab === 'flight' && (
            <form onSubmit={handleFlightSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flight Title
                  </label>
                  <input
                    type="text"
                    value={flightForm.title}
                    onChange={(e) => setFlightForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Round Trip to Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Airport
                  </label>
                  <input
                    type="text"
                    value={flightForm.departureAirport}
                    onChange={(e) => setFlightForm(prev => ({ ...prev, departureAirport: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., JFK"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={flightForm.departureDate}
                    onChange={(e) => setFlightForm(prev => ({ ...prev, departureDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={flightForm.departureTime}
                    onChange={(e) => setFlightForm(prev => ({ ...prev, departureTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={flightForm.returnDate}
                    onChange={(e) => setFlightForm(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Time
                  </label>
                  <input
                    type="time"
                    value={flightForm.returnTime}
                    onChange={(e) => setFlightForm(prev => ({ ...prev, returnTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Airport
                </label>
                <input
                  type="text"
                  value={flightForm.arrivalAirport}
                  onChange={(e) => setFlightForm(prev => ({ ...prev, arrivalAirport: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CDG"
                />
              </div>

              {/* Flight Segments */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Flight Segments
                  </label>
                  <button
                    type="button"
                    onClick={addFlightSegment}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Segment
                  </button>
                </div>
                
                {flightForm.segments.map((segment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Segment {index + 1}</span>
                      {flightForm.segments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFlightSegment(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Flight Number</label>
                        <input
                          type="text"
                          value={segment.flightNumber}
                          onChange={(e) => updateFlightSegment(index, 'flightNumber', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="AA123"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Duration (hours)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={segment.duration}
                          onChange={(e) => updateFlightSegment(index, 'duration', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">From</label>
                        <input
                          type="text"
                          value={segment.departure}
                          onChange={(e) => updateFlightSegment(index, 'departure', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="JFK"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">To</label>
                        <input
                          type="text"
                          value={segment.arrival}
                          onChange={(e) => updateFlightSegment(index, 'arrival', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="LAX"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Flight'}
                </button>
              </div>
            </form>
          )}

          {/* Hotel Form */}
          {activeTab === 'hotel' && (
            <form onSubmit={handleHotelSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={hotelForm.hotelName}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, hotelName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grand Hotel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={hotelForm.location}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., San Francisco"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={hotelForm.checkinDate}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, checkinDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={hotelForm.checkinTime}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, checkinTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={hotelForm.checkoutDate}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, checkoutDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={hotelForm.checkoutTime}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, checkoutTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Hotel'}
                </button>
              </div>
            </form>
          )}
      </div>
    </div>
  );
}
