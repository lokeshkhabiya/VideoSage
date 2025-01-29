"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createContext, useContext, ReactNode } from "react";
import { useSpacesStore } from "@/hooks/space-provider";

// User and Space Interfaces
interface Space {
  id: string;
  name: string;
}

interface User {
  user_id: string;
  email: string;
  name: string;
  username: string; // Add this line
  spaces?: Space[];
  first_name?: string;
  last_name?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (userData: User) => void;
  logout: () => void;
  updateUserSpaces: (spaces: Space[]) => void;
  updateUserData: (updatedData: Partial<User>) => void;
}

// Zustand Store
export const useAuthStore = create(
  persist<AuthState & AuthActions>(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // Login function
      login: (userData: User) => {
        // Ensure default spaces are added if missing
        if (!userData.spaces) {
          userData.spaces = [{ id: "default", name: "Default Space" }];
        }
        set({
          user: userData,
          isAuthenticated: true,
        });
        useSpacesStore.getState().resetSpaces();
      },

      // Logout function
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
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
    }),
    {
      name: "auth-storage", // LocalStorage key
    }
  )
);

// Auth Context to wrap Zustand store for React Context
const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();

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
