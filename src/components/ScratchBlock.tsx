import React from 'react';
import type { TravelBlock } from '../types/index';

interface ScratchBlockProps {
  block: TravelBlock;
  isSelected?: boolean;
  isHovered?: boolean;
  isDragging?: boolean;
  children?: React.ReactNode;
}

export function ScratchBlock({ 
  block, 
  isSelected = false, 
  isHovered = false, 
  isDragging = false,
  children 
}: ScratchBlockProps) {
  const PIXELS_PER_DAY = 60; // Each day is 60 pixels wide
  const blockWidth = Math.max(140, block.duration * PIXELS_PER_DAY); // Minimum 140px width

  const getBlockColor = () => {
    switch (block.type) {
      case 'flight': return '#4A90E2'; // Scratch blue
      case 'hotel': return '#5CB85C'; // Scratch green
      case 'activity': return '#9B59B6'; // Scratch purple
      default: return '#95A5A6'; // Scratch gray
    }
  };

  const getBlockAccent = () => {
    switch (block.type) {
      case 'flight': return '#357ABD'; // Darker blue
      case 'hotel': return '#4CAF50'; // Darker green
      case 'activity': return '#8E44AD'; // Darker purple
      default: return '#7F8C8D'; // Darker gray
    }
  };

  return (
    <div
      className={`
        relative cursor-move select-none
        ${isDragging ? 'opacity-80 scale-105 z-50' : ''}
        ${isSelected ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}
        ${isHovered ? 'ring-2 ring-blue-300 ring-opacity-40' : ''}
        transition-all duration-200 ease-out
      `}
      style={{
        left: block.x,
        top: block.y,
      }}
    >
      {/* Main block body with Scratch-like shape */}
      <div 
        className="relative text-white font-medium"
        style={{ 
          width: `${blockWidth}px`,
          filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
        }}
      >
        {/* Main block body */}
        <div
          className="relative px-4 py-3 rounded-lg border-2 border-black"
          style={{
            backgroundColor: getBlockColor(),
            background: `linear-gradient(135deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.3),
              inset 0 -1px 0 rgba(0,0,0,0.2),
              0 2px 4px rgba(0,0,0,0.1)
            `,
          }}
        >
          {/* Top notch (input) - C-shaped opening */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-8 h-6 rounded-t-lg border-2 border-black border-b-0"
              style={{
                backgroundColor: getBlockAccent(),
                background: `linear-gradient(135deg, ${getBlockAccent()} 0%, ${getBlockColor()} 100%)`,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 80% 100%, 20% 100%, 0% 70%)',
              }}
            />
          </div>

          {/* Bottom notch (output) - C-shaped opening */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-8 h-6 rounded-b-lg border-2 border-black border-t-0"
              style={{
                backgroundColor: getBlockAccent(),
                background: `linear-gradient(135deg, ${getBlockAccent()} 0%, ${getBlockColor()} 100%)`,
                clipPath: 'polygon(0% 30%, 20% 0%, 80% 0%, 100% 30%, 100% 100%, 0% 100%)',
              }}
            />
          </div>

          {/* Left side notch (previous block connection) */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
            <div 
              className="w-6 h-8 rounded-l-lg border-2 border-black border-r-0"
              style={{
                backgroundColor: getBlockAccent(),
                background: `linear-gradient(135deg, ${getBlockAccent()} 0%, ${getBlockColor()} 100%)`,
                clipPath: 'polygon(0% 20%, 70% 0%, 100% 0%, 100% 100%, 70% 100%, 0% 80%)',
              }}
            />
          </div>

          {/* Right side notch (next block connection) */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
            <div 
              className="w-6 h-8 rounded-r-lg border-2 border-black border-l-0"
              style={{
                backgroundColor: getBlockAccent(),
                background: `linear-gradient(135deg, ${getBlockAccent()} 0%, ${getBlockColor()} 100%)`,
                clipPath: 'polygon(30% 0%, 100% 20%, 100% 80%, 30% 100%, 0% 100%, 0% 0%)',
              }}
            />
          </div>

          {/* Block content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>

        {/* Connection points overlay - only show when hovering or dragging */}
        {(isHovered || isDragging) && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top connection point */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{ backgroundColor: '#FFD700' }}
              />
            </div>
            
            {/* Bottom connection point */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{ backgroundColor: '#FFD700' }}
              />
            </div>
            
            {/* Left connection point */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{ backgroundColor: '#FFD700' }}
              />
            </div>
            
            {/* Right connection point */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{ backgroundColor: '#FFD700' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
