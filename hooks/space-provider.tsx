// hooks/space-provider.tsx
"use client";

import { create } from "zustand";
import { createContext, useContext, ReactNode } from "react";

// Type definitions
export interface ContentItem {
  id: string;
  youtube_id: string;
  type?: string;
  createdAt?: string;
  title?: string | null;
  thumbnailUrl?: string | null;
  filename?: string | null;
  fileUrl?: string | null;
}

export interface SpaceItem {
  id: string;
  name: string;
  createdAt?: string;
  contents?: ContentItem[];
}

interface SpacesState {
  spaces: SpaceItem[];
  loading: boolean;
}

interface SpacesActions {
  setSpaces: (spaces: SpaceItem[]) => void;
  addSpace: (space: SpaceItem) => void;
  setLoading: (val: boolean) => void;
  createSpace: (name: string) => Promise<void>;
  addContentToSpace: (spaceId: string, content: ContentItem) => void;
  resetSpaces: () => void;
}

export type SpacesStore = SpacesState & SpacesActions;

// Create our Zustand store
export const useSpacesStore = create<SpacesStore>(
  (set, get) => ({
    spaces: [],
    loading: true,

    setSpaces: (spaces) => set({ spaces }),

    addSpace: (space) =>
      set((state) => ({ spaces: [...state.spaces, space] })),

    setLoading: (val) => set({ loading: val }),

    // Create a new space via POST /api/spaces
    async createSpace(name) {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create space");
      const created = await res.json();
      get().addSpace({
        id: created.id,
        name: created.name,
        createdAt: created.createdAt,
        contents: [],
      });
    },

    // Add a new content item to the specified space in local store
    addContentToSpace(spaceId, content) {
      set((state) => ({
        spaces: state.spaces.map((s) =>
          s.id === spaceId
            ? { ...s, contents: [...(s.contents || []), content] }
            : s
        ),
      }));
    },

    // Reset store on logout
    resetSpaces: () => {
      set({
        spaces: [],
        loading: true,
      });
    },
  })
);

const SpacesContext = createContext<(SpacesState & SpacesActions) | null>(null);

export function SpacesProvider({ children }: { children: ReactNode }) {
  const store = useSpacesStore();
  return (
    <SpacesContext.Provider value={store}>{children}</SpacesContext.Provider>
  );
}

export function useSpaces() {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error("useSpaces must be used within a SpacesProvider");
  }
  return context;
}
