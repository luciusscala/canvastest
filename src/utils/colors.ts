// Shared color scheme for blocks and labels
export const BLOCK_COLORS = {
  flight: {
    primary: '#dc2626',    // Red
    secondary: '#fef2f2',  // Light red
    accent: '#fca5a5',     // Medium red
    text: '#991b1b',       // Dark red
    textSecondary: '#7f1d1d', // Darker red
    name: 'Red'
  },
  hotel: {
    primary: '#059669',    // Green
    secondary: '#f0fdf4',  // Light green
    accent: '#86efac',     // Medium green
    text: '#064e3b',       // Dark green
    textSecondary: '#052e16', // Darker green
    name: 'Green'
  },
  activity: {
    primary: '#7c3aed',    // Purple
    secondary: '#faf5ff',  // Light purple
    accent: '#c4b5fd',     // Medium purple
    text: '#6b21a8',       // Dark purple
    textSecondary: '#581c87', // Darker purple
    name: 'Purple'
  },
  regular: {
    primary: '#f59e0b',    // Orange
    secondary: '#fffbeb',  // Light orange
    accent: '#fcd34d',     // Medium orange
    text: '#92400e',       // Dark orange
    textSecondary: '#78350f', // Darker orange
    name: 'Orange'
  }
};

export const RELATIONSHIP_COLORS = {
  'flight-hotel': {
    primary: '#6b7280',    // Gray
    secondary: '#f9fafb',  // Light gray
    accent: '#d1d5db',     // Medium gray
    text: '#374151',       // Dark gray
    textSecondary: '#1f2937', // Darker gray
    name: 'Gray'
  },
  'hotel-activity': {
    primary: '#be185d',    // Pink
    secondary: '#fdf2f8',  // Light pink
    accent: '#f9a8d4',     // Medium pink
    text: '#9d174d',       // Dark pink
    textSecondary: '#831843', // Darker pink
    name: 'Pink'
  },
  'flight-activity': {
    primary: '#16a34a',    // Emerald
    secondary: '#f0fdf4',  // Light emerald
    accent: '#86efac',     // Medium emerald
    text: '#15803d',       // Dark emerald
    textSecondary: '#14532d', // Darker emerald
    name: 'Emerald'
  }
};

// Helper function to get colors for a block
export function getBlockColors(blockType: string, isGrouped: boolean = false, relationshipType?: string) {
  if (isGrouped && relationshipType) {
    return RELATIONSHIP_COLORS[relationshipType as keyof typeof RELATIONSHIP_COLORS] || RELATIONSHIP_COLORS['flight-hotel'];
  }
  return BLOCK_COLORS[blockType as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.regular;
}
