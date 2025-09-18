import { Rect, Group } from 'react-konva';
import type { SnappingResult } from '../utils/snapping';

interface SnappingIndicatorProps {
  snappingResult: SnappingResult;
  blockWidth: number;
  blockHeight: number;
}

export function SnappingIndicator({ snappingResult, blockWidth, blockHeight }: SnappingIndicatorProps) {
  if (!snappingResult.shouldSnap) {
    return null;
  }

  const { snapX, snapY, snapType } = snappingResult;

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
      {/* Snap target outline */}
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
    </Group>
  );
}
