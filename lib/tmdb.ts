import { config } from "./config"
import type { Movie } from "./types"

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

// Funzione di utilità per le chiamate API
async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  // Se le API sono disabilitate tramite configurazione, lancia un errore
  if (!config.enableTMDBApi) {
    console.error(`TMDB API disabled: request to ${endpoint} blocked`)
    throw new Error("TMDB API is disabled")
  }

  if (!TMDB_API_KEY) {
    console.error("TMDB API key is missing")
    throw new Error("TMDB API key is missing")
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`)

  // Aggiungi l'API key e i parametri
  url.searchParams.append("api_key", TMDB_API_KEY)
  url.searchParams.append("language", "it-IT")
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  try {
    console.log(`Fetching from TMDB: ${endpoint}`, {
      apiKeyPresent: !!TMDB_API_KEY,
      apiKeyLength: TMDB_API_KEY?.length || 0,
      url: url.toString().replace(TMDB_API_KEY, "API_KEY_HIDDEN"),
    })

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache per 1 ora
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`TMDB API error (${response.status}): ${errorText}`, { endpoint, params })
      throw new Error(`TMDB API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    // Log di debug per vedere la struttura dei dati
    console.log(`TMDB API response for ${endpoint}:`, {
      hasResults: !!data.results,
      resultsCount: data.results?.length,
      keys: Object.keys(data),
    })

    return data
  } catch (error) {
    console.error("Error fetching from TMDB:", error, { endpoint, params })
    throw error // Rilancia l'errore invece di restituire un oggetto di errore
  }
}

// Ottieni i film di tendenza
export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/trending/movie/week")
  return data?.results || []
}

// Ottieni i film popolari
export async function getPopularMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/movie/popular")
  return data?.results || []
}

// Ottieni i film con le migliori recensioni
export async function getTopRatedMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/movie/top_rated")
  return data?.results || []
}

// Ottieni i film in uscita
export async function getUpcomingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/movie/upcoming")
  return data?.results || []
}

// Ottieni le serie TV popolari
export async function getPopularTVShows(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/tv/popular")
  return data?.results || []
}

// Cerca film o serie TV
export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await fetchFromTMDB("/search/multi", { query })
  return (data?.results || []).filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
}

// Ottieni dettagli di un film o serie TV
export async function getMovieDetails(id: string, type: "movie" | "tv"): Promise<Movie | null> {
  if (!id) return null

  try {
    const data = await fetchFromTMDB(`/${type}/${id}`, {
      append_to_response: "videos,credits,recommendations,similar",
    })

    if (data && !data.error && !data.status_code) {
      return data as Movie
    }

    console.error(`Failed to fetch movie details:`, data?.error || data?.status_code)
    return null
  } catch (error) {
    console.error("Error fetching movie details:", error)
    return null
  }
}

// Ottieni i trailer di un film o serie TV
export async function getTrailers(id: string, type: "movie" | "tv"): Promise<any[]> {
  try {
    const data = await fetchFromTMDB(`/${type}/${id}/videos`)

    if (data && !data.error) {
      return data.results.filter((video: any) => video.site === "YouTube")
    }

    console.error(`Failed to fetch trailers:`, data?.error)
    return []
  } catch (error) {
    console.error("Error fetching trailers:", error)
    return []
  }
}

// Ottieni film simili
export async function getSimilarMovies(id: string, type: "movie" | "tv"): Promise<Movie[]> {
  try {
    const data = await fetchFromTMDB(`/${type}/${id}/similar`)

    if (data && !data.error) {
      return data.results
    }

    console.error(`Failed to fetch similar movies:`, data?.error)
    return []
  } catch (error) {
    console.error("Error fetching similar movies:", error)
    return []
  }
}

// Modifica la funzione getPersonDetails per lanciare un errore quando le API sono disabilitate
export async function getPersonDetails(id: string): Promise<any | null> {
  if (!id) return null

  // Se le API sono disabilitate, lancia un errore
  if (!config.enableTMDBApi) {
    console.error(`TMDB API disabled: request for person ${id} blocked`)
    throw new Error("TMDB API is disabled")
  }

  try {
    const data = await fetchFromTMDB(`/person/${id}`, {
      append_to_response: "combined_credits",
    })

    return data
  } catch (error) {
    console.error("Error fetching person details:", error)
    throw error // Rilancia l'errore
  }
}

