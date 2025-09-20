import { Rect, Group, Text } from 'react-konva';
import type { SnappingResult, EnhancedSnappingResult } from '../utils/snapping';
import { ConflictIndicator } from './ConflictIndicator';
import { ValidDropZone } from './ValidDropZone';

interface SnappingIndicatorProps {
  snappingResult: SnappingResult | EnhancedSnappingResult;
  blockWidth: number;
  blockHeight: number;
}

export function SnappingIndicator({ snappingResult, blockWidth, blockHeight }: SnappingIndicatorProps) {
  const { snapX, snapY, snapType } = snappingResult;
  const enhancedResult = snappingResult as EnhancedSnappingResult;
  const validation = enhancedResult.validation;

  // Different colors for different snap types
  const snapColors: Record<string, string> = {
    hotel: '#10b981', // Green for hotel snapping
    activity: '#3b82f6', // Blue for activity snapping
    flight: '#dc2626', // Red for flight snapping
    none: '#6b7280' // Gray for no snapping
  };

  const color = snapColors[snapType] || snapColors.none;

  return (
    <Group>
      {/* Show valid drop zone if available */}
      {validation && 'suggestedPosition' in validation && validation.suggestedPosition && validation.canSnap && (
        <ValidDropZone
          position={validation.suggestedPosition}
          y={snapY}
          height={blockHeight}
          isValid={true}
          message={`Snap to ${snapType}`}
        />
      )}
      
      {/* Show conflict indicators if there are conflicts */}
      {validation?.conflicts && validation.conflicts.length > 0 && (
        <ConflictIndicator
          conflicts={validation.conflicts}
          x={snapX}
          y={snapY}
          width={blockWidth}
          height={blockHeight}
        />
      )}
      
      {/* Snap target outline (only if shouldSnap is true) */}
      {snappingResult.shouldSnap && (
        <>
          <Rect
            x={snapX}
            y={snapY}
            width={blockWidth}
            height={blockHeight}
            stroke={color}
            strokeWidth={3}
            dash={[5, 5]}
            fill="transparent"
            cornerRadius={6}
            listening={false}
          />
          
          {/* Snap indicator dot */}
          <Rect
            x={snapX + blockWidth / 2 - 4}
            y={snapY + blockHeight / 2 - 4}
            width={8}
            height={8}
            fill={color}
            cornerRadius={4}
            listening={false}
          />
          
          {/* Snap type label */}
          <Text
            x={snapX + 5}
            y={snapY - 20}
            text={`Snap to ${snapType}`}
            fontSize={12}
            fontFamily="Inter, system-ui, sans-serif"
            fill={color}
            fontStyle="bold"
            listening={false}
          />
        </>
      )}
    </Group>
  );
}
