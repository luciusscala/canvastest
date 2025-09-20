import { Group, Rect, Text, Circle } from 'react-konva';
import type { Conflict } from '../types/index';

interface ConflictIndicatorProps {
  conflicts: Conflict[];
  x: number;
  y: number;
  width: number;
  height: number;
}

const CONFLICT_COLORS = {
  error: '#ef4444',    // Red
  warning: '#f59e0b',  // Orange
  info: '#3b82f6',     // Blue
};

export function ConflictIndicator({ conflicts, x, y, width, height }: ConflictIndicatorProps) {
  if (conflicts.length === 0) return null;

  const errorConflicts = conflicts.filter(c => c.severity === 'error');
  const warningConflicts = conflicts.filter(c => c.severity === 'warning');
  const infoConflicts = conflicts.filter(c => c.severity === 'info');

  return (
    <Group>
      {/* Background highlight for conflicts */}
      <Rect
        x={x - 2}
        y={y - 2}
        width={width + 4}
        height={height + 4}
        fill="rgba(239, 68, 68, 0.1)"
        stroke={errorConflicts.length > 0 ? CONFLICT_COLORS.error : CONFLICT_COLORS.warning}
        strokeWidth={2}
        dash={[5, 5]}
        cornerRadius={4}
        listening={false}
      />
      
      {/* Conflict indicators */}
      {errorConflicts.length > 0 && (
        <Circle
          x={x + width - 10}
          y={y + 10}
          radius={6}
          fill={CONFLICT_COLORS.error}
          listening={false}
        />
      )}
      
      {warningConflicts.length > 0 && errorConflicts.length === 0 && (
        <Circle
          x={x + width - 10}
          y={y + 10}
          radius={6}
          fill={CONFLICT_COLORS.warning}
          listening={false}
        />
      )}
      
      {/* Conflict count */}
      <Text
        x={x + width - 8}
        y={y + 6}
        text={conflicts.length.toString()}
        fontSize={10}
        fontFamily="Inter, system-ui, sans-serif"
        fill="white"
        fontStyle="bold"
        listening={false}
      />
    </Group>
  );
}
