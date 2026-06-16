import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecentItemType = "account" | "category" | "transaction" | "template" | "report";

export interface RecentItem {
  id: string;
  type: RecentItemType;
  label: string;
  href?: string;
  accessedAt: string;
}

interface RecentState {
  items: RecentItem[];
  addRecent: (item: Omit<RecentItem, "accessedAt">) => void;
  removeRecent: (id: string, type?: RecentItemType) => void;
  clearRecent: () => void;
}

const MAX_RECENT_ITEMS = 20;

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      addRecent: (item) =>
        set((state) => ({
          items: [
            { ...item, accessedAt: new Date().toISOString() },
            ...state.items.filter((existing) => existing.id !== item.id || existing.type !== item.type),
          ].slice(0, MAX_RECENT_ITEMS),
        })),
      removeRecent: (id, type) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id || (type ? item.type !== type : false)),
        })),
      clearRecent: () => set({ items: [] }),
    }),
    { name: "fitracker-recent" },
  ),
);
