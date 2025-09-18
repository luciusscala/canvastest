import React from 'react';
import type { TravelBlock } from '../types/index';

// Helper function to format dates
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateRange = (startDate: Date, endDate: Date) => {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${start} - ${end}`;
};

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
  const PIXELS_PER_HOUR = 2.5; // Each hour is 2.5 pixels wide (60px per day = 2.5px per hour)
  const EVENT_BLOCK_WIDTH = 80; // Width of the thick event blocks
  const TIMELINE_HEIGHT = 16; // Height of the thin connecting line (increased for visibility)
  const totalWidth = Math.max(160, block.duration * PIXELS_PER_HOUR); // Total width based on duration in hours

  const getBlockColor = () => {
    switch (block.type) {
      case 'flight': return '#3B82F6'; // Professional blue
      case 'roundtrip-flight': return '#DC2626'; // Professional red
      case 'hotel': return '#059669'; // Professional green
      case 'activity': return '#7C3AED'; // Professional purple
      default: return '#6B7280';
    }
  };

  const getBlockAccent = () => {
    switch (block.type) {
      case 'flight': return '#1D4ED8'; // Darker blue
      case 'roundtrip-flight': return '#B91C1C'; // Darker red
      case 'hotel': return '#047857'; // Darker green
      case 'activity': return '#5B21B6'; // Darker purple
      default: return '#4B5563';
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'flight': return '✈️';
      case 'roundtrip-flight': return '🔄';
      case 'hotel': return '🏨';
      case 'activity': return '🎯';
      default: return '📅';
    }
  };

  // For activities, render as a simple block (no timeline)
  if (block.type === 'activity') {
    return (
      <div
        className={`
          relative cursor-move select-none group
          ${isDragging ? 'opacity-80 scale-105 z-50' : ''}
          transition-all duration-200 ease-out
        `}
        style={{
          left: block.x,
          top: block.y,
        }}
      >
        {/* Date indicator above the block */}
        <div className="absolute -top-8 left-0 text-xs text-gray-600 font-medium whitespace-nowrap">
          {formatDate(block.startTime)} - {formatDate(block.endTime)}
        </div>
        
        <div
          className="relative text-white font-medium"
          style={{
            width: `${EVENT_BLOCK_WIDTH}px`,
            filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }}
        >
          <div
            className="relative px-3 py-2 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-200"
            style={{
              backgroundColor: getBlockColor(),
              background: `linear-gradient(135deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.4),
                inset 0 -1px 0 rgba(0,0,0,0.2),
                0 4px 12px rgba(0,0,0,0.15)
              `,
            }}
          >
            {/* Icon */}
            <div className="absolute -top-1 -right-1 text-lg">
              {getBlockIcon()}
            </div>
            
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
        relative cursor-move select-none group
        ${isDragging ? 'opacity-80 scale-105 z-50' : ''}
        transition-all duration-200 ease-out
      `}
      style={{
        left: block.x,
        top: block.y,
      }}
    >
      {/* Date range indicator above the timeline */}
      <div className="absolute -top-8 left-0 text-xs text-gray-600 font-medium whitespace-nowrap">
        {formatDateRange(block.startTime, block.endTime)}
      </div>
      
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
        {/* Start Event Block (Check-in, Departure) - Thick block */}
        <div
          className="absolute left-0 top-0 px-3 py-2 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-200"
          style={{
            width: `${EVENT_BLOCK_WIDTH}px`,
            height: `${EVENT_BLOCK_WIDTH}px`,
            backgroundColor: getBlockColor(),
            background: `linear-gradient(135deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 -1px 0 rgba(0,0,0,0.2),
              0 4px 12px rgba(0,0,0,0.15)
            `,
            zIndex: 2,
          }}
        >
          {/* Icon */}
          <div className="absolute -top-1 -right-1 text-lg">
            {getBlockIcon()}
          </div>
          
          <div className="text-xs font-bold text-white">
            {block.type === 'roundtrip-flight' ? 'DEPARTURE' : 
             block.type === 'flight' ? 'TAKEOFF' : 'CHECK-IN'}
          </div>
        </div>

        {/* Thin horizontal connecting line - flush with top of rectangles */}
        <div
          className="absolute border-2 border-white/20 group-hover:border-white/40 rounded transition-all duration-200"
          style={{
            left: `${EVENT_BLOCK_WIDTH}px`,
            top: '0px', // Flush with the top of the thick rectangles
            width: `${totalWidth - 2 * EVENT_BLOCK_WIDTH}px`,
            height: `${TIMELINE_HEIGHT}px`,
            backgroundColor: getBlockColor(),
            background: `linear-gradient(90deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
            zIndex: 1,
            minWidth: '20px', // Ensure minimum width for visibility
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        />

        {/* End Event Block (Check-out, Return) - Thick block */}
        <div
          className="absolute top-0 px-3 py-2 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-200"
          style={{
            left: `${totalWidth - EVENT_BLOCK_WIDTH}px`,
            width: `${EVENT_BLOCK_WIDTH}px`,
            height: `${EVENT_BLOCK_WIDTH}px`,
            backgroundColor: getBlockColor(),
            background: `linear-gradient(135deg, ${getBlockColor()} 0%, ${getBlockAccent()} 100%)`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 -1px 0 rgba(0,0,0,0.2),
              0 4px 12px rgba(0,0,0,0.15)
            `,
            zIndex: 2,
          }}
        >
          {/* Icon */}
          <div className="absolute -top-1 -right-1 text-lg">
            {getBlockIcon()}
          </div>
          
          <div className="text-xs font-bold text-white">
            {block.type === 'roundtrip-flight' ? 'RETURN' : 
             block.type === 'flight' ? 'LANDING' : 'CHECK-OUT'}
          </div>
        </div>

        {/* Connection points overlay - only show when hovering or dragging */}
        {(isHovered || isDragging) && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Left connection point */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3">
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center"
                style={{ backgroundColor: '#F59E0B' }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Right connection point */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3">
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center"
                style={{ backgroundColor: '#F59E0B' }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
