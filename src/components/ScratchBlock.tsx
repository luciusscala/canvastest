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
  const getBlockColor = () => {
    switch (block.type) {
      case 'flight': return 'bg-blue-500';
      case 'hotel': return 'bg-green-500';
      case 'activity': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getBlockAccent = () => {
    switch (block.type) {
      case 'flight': return 'bg-blue-600';
      case 'hotel': return 'bg-green-600';
      case 'activity': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div
      className={`
        relative cursor-move select-none
        ${isDragging ? 'opacity-50 scale-105' : ''}
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isHovered ? 'ring-2 ring-blue-300' : ''}
        transition-all duration-200
      `}
      style={{
        left: block.x,
        top: block.y,
      }}
    >
      {/* Main block body with Scratch-like shape */}
      <div className={`
        relative ${getBlockColor()} text-white rounded-lg shadow-lg
        min-w-48 px-4 py-3
        border-2 border-black
      `}>
        {/* Top notch (input) */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className={`
            w-6 h-4 ${getBlockAccent()} rounded-t-lg
            border-2 border-black border-b-0
          `} />
        </div>

        {/* Bottom notch (output) */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className={`
            w-6 h-4 ${getBlockAccent()} rounded-b-lg
            border-2 border-black border-t-0
          `} />
        </div>

        {/* Left side notch (previous block connection) */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
          <div className={`
            w-4 h-6 ${getBlockAccent()} rounded-l-lg
            border-2 border-black border-r-0
          `} />
        </div>

        {/* Right side notch (next block connection) */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
          <div className={`
            w-4 h-6 ${getBlockAccent()} rounded-r-lg
            border-2 border-black border-l-0
          `} />
        </div>

        {/* Block content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Connection points overlay */}
        {(isHovered || isDragging) && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top connection point */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
            
            {/* Bottom connection point */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
            
            {/* Left connection point */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
            
            {/* Right connection point */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
