"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("colorsense-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("colorsense-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple mock authentication - in real app, this would be an API call
    const mockUsers = JSON.parse(localStorage.getItem("colorsense-users") || "[]")
    const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: new Date(foundUser.createdAt),
      }
      setUser(userSession)
      localStorage.setItem("colorsense-user", JSON.stringify(userSession))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple mock registration - in real app, this would be an API call
    const mockUsers = JSON.parse(localStorage.getItem("colorsense-users") || "[]")

    // Check if user already exists
    if (mockUsers.find((u: any) => u.email === email)) {
      setIsLoading(false)
      return false
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In real app, this would be hashed
      name,
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    localStorage.setItem("colorsense-users", JSON.stringify(mockUsers))

    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: new Date(newUser.createdAt),
    }

    setUser(userSession)
    localStorage.setItem("colorsense-user", JSON.stringify(userSession))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("colorsense-user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
