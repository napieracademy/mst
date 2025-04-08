"use client"

import { useEffect, useState } from "react"
import { getOMDBDataByIMDbId } from "@/lib/omdb"

interface TVRatingsProps {
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

export function TVRatings({ tmdbId, imdbId, tmdbRating, tmdbVoteCount }: TVRatingsProps) {
  const [ratings, setRatings] = useState<RatingsData>({
    imdb: null,
    rottenTomatoes: null,
    metascore: null,
    tmdb: tmdbRating && tmdbVoteCount ? {
      rating: tmdbRating,
      votes: tmdbVoteCount
    } : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true)
        
        // Verifica che l'IMDb ID sia valido (deve iniziare con "tt" e avere almeno 7 caratteri)
        let validImdbId = imdbId;
        let isValidImdbId = imdbId && typeof imdbId === 'string' && imdbId.startsWith('tt') && imdbId.length >= 7;
        
        console.log("TVRatings: IMDb ID check:", { 
          imdbId, 
          isValidImdbId,
          type: typeof imdbId,
          length: imdbId ? imdbId.length : 0,
          startsWithTt: imdbId ? imdbId.startsWith('tt') : false
        });
        
        // Se manca l'IMDb ID ma abbiamo l'ID TMDB, tentiamo di generare un IMDb ID presumibile
        // Nota: questo è un fallback semplice che funziona per molte serie popolari
        if (!isValidImdbId && tmdbId) {
          // Per le serie più note, possiamo provare alcuni pattern comuni
          // Molte serie TV su TMDB hanno IMDb ID del tipo tt + padded TMDB ID
          const paddedId = tmdbId.toString().padStart(7, '0');
          validImdbId = `tt${paddedId}`;
          console.log(`TVRatings: Generato IMDb ID fallback: ${validImdbId} (dal TMDB ID ${tmdbId})`);
          isValidImdbId = true; // Proviamo con questo ID
        }
        
        if (isValidImdbId) {
          console.log("TVRatings: Attempting to fetch OMDB data for IMDb ID:", validImdbId);
          const omdbData = await getOMDBDataByIMDbId(validImdbId)
          console.log("TVRatings: OMDB data received:", omdbData ? "Success" : "Null");
          
          if (omdbData) {
            console.log("TVRatings: Processing OMDB data");
            // IMDb ratings
            const imdbRating = {
              rating: omdbData.imdb_rating,
              votes: omdbData.imdb_votes
            }
            
            // Rotten Tomatoes - verifica sia tramite oggetto ratings che tramite array Ratings da API
            // Prima cerca nel nostro formato normalizzato
            let rtRating = omdbData.ratings.find(r => r.source === "Rotten Tomatoes")
            
            // Se non trovato, cerca nell'array Ratings originale dall'API
            if (!rtRating && omdbData.fullResponse?.Ratings) {
              const originalRating = omdbData.fullResponse.Ratings.find(
                (r: any) => r.Source === "Rotten Tomatoes"
              )
              
              if (originalRating) {
                // Estrai il valore numerico (es. "94%" -> 94)
                const ratingValue = originalRating.Value.replace('%', '')
                rtRating = {
                  source: "Rotten Tomatoes",
                  value: originalRating.Value,
                  normalizedValue: parseInt(ratingValue, 10)
                }
              }
            }
            
            const rottenTomatoes = rtRating ? {
              rating: rtRating.normalizedValue || 0
            } : null
            
            // Metascore
            const metascore = omdbData.metascore || null
            
            setRatings({
              ...ratings,
              imdb: imdbRating,
              rottenTomatoes,
              metascore
            })
          }
        }
      } catch (error) {
        console.error("Error fetching ratings:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRatings()
  }, [tmdbId, imdbId])
  
  // Se stiamo caricando e non abbiamo alcun rating disponibile, mostra uno skeleton
  if (loading && !ratings.tmdb) {
    return (
      <section className="mt-8 bg-gray-900/30 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-medium mb-4">Valutazioni</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-16 bg-gray-800/50 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-800/50 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-800/50 rounded-lg animate-pulse"></div>
        </div>
      </section>
    )
  }
  
  // Se non abbiamo nemmeno il rating TMDB, non mostrare la sezione
  if (!ratings.tmdb && !ratings.imdb && !ratings.rottenTomatoes && !ratings.metascore) {
    return null
  }
  
  // Formatta il numero di voti (es. 1.2k, 4.5M)
  const formatVoteCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    } else {
      return count.toString()
    }
  }
  
  return (
    <section className="mt-8 bg-gray-900/30 rounded-xl p-6 backdrop-blur-sm">
      <h2 className="text-xl font-medium mb-4">Valutazioni</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* IMDb */}
        {ratings.imdb && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-amber-500">IMDb</div>
              <div className="text-right">
                <span className="font-bold text-lg">{ratings.imdb.rating}</span>
                <span className="text-xs text-gray-400 ml-1">/10</span>
                <div className="text-xs text-gray-400">
                  {formatVoteCount(ratings.imdb.votes)} {ratings.imdb.votes === 1 ? 'voto' : 'voti'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Rotten Tomatoes */}
        {ratings.rottenTomatoes && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-red-500">Rotten Tomatoes</div>
              <div className="text-right">
                <span className="font-bold text-lg">{ratings.rottenTomatoes.rating}</span>
                <span className="text-xs text-gray-400 ml-1">%</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Metascore */}
        {ratings.metascore && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-blue-400">Metacritic</div>
              <div className="text-right">
                <span className={`
                  font-bold text-lg px-2 py-1 rounded
                  ${ratings.metascore >= 75 ? 'text-green-500' : 
                    ratings.metascore >= 50 ? 'text-yellow-500' : 
                    'text-red-500'}
                `}>{ratings.metascore}</span>
                <span className="text-xs text-gray-400 ml-1">/100</span>
              </div>
            </div>
          </div>
        )}
        
        {/* TMDB */}
        {ratings.tmdb && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-cyan-500">TMDB</div>
              <div className="text-right">
                <span className="font-bold text-lg">{ratings.tmdb.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400 ml-1">/10</span>
                <div className="text-xs text-gray-400">
                  {formatVoteCount(ratings.tmdb.votes)} {ratings.tmdb.votes === 1 ? 'voto' : 'voti'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}