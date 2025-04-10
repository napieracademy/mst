"use client"

import { useEffect, useState } from "react"
import { SitemapCount } from "@/components/ui/sitemap-count"
import { useSession } from "@supabase/auth-helpers-react"

interface BuildInfo {
  buildTime: string
  environment: string
}

export function AdminBar() {
  const session = useSession()
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null)
  const [pageGenerationTime, setPageGenerationTime] = useState<string | null>(null)

  useEffect(() => {
    // Recupera le informazioni di build
    fetch('/api/build-info')
      .then(res => res.json())
      .then(data => setBuildInfo(data))
      .catch(err => console.error('Errore nel recupero delle info di build:', err))

    // Recupera il tempo di generazione della pagina
    const startTime = performance.now()
    window.addEventListener('load', () => {
      const endTime = performance.now()
      setPageGenerationTime(`${Math.round(endTime - startTime)}ms`)
    })
  }, [])

  // Mostra la barra solo se l'utente è admin
  if (!session?.user?.user_metadata?.role === 'admin') {
    return null
  }

  return (
    <div className="bg-gray-900 text-white text-sm py-1 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>Build: {buildInfo?.buildTime || 'N/A'}</span>
          <span>Env: {buildInfo?.environment || 'N/A'}</span>
          <span>Gen: {pageGenerationTime || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <SitemapCount />
        </div>
      </div>
    </div>
  )
} 