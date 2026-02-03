"use client";

import { create } from "zustand";
import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSpacesStore, type SpacesStore } from "@/hooks/space-provider";

// User and Space Interfaces
interface Space {
  id: string;
  name: string;
}

interface User {
  user_id: string;
  email: string;
  name: string;
  username?: string | null;
  spaces?: Space[];
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthActions {
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUserSpaces: (spaces: Space[]) => void;
  updateUserData: (updatedData: Partial<User>) => void;
  setUser: (userData: User | null) => void;
  setLoading: (loading: boolean) => void;
}

// Zustand Store
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  // Login function
  login: (userData: User) => {
    set({
      user: userData,
      isAuthenticated: true,
    });
    (useSpacesStore.getState() as SpacesStore).resetSpaces();
  },

  setUser: (userData: User | null) =>
    set({
      user: userData,
      isAuthenticated: Boolean(userData),
    }),

  setLoading: (loading: boolean) => set({ loading }),

  // Logout function
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore logout errors
    }
    set({
      user: null,
      isAuthenticated: false,
    });
    (useSpacesStore.getState() as SpacesStore).resetSpaces();
  },

  // Update spaces for the user
  updateUserSpaces: (spaces: Space[]) =>
    set((state) => ({
      user: state.user ? { ...state.user, spaces } : null,
    })),

  // Update partial user data
  updateUserData: (updatedData: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedData } : null,
    })),
}));

// Auth Context to wrap Zustand store for React Context
const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();
  const { setUser, setLoading } = authStore;

  useEffect(() => {
    async function hydrateSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setUser({
            ...data.user,
            name: `${data.user.first_name ?? ""} ${data.user.last_name ?? ""}`.trim(),
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    hydrateSession();
  }, [setUser, setLoading]);

  return (
    <AuthContext.Provider value={authStore}>{children}</AuthContext.Provider>
  );
}

// Custom Hook for Accessing Auth State and Actions
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
