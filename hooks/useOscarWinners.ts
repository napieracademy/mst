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
        
        // Log dei dati ricevuti per debugging
        console.log('API response received:', {
          winnersCount: data.winners?.length || 0,
          confirmedCount: data.confirmed_count || 0
        })
        
        // Verifica che data.winners sia un array
        if (!Array.isArray(data.winners)) {
          console.error('data.winners is not an array:', data.winners)
          setWinners([])
          return
        }
        
        // Assicuriamoci che i vincitori non siano vuoti
        if (data.winners.length === 0) {
          console.warn('Received empty winners array from API')
        }
        
        // Ordina i vincitori per anno di vittoria (dal più recente al più vecchio)
        const sortedWinners = data.winners.sort((a: any, b: any) => 
          (b.oscar_win_year || 0) - (a.oscar_win_year || 0)
        )
        
        console.log('Sorted winners:', sortedWinners.map((w: any) => ({ 
          id: w.id, 
          title: w.title, 
          year: w.oscar_win_year 
        })))
        
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