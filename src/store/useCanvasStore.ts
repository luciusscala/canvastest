import { create } from 'zustand';
import type { TravelBlock } from '../types/index';

interface CanvasState {
  blocks: TravelBlock[];
  selectedBlockId: string | null;
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
}

interface CanvasActions {
  addBlock: (block: TravelBlock) => void;
  updateBlock: (id: string, updates: Partial<TravelBlock>) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  updateViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  getBlock: (id: string) => TravelBlock | undefined;
  hasTemporalConflict: (block: TravelBlock) => boolean;
}

export const useCanvasStore = create<CanvasState & CanvasActions>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  viewport: { x: 0, y: 0, scale: 1 },

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

  hasTemporalConflict: (block) => {
    const { blocks } = get();
    return blocks.some((otherBlock) => {
      if (otherBlock.id === block.id) return false;

      const blockStart = block.startTime.getTime();
      const blockEnd = block.endTime.getTime();
      const otherStart = otherBlock.startTime.getTime();
      const otherEnd = otherBlock.endTime.getTime();

      return (
        (blockStart < otherEnd && blockEnd > otherStart) ||
        (otherStart < blockEnd && otherEnd > blockStart)
      );
    });
  },
}));