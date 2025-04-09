"use client"

import { useState, useEffect } from 'react'

export function useOscarWinners() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOscarWinners = async () => {
      setLoading(true)
      
      try {
        const response = await fetch('/api/enrich-oscar-winners')
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Ordina i vincitori per anno di vittoria (dal più recente al più vecchio)
        const sortedWinners = data.winners.sort((a: any, b: any) => 
          (b.oscar_win_year || 0) - (a.oscar_win_year || 0)
        )
        
        setWinners(sortedWinners)
      } catch (err) {
        console.error('Error fetching Oscar winners:', err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOscarWinners()
  }, [])

  return { winners, loading, error }
}