"use client"

import { ApiStateProvider } from "@/lib/api-state"
import { SearchProvider } from "@/components/search-provider"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApiStateProvider>
      {children}
      <SearchProvider />
    </ApiStateProvider>
  )
}

