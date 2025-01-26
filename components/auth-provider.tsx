"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  email: string
  name: string
  spaces?: { id: string; name: string }[]
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in (e.g., by checking local storage or making an API call)
    const loggedInUser = localStorage.getItem("user")
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    // Create default space for new users
    if (!userData.spaces) {
      userData.spaces = [{ id: "default", name: "Default Space" }]
      localStorage.setItem("user", JSON.stringify(userData))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

