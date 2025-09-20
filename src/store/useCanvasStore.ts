import { create } from 'zustand';
import type { CanvasBlock, FlightBlock, HotelBlock, ActivityBlock, TripTimeline } from '../types/index';
import { createTripTimeline } from '../utils/timeUtils';

interface CanvasState {
  blocks: (CanvasBlock | FlightBlock | HotelBlock | ActivityBlock)[];
  selectedBlockId: string | null;
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
  tripTimeline: TripTimeline | null;
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
}

export const useCanvasStore = create<CanvasState & CanvasActions>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  viewport: { x: 0, y: 0, scale: 1 },
  tripTimeline: null,

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block],
    })),

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
    })),

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
}));
