import { create } from "zustand";

interface MapState {
  activeLayer: string | null;
  isCreatePinMode: boolean;
  refreshCounter: number; // Incremented to trigger data refresh
  actions: {
    setActiveLayer: (layer: string | null) => void;
    toggleCreatePinMode: () => void;
    setCreatePinMode: (isActive: boolean) => void;
    triggerRefresh: () => void; // Call after creating pin/zone
    reset: () => void;
  };
}

export const useMapStore = create<MapState>((set) => ({
  activeLayer: null, // null = show all pins
  isCreatePinMode: false,
  refreshCounter: 0,
  actions: {
    setActiveLayer: (layer) => set({ activeLayer: layer }),
    toggleCreatePinMode: () =>
      set((state) => ({ isCreatePinMode: !state.isCreatePinMode })),
    setCreatePinMode: (isActive) => set({ isCreatePinMode: isActive }),
    triggerRefresh: () =>
      set((state) => ({ refreshCounter: state.refreshCounter + 1 })),
    reset: () =>
      set({ activeLayer: "water", isCreatePinMode: false, refreshCounter: 0 }),
  },
}));

export const useMapActions = () => useMapStore((state) => state.actions);
export const useMapActiveLayer = () =>
  useMapStore((state) => state.activeLayer);
export const useMapIsCreatePinMode = () =>
  useMapStore((state) => state.isCreatePinMode);
export const useMapRefreshCounter = () =>
  useMapStore((state) => state.refreshCounter);
