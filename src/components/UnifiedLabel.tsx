import { Group, Rect, Text, Line } from 'react-konva';
import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock } from '../types/index';
import type { BlockRelationship } from '../utils/blockRelationships';
import { DayIndicators } from './DayIndicators';
import { getBlockColors } from '../utils/colors';

interface UnifiedLabelProps {
  block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock;
  relationship?: BlockRelationship | null;
  x: number;
  y: number;
  width: number;
}


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
  const colors = getBlockColors(blockType, isGrouped, relationship?.relationshipType);

  // Calculate label height based on content
  const baseHeight = 50;
  const detailsHeight = (isGrouped || details) ? 40 : 20; // More space for grouped labels or individual with details
  const colorLegend = getColorLegend(block, colors, isGrouped, relationship);
  const colorLegendHeight = colorLegend.length * 14; // 14px per legend item
  const totalHeight = baseHeight + detailsHeight + colorLegendHeight;
  
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
      
      {/* Detailed color legend */}
      <Group>
        {getColorLegend(block, colors, isGrouped, relationship).map((legendItem, index) => {
          const legendY = labelY + (details ? 62 : 48) + (index * 14);
          
          return (
            <Group key={legendItem.label}>
              {/* Color indicator */}
              <Rect
                x={x + 8}
                y={legendY}
                width={8}
                height={8}
                fill={legendItem.color}
                cornerRadius={2}
                listening={false}
              />
              
              {/* Color label */}
              <Text
                x={x + 20}
                y={legendY + 2}
                text={legendItem.label}
                fontSize={9}
                fontFamily="Inter, system-ui, sans-serif"
                fill={colors.textSecondary}
                fontStyle="bold"
                listening={false}
              />
            </Group>
          );
        })}
      </Group>
      
      {/* Day indicators - only show for grouped blocks */}
      {isGrouped && relationship && (
        <DayIndicators
          relationship={relationship}
          x={x}
          y={y}
          width={width}
          height={block.height}
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
    title = 'title' in block ? block.title : 'Block';
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

// Get color legend for the label
function getColorLegend(block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock, colors: { primary: string; accent: string; textSecondary: string; name: string }, isGrouped: boolean, relationship?: BlockRelationship | null): Array<{color: string, label: string}> {
  const legend: Array<{color: string, label: string}> = [];
  
  if (isGrouped && relationship) {
    // For grouped blocks, show colors for both parent and children
    const allBlocks = [relationship.parent, ...relationship.children];
    
    allBlocks.forEach(blockItem => {
      if ('type' in blockItem) {
        // Get the individual block colors for this specific block
        const blockColors = getBlockColors(blockItem.type, false, null);
        
        switch (blockItem.type) {
          case 'flight': {
            const flight = blockItem as FlightBlock;
            const segmentTypes = [...new Set(flight.segments.map(s => s.type))];
            segmentTypes.forEach(segmentType => {
              const segmentColors = {
                outbound: blockColors.primary,
                return: blockColors.accent,
                connecting: blockColors.textSecondary
              };
              const labels = {
                outbound: 'Outbound Flight',
                return: 'Return Flight',
                connecting: 'Connecting Flight'
              };
              legend.push({
                color: segmentColors[segmentType],
                label: labels[segmentType]
              });
            });
            break;
          }
          case 'hotel': {
            const hotel = blockItem as HotelBlock;
            if (hotel.events && hotel.events.length > 0) {
              const eventTypes = [...new Set(hotel.events.map(e => e.type))];
              
              eventTypes.forEach(eventType => {
                const eventColors = {
                  checkin: blockColors.primary,
                  checkout: blockColors.accent
                };
                const labels = {
                  checkin: 'Hotel Check-in',
                  checkout: 'Hotel Check-out'
                };
                legend.push({
                  color: eventColors[eventType],
                  label: labels[eventType]
                });
              });
            } else {
              // If no events, add a generic hotel entry
              legend.push({
                color: blockColors.primary,
                label: 'Hotel Stay'
              });
            }
            break;
          }
          case 'activity': {
            legend.push({
              color: blockColors.primary,
              label: 'Activity'
            });
            break;
          }
        }
      }
    });
  } else {
    // For individual blocks, show only that block's colors
    if ('type' in block) {
      switch (block.type) {
        case 'flight': {
          const flight = block as FlightBlock;
          const segmentTypes = [...new Set(flight.segments.map(s => s.type))];
          segmentTypes.forEach(segmentType => {
            const segmentColors = {
              outbound: colors.primary,
              return: colors.accent,
              connecting: colors.textSecondary
            };
            const labels = {
              outbound: 'Outbound Flight',
              return: 'Return Flight',
              connecting: 'Connecting Flight'
            };
            legend.push({
              color: segmentColors[segmentType],
              label: labels[segmentType]
            });
          });
          break;
        }
            case 'hotel': {
              const hotel = block as HotelBlock;
              const eventTypes = [...new Set(hotel.events.map(e => e.type))];
              eventTypes.forEach(eventType => {
                const eventColors = {
                  checkin: colors.primary,
                  checkout: colors.accent
                };
                const labels = {
                  checkin: 'Hotel Check-in',
                  checkout: 'Hotel Check-out'
                };
                legend.push({
                  color: eventColors[eventType],
                  label: labels[eventType]
                });
              });
              break;
            }
        case 'activity': {
          legend.push({
            color: colors.primary,
            label: 'Activity'
          });
          break;
        }
        default: {
          legend.push({
            color: colors.primary,
            label: 'Block'
          });
          break;
        }
      }
    } else {
      legend.push({
        color: colors.primary,
        label: 'Block'
      });
    }
  }
  
  // Remove duplicates based on label
  const uniqueLegend = legend.filter((item, index, self) => 
    index === self.findIndex(t => t.label === item.label)
  );
  
  return uniqueLegend;
}
