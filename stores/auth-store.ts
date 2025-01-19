import { create } from "zustand";
import { persist } from "zustand/middleware";

interface authState {
    user_id: string;
    isAuthenticated: boolean
    username: string; 
    first_name: string;
    last_name: string; 
    token: string;
}

interface authActions {
    setToken: (token: string) => void;
    setUsername: (username: string) => void;
    setFirstName: (first_name: string) => void;
    setLastName: (last_name: string) => void;
    setUserId: (id: string) => void;
    loginUser: (token: string) => void;
    logoutUser: () => void;
}

export const useAuthStore = create(persist<authState & authActions>(
    (set) => ({
        user_id: "",
        isAuthenticated: false,
        username: "",
        first_name: "",
        last_name: "",
        token: "",
        setToken: (token) => set(() => ({ token })),
        setUsername: (username) => set(() => ({ username })),
        setFirstName: (first_name) => set(() => ({ first_name })),
        setLastName: (last_name) => set(() => ({ last_name })),
        setUserId: (id) => set(() => ({ user_id: id })),
        loginUser: (token) => set(() => ({ 
            isAuthenticated: true,
            token: token
        })),
        logoutUser: () => set(() => ({
            isAuthenticated: false,
            user_id: "",
            username: "",
            first_name: "",
            last_name: "",
            token: "",
        })),
    }),
    {
        name: "auth-storage", // unique name for the storage
    }
));