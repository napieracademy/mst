"use client"

import { ApiStateProvider } from "@/lib/api-state"
import { SearchProvider } from "@/components/search-provider"
import { MobileOptimizer } from "@/components/ui/mobile-optimizer"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApiStateProvider>
      <MobileOptimizer />
      {children}
      <SearchProvider />
    </ApiStateProvider>
  )
}

