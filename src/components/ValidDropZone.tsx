import { Group, Rect, Text, Line } from 'react-konva';
import type { BlockPosition } from '../types/index';

interface ValidDropZoneProps {
  position: BlockPosition;
  y: number;
  height: number;
  isValid: boolean;
  message?: string;
}

export function ValidDropZone({ position, y, height, isValid, message }: ValidDropZoneProps) {
  if (!isValid) return null;

  return (
    <Group>
      {/* Valid drop zone highlight */}
      <Rect
        x={position.x}
        y={y}
        width={position.width}
        height={height}
        fill="rgba(34, 197, 94, 0.1)"
        stroke="#22c55e"
        strokeWidth={2}
        dash={[8, 4]}
        cornerRadius={4}
        listening={false}
      />
      
      {/* Drop zone label */}
      <Rect
        x={position.x}
        y={y - 25}
        width={Math.max(position.width, 120)}
        height={20}
        fill="rgba(34, 197, 94, 0.9)"
        cornerRadius={10}
        listening={false}
      />
      
      <Text
        x={position.x + 10}
        y={y - 20}
        text={message || "Valid drop zone"}
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
        fill="white"
        fontStyle="bold"
        listening={false}
      />
      
      {/* Time duration indicator */}
      <Text
        x={position.x + 5}
        y={y + height + 5}
        text={`${Math.round(position.durationHours * 10) / 10}h`}
        fontSize={10}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#22c55e"
        fontStyle="bold"
        listening={false}
      />
    </Group>
  );
}
