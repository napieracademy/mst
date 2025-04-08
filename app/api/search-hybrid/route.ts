import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { searchMedia } from "@/lib/trakt"
import { searchOMDB } from "@/lib/omdb"
import { config } from "@/lib/config"
import { getMoviePopularityScore, getShowPopularityScore } from "@/lib/popularity-ranking"

/**
 * API per ricerca ibrida che combina risultati da TMDB, Trakt.tv e OMDB
 * e li ordina in base a un punteggio di popolarità composito
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const type = searchParams.get("type") || "all" // "movie", "tv", "all"
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
  
  if (!query) {
    return NextResponse.json({ results: [] })
  }
  
  if (!apiKey) {
    console.error("TMDB API key is missing")
    return NextResponse.json({ error: "API key is missing" }, { status: 500 })
  }
  
  try {
    // Traduciamo il tipo per le diverse API
    const tmdbType = type === "tv" ? "tv" : type === "movie" ? "movie" : "multi"
    const traktType = type === "tv" ? "show" : type === "movie" ? "movie" : "all"
    const omdbType = type === "tv" ? "series" : type === "movie" ? "movie" : "all"
    
    // Richieste parallele a TMDB (base standard)
    const tmdbUrl = new URL(`https://api.themoviedb.org/3/search/${tmdbType}`)
    tmdbUrl.searchParams.append("api_key", apiKey)
    tmdbUrl.searchParams.append("query", query)
    tmdbUrl.searchParams.append("language", "it-IT")
    tmdbUrl.searchParams.append("include_adult", "false")
    tmdbUrl.searchParams.append("page", "1")
    
    // Raccogliamo risultati da diverse fonti in parallelo
    const [tmdbResponse, traktResults, omdbResults] = await Promise.all([
      fetch(tmdbUrl.toString()),
      config.enableTraktApi ? searchMedia(query, traktType, 10) : Promise.resolve([]),
      config.enableOMDBApi ? searchOMDB(query, omdbType) : Promise.resolve([])
    ])
    
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.status}`)
    }
    
    const tmdbData = await tmdbResponse.json()
    
    // Mappatura dei risultati TMDB
    const results = await Promise.all(
      tmdbData.results.map(async (item: any) => {
        const mediaType = item.media_type || (tmdbType === "movie" ? "movie" : tmdbType === "tv" ? "tv" : null)
        
        // Ignora persone e altri tipi che non sono film o serie TV
        if (mediaType !== "movie" && mediaType !== "tv") {
          return null
        }
        
        // Dati di base comuni a film e serie TV
        const baseResult = {
          id: item.id,
          title: item.title || item.name,
          poster_path: item.poster_path,
          media_type: mediaType,
          year: item[mediaType === "movie" ? "release_date" : "first_air_date"]
            ? (item[mediaType === "movie" ? "release_date" : "first_air_date"]).split("-")[0]
            : null,
          popularity: item.popularity || 0,
          vote_average: item.vote_average || 0,
          vote_count: item.vote_count || 0,
        }
        
        // Calcola il punteggio ibrido di popolarità
        try {
          // Cerca un eventuale ID IMDb
          let imdbId = undefined
          
          // Cerca nei risultati Trakt
          const traktMatch = traktResults.find(tr => tr.tmdb_id === item.id)
          if (traktMatch && traktMatch.imdb_id) {
            imdbId = traktMatch.imdb_id
          }
          
          // Cerca nei risultati OMDB in base al titolo e all'anno
          if (!imdbId && baseResult.year) {
            const omdbMatch = omdbResults.find(omdb => 
              omdb.title.toLowerCase() === baseResult.title.toLowerCase() && 
              omdb.year === baseResult.year
            )
            if (omdbMatch) {
              imdbId = omdbMatch.imdb_id
            }
          }
          
          // Calcola il punteggio composito
          const popularityScore = mediaType === "movie"
            ? await getMoviePopularityScore(
                item.id, 
                imdbId, 
                item.popularity, 
                item.vote_average, 
                item.vote_count
              )
            : await getShowPopularityScore(
                item.id, 
                imdbId, 
                item.popularity, 
                item.vote_average, 
                item.vote_count
              )
          
          // Arricchisci il risultato con il punteggio e i metadata
          return {
            ...baseResult,
            hybrid_score: popularityScore.score,
            source_scores: popularityScore.sources,
            imdb_id: imdbId,
            trakt_id: popularityScore.metadata.trakt_id,
            imdb_rating: popularityScore.metadata.imdb_rating,
            imdb_votes: popularityScore.metadata.imdb_votes,
            trakt_watchers: popularityScore.metadata.trakt_watchers
          }
        } catch (error) {
          console.error(`Error calculating hybrid score for ${baseResult.title}:`, error)
          return baseResult
        }
      })
    )
    
    // Filtra eventuali risultati nulli e ordina per punteggio ibrido
    const filteredResults = results
      .filter(r => r !== null)
      .sort((a, b) => (b?.hybrid_score || b?.popularity || 0) - (a?.hybrid_score || a?.popularity || 0))
      .slice(0, 15) // Limita a 15 risultati totali
    
    return NextResponse.json({ results: filteredResults })
  } catch (error) {
    console.error("Error in hybrid search:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}