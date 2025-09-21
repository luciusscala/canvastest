import { create } from 'zustand';
import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock, TripTimeline } from '../types/index';
import { createTripTimeline } from '../utils/timeUtils';
import { getBlockRelationships, type BlockRelationship } from '../utils/blockRelationships';

interface CanvasState {
  blocks: (CanvasBlock | FlightBlock | HotelBlock | ActivityBlock)[];
  selectedBlockId: string | null;
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
  tripTimeline: TripTimeline | null;
  relationships: BlockRelationship[];
  lastRelationshipUpdate: number;
}

interface CanvasActions {
  addBlock: (block: CanvasBlock | FlightBlock | HotelBlock | ActivityBlock) => void;
  updateBlock: (id: string, updates: Partial<CanvasBlock | FlightBlock | HotelBlock | ActivityBlock>) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  updateViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  getBlock: (id: string) => (CanvasBlock | FlightBlock | HotelBlock | ActivityBlock) | undefined;
  setTripTimeline: (timeline: TripTimeline) => void;
  initializeTripTimeline: (startDate: Date, endDate: Date, scale?: number) => void;
  updateRelationships: () => void;
  getRelationshipsForBlock: (blockId: string) => BlockRelationship | null;
}

export const useCanvasStore = create<CanvasState & CanvasActions>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  viewport: { x: 0, y: 0, scale: 1 },
  tripTimeline: null,
  relationships: [],
  lastRelationshipUpdate: 0,

  addBlock: (block) =>
    set((state) => {
      const newBlocks = [...state.blocks, block];
      const relationships = getBlockRelationships(newBlocks);
      return {
        blocks: newBlocks,
        relationships,
        lastRelationshipUpdate: Date.now(),
      };
    }),

  updateBlock: (id, updates) =>
    set((state) => {
      const newBlocks = state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      );
      const relationships = getBlockRelationships(newBlocks);
      console.log('Relationships updated:', relationships.length, 'relationships found');
      return {
        blocks: newBlocks,
        relationships,
        lastRelationshipUpdate: Date.now(),
      };
    }),

  removeBlock: (id) =>
    set((state) => {
      const newBlocks = state.blocks.filter((block) => block.id !== id);
      const relationships = getBlockRelationships(newBlocks);
      return {
        blocks: newBlocks,
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
        relationships,
        lastRelationshipUpdate: Date.now(),
      };
    }),

  selectBlock: (id) =>
    set(() => ({
      selectedBlockId: id,
    })),

  updateViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  getBlock: (id) => get().blocks.find((block) => block.id === id),

  setTripTimeline: (timeline) =>
    set(() => ({
      tripTimeline: timeline,
    })),

  initializeTripTimeline: (startDate, endDate, scale = 20) =>
    set(() => ({
      tripTimeline: createTripTimeline(startDate, endDate, scale),
    })),

  updateRelationships: () =>
    set((state) => {
      const relationships = getBlockRelationships(state.blocks);
      return {
        relationships,
        lastRelationshipUpdate: Date.now(),
      };
    }),

  getRelationshipsForBlock: (blockId) => {
    const state = get();
    return state.relationships.find(rel => 
      rel.parent.id === blockId || rel.children.some(child => child.id === blockId)
    ) || null;
  },
}));
