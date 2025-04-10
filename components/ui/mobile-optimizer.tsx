"use client"

import { useEffect } from "react"
import { useIsMobile } from "./use-mobile"

export function MobileOptimizer() {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) return
    
    // Aggiusta viewport per evitare zoom involontario negli input
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
    document.head.appendChild(meta)
    
    // Migliora il touch target sui dispositivi mobili
    document.documentElement.style.setProperty('--touch-target-size', '44px')
    
    // Aggiungi classi CSS per ottimizzazioni mobili
    document.body.classList.add('mobile-optimized')
    
    // Migliora lo scrolling su iOS
    document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch')
    
    // Previeni zooming involontario sugli input
    const disableDoubleTapZoom = (e: TouchEvent) => {
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLSelectElement) {
        e.preventDefault()
        ;(e.target as HTMLElement).focus()
      }
    }
    
    document.addEventListener('touchend', disableDoubleTapZoom)
    
    return () => {
      document.removeEventListener('touchend', disableDoubleTapZoom)
      document.head.removeChild(meta)
      document.body.classList.remove('mobile-optimized')
    }
  }, [isMobile])

  return null
}