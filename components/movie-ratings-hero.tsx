"use client"

import { useState, useEffect } from "react"
import { DraggableContent } from "@/atomic/molecules/draggable-content"
import { FaImdb } from "react-icons/fa"
import { Loader2 } from "lucide-react"

interface MovieRatingsHeroProps {
  tmdbId: number
  imdbId?: string | null
  tmdbRating?: number
  tmdbVoteCount?: number
}

export function MovieRatingsHero({ tmdbId, imdbId, tmdbRating, tmdbVoteCount }: MovieRatingsHeroProps) {
  const [imdbRating, setImdbRating] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  
  // Fetch IMDb rating if we have an IMDb ID
  useEffect(() => {
    if (!imdbId) return
    
    const fetchImdbRating = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/imdb-rating?imdbId=${imdbId}`)
        if (!response.ok) throw new Error('Error fetching IMDb rating')
        
        const data = await response.json()
        setImdbRating(data.rating || null)
      } catch (error) {
        console.error("Failed to fetch IMDb rating:", error)
        setImdbRating(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchImdbRating()
  }, [imdbId])
  
  // Don't render anything if we don't have any ratings
  if (!tmdbRating && !imdbRating && !loading) {
    return null
  }
  
  return (
    <DraggableContent
      dragConstraints={{ top: -20, right: 50, bottom: 20, left: -50 }}
      snapBackDuration={0.5}
    >
      <div className="flex flex-wrap items-center gap-6 mt-4 text-white">
        {/* TMDB Rating in testo semplice */}
        {tmdbRating !== undefined && tmdbRating > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">TMDB:</span>
            <span>{tmdbRating.toFixed(1)}/10</span>
          </div>
        )}
        
        {/* IMDb Rating in testo semplice */}
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-400">Caricamento</span>
          </div>
        ) : imdbRating ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold">IMDb:</span>
            <span>{imdbRating}/10</span>
          </div>
        ) : null}
      </div>
    </DraggableContent>
  )
}