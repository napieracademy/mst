"use client"

import { useEffect, useState } from "react"
import { getOMDBDataByIMDbId } from "@/lib/omdb"

interface MovieRatingsHeroProps {
  tmdbId: string
  imdbId?: string
  tmdbRating?: number
  tmdbVoteCount?: number
}

interface RatingsData {
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

export function MovieRatingsHero({ tmdbId, imdbId, tmdbRating, tmdbVoteCount }: MovieRatingsHeroProps) {
  const [ratings, setRatings] = useState<RatingsData>({
    imdb: null,
    rottenTomatoes: null,
    metascore: null,
    tmdb: tmdbRating && tmdbVoteCount ? {
      rating: tmdbRating,
      votes: tmdbVoteCount
    } : null
  })

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Verifica che l'IMDb ID sia valido
        let validImdbId = imdbId;
        let isValidImdbId = imdbId && typeof imdbId === 'string' && imdbId.startsWith('tt') && imdbId.length >= 7;
        
        if (!isValidImdbId && tmdbId) {
          const paddedId = tmdbId.toString().padStart(7, '0');
          validImdbId = `tt${paddedId}`;
          isValidImdbId = true;
        }
        
        if (isValidImdbId && validImdbId) {
          const omdbData = await getOMDBDataByIMDbId(validImdbId);
          
          if (omdbData) {
            // IMDb ratings
            const imdbRating = {
              rating: omdbData.imdb_rating,
              votes: omdbData.imdb_votes
            }
            
            // Rotten Tomatoes
            const rtRating = omdbData.ratings.find(r => 
              r.source === "Rotten Tomatoes"
            );
            
            // Metascore
            const metascore = omdbData.metascore ?? null;
            
            setRatings({
              ...ratings,
              imdb: imdbRating,
              rottenTomatoes: rtRating ? {
                rating: rtRating.normalizedValue || 0
              } : null,
              metascore
            });
          }
        }
      } catch (error) {
        console.error("MovieRatingsHero: Error fetching ratings:", error)
      }
    }
    
    fetchRatings()
  }, [tmdbId, imdbId])

  // Se non abbiamo nessun rating, non mostrare nulla
  if (!ratings.imdb && !ratings.rottenTomatoes && !ratings.metascore && !ratings.tmdb) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
      {/* IMDb */}
      {ratings.imdb && (
        <div className="flex items-center gap-1">
          <span className="text-white font-medium">IMDb</span>
          <span className="text-white mx-1">•</span>
          <span className="text-white">{ratings.imdb.rating}/10</span>
        </div>
      )}
      
      {/* Rotten Tomatoes */}
      {ratings.rottenTomatoes && (
        <div className="flex items-center gap-1">
          <span className="text-white font-medium">RT</span>
          <span className="text-white mx-1">•</span>
          <span className="text-white">{ratings.rottenTomatoes.rating}%</span>
        </div>
      )}
      
      {/* Metascore */}
      {ratings.metascore && (
        <div className="flex items-center gap-1">
          <span className="text-white font-medium">MC</span>
          <span className="text-white mx-1">•</span>
          <span className="text-white">{ratings.metascore}/100</span>
        </div>
      )}

      {/* TMDB */}
      {ratings.tmdb && (
        <div className="flex items-center gap-1">
          <span className="text-white font-medium">TMDB</span>
          <span className="text-white mx-1">•</span>
          <span className="text-white">{ratings.tmdb.rating.toFixed(1)}/10</span>
        </div>
      )}
    </div>
  )
} 