import { useRef, useState, useCallback } from 'react';
import { DndContext, type DragEndEvent, useDndMonitor } from '@dnd-kit/core';
import { useCanvasStore } from '../store/useCanvasStore';
import { DraggableBlock } from './DraggableBlock';
import { DotGrid } from './DotGrid';
import { TemporalMarkers } from './TemporalMarkers';
import { findNearbyConnectionPoints, calculateSnapPosition } from '../utils/blockConnections';

interface CanvasProps {
  children?: React.ReactNode;
}

// Inner component that uses useDndMonitor
function CanvasContent({ children }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const { blocks } = useCanvasStore();

  // Monitor drag state from @dnd-kit
  useDndMonitor({
    onDragStart: () => {
      setIsDragActive(true);
    },
    onDragEnd: () => {
      setIsDragActive(false);
    },
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isDragActive) return;
    
    // Only start panning if the target is the canvas itself, not a child element
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragActive]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isDragActive) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, isDragActive, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    if (!isDragActive) {
      setIsDragging(false);
    }
  }, [isDragActive]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;

    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale + delta))
    }));
  }, []);

  return (
    <div
      ref={canvasRef}
      className="w-full h-screen overflow-hidden bg-white cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Figma Jam-style dot grid background */}
      <DotGrid spacing={20} dotSize={1} />
      
      {/* Temporal markers */}
      <TemporalMarkers transform={transform} />
      
      <div
        className="origin-top-left relative"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {children}

        {/* Render draggable blocks */}
        {blocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}

// Main Canvas component that provides DndContext
export function Canvas({ children }: CanvasProps) {
  const { updateBlock, getBlock, blocks } = useCanvasStore();

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    if (delta) {
      const block = getBlock(active.id as string);
      if (block) {
        const newX = block.x + delta.x;
        const newY = block.y + delta.y;
        
        // Create a temporary block with new position
        const tempBlock = { ...block, x: newX, y: newY };
        
        // Find nearby connection points
        const nearbyPoints = findNearbyConnectionPoints(tempBlock, blocks);
        
        if (nearbyPoints.length > 0) {
          // Snap to the closest connection point
          const closestPoint = nearbyPoints[0];
          const snapPosition = calculateSnapPosition(
            tempBlock,
            closestPoint,
            'start-to-end' // Default snap type
          );
          
          updateBlock(block.id, {
            x: snapPosition.x,
            y: snapPosition.y,
          });
        } else {
          // Regular grid snapping to 20px grid
          const snappedX = Math.round(newX / 20) * 20;
          const snappedY = Math.round(newY / 20) * 20;

          updateBlock(block.id, {
            x: snappedX,
            y: snappedY,
          });
        }
      }
    }
  }, [getBlock, updateBlock, blocks]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <CanvasContent>{children}</CanvasContent>
    </DndContext>
  );
}