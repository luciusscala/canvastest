import React from 'react';

interface DotGridProps {
  spacing?: number;
  dotSize?: number;
}

export function DotGrid({ spacing = 20, dotSize = 1 }: DotGridProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Main dot grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #e5e7eb ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: '0 0',
        }}
      />
      
      {/* Grid lines - more visible */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1d5db 1px, transparent 1px),
            linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: '0 0',
          opacity: 0.6,
        }}
      />
      
      {/* Major grid lines every 5th line */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9ca3af 2px, transparent 2px),
            linear-gradient(to bottom, #9ca3af 2px, transparent 2px)
          `,
          backgroundSize: `${spacing * 5}px ${spacing * 5}px`,
          backgroundPosition: '0 0',
          opacity: 0.8,
        }}
      />
    </div>
  );
}
