import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  activeMonth: string; // YYYY-MM
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveMonth: (month: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  activeMonth: new Date().toISOString().slice(0, 7),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setActiveMonth: (month) => set({ activeMonth: month }),
}));
