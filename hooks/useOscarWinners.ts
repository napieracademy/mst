"use client"

import { useState, useEffect } from 'react'

export function useOscarWinners() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOscarWinners = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log('Initiating Oscar winners data fetch')
        
        // Utilizziamo un timeout per la richiesta
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 secondi
        
        let response;
        
        try {
          response = await fetch('/api/enrich-oscar-winners', {
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          console.log('Response received:', { 
            status: response.status,
            ok: response.ok,
            type: response.type 
          })
          
          if (!response.ok) {
            // Per errori 500, prendiamo il messaggio di errore dal corpo della risposta
            if (response.status === 500) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error || `Server error: ${response.status}`)
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`)
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          console.error('Fetch error:', fetchError)
          throw fetchError
        }
        
        // Se arriviamo qui, abbiamo una risposta valida
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
        setWinners([]) // Imposta winners a array vuoto in caso di errore
      } finally {
        setLoading(false)
      }
    }
    
    fetchOscarWinners()
  }, [])

  return { winners, loading, error }
}