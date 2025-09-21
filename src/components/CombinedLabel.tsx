import { Group, Rect, Text } from 'react-konva';
import type { BlockRelationship } from '../utils/blockRelationships';
import { getCombinedLabelData } from '../utils/blockRelationships';

interface CombinedLabelProps {
  relationship: BlockRelationship;
  x: number;
  y: number;
  width: number;
}

export function CombinedLabel({ relationship, x, y, width }: CombinedLabelProps) {
  const labelData = getCombinedLabelData(relationship);
  const { parentLabel, childrenLabels, combinedTitle, combinedDates, combinedDetails, relationshipType } = labelData;
  
  // Calculate label height based on content
  const baseHeight = 80;
  const detailsHeight = Math.max(0, (combinedDetails.length - 2) * 20);
  const totalHeight = baseHeight + detailsHeight;
  
  // Color scheme based on relationship type
  const getColors = (type: string) => {
    switch (type) {
      case 'flight-hotel':
        return {
          background: '#fef3c7', // Light amber
          border: '#f59e0b', // Amber
          primary: '#92400e', // Dark amber
          secondary: '#a16207' // Medium amber
        };
      case 'hotel-activity':
        return {
          background: '#dbeafe', // Light blue
          border: '#3b82f6', // Blue
          primary: '#1e40af', // Dark blue
          secondary: '#2563eb' // Medium blue
        };
      case 'flight-activity':
        return {
          background: '#fce7f3', // Light pink
          border: '#ec4899', // Pink
          primary: '#be185d', // Dark pink
          secondary: '#db2777' // Medium pink
        };
      default:
        return {
          background: '#f3f4f6', // Light gray
          border: '#6b7280', // Gray
          primary: '#374151', // Dark gray
          secondary: '#4b5563' // Medium gray
        };
    }
  };
  
  const colors = getColors(relationshipType);
  
  return (
    <Group>
      {/* Combined label background */}
      <Rect
        x={x}
        y={y - totalHeight}
        width={width}
        height={totalHeight}
        fill={colors.background}
        stroke={colors.border}
        strokeWidth={2}
        cornerRadius={8}
        shadowColor="rgba(0, 0, 0, 0.15)"
        shadowBlur={6}
        shadowOffset={{ x: 0, y: 3 }}
        shadowOpacity={1}
        listening={false}
      />
      
      {/* Relationship type indicator */}
      <Rect
        x={x + 8}
        y={y - totalHeight + 8}
        width={8}
        height={8}
        fill={colors.border}
        cornerRadius={2}
        listening={false}
      />
      
      <Text
        x={x + 22}
        y={y - totalHeight + 6}
        text={relationshipType.replace('-', ' + ').toUpperCase()}
        fontSize={10}
        fontFamily="Inter, system-ui, sans-serif"
        fill={colors.primary}
        fontStyle="bold"
        listening={false}
      />
      
      {/* Combined title */}
      <Text
        x={x + 12}
        y={y - totalHeight + 25}
        text={combinedTitle}
        fontSize={16}
        fontFamily="Inter, system-ui, sans-serif"
        fill={colors.primary}
        fontStyle="bold"
        width={width - 24}
        wrap="none"
        ellipsis={true}
        listening={false}
      />
      
      {/* Combined dates */}
      {combinedDates && (
        <Text
          x={x + 12}
          y={y - totalHeight + 45}
          text={`${combinedDates.start.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })} - ${combinedDates.end.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}`}
          fontSize={14}
          fontFamily="Inter, system-ui, sans-serif"
          fill={colors.secondary}
          width={width - 24}
          wrap="none"
          ellipsis={true}
          listening={false}
        />
      )}
      
      {/* Combined details */}
      {combinedDetails.slice(0, 4).map((detail, index) => {
        const detailY = y - totalHeight + 65 + (index * 20);
        
        return (
          <Group key={index}>
            {/* Detail type indicator */}
            <Rect
              x={x + 12}
              y={detailY + 2}
              width={6}
              height={6}
              fill={colors.border}
              cornerRadius={1}
              listening={false}
            />
            
            {/* Detail text */}
            <Text
              x={x + 24}
              y={detailY}
              text={formatDetailText(detail, relationshipType)}
              fontSize={12}
              fontFamily="Inter, system-ui, sans-serif"
              fill={colors.primary}
              width={width - 36}
              wrap="none"
              ellipsis={true}
              listening={false}
            />
          </Group>
        );
      })}
      
      {/* Show more indicator if there are more details */}
      {combinedDetails.length > 4 && (
        <Text
          x={x + 12}
          y={y - totalHeight + 65 + (4 * 20)}
          text={`+${combinedDetails.length - 4} more...`}
          fontSize={10}
          fontFamily="Inter, system-ui, sans-serif"
          fill={colors.secondary}
          fontStyle="italic"
          listening={false}
        />
      )}
    </Group>
  );
}

// Format detail text based on the detail type and relationship
function formatDetailText(detail: any, relationshipType: string): string {
  if (detail.flightNumber) {
    return `${detail.flightNumber} (${detail.route}) - ${detail.duration}h`;
  }
  
  if (detail.hotelName) {
    return `${detail.type.toUpperCase()} - ${detail.date} (${detail.hotelName})`;
  }
  
  if (detail.location) {
    return `${detail.type} at ${detail.location} - ${detail.duration}h`;
  }
  
  return detail.type || 'Detail';
}
