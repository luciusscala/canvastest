import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useCanvasStore } from '../store/useCanvasStore';
import { DraggableBlock } from './DraggableBlock';

// Simple grid with limited lines to prevent recursion
function SimpleGrid() {
  const lines = [];
  const spacing = 50; // Larger spacing
  const width = 1000;
  const height = 1000;

  // Only create a few lines to test
  for (let i = 0; i <= width; i += spacing) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, height]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
      />
    );
  }

  for (let i = 0; i <= height; i += spacing) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, width, i]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
      />
    );
  }

  return lines;
}

export function Canvas() {
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const { blocks, addBlock } = useCanvasStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle double click to add blocks
  const handleStageClick = useCallback((e: any) => {
    if (e.evt.detail === 2) { // Double click
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      
      // Create a new block
      const newBlock = {
        id: `block-${Date.now()}`,
        x: pointer.x - 60,
        y: pointer.y - 30,
        width: 120,
        height: 60,
        title: `Block ${blocks.length + 1}`,
        color: `hsl(${(blocks.length * 137.5) % 360}, 70%, 80%)`,
      };

      addBlock(newBlock);
    }
  }, [addBlock, blocks.length]);

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
        onClick={handleStageClick}
      >
        <Layer>
          {/* Simple grid */}
          <SimpleGrid />
          
          {/* Simple test text */}
          <Text
            x={20}
            y={20}
            text="Double-click to add blocks"
            fontSize={16}
            fill="black"
          />
          
          {/* Render draggable blocks */}
          {blocks.map((block) => (
            <DraggableBlock key={block.id} block={block} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}