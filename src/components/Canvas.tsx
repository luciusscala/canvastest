import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Text, Line } from 'react-konva';
import { useCanvasStore } from '../store/useCanvasStore';
import { DraggableBlock } from './DraggableBlock';
import { FlightBlock } from './FlightBlock';
import { HotelBlock } from './HotelBlock';
import { ActivityBlock } from './ActivityBlock';
import { SnappingIndicator } from './SnappingIndicator';
import type { FlightBlock as FlightBlockType, FlightSegment, HotelBlock as HotelBlockType, HotelEvent, ActivityBlock as ActivityBlockType } from '../types/index';

// Efficient grid that covers the entire viewport
function SimpleGrid({ stageWidth, stageHeight, spacing = 20 }: { stageWidth: number; stageHeight: number; spacing?: number }) {
  const lines = [];
  
  // Calculate grid bounds based on current viewport
  const gridSize = Math.max(stageWidth, stageHeight) * 2; // 2x viewport for panning
  const startX = -gridSize / 2;
  const startY = -gridSize / 2;
  const endX = gridSize / 2;
  const endY = gridSize / 2;

  // Vertical lines
  for (let x = startX; x <= endX; x += spacing) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
        listening={false} // Don't interfere with mouse events
      />
    );
  }

  // Horizontal lines
  for (let y = startY; y <= endY; y += spacing) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
        listening={false} // Don't interfere with mouse events
      />
    );
  }

  return lines;
}

export function Canvas() {
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });

  const { blocks, addBlock } = useCanvasStore();

  // Callback to communicate drag state to blocks
  const handleBlockDragStart = useCallback(() => {
    setIsDraggingBlock(true);
  }, []);

  const handleBlockDragEnd = useCallback(() => {
    setIsDraggingBlock(false);
  }, []);

  // Create a sample flight block
  const createFlightBlock = useCallback((x: number, y: number): FlightBlockType => {
    const segments: FlightSegment[] = [
      {
        id: `segment-${Date.now()}-1`,
        startTime: 0, // Day 0, 8:00 AM
        duration: 2.5, // 2.5 hours
        type: 'outbound',
        flightNumber: 'AA123',
        departure: 'JFK',
        arrival: 'LAX',
        label: 'AA123'
      },
      {
        id: `segment-${Date.now()}-2`,
        startTime: 24, // Day 1, 8:00 AM
        duration: 1.5, // 1.5 hours
        type: 'connecting',
        flightNumber: 'AA456',
        departure: 'LAX',
        arrival: 'SFO',
        label: 'AA456'
      },
      {
        id: `segment-${Date.now()}-3`,
        startTime: 162.5, // Day 6, 6:30 PM (near end of 7-day period)
        duration: 5.5, // 5.5 hours
        type: 'return',
        flightNumber: 'AA789',
        departure: 'SFO',
        arrival: 'JFK',
        label: 'AA789'
      }
    ];

    return {
      id: `flight-${Date.now()}`,
      type: 'flight',
      x: x,
      y: y,
      width: 800, // Much wider
      height: 150, // Much taller
      title: 'Flight Block',
      totalHours: 168, // 7 days = 168 hours
      segments,
      contextBarHeight: 24, // Taller context bar
      segmentHeight: 80, // Much taller segments
      departureAirport: 'JFK',
      arrivalAirport: 'JFK',
      color: '#f3f4f6'
    };
  }, []);

  // Create a sample hotel block
  const createHotelBlock = useCallback((x: number, y: number): HotelBlockType => {
    const events: HotelEvent[] = [
      {
        id: `event-${Date.now()}-1`,
        type: 'checkin',
        date: 'Dec 15',
        hotelName: 'Grand Hotel'
      },
      {
        id: `event-${Date.now()}-2`,
        type: 'checkout',
        date: 'Dec 18',
        hotelName: 'Grand Hotel'
      }
    ];

    return {
      id: `hotel-${Date.now()}`,
      type: 'hotel',
      x: x,
      y: y,
      width: 600, // Wider for hotel stays
      height: 100,
      title: 'Hotel Block',
      totalDays: 3, // 3-day stay
      events,
      contextBarHeight: 20,
      eventHeight: 60,
      hotelName: 'Grand Hotel',
      location: 'San Francisco',
      color: '#f3f4f6'
    };
  }, []);

  // Create a sample activity block
  const createActivityBlock = useCallback((x: number, y: number): ActivityBlockType => {
    const duration = Math.random() * 4 + 1; // 1-5 hours
    const width = duration * 60; // Scale width based on duration (60px per hour)
    
    const activities = [
      { name: 'Museum Visit', type: 'sightseeing', color: '#8b5cf6' },
      { name: 'Restaurant Dinner', type: 'dining', color: '#f59e0b' },
      { name: 'Shopping', type: 'shopping', color: '#10b981' },
      { name: 'City Tour', type: 'sightseeing', color: '#3b82f6' },
      { name: 'Beach Time', type: 'leisure', color: '#06b6d4' }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];

    return {
      id: `activity-${Date.now()}`,
      type: 'activity',
      x: x,
      y: y,
      width: width,
      height: 60, // Fixed height
      title: activity.name,
      duration: Math.round(duration * 10) / 10, // Round to 1 decimal
      activityType: activity.type,
      location: 'San Francisco',
      color: activity.color
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle stage drag (panning) - only when not dragging blocks
  const handleStageDragStart = useCallback(() => {
    // Only start panning if we're not dragging a block
    if (isDraggingBlock) return;
    
    setIsPanning(true);
    setLastPointerPosition(stageRef.current.getPointerPosition());
  }, [isDraggingBlock]);

  const handleStageDragMove = useCallback(() => {
    if (!isPanning || isDraggingBlock) return;

    const stage = stageRef.current;
    const newPos = stage.getPointerPosition();
    const deltaX = newPos.x - lastPointerPosition.x;
    const deltaY = newPos.y - lastPointerPosition.y;

    // Apply pan sensitivity reduction
    const panSensitivity = 0.6; // Much lower = much less sensitive (0.5-1.0 range)
    const adjustedDeltaX = deltaX * panSensitivity;
    const adjustedDeltaY = deltaY * panSensitivity;

    // Update stage position directly for smooth panning
    stage.x(stage.x() + adjustedDeltaX);
    stage.y(stage.y() + adjustedDeltaY);
    
    // Update state for consistency
    setStagePosition({
      x: stage.x(),
      y: stage.y()
    });

    setLastPointerPosition(newPos);
  }, [isPanning, isDraggingBlock, lastPointerPosition]);

  const handleStageDragEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel zoom - default sensitivity
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.1; // Default Konva sensitivity
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const deltaY = e.evt.deltaY;
    const scaleFactor = deltaY > 0 ? scaleBy : 1 / scaleBy;
    
    const newScale = oldScale * scaleFactor;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));

    setStageScale(clampedScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  // Handle double click to add blocks
  const handleStageClick = useCallback((e: any) => {
    if (e.evt.detail === 2) { // Double click
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      
      // Convert stage coordinates to world coordinates
      const x = (pointer.x - stagePosition.x) / stageScale;
      const y = (pointer.y - stagePosition.y) / stageScale;
      
      // Snap to grid
      const snappedX = Math.round(x / 20) * 20;
      const snappedY = Math.round(y / 20) * 20;

      // Cycle through regular blocks, flight blocks, hotel blocks, and activity blocks
      const blockType = blocks.length % 4;
      if (blockType === 0) {
        // Create a regular block
        const newBlock = {
          id: `block-${Date.now()}`,
          x: snappedX,
          y: snappedY,
          width: 120,
          height: 60,
          title: `Block ${blocks.length + 1}`,
          color: `hsl(${(blocks.length * 137.5) % 360}, 70%, 80%)`,
        };
        addBlock(newBlock);
      } else if (blockType === 1) {
        // Create a flight block
        const flightBlock = createFlightBlock(snappedX, snappedY);
        addBlock(flightBlock);
      } else if (blockType === 2) {
        // Create a hotel block
        const hotelBlock = createHotelBlock(snappedX, snappedY);
        addBlock(hotelBlock);
      } else {
        // Create an activity block
        const activityBlock = createActivityBlock(snappedX, snappedY);
        addBlock(activityBlock);
      }
    }
  }, [stagePosition, stageScale, addBlock, blocks.length, createFlightBlock, createHotelBlock, createActivityBlock]);



  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200 z-10">
        <p className="text-sm text-gray-600">
          <strong>Canvas Controls:</strong><br />
          • Double-click to add blocks<br />
          • Drag to pan, scroll to zoom<br />
          • Drag blocks to move them
        </p>
      </div>

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={!isDraggingBlock}
        onDragStart={handleStageDragStart}
        onDragMove={handleStageDragMove}
        onDragEnd={handleStageDragEnd}
        onWheel={handleWheel}
        onClick={handleStageClick}
        className={isDraggingBlock ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
      >
        <Layer>
          {/* Grid background */}
          <SimpleGrid stageWidth={stageSize.width} stageHeight={stageSize.height} />
          
          {/* Instructions text */}
          <Text
            x={20}
            y={20}
            text="Double-click to add blocks • Drag to pan • Scroll to zoom"
            fontSize={14}
            fill="#64748b"
            listening={false}
          />
          
          {/* Render blocks */}
          {blocks.map((block) => {
            if ('type' in block && block.type === 'flight') {
              return (
                <FlightBlock
                  key={block.id}
                  block={block as FlightBlockType}
                  onDragStart={handleBlockDragStart}
                  onDragEnd={handleBlockDragEnd}
                />
              );
            } else if ('type' in block && block.type === 'hotel') {
              return (
                <HotelBlock
                  key={block.id}
                  block={block as HotelBlockType}
                  onDragStart={handleBlockDragStart}
                  onDragEnd={handleBlockDragEnd}
                />
              );
            } else if ('type' in block && block.type === 'activity') {
              return (
                <ActivityBlock
                  key={block.id}
                  block={block as ActivityBlockType}
                  onDragStart={handleBlockDragStart}
                  onDragEnd={handleBlockDragEnd}
                />
              );
            } else {
              return (
                <DraggableBlock 
                  key={block.id} 
                  block={block}
                  onDragStart={handleBlockDragStart}
                  onDragEnd={handleBlockDragEnd}
                />
              );
            }
          })}
        </Layer>
      </Stage>

    </div>
  );
}