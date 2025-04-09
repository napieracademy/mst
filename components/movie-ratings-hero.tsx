"use client"

import { DraggableContent } from "@/atomic/molecules/draggable-content"
import { Loader2 } from "lucide-react"
import { useMovieRatings } from "@/hooks/useMovieRatings"

interface MovieRatingsHeroProps {
  tmdbId: number
  imdbId?: string | null
  tmdbRating?: number
  tmdbVoteCount?: number
}

export function MovieRatingsHero({ tmdbId, imdbId, tmdbRating, tmdbVoteCount }: MovieRatingsHeroProps) {
  // Utilizziamo l'hook personalizzato per gestire i rating
  const { ratings, loading, hasRatings } = useMovieRatings(imdbId, tmdbRating, tmdbVoteCount)
  
  // Don't render anything if we don't have any ratings and we're not loading
  if (!hasRatings && !loading) {
    return null
  }
  
  return (
    <DraggableContent
      dragConstraints={{ top: -20, right: 50, bottom: 20, left: -50 }}
      snapBackDuration={0.5}
    >
      <div className="flex flex-wrap items-center gap-6 mt-4 text-white">
        {/* Loader durante il caricamento */}
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-400">Caricamento</span>
          </div>
        )}
        
        {/* TMDB Rating */}
        {ratings.tmdb && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">TMDB:</span>
            <span>{ratings.tmdb.rating.toFixed(1)}/10</span>
          </div>
        )}
        
        {/* IMDb Rating */}
        {ratings.imdb && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">IMDb:</span>
            <span>{ratings.imdb.rating.toFixed(1)}/10</span>
          </div>
        )}
        
        {/* Rotten Tomatoes */}
        {ratings.rottenTomatoes && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">RT:</span>
            <span>{ratings.rottenTomatoes.rating}%</span>
          </div>
        )}
        
        {/* Metacritic */}
        {ratings.metascore && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">MC:</span>
            <span>{ratings.metascore}/100</span>
          </div>
        )}
      </div>
    </DraggableContent>
  )
}