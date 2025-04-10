"use client"

import { useState, createContext, useContext, type ReactNode } from "react"

interface ApiStateContextType {
  tmdbApiEnabled: boolean
  setTmdbApiEnabled: (enabled: boolean) => void
}

const ApiStateContext = createContext<ApiStateContextType | undefined>(undefined)

interface ApiStateProviderProps {
  children: ReactNode
}

export function ApiStateProvider({ children }: ApiStateProviderProps) {
  const [tmdbApiEnabled, setTmdbApiEnabled] = useState(true)

  return <ApiStateContext.Provider value={{ tmdbApiEnabled, setTmdbApiEnabled }}>{children}</ApiStateContext.Provider>
}

export function useApiState(): ApiStateContextType {
  const context = useContext(ApiStateContext)
  if (!context) {
    throw new Error("useApiState must be used within an ApiStateProvider")
  }
  return context
}

