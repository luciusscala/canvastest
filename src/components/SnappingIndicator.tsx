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
      {/* Outer glow ring */}
      <div className="w-12 h-12 border-2 border-amber-400 rounded-full animate-pulse bg-amber-400 bg-opacity-10 shadow-lg" 
           style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }} />
      
      {/* Inner snap indicator ring */}
      <div className="absolute top-1 left-1 w-10 h-10 border-2 border-amber-500 rounded-full animate-pulse bg-amber-500 bg-opacity-30" />
      
      {/* Center dot */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"
        style={{ animation: 'pulse 1s infinite' }}
      />
    </div>
  );
}
