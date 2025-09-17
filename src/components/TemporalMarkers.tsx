import React from 'react';

interface TemporalMarkersProps {
  transform: { x: number; y: number; scale: number };
}

export function TemporalMarkers({ transform }: TemporalMarkersProps) {
  // Generate time markers for the next 7 days
  const now = new Date();
  const markers = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    return {
      date,
      x: 100 + (i * 200), // 200px spacing between days
      label: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    };
  });

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      }}
    >
      {/* Time progression line */}
      <div 
        className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"
        style={{ opacity: 0.4 }}
      />
      
      {/* Day markers */}
      {markers.map((marker, index) => (
        <div key={index} className="absolute" style={{ left: marker.x, top: 20 }}>
          {/* Vertical line */}
          <div 
            className="w-px h-8 bg-gray-300"
            style={{ opacity: 0.5 }}
          />
          
          {/* Date label */}
          <div 
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium whitespace-nowrap"
            style={{ opacity: 0.7 }}
          >
            {marker.label}
          </div>
          
          {/* Time progression indicator */}
          <div 
            className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"
            style={{ opacity: 0.6 }}
          />
        </div>
      ))}
      
      {/* Flow direction indicator */}
      <div className="absolute top-12 right-8 flex items-center gap-1 text-xs text-gray-400">
        <span>Time Flow</span>
        <div className="flex">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}
