import { DiscoveryService } from '@/services/discoveryService';
import { Discovery, DiscoveryInput } from '@/types/discovery';
import { create } from 'zustand';

interface DiscoveryStore {
  discoveries: Discovery[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createDiscovery: (data: DiscoveryInput) => Promise<void>;
  fetchDiscoveries: () => Promise<void>;
  updateDiscovery: (id: string, data: Partial<Discovery>) => Promise<void>;
  deleteDiscovery: (id: string) => Promise<void>;
  clearError: () => void;
  
  // Future actions (commented for MVP)
  /*
  retryProcessing: (discoveryId: string) => Promise<void>;
  searchDiscoveries: (query: string) => Promise<void>;
  filterDiscoveries: (filters: FilterOptions) => Promise<void>;
  */
}

export const useDiscoveryStore = create<DiscoveryStore>((set, get) => ({
  discoveries: [],
  isLoading: false,
  error: null,

  createDiscovery: async (data: DiscoveryInput) => {
    set({ isLoading: true, error: null });
    try {
      const newDiscovery = await DiscoveryService.createDiscovery(data);
      set(state => ({
        discoveries: [newDiscovery, ...state.discoveries],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create discovery',
        isLoading: false 
      });
    }
  },

  fetchDiscoveries: async () => {
    set({ isLoading: true, error: null });
    try {
      const discoveries = await DiscoveryService.getDiscoveries();
      set({ discoveries, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch discoveries',
        isLoading: false 
      });
    }
  },

  updateDiscovery: async (id: string, data: Partial<Discovery>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDiscovery = await DiscoveryService.updateDiscovery(id, data);
      set(state => ({
        discoveries: state.discoveries.map(d => 
          d.id === id ? updatedDiscovery : d
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update discovery',
        isLoading: false 
      });
    }
  },

  deleteDiscovery: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await DiscoveryService.deleteDiscovery(id);
      set(state => ({
        discoveries: state.discoveries.filter(d => d.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete discovery',
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
