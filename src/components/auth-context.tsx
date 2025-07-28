"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface AuthContextType {
  userId: string | null
  isLoggedIn: boolean
  login: (id: string) => void
  logout: () => void
  refreshAuthStatus: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const checkAuthStatus = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId")
      setUserId(storedUserId)
      setIsLoggedIn(!!storedUserId)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus() // Initial check on mount

    // Listen for storage events from other tabs/windows
    const handleStorageChange = () => {
      checkAuthStatus()
    }
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [checkAuthStatus])

  const login = useCallback((id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userId", id)
      setUserId(id)
      setIsLoggedIn(true)
    }
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userId")
      setUserId(null)
      setIsLoggedIn(false)
    }
  }, [])

  const refreshAuthStatus = useCallback(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  return (
    <AuthContext.Provider value={{ userId, isLoggedIn, login, logout, refreshAuthStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // This error means useAuth was called outside of AuthProvider
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
