import React from 'react';

interface SnappingIndicatorProps {
  x: number;
  y: number;
  isVisible: boolean;
}

export function SnappingIndicator({ x, y, isVisible }: SnappingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: x - 20,
        top: y - 20,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Snap indicator ring */}
      <div className="w-10 h-10 border-2 border-yellow-400 rounded-full animate-pulse bg-yellow-400 bg-opacity-20" />
      
      {/* Center dot */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"
        style={{ animation: 'pulse 1s infinite' }}
      />
    </div>
  );
}
