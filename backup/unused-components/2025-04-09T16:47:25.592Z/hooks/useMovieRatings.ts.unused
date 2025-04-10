"use client"

import { useState, useEffect } from "react"

export interface RatingsData {
  imdb: {
    rating: number
    votes: number
  } | null
  rottenTomatoes: {
    rating: number
  } | null
  metascore: number | null
  tmdb: {
    rating: number
    votes: number
  } | null
}

/**
 * Hook personalizzato per recuperare e gestire i rating dei film
 * 
 * @param imdbId - ID IMDb del film
 * @param tmdbRating - Rating TMDB (opzionale)
 * @param tmdbVoteCount - Conteggio voti TMDB (opzionale)
 * @returns Oggetto con i rating e lo stato di caricamento
 */
export function useMovieRatings(
  imdbId?: string | null,
  tmdbRating?: number,
  tmdbVoteCount?: number
) {
  const [ratings, setRatings] = useState<Omit<RatingsData, 'tmdb'> | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch ratings if we have an IMDb ID
  useEffect(() => {
    if (!imdbId) return

    let isMounted = true
    
    const fetchRatings = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/imdb-rating?imdbId=${imdbId}`)
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (isMounted) {
          setRatings(data)
        }
      } catch (err) {
        console.error("Failed to fetch ratings:", err)
        
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching ratings')
          setRatings(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchRatings()
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [imdbId])
  
  // Combine TMDB ratings with other ratings
  const allRatings: RatingsData = {
    ...ratings,
    tmdb: tmdbRating && tmdbRating > 0 ? {
      rating: tmdbRating,
      votes: tmdbVoteCount || 0
    } : null
  }
  
  // Check if we have any ratings at all
  const hasRatings = Boolean(
    allRatings.tmdb?.rating ||
    allRatings.imdb?.rating ||
    allRatings.rottenTomatoes?.rating ||
    allRatings.metascore
  )
  
  return {
    ratings: allRatings,
    loading,
    error,
    hasRatings
  }
}