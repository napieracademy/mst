"use client"

import { useEffect, useState } from "react"
import { getOMDBDataByIMDbId } from "@/lib/omdb"
import Image from "next/image"

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

// Costanti per i loghi ufficiali da Wikipedia
const RATING_LOGOS = {
  imdb: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/575px-IMDB_Logo_2016.svg.png",
  rottenTomatoes: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Rotten_Tomatoes.svg/2019px-Rotten_Tomatoes.svg.png",
  metacritic: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Metacritic.svg/2048px-Metacritic.svg.png",
  tmdb: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/2000px-Tmdb.new.logo.svg.png"
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
    <div className="flex flex-wrap items-center gap-6 text-sm mt-4">
      {/* IMDb */}
      {ratings.imdb && (
        <div className="flex items-center gap-2">
          <div className="relative w-16 h-8">
            <Image
              src={RATING_LOGOS.imdb}
              alt="IMDb"
              fill
              className="object-contain brightness-200"
              sizes="64px"
              priority
            />
          </div>
          <span className="text-white font-medium">{ratings.imdb.rating}/10</span>
        </div>
      )}
      
      {/* Rotten Tomatoes */}
      {ratings.rottenTomatoes && (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src={RATING_LOGOS.rottenTomatoes}
              alt="Rotten Tomatoes"
              fill
              className="object-contain"
              sizes="32px"
              priority
            />
          </div>
          <span className="text-white font-medium">{ratings.rottenTomatoes.rating}%</span>
        </div>
      )}
      
      {/* Metascore */}
      {ratings.metascore && (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src={RATING_LOGOS.metacritic}
              alt="Metacritic"
              fill
              className="object-contain"
              sizes="32px"
              priority
            />
          </div>
          <span className="text-white font-medium">{ratings.metascore}/100</span>
        </div>
      )}

      {/* TMDB */}
      {ratings.tmdb && (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src={RATING_LOGOS.tmdb}
              alt="TMDB"
              fill
              className="object-contain brightness-200"
              sizes="32px"
              priority
            />
          </div>
          <span className="text-white font-medium">{ratings.tmdb.rating.toFixed(1)}/10</span>
        </div>
      )}
    </div>
  )
} 