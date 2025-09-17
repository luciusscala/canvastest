import React from 'react';
import type { TravelBlock } from '../types/index';
import { getConnectionPoints, canConnect, findNearbyConnectionPoints } from '../utils/blockConnections';

interface BlockConnectionsProps {
  blocks: TravelBlock[];
  draggedBlockId?: string;
  hoveredBlockId?: string;
}

export function BlockConnections({ blocks, draggedBlockId, hoveredBlockId }: BlockConnectionsProps) {
  const draggedBlock = blocks.find(b => b.id === draggedBlockId);
  const hoveredBlock = blocks.find(b => b.id === hoveredBlockId);

  // Get all connection points
  const allConnectionPoints = blocks.flatMap(block => getConnectionPoints(block));

  // Find nearby points when dragging
  const nearbyPoints = draggedBlock 
    ? findNearbyConnectionPoints(draggedBlock, blocks)
    : [];

  // Find connections between blocks
  const connections: Array<{ from: TravelBlock; to: TravelBlock }> = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      if (canConnect(blocks[i], blocks[j])) {
        connections.push({ from: blocks[i], to: blocks[j] });
      }
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Connection lines between compatible blocks */}
      {connections.map((connection, index) => {
        const fromPoints = getConnectionPoints(connection.from);
        const toPoints = getConnectionPoints(connection.to);
        
        // Find the closest connection points
        let minDistance = Infinity;
        let bestFrom = fromPoints[0];
        let bestTo = toPoints[0];
        
        for (const fromPoint of fromPoints) {
          for (const toPoint of toPoints) {
            const distance = Math.sqrt(
              Math.pow(fromPoint.x - toPoint.x, 2) + 
              Math.pow(fromPoint.y - toPoint.y, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              bestFrom = fromPoint;
              bestTo = toPoint;
            }
          }
        }

        return (
          <svg
            key={`connection-${index}`}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1 }}
          >
            <line
              x1={bestFrom.x}
              y1={bestFrom.y}
              x2={bestTo.x}
              y2={bestTo.y}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>
        );
      })}

      {/* Snap zone indicators when dragging */}
      {nearbyPoints.map((point) => (
        <div
          key={point.id}
          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"
          style={{
            left: point.x - 8,
            top: point.y - 8,
            zIndex: 10,
          }}
        />
      ))}

      {/* Connection points on hovered block */}
      {hoveredBlock && (
        <>
          {getConnectionPoints(hoveredBlock).map((point) => (
            <div
              key={`hover-${point.id}`}
              className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
              style={{
                left: point.x - 6,
                top: point.y - 6,
                zIndex: 5,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
