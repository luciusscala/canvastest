import React, { useState, useCallback } from 'react';
import { TravelBlock } from '../types';
import { useCanvasStore } from '../store/useCanvasStore';

interface ResizableBlockProps {
  block: TravelBlock;
  children: React.ReactNode;
}

export function ResizableBlock({ block, children }: ResizableBlockProps) {
  const { updateBlock } = useCanvasStore();
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(e.currentTarget.parentElement?.offsetWidth || 0);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + deltaX); // Minimum width of 80px

    // Calculate new duration based on width change
    const originalDuration = block.endTime.getTime() - block.startTime.getTime();
    const widthRatio = newWidth / startWidth;
    const newDuration = originalDuration * widthRatio;

    const newEndTime = new Date(block.startTime.getTime() + newDuration);

    updateBlock(block.id, {
      endTime: newEndTime,
    });
  }, [isResizing, startX, startWidth, block, updateBlock]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners when resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative">
      {children}
      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-white hover:bg-opacity-30"
        onMouseDown={handleResizeStart}
        style={{ right: '-1px' }}
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white bg-opacity-50 rounded-sm" />
      </div>
    </div>
  );
}