"use client"

import { usePathname } from "next/navigation"
import { FloatingSearch } from "./floating-search"

export function SearchProvider() {
  const pathname = usePathname()
  
  // Mostra il pulsante di ricerca flottante solo quando non siamo nella home page
  // La home page ha pathname "/"
  const showSearch = pathname !== "/"
  
  if (!showSearch) return null
  
  return <FloatingSearch />
} 