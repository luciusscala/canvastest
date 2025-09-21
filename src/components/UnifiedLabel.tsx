import { Group, Rect, Text, Line } from 'react-konva';
import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock } from '../types/index';
import type { BlockRelationship } from '../utils/blockRelationships';

interface UnifiedLabelProps {
  block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock;
  relationship?: BlockRelationship | null;
  x: number;
  y: number;
  width: number;
}

// Color scheme for different block types
const BLOCK_COLORS = {
  flight: {
    primary: '#dc2626',    // Red
    secondary: '#fef2f2',  // Light red
    accent: '#fca5a5',     // Medium red
    text: '#991b1b',       // Dark red
    textSecondary: '#7f1d1d' // Darker red
  },
  hotel: {
    primary: '#059669',    // Green
    secondary: '#f0fdf4',  // Light green
    accent: '#86efac',     // Medium green
    text: '#064e3b',       // Dark green
    textSecondary: '#052e16' // Darker green
  },
  activity: {
    primary: '#3b82f6',    // Blue
    secondary: '#eff6ff',  // Light blue
    accent: '#93c5fd',     // Medium blue
    text: '#1e40af',       // Dark blue
    textSecondary: '#1e3a8a' // Darker blue
  },
  regular: {
    primary: '#6b7280',    // Gray
    secondary: '#f9fafb',  // Light gray
    accent: '#d1d5db',     // Medium gray
    text: '#374151',       // Dark gray
    textSecondary: '#1f2937' // Darker gray
  }
};

// Relationship color schemes
const RELATIONSHIP_COLORS = {
  'flight-hotel': {
    primary: '#f59e0b',    // Amber
    secondary: '#fffbeb',  // Light amber
    accent: '#fcd34d',     // Medium amber
    text: '#92400e',       // Dark amber
    textSecondary: '#78350f' // Darker amber
  },
  'hotel-activity': {
    primary: '#8b5cf6',    // Purple
    secondary: '#faf5ff',  // Light purple
    accent: '#c4b5fd',     // Medium purple
    text: '#6b21a8',       // Dark purple
    textSecondary: '#581c87' // Darker purple
  },
  'flight-activity': {
    primary: '#ec4899',    // Pink
    secondary: '#fdf2f8',  // Light pink
    accent: '#f9a8d4',     // Medium pink
    text: '#be185d',       // Dark pink
    textSecondary: '#9d174d' // Darker pink
  }
};

export function UnifiedLabel({ block, relationship, x, y, width }: UnifiedLabelProps) {
  // Don't show label if this block is a child in a relationship
  if (relationship !== null && relationship !== undefined && relationship.parent.id !== block.id) {
    return null;
  }
  
  // Only show grouped label if this block is the parent in the relationship
  const isGrouped = relationship !== null && relationship !== undefined && relationship.parent.id === block.id;
  const blockType = ('type' in block) ? block.type : 'regular';
  
  // Get the main title and subtitle first
  const { title, subtitle, details } = getLabelContent(block, relationship || null);
  
  // Choose colors based on whether it's grouped or individual
  const colors = isGrouped 
    ? RELATIONSHIP_COLORS[(relationship?.relationshipType as keyof typeof RELATIONSHIP_COLORS) || 'flight-hotel'] || RELATIONSHIP_COLORS['flight-hotel']
    : BLOCK_COLORS[blockType] || BLOCK_COLORS.regular;

  // Calculate label height based on content
  const baseHeight = 50;
  const detailsHeight = (isGrouped || details) ? 40 : 20; // More space for grouped labels or individual with details
  const totalHeight = baseHeight + detailsHeight;
  
  // Position the label floating above the blocks
  const labelY = y - totalHeight - 15; // 15px gap above blocks
  
  return (
    <Group>
      {/* Connection line from label to blocks */}
      <Line
        points={[x + width / 2, labelY + totalHeight, x + width / 2, y]}
        stroke={colors.primary}
        strokeWidth={2}
        dash={[3, 3]}
        listening={false}
      />
      
      {/* Main label background */}
      <Rect
        x={x}
        y={labelY}
        width={width}
        height={totalHeight}
        fill={colors.secondary}
        stroke={colors.primary}
        strokeWidth={2}
        cornerRadius={8}
        shadowColor="rgba(0, 0, 0, 0.15)"
        shadowBlur={6}
        shadowOffset={{ x: 0, y: 3 }}
        shadowOpacity={1}
        listening={false}
      />
      
      {/* Type indicator badge */}
      <Rect
        x={x + 8}
        y={labelY + 6}
        width={6}
        height={6}
        fill={colors.accent}
        cornerRadius={3}
        listening={false}
      />
      
      {/* Type label */}
        <Text
          x={x + 18}
          y={labelY + 4}
          text={getTypeLabel(block, relationship || null)}
          fontSize={9}
          fontFamily="Inter, system-ui, sans-serif"
          fill={colors.text}
          fontStyle="bold"
          listening={false}
        />
      
      {/* Main title */}
      <Text
        x={x + 8}
        y={labelY + 18}
        text={title}
        fontSize={14}
        fontFamily="Inter, system-ui, sans-serif"
        fill={colors.text}
        fontStyle="bold"
        width={width - 16}
        wrap="none"
        ellipsis={true}
        listening={false}
      />
      
      {/* Subtitle */}
      <Text
        x={x + 8}
        y={labelY + 34}
        text={subtitle}
        fontSize={11}
        fontFamily="Inter, system-ui, sans-serif"
        fill={colors.textSecondary}
        width={width - 16}
        wrap="none"
        ellipsis={true}
        listening={false}
      />
      
      {/* Details for both grouped and individual labels */}
      {details && (
        <Text
          x={x + 8}
          y={labelY + 48}
          text={details}
          fontSize={10}
          fontFamily="Inter, system-ui, sans-serif"
          fill={colors.textSecondary}
          width={width - 16}
          wrap="none"
          ellipsis={true}
          listening={false}
        />
      )}
    </Group>
  );
}

// Get the type label for the indicator
function getTypeLabel(block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock, relationship: BlockRelationship | null): string {
  if (relationship) {
    return relationship.relationshipType.replace('-', ' + ').toUpperCase();
  }
  
  if ('type' in block) {
    return block.type.toUpperCase();
  }
  
  return 'BLOCK';
}

// Get the main content for the label
function getLabelContent(block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock, relationship: BlockRelationship | null) {
  if (relationship) {
    return getGroupedLabelContent(block, relationship);
  } else {
    return getIndividualLabelContent(block);
  }
}

// Get content for grouped labels
function getGroupedLabelContent(_block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock, relationship: BlockRelationship) {
  const parent = relationship.parent;
  
  // Create a comprehensive title
  let title = '';
  if ('type' in parent && parent.type === 'flight') {
    const flight = parent as FlightBlock;
    title = `${flight.title} - ${flight.departureAirport} → ${flight.arrivalAirport}`;
  } else if ('type' in parent && parent.type === 'hotel') {
    const hotel = parent as HotelBlock;
    title = `${hotel.hotelName} - ${hotel.location}`;
  } else {
    title = parent.title;
  }
  
  // Create a detailed summary
  const summary = createDetailedSummary(relationship);
  
  // Get comprehensive details
  const details = getComprehensiveDetails(relationship);
  
  return {
    title,
    subtitle: summary,
    details
  };
}

// Get content for individual labels
function getIndividualLabelContent(block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock) {
  let title = '';
  let subtitle = '';
  let details = '';
  
  if ('type' in block) {
    switch (block.type) {
      case 'flight': {
        const flight = block as FlightBlock;
        title = `${flight.title} - ${flight.departureAirport} → ${flight.arrivalAirport}`;
        subtitle = `${flight.segments.length} segment${flight.segments.length > 1 ? 's' : ''} • ${flight.totalHours}h`;
        
        // Add flight details
        const firstSegment = flight.segments[0];
        if (firstSegment) {
          details = `${firstSegment.flightNumber} (${firstSegment.departure}→${firstSegment.arrival})`;
        }
        
        // Add date range if available
        if (flight.dateRange) {
          const startDate = flight.dateRange.start.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
          const endDate = flight.dateRange.end.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
          details += ` • ${startDate} - ${endDate}`;
        }
        break;
      }
      case 'hotel': {
        const hotel = block as HotelBlock;
        title = `${hotel.hotelName} - ${hotel.location}`;
        subtitle = `${hotel.events.length} event${hotel.events.length > 1 ? 's' : ''} • ${hotel.totalDays} day${hotel.totalDays > 1 ? 's' : ''}`;
        
        // Add hotel details
        if (hotel.events.length > 0) {
          const eventTypes = [...new Set(hotel.events.map((e) => e.type))];
          details = eventTypes.join(', ').toUpperCase();
        }
        
        // Add date range if available
        if (hotel.dateRange) {
          const startDate = hotel.dateRange.start.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
          const endDate = hotel.dateRange.end.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
          details += ` • ${startDate} - ${endDate}`;
        }
        break;
      }
      case 'activity': {
        const activity = block as ActivityBlock;
        title = activity.title;
        subtitle = `${activity.activityType} • ${activity.durationHours}h`;
        
        // Add activity details - use activityType as details since description doesn't exist
        details = activity.activityType;
        break;
      }
      default:
        title = 'title' in block ? block.title : 'Block';
        subtitle = 'Block';
    }
  } else {
    title = block.title;
    subtitle = 'Block';
  }
  
  return {
    title,
    subtitle,
    details: details || null
  };
}

// Create a detailed summary for grouped labels
function createDetailedSummary(relationship: BlockRelationship): string {
  const parts = [];
  
  // Parent information
  if ('type' in relationship.parent && relationship.parent.type === 'flight') {
    const flight = relationship.parent as FlightBlock;
    parts.push(`${flight.segments.length} segment${flight.segments.length > 1 ? 's' : ''} • ${flight.totalHours}h`);
  } else if ('type' in relationship.parent && relationship.parent.type === 'hotel') {
    const hotel = relationship.parent as HotelBlock;
    parts.push(`${hotel.events.length} event${hotel.events.length > 1 ? 's' : ''} • ${hotel.totalDays} day${hotel.totalDays > 1 ? 's' : ''}`);
  }
  
  // Children information
  const hotelCount = relationship.children.filter(child => 'type' in child && child.type === 'hotel').length;
  if (hotelCount > 0) {
    parts.push(`${hotelCount} hotel${hotelCount > 1 ? 's' : ''}`);
  }
  
  const activityCount = relationship.children.filter(child => 'type' in child && child.type === 'activity').length;
  if (activityCount > 0) {
    parts.push(`${activityCount} activit${activityCount > 1 ? 'ies' : 'y'}`);
  }
  
  return parts.join(' • ');
}

// Get comprehensive details for grouped labels
function getComprehensiveDetails(relationship: BlockRelationship): string {
  const details = [];
  
  // Add parent details
  if ('type' in relationship.parent && relationship.parent.type === 'flight') {
    const flight = relationship.parent as FlightBlock;
    const firstSegment = flight.segments[0];
    if (firstSegment) {
      details.push(`${firstSegment.flightNumber} (${firstSegment.departure}→${firstSegment.arrival})`);
    }
    
    // Add date range if available
    if (flight.dateRange) {
      const startDate = flight.dateRange.start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      const endDate = flight.dateRange.end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      details.push(`${startDate} - ${endDate}`);
    }
  } else if ('type' in relationship.parent && relationship.parent.type === 'hotel') {
    const hotel = relationship.parent as HotelBlock;
    details.push(`${hotel.hotelName}`);
    
    // Add date range if available
    if (hotel.dateRange) {
      const startDate = hotel.dateRange.start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      const endDate = hotel.dateRange.end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      details.push(`${startDate} - ${endDate}`);
    }
  }
  
  // Add child details
  const hotel = relationship.children.find(child => 'type' in child && child.type === 'hotel');
  if (hotel) {
    const hotelData = hotel as HotelBlock;
    details.push(`${hotelData.hotelName} - ${hotelData.location}`);
  }
  
  const activity = relationship.children.find(child => 'type' in child && child.type === 'activity');
  if (activity) {
    const activityData = activity as ActivityBlock;
    details.push(`${activityData.title} (${activityData.activityType})`);
  }
  
  return details.slice(0, 3).join(' • ');
}
