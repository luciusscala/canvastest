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
      
      {/* Subtle grid lines for snapping reference */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f3f4f6 1px, transparent 1px),
            linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)
          `,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: '0 0',
          opacity: 0.3,
        }}
      />
    </div>
  );
}
