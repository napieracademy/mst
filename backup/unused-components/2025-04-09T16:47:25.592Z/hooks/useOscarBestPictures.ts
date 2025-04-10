/**
 * Hook per recuperare i film vincitori dell'Oscar come miglior film
 */

import { useState, useEffect } from 'react'

// Interfaccia per il film vincitore dell'Oscar
export interface OscarBestPicture {
  imdbId: string
  tmdbId: number
  title: string
  originalTitle?: string
  releaseDate?: string
  releaseYear?: number
  ceremonyYear?: number
  posterPath?: string
  backdropPath?: string
  overview?: string
  director?: {
    id: number
    name: string
    profilePath?: string
  } | null
}

interface UseOscarBestPicturesOptions {
  limit?: number
  enabled?: boolean
}

/**
 * Hook per recuperare l'elenco dei film vincitori dell'Oscar come miglior film
 * 
 * @param options Opzioni di configurazione
 * @returns Stato dei dati, caricamento ed errori
 */
export function useOscarBestPictures(options: UseOscarBestPicturesOptions = {}) {
  const { limit = 10, enabled = true } = options
  
  const [data, setData] = useState<OscarBestPicture[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    // Se il hook è disabilitato, non facciamo nulla
    if (!enabled) {
      setLoading(false)
      return
    }
    
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/best-picture-winners?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error(`Errore API: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Errore nel recupero dei dati')
        }
        
        setData(result.winners || [])
      } catch (err) {
        console.error('Errore nel recupero dei vincitori Oscar:', err)
        setError(err instanceof Error ? err : new Error('Errore sconosciuto'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [limit, enabled])
  
  return {
    data,
    loading,
    error,
    isEmpty: !loading && data.length === 0
  }
}