import { Group, Rect, Text, Line } from 'react-konva';
import type { BlockRelationship } from '../utils/blockRelationships';
import { getCombinedLabelData } from '../utils/blockRelationships';

interface FloatingLabelProps {
  relationship: BlockRelationship;
  x: number;
  y: number;
  width: number;
}

export function FloatingLabel({ relationship, x, y, width }: FloatingLabelProps) {
  const labelData = getCombinedLabelData(relationship);
  const { parentLabel, childrenLabels, relationshipType } = labelData;
  
  // Calculate label height based on content
  const baseHeight = 60;
  const detailsHeight = Math.max(0, (labelData.combinedDetails.length - 1) * 16);
  const totalHeight = baseHeight + detailsHeight;
  
  // Position the label floating above the blocks
  const labelY = y - totalHeight - 20; // 20px gap above blocks
  
  // Color scheme based on relationship type
  const getColors = (type: string) => {
    switch (type) {
      case 'flight-hotel':
        return {
          background: 'rgba(254, 243, 199, 0.95)', // Light amber with transparency
          border: '#f59e0b', // Amber
          primary: '#92400e', // Dark amber
          secondary: '#a16207', // Medium amber
          accent: '#fbbf24' // Light amber
        };
      case 'hotel-activity':
        return {
          background: 'rgba(219, 234, 254, 0.95)', // Light blue with transparency
          border: '#3b82f6', // Blue
          primary: '#1e40af', // Dark blue
          secondary: '#2563eb', // Medium blue
          accent: '#60a5fa' // Light blue
        };
      case 'flight-activity':
        return {
          background: 'rgba(252, 231, 243, 0.95)', // Light pink with transparency
          border: '#ec4899', // Pink
          primary: '#be185d', // Dark pink
          secondary: '#db2777', // Medium pink
          accent: '#f472b6' // Light pink
        };
      default:
        return {
          background: 'rgba(243, 244, 246, 0.95)', // Light gray with transparency
          border: '#6b7280', // Gray
          primary: '#374151', // Dark gray
          secondary: '#4b5563', // Medium gray
          accent: '#9ca3af' // Light gray
        };
    }
  };
  
  const colors = getColors(relationshipType);
  
  // Create a more intuitive title
  const createIntuitiveTitle = () => {
    switch (relationshipType) {
      case 'flight-hotel':
        return `${parentLabel.title} + Hotel Stay`;
      case 'hotel-activity':
        return `${parentLabel.title} + Activities`;
      case 'flight-activity':
        return `${parentLabel.title} + Activities`;
      default:
        return parentLabel.title;
    }
  };
  
  // Create a summary of what's included
  const createSummary = () => {
    const parts = [];
    if (parentLabel.type === 'flight') {
      parts.push(`${parentLabel.details.length} flight${parentLabel.details.length > 1 ? 's' : ''}`);
    }
    if (childrenLabels.some(child => child.type === 'hotel')) {
      const hotelCount = childrenLabels.filter(child => child.type === 'hotel').length;
      parts.push(`${hotelCount} hotel${hotelCount > 1 ? 's' : ''}`);
    }
    if (childrenLabels.some(child => child.type === 'activity')) {
      const activityCount = childrenLabels.filter(child => child.type === 'activity').length;
      parts.push(`${activityCount} activit${activityCount > 1 ? 'ies' : 'y'}`);
    }
    return parts.join(' • ');
  };
  
  return (
    <Group>
      {/* Connection line from label to blocks */}
      <Line
        points={[x + width / 2, labelY + totalHeight, x + width / 2, y]}
        stroke={colors.border}
        strokeWidth={2}
        dash={[4, 4]}
        listening={false}
      />
      
      {/* Main label background */}
      <Rect
        x={x}
        y={labelY}
        width={width}
        height={totalHeight}
        fill={colors.background}
        stroke={colors.border}
        strokeWidth={2}
        cornerRadius={12}
        shadowColor="rgba(0, 0, 0, 0.2)"
        shadowBlur={8}
        shadowOffset={{ x: 0, y: 4 }}
        shadowOpacity={1}
        listening={false}
      />
      
      {/* Relationship type badge */}
      <Rect
        x={x + 12}
        y={labelY + 8}
        width={8}
        height={8}
        fill={colors.accent}
        cornerRadius={4}
        listening={false}
      />
      
      <Text
        x={x + 26}
        y={labelY + 6}
        text={relationshipType.replace('-', ' + ').toUpperCase()}
        fontSize={10}
        fontFamily="Inter, system-ui, sans-serif"
        fill={colors.primary}
        fontStyle="bold"
        listening={false}
      />
      
      {/* Main title */}
      <Text
        x={x + 12}
        y={labelY + 22}
        text={createIntuitiveTitle()}
        fontSize={16}
        fontFamily="Inter, system-ui, sans-serif"
        fill={colors.primary}
        fontStyle="bold"
        width={width - 24}
        wrap="none"
        ellipsis={true}
        listening={false}
      />
      
      {/* Summary */}
      <Text
        x={x + 12}
        y={labelY + 42}
        text={createSummary()}
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
        fill={colors.secondary}
        width={width - 24}
        wrap="none"
        ellipsis={true}
        listening={false}
      />
      
      {/* Key details - only show most important ones */}
      {labelData.combinedDetails.slice(0, 3).map((detail, index) => {
        const detailY = labelY + 58 + (index * 16);
        
        return (
          <Group key={index}>
            {/* Detail indicator */}
            <Rect
              x={x + 12}
              y={detailY + 4}
              width={4}
              height={4}
              fill={colors.accent}
              cornerRadius={2}
              listening={false}
            />
            
            {/* Detail text */}
            <Text
              x={x + 22}
              y={detailY}
              text={formatDetailText(detail, relationshipType)}
              fontSize={11}
              fontFamily="Inter, system-ui, sans-serif"
              fill={colors.primary}
              width={width - 34}
              wrap="none"
              ellipsis={true}
              listening={false}
            />
          </Group>
        );
      })}
      
      {/* Show more indicator if there are more details */}
      {labelData.combinedDetails.length > 3 && (
        <Text
          x={x + 12}
          y={labelY + 58 + (3 * 16)}
          text={`+${labelData.combinedDetails.length - 3} more`}
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

// Format detail text in a more concise way
function formatDetailText(detail: any, relationshipType: string): string {
  if (detail.flightNumber) {
    return `${detail.flightNumber} (${detail.route})`;
  }
  
  if (detail.hotelName) {
    return `${detail.type} - ${detail.hotelName}`;
  }
  
  if (detail.location) {
    return `${detail.type} at ${detail.location}`;
  }
  
  return detail.type || 'Detail';
}
