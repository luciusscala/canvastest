import React from 'react';
import type { TravelBlock } from '../types/index';

interface TimelineBlockProps {
  block: TravelBlock;
  isSelected?: boolean;
  isHovered?: boolean;
  isDragging?: boolean;
  children?: React.ReactNode;
}

export function TimelineBlock({ 
  block, 
  isSelected = false, 
  isHovered = false, 
  isDragging = false,
  children 
}: TimelineBlockProps) {
  const PIXELS_PER_DAY = 60; // Each day is 60 pixels wide
  const EVENT_BLOCK_WIDTH = 80; // Width of the thick event blocks
  const TIMELINE_HEIGHT = 16; // Height of the thin connecting line (increased for visibility)
  const totalWidth = Math.max(240, block.duration * PIXELS_PER_DAY); // Total width including duration (increased minimum)

  const getBlockColor = () => {
    switch (block.type) {
      case 'flight': return '#E74C3C'; // Red-brown like in the image
      case 'hotel': return '#2ECC71'; // Light green like in the image
      case 'activity': return '#3498DB'; // Blue like in the image
      default: return '#95A5A6';
    }
  };

  const getBlockAccent = () => {
    switch (block.type) {
      case 'flight': return '#C0392B'; // Darker red
      case 'hotel': return '#27AE60'; // Darker green
      case 'activity': return '#2980B9'; // Darker blue
      default: return '#7F8C8D';
    }
  };

  // For activities, render as a simple block (no timeline)
  if (block.type === 'activity') {
    return (
      <div
        className={`
          relative cursor-move select-none
          ${isDragging ? 'opacity-80 scale-105 z-50' : ''}
          transition-all duration-200 ease-out
        `}
        style={{
          left: block.x,
          top: block.y,
        }}
      >
        <div 
          className="relative text-white font-medium"
          style={{ 
            width: `${EVENT_BLOCK_WIDTH}px`,
            filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }}
        >
          <div
            className="relative px-3 py-2 rounded-lg border-2 border-black"
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
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For flights and hotels, render as timeline blocks
  return (
    <div
      className={`
        relative cursor-move select-none
        ${isDragging ? 'opacity-80 scale-105 z-50' : ''}
        transition-all duration-200 ease-out
      `}
      style={{
        left: block.x,
        top: block.y,
      }}
    >
      {/* Content above the timeline */}
      <div className="absolute -top-12 left-0 w-full text-center">
        {children}
      </div>
      
      <div 
        className="relative text-white font-medium"
        style={{ 
          width: `${totalWidth}px`,
          filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
        }}
      >
        {/* Start Event Block (Check-in, Takeoff) - Thick block */}
        <div
          className="absolute left-0 top-0 px-3 py-2 rounded-lg border-2 border-black"
          style={{
            width: `${EVENT_BLOCK_WIDTH}px`,
            height: `${EVENT_BLOCK_WIDTH}px`,
            backgroundColor: getBlockColor(),
            background: `linear-gradient(135deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.3),
              inset 0 -1px 0 rgba(0,0,0,0.2),
              0 2px 4px rgba(0,0,0,0.1)
            `,
            zIndex: 2,
          }}
        >
          <div className="text-xs font-bold text-black">
            {block.type === 'flight' ? 'TAKEOFF' : 'CHECK-IN'}
          </div>
        </div>

        {/* Thin horizontal connecting line */}
        <div
          className="absolute border-2 border-black rounded"
          style={{
            left: `${EVENT_BLOCK_WIDTH}px`,
            top: `${(EVENT_BLOCK_WIDTH - TIMELINE_HEIGHT) / 2}px`,
            width: `${totalWidth - 2 * EVENT_BLOCK_WIDTH}px`,
            height: `${TIMELINE_HEIGHT}px`,
            backgroundColor: getBlockColor(),
            background: `linear-gradient(90deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
            zIndex: 1,
            minWidth: '20px', // Ensure minimum width for visibility
          }}
        />

        {/* End Event Block (Check-out, Landing) - Thick block */}
        <div
          className="absolute top-0 px-3 py-2 rounded-lg border-2 border-black"
          style={{
            left: `${totalWidth - EVENT_BLOCK_WIDTH}px`,
            width: `${EVENT_BLOCK_WIDTH}px`,
            height: `${EVENT_BLOCK_WIDTH}px`,
            backgroundColor: getBlockColor(),
            background: `linear-gradient(135deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.3),
              inset 0 -1px 0 rgba(0,0,0,0.2),
              0 2px 4px rgba(0,0,0,0.1)
            `,
            zIndex: 2,
          }}
        >
          <div className="text-xs font-bold text-black">
            {block.type === 'flight' ? 'LANDING' : 'CHECK-OUT'}
          </div>
        </div>

        {/* Connection points overlay - only show when hovering or dragging */}
        {(isHovered || isDragging) && (
          <div className="absolute inset-0 pointer-events-none">
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
