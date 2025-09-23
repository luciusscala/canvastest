import { Group, Line, Text, Rect } from 'react-konva';
import type { BlockRelationship } from '../utils/blockRelationships';

interface DayIndicatorsProps {
  relationship: BlockRelationship;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function DayIndicators({ relationship, x, y, width, height }: DayIndicatorsProps) {
  // Get all unique days from the relationship
  const days = getUniqueDays(relationship);
  
  if (days.length <= 1) {
    return null; // Don't show indicators for single day trips
  }

  // Calculate day positions
  const dayWidth = width / days.length;
  const indicatorHeight = 20;
  const indicatorY = y - indicatorHeight - 5; // Position above the blocks

  return (
    <Group>
      {/* Background for day indicators */}
      <Rect
        x={x}
        y={indicatorY}
        width={width}
        height={indicatorHeight}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="#e5e7eb"
        strokeWidth={1}
        cornerRadius={4}
        listening={false}
      />
      
      {/* Day separators and labels */}
      {days.map((day, index) => {
        const dayX = x + (index * dayWidth);
        const isLastDay = index === days.length - 1;
        
        return (
          <Group key={day.dateString}>
            {/* Vertical separator line (except for last day) */}
            {!isLastDay && (
              <Line
                points={[dayX + dayWidth, indicatorY, dayX + dayWidth, indicatorY + indicatorHeight]}
                stroke="#d1d5db"
                strokeWidth={1}
                listening={false}
              />
            )}
            
            {/* Day label - single line, no duplicate numbers */}
            <Text
              x={dayX + 8}
              y={indicatorY + 6}
              text={day.label}
              fontSize={10}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#6b7280"
              fontStyle="bold"
              width={dayWidth - 16}
              align="center"
              listening={false}
            />
          </Group>
        );
      })}
      
      {/* Connection lines from indicators to blocks */}
      {days.map((day, index) => {
        const dayX = x + (index * dayWidth) + (dayWidth / 2);
        
        return (
          <Line
            key={`connection-${day.dateString}`}
            points={[dayX, indicatorY + indicatorHeight, dayX, y]}
            stroke="#d1d5db"
            strokeWidth={1}
            dash={[2, 2]}
            listening={false}
          />
        );
      })}
    </Group>
  );
}

// Helper function to get unique days from a relationship
function getUniqueDays(relationship: BlockRelationship): DayInfo[] {
  const dayMap = new Map<string, DayInfo>();
  
  // Add parent block days
  addDaysFromBlock(relationship.parent, dayMap);
  
  // Add children block days
  relationship.children.forEach(child => {
    addDaysFromBlock(child, dayMap);
  });
  
  // Sort days by date
  return Array.from(dayMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Helper function to add days from a block to the day map
function addDaysFromBlock(block: any, dayMap: Map<string, DayInfo>) {
  if (block.dateRange) {
    const startDate = block.dateRange.start;
    const endDate = block.dateRange.end;
    
    // Add start day
    const startDayKey = startDate.toDateString();
    if (!dayMap.has(startDayKey)) {
      dayMap.set(startDayKey, {
        date: startDate,
        dateString: startDayKey,
        label: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayNumber: startDate.getDate().toString()
      });
    }
    
    // Add end day if different
    const endDayKey = endDate.toDateString();
    if (endDayKey !== startDayKey && !dayMap.has(endDayKey)) {
      dayMap.set(endDayKey, {
        date: endDate,
        dateString: endDayKey,
        label: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayNumber: endDate.getDate().toString()
      });
    }
    
    // Add intermediate days for multi-day blocks
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    while (currentDate < endDate) {
      const dayKey = currentDate.toDateString();
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          date: new Date(currentDate),
          dateString: dayKey,
          label: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dayNumber: currentDate.getDate().toString()
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
}

interface DayInfo {
  date: Date;
  dateString: string;
  label: string;
  dayNumber: string;
}
