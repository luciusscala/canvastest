import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock } from '../types/index';

type AnyBlock = CanvasBlock | FlightBlock | HotelBlock | ActivityBlock;

export interface BlockRelationship {
  parent: AnyBlock;
  children: AnyBlock[];
  relationshipType: 'flight-hotel' | 'hotel-activity' | 'flight-activity' | 'none';
}

// Check if a block is snapped to a parent based on position
export function isBlockSnappedToParent(
  childBlock: AnyBlock,
  parentBlock: AnyBlock,
  snapThreshold: number = 5
): boolean {
  // Check if child is positioned within parent's bounds
  const childLeft = childBlock.x;
  const childRight = childBlock.x + childBlock.width;
  const childTop = childBlock.y;
  const childBottom = childBlock.y + childBlock.height;
  
  const parentLeft = parentBlock.x;
  const parentRight = parentBlock.x + parentBlock.width;
  const parentTop = parentBlock.y;
  const parentBottom = parentBlock.y + parentBlock.height;
  
  // Check if child is within parent bounds (with small threshold for snapping)
  const withinHorizontalBounds = 
    childLeft >= parentLeft - snapThreshold && 
    childRight <= parentRight + snapThreshold;
  
  const withinVerticalBounds = 
    childTop >= parentTop - snapThreshold && 
    childBottom <= parentBottom + snapThreshold;
  
  return withinHorizontalBounds && withinVerticalBounds;
}

// Get all block relationships in the canvas
export function getBlockRelationships(blocks: AnyBlock[]): BlockRelationship[] {
  const relationships: BlockRelationship[] = [];
  
  for (const block of blocks) {
    // Find all blocks that this block is snapped to
    const children = blocks.filter(otherBlock => 
      otherBlock.id !== block.id && 
      isBlockSnappedToParent(otherBlock, block)
    );
    
    if (children.length > 0) {
      const relationshipType = determineRelationshipType(block, children);
      relationships.push({
        parent: block,
        children,
        relationshipType
      });
    }
  }
  
  return relationships;
}

// Determine the type of relationship between parent and children
function determineRelationshipType(parent: AnyBlock, children: AnyBlock[]): BlockRelationship['relationshipType'] {
  if ('type' in parent && parent.type === 'flight') {
    if (children.some(child => 'type' in child && child.type === 'hotel')) {
      return 'flight-hotel';
    }
    if (children.some(child => 'type' in child && child.type === 'activity')) {
      return 'flight-activity';
    }
  }
  
  if ('type' in parent && parent.type === 'hotel') {
    if (children.some(child => 'type' in child && child.type === 'activity')) {
      return 'hotel-activity';
    }
  }
  
  return 'none';
}

// Get the combined label data for a relationship
export function getCombinedLabelData(relationship: BlockRelationship) {
  const { parent, children, relationshipType } = relationship;
  
  const parentLabel = getBlockLabel(parent);
  const childrenLabels = children.map(child => getBlockLabel(child));
  
  return {
    parentLabel,
    childrenLabels,
    relationshipType,
    combinedTitle: createCombinedTitle(parentLabel, childrenLabels, relationshipType),
    combinedDates: createCombinedDates(parentLabel, childrenLabels),
    combinedDetails: createCombinedDetails(parentLabel, childrenLabels, relationshipType)
  };
}

// Get label data for a single block
function getBlockLabel(block: AnyBlock) {
  if ('type' in block) {
    switch (block.type) {
      case 'flight':
        return {
          type: 'flight',
          title: `${block.title} - ${block.departureAirport} → ${block.arrivalAirport}`,
          dates: block.dateRange ? {
            start: block.dateRange.start,
            end: block.dateRange.end
          } : null,
          details: block.segments.map(segment => ({
            type: segment.type,
            flightNumber: segment.flightNumber,
            route: `${segment.departure}→${segment.arrival}`,
            duration: segment.duration
          }))
        };
      case 'hotel':
        return {
          type: 'hotel',
          title: `${block.hotelName} - ${block.location}`,
          dates: block.dateRange ? {
            start: block.dateRange.start,
            end: block.dateRange.end
          } : null,
          details: block.events.map(event => ({
            type: event.type,
            date: event.date,
            hotelName: event.hotelName
          }))
        };
      case 'activity':
        return {
          type: 'activity',
          title: block.title,
          dates: block.dateRange ? {
            start: block.dateRange.start,
            end: block.dateRange.end
          } : null,
          details: [{
            type: block.activityType,
            location: block.location,
            duration: block.durationHours
          }]
        };
    }
  }
  
  // Fallback for regular blocks
  return {
    type: 'regular',
    title: block.title,
    dates: null,
    details: []
  };
}

// Create a combined title for the relationship
function createCombinedTitle(parentLabel: any, childrenLabels: any[], relationshipType: string): string {
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
}

// Create combined dates for the relationship
function createCombinedDates(parentLabel: any, childrenLabels: any[]) {
  const allDates = [parentLabel.dates, ...childrenLabels.map(child => child.dates)].filter(Boolean);
  
  if (allDates.length === 0) return null;
  
  const startDates = allDates.map(d => d.start).filter(Boolean);
  const endDates = allDates.map(d => d.end).filter(Boolean);
  
  if (startDates.length === 0 || endDates.length === 0) return null;
  
  const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
  const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
  
  return {
    start: earliestStart,
    end: latestEnd
  };
}

// Create combined details for the relationship
function createCombinedDetails(parentLabel: any, childrenLabels: any[], relationshipType: string) {
  const allDetails = [parentLabel.details, ...childrenLabels.map(child => child.details)].flat();
  return allDetails;
}
