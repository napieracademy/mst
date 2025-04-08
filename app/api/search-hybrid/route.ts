import { NextResponse } from "next/server"
import { searchTMDB } from "@/lib/tmdb"
import { getOMDBDataByIMDbId } from "@/lib/omdb"
import { config } from "@/lib/config"

interface SearchResult {
  id: number
  title: string
  poster_path: string | null
  media_type: 'movie' | 'tv'
  release_date?: string
  first_air_date?: string
  popularity: number
  vote_average: number
  vote_count: number
  imdb_id?: string
  omdb_rating?: number
  hybrid_score: number
}

/**
 * API per ricerca ibrida che combina risultati da TMDB, Trakt.tv e OMDB
 * e li ordina in base a un punteggio di popolarità composito
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const type = searchParams.get('type')
    const page = searchParams.get('page') || '1'

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Cerca su TMDB
    const tmdbResults = await searchTMDB(query, type, parseInt(page))
    
    // Per ogni risultato TMDB, arricchisci con dati OMDB se possibile
    const enrichedResults: SearchResult[] = await Promise.all(
      tmdbResults.results.map(async (result): Promise<SearchResult> => {
        let omdbRating: number | undefined
        
        if (result.imdb_id) {
          try {
            const omdbData = await getOMDBDataByIMDbId(result.imdb_id)
            omdbRating = omdbData?.imdb_rating
          } catch (error) {
            console.error(`Error fetching OMDB data for ${result.imdb_id}:`, error)
          }
        }

        // Calcola lo score ibrido basato su popolarità TMDB e rating OMDB
        const hybridScore = calculateHybridScore(result.popularity, result.vote_average, omdbRating)

        return {
          id: result.id,
          title: result.title || result.name || 'Unknown Title',
          poster_path: result.poster_path,
          media_type: result.media_type,
          release_date: result.release_date,
          first_air_date: result.first_air_date,
          popularity: result.popularity,
          vote_average: result.vote_average,
          vote_count: result.vote_count,
          imdb_id: result.imdb_id,
          omdb_rating: omdbRating,
          hybrid_score: hybridScore
        }
      })
    )

    // Ordina i risultati per score ibrido
    const sortedResults = enrichedResults.sort((a, b) => b.hybrid_score - a.hybrid_score)

    return NextResponse.json({
      results: sortedResults,
      page: tmdbResults.page,
      total_pages: tmdbResults.total_pages,
      total_results: tmdbResults.total_results
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateHybridScore(
  tmdbPopularity: number,
  tmdbVoteAverage: number,
  omdbRating?: number
): number {
  // Normalizza i punteggi su una scala da 0 a 1
  const normalizedPopularity = Math.min(tmdbPopularity / 100, 1)
  const normalizedTMDBRating = tmdbVoteAverage / 10
  const normalizedOMDBRating = omdbRating ? omdbRating / 10 : normalizedTMDBRating

  // Pesi per ciascun fattore
  const POPULARITY_WEIGHT = 0.3
  const TMDB_RATING_WEIGHT = 0.35
  const OMDB_RATING_WEIGHT = 0.35

  // Calcola lo score ibrido
  return (
    normalizedPopularity * POPULARITY_WEIGHT +
    normalizedTMDBRating * TMDB_RATING_WEIGHT +
    normalizedOMDBRating * OMDB_RATING_WEIGHT
  )
}