import { config } from "./config"
import type { Movie } from "./types"
import { getApiKey } from "./api-keys-client"

// Costanti per le API TMDB
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// Fallback in caso il servizio centralizzato non sia disponibile
// NOTA: Utilizziamo solo la chiave privata server-side
const TMDB_API_KEY_FALLBACK = process.env.TMDB_API_KEY || ''

// Funzione per verificare se un percorso immagine è valido
export function isValidImagePath(path: string | null | undefined): boolean {
  return Boolean(path && typeof path === 'string' && path.startsWith('/') && path.length > 1);
}

// Funzione per costruire URL immagine con maggiori controlli di sicurezza
export function buildImageUrl(path: string | null | undefined, size: string = "original"): string | null {
  // Se il percorso immagine non è valido, restituisci null
  if (!isValidImagePath(path)) {
    console.warn(`Invalid image path detected: ${path}`);
    return null;
  }
  
  const validSizes = ["w92", "w154", "w185", "w342", "w500", "w780", "h632", "original"];
  
  // Verifica che la dimensione richiesta sia valida
  if (!validSizes.includes(size)) {
    console.warn(`Invalid image size requested: ${size}, defaulting to "original"`);
    size = "original";
  }
  
  // Costruiamo l'URL TMDB diretto (senza proxy)
  const imageUrl = `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  
  // In modalità sviluppo, facciamo logging dell'URL per debug
  if (process.env.NODE_ENV === 'development') {
    console.log(`TMDB image URL generated: ${imageUrl} (from path: ${path}, size: ${size})`);
  }
  
  // Ritorniamo direttamente l'URL di TMDB, senza utilizzare il proxy
  return imageUrl;
}

// Funzione di utilità per le chiamate API
async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}, language = "it-IT") {
  // Se le API sono disabilitate tramite configurazione, lancia un errore
  if (!config.enableTMDBApi) {
    // Evita log in ambiente build
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'build') {
      console.warn(`TMDB API disabled: request to ${endpoint} blocked`)
    }
    throw new Error("TMDB API is disabled")
  }

  // Ottieni la chiave API TMDB dal centralizzatore delle chiavi
  let apiKey = await getApiKey('tmdb').catch(error => {
    console.warn("Errore nel recupero chiave TMDB dal servizio centralizzato:", error.message)
    return TMDB_API_KEY_FALLBACK // Fallback alla chiave dalle variabili d'ambiente
  });

  if (!apiKey) {
    // In ambiente di build, evita di fare console.error
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'build') {
      console.warn("TMDB API key is missing")
    }
    throw new Error("TMDB API key is missing")
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`)

  // Aggiungi l'API key e i parametri
  url.searchParams.append("api_key", apiKey)
  url.searchParams.append("language", language)
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  try {
    console.log(`Fetching from TMDB: ${endpoint}`, {
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      url: url.toString().replace(apiKey, "API_KEY_HIDDEN"),
      language: language,
      source: apiKey === TMDB_API_KEY_FALLBACK ? 'fallback' : 'central-service'
    })

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache per 1 ora
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      // Evita log durante la build
      if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'build') {
        console.warn(`TMDB API error (${response.status}): ${errorText}`, { endpoint, params })
      }
      throw new Error(`TMDB API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    // Log di debug per vedere la struttura dei dati
    console.log(`TMDB API response for ${endpoint}:`, {
      hasResults: !!data.results,
      resultsCount: data.results?.length,
      keys: Object.keys(data),
    })
    
    // Log aggiuntivo per debug delle immagini
    if (endpoint.includes('/person/') || endpoint.includes('/movie/') || endpoint.includes('/tv/')) {
      const imagePaths = {
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        profilePath: data.profile_path,
        hasValidPosterPath: isValidImagePath(data.poster_path),
        hasValidBackdropPath: isValidImagePath(data.backdrop_path),
        hasValidProfilePath: isValidImagePath(data.profile_path)
      };
      
      console.log(`TMDB image paths for ${endpoint}:`, imagePaths);
    }

    return data
  } catch (error) {
    // Evita log pesanti durante la build
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'build') {
      console.warn("Error fetching from TMDB:", error instanceof Error ? error.message : error)
    }
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
  try {
    console.log("Fetching popular movies...");
    const data = await fetchFromTMDB("/movie/popular");
    const movies = data?.results || [];

    // Recupera i dettagli completi per ogni film in parallelo
    const moviesWithDetails = await Promise.all(
      movies.map(async (movie: any) => {
        try {
          const details = await fetchFromTMDB(`/movie/${movie.id}`);
          return {
            ...movie,
            imdb_id: details.imdb_id
          };
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error);
          return movie;
        }
      })
    );

    console.log(`Got ${moviesWithDetails.length} movies with IMDB IDs`);
    return moviesWithDetails;
  } catch (error) {
    console.error("Error in getPopularMovies:", error);
    return [];
  }
}

// Ottieni i film con le migliori recensioni
export async function getTopRatedMovies(): Promise<Movie[]> {
  try {
    console.log("Fetching top rated movies...");
    const data = await fetchFromTMDB("/movie/top_rated");
    const movies = data?.results || [];

    // Recupera i dettagli completi per ogni film in parallelo
    const moviesWithDetails = await Promise.all(
      movies.map(async (movie: any) => {
        try {
          const details = await fetchFromTMDB(`/movie/${movie.id}`);
          return {
            ...movie,
            imdb_id: details.imdb_id
          };
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error);
          return movie;
        }
      })
    );

    console.log(`Got ${moviesWithDetails.length} movies with IMDB IDs`);
    return moviesWithDetails;
  } catch (error) {
    console.error("Error in getTopRatedMovies:", error);
    return [];
  }
}

// Ottieni i film in uscita
export async function getUpcomingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB("/movie/upcoming")
  return data?.results || []
}

// Ottieni i film attualmente al cinema
export async function getNowPlayingMovies(): Promise<Movie[]> {
  try {
    console.log("Chiamata a getNowPlayingMovies avviata");
    const data = await fetchFromTMDB("/movie/now_playing");
    console.log(`getNowPlayingMovies: ricevuti ${data?.results?.length || 0} film`);
    return data?.results || [];
  } catch (error) {
    console.error("Errore in getNowPlayingMovies:", error);
    return [];
  }
}

// Ottieni le serie TV popolari (filtrate per provider italiani e senza talk show/news)
export async function getPopularTVShows(): Promise<Movie[]> {
  try {
    console.log("Fetching popular TV shows with Italian provider filtering...");
    
    // Generi da escludere: talk show, news, reality TV
    const excludedGenreIds = [10767, 10763, 10764]; // Talk show, news, reality
    
    // Recupera più show del solito perché filtreremo
    const data = await fetchFromTMDB("/tv/popular", { page: "1" });
    const page2Data = await fetchFromTMDB("/tv/popular", { page: "2" });
    
    // Combina i risultati per avere più show da filtrare
    const tvShows = [...(data?.results || []), ...(page2Data?.results || [])];
    console.log(`Retrieved ${tvShows.length} TV shows before filtering`);
    
    // Filtra e arricchisci i dati in parallelo
    const processedShows = await Promise.all(
      tvShows.map(async (show: any) => {
        try {
          // Ottieni dettagli completi inclusi i generi
          const details = await fetchFromTMDB(`/tv/${show.id}`);
          
          // Verifica se lo show ha generi da escludere
          const hasExcludedGenre = details.genres?.some((genre: {id: number}) => 
            excludedGenreIds.includes(genre.id)
          );
          
          if (hasExcludedGenre) {
            return null; // Escludi questo show
          }
          
          // Verifica la disponibilità sui provider italiani specifici (Netflix, Amazon, Apple)
          const providersData = await fetchFromTMDB(`/tv/${show.id}/watch/providers`);
          const italianProviders = providersData.results?.IT;
          
          // Provider ID di riferimento:
          // Netflix: 8
          // Amazon Prime Video: 119
          // Apple TV+: 350
          const targetProviderIds = [8, 119, 350]; // Netflix, Amazon, Apple
          
          // Controlla se lo show è disponibile su almeno uno dei provider target
          const hasTargetProvider = italianProviders?.flatrate?.some((provider: {provider_id: number}) => 
            targetProviderIds.includes(provider.provider_id)
          );
          
          // Se non è disponibile su nessuno dei provider target, escludi
          if (!italianProviders || !hasTargetProvider) {
            return null; // Escludi questo show
          }
          
          // Restituisci show con dettagli completi
          return {
            ...show,
            ...details,
            has_italian_providers: true
          };
        } catch (error) {
          console.error(`Error processing TV show ${show.id}:`, error);
          return null;
        }
      })
    );
    
    // Rimuovi null e ordina per popolarità (più alta prima)
    const validShows = processedShows
      .filter((show): show is Movie => show !== null)
      .sort((a, b) => b.popularity - a.popularity);
    
    console.log(`Filtered to ${validShows.length} TV shows with Italian providers and without excluded genres`);
    return validShows;
  } catch (error) {
    console.error("Error in getPopularTVShows:", error);
    return [];
  }
}

// Cerca film o serie TV
export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await fetchFromTMDB("/search/multi", { query })
  // Filtra per avere solo film e serie TV
  const filteredResults = (data?.results || [])
    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
  
  // Arricchisci i risultati per renderli compatibili con la nostra interfaccia di Movie
  // Ciò è importante per generare correttamente gli slug
  return filteredResults.map((item: any) => {
    if (item.media_type === "movie") {
      return {
        ...item,
        title: item.title || "Film senza titolo",
        release_date: item.release_date || "",
      };
    } else { // tv
      return {
        ...item,
        name: item.name || "Serie TV senza titolo",
        first_air_date: item.first_air_date || "",
      };
    }
  });
}

// Funzione per recuperare i credits con nomi internazionali
async function getCreditsEnglish(id: number, type: "movie" | "tv") {
  try {
    // Prima recuperiamo i credits in inglese per avere i nomi internazionali
    const englishData = await fetchFromTMDB(`/${type}/${id}/credits`, {}, "en-US")
    
    // Creiamo una mappa dei nomi internazionali
    const internationalNames = new Map()
    englishData.cast?.forEach((person: any) => {
      internationalNames.set(person.id, person.name)
    })
    englishData.crew?.forEach((person: any) => {
      internationalNames.set(person.id, person.name)
    })

    // Ora recuperiamo i credits in italiano per avere il resto delle informazioni localizzate
    const italianData = await fetchFromTMDB(`/${type}/${id}/credits`, {}, "it-IT")

    // Sostituiamo i nomi con quelli internazionali
    if (italianData.cast) {
      italianData.cast = italianData.cast.map((person: any) => ({
        ...person,
        name: internationalNames.get(person.id) || person.name
      }))
    }

    if (italianData.crew) {
      italianData.crew = italianData.crew.map((person: any) => ({
        ...person,
        name: internationalNames.get(person.id) || person.name
      }))
    }

    return italianData
  } catch (error) {
    console.error(`Error fetching credits for ${type} ${id}:`, error)
    return null
  }
}

// Funzione per calcolare il punteggio di un credit
function calculateCreditScore(credit: any) {
  let score = 0;
  
  // Base: popolarità e voto
  score += (credit.popularity || 0) * 0.3;  // 30% popolarità
  score += (credit.vote_average || 0) * 0.2; // 20% voto medio
  score += (credit.vote_count || 0) * 0.1;   // 10% numero di voti
  
  // Bonus per ruolo
  if (credit.job === "Director") {
    score *= 2.0; // Bonus del 100% per registi
  } else if (credit.order !== undefined && credit.order < 10) {
    score *= 1.5; // Bonus del 50% per ruoli principali nel cast
  }
  
  // Bonus per film vs TV
  score *= credit.media_type === 'movie' ? 1.5 : 1; // 50% bonus per film
  
  // Bonus per ruoli recenti
  const releaseDate = credit.release_date || credit.first_air_date;
  if (releaseDate) {
    const yearsSinceRelease = new Date().getFullYear() - new Date(releaseDate).getFullYear();
    if (yearsSinceRelease <= 10) {
      score *= 1 + ((10 - yearsSinceRelease) * 0.05);
    }
  }

  // Penalità per apparizioni minori
  if (credit.character?.toLowerCase().includes('uncredited') || 
      credit.character?.toLowerCase().includes('cameo')) {
    score *= 0.5;
  }

  return score;
}

// Ottieni dettagli di un film o serie TV
export async function getMovieDetails(id: string, type: "movie" | "tv"): Promise<Movie | null> {
  if (!id) return null

  try {
    // Ottieni i dettagli base in italiano
    const baseData = await fetchFromTMDB(`/${type}/${id}`, {
      append_to_response: "videos,recommendations,similar,external_ids,credits",
    }, "it-IT");
    
    // Log specifico per external_ids (utile per debug)
    console.log(`TMDB ${type} ${id} external_ids:`, {
      hasExternalIds: !!baseData.external_ids,
      imdbId: baseData.external_ids?.imdb_id || 'non disponibile',
      keys: baseData.external_ids ? Object.keys(baseData.external_ids) : []
    });
    
    console.log(`Dati simili per ${type} ${id}:`, {
      hasSimilar: !!baseData.similar,
      similarCount: baseData.similar?.results?.length || 0
    });
    
    // Combina i dati
    const data = {
      ...baseData,
      known_for_credits: [] // Array dei crediti "known_for" del film/serie
    };

    // Cercare di ottenere i "known_for" per un film/serie
    try {
      // Ottieni i film/serie popolari
      const popularItems = await fetchFromTMDB(`/${type}/popular`, {}, "it-IT");
      const itemInPopular = popularItems.results?.find((p: any) => p.id === parseInt(id, 10));
      
      if (itemInPopular) {
        console.log(`${type.toUpperCase()} ${id} trovato tra i popolari, aggiungendo known_for_credits`);
        // Se il film/serie è tra i popolari, possiamo considerarlo known_for
        // Qui possiamo prendere i registi o attori principali come "known_for"
        const knownForCredits = [];
        
        // Aggiungi i principali attori (primi 5)
        if (data.credits?.cast && data.credits.cast.length > 0) {
          // Marchiamo questi crediti come "known_for"
          const mainCast = data.credits.cast.slice(0, 5).map((actor: any) => ({
            ...actor,
            is_known_for: true
          }));
          knownForCredits.push(...mainCast);
        }
        
        // Aggiungi i registi
        if (data.credits?.crew) {
          const directors = data.credits.crew
            .filter((c: any) => c.job === "Director")
            .map((director: any) => ({
              ...director,
              is_known_for: true
            }));
          knownForCredits.push(...directors);
        }
        
        data.known_for_credits = knownForCredits;
        console.log(`${type.toUpperCase()} ${id} aggiunti ${knownForCredits.length} known_for_credits`);
      } else {
        // Anche se non è tra i popolari, possiamo comunque aggiungere i principali attori/registi
        // ma limitiamo a meno elementi (3 attori + registi)
        console.log(`${type.toUpperCase()} ${id} non è tra i popolari, usando approccio alternativo`);
        const knownForCredits = [];
        
        // Aggiungi i principali attori (primi 3)
        if (data.credits?.cast && data.credits.cast.length > 0) {
          const mainCast = data.credits.cast.slice(0, 3).map((actor: any) => ({
            ...actor,
            is_known_for: true
          }));
          knownForCredits.push(...mainCast);
        }
        
        // Aggiungi i registi
        if (data.credits?.crew) {
          const directors = data.credits.crew
            .filter((c: any) => c.job === "Director")
            .map((director: any) => ({
              ...director,
              is_known_for: true
            }));
          knownForCredits.push(...directors);
        }
        
        data.known_for_credits = knownForCredits;
        console.log(`${type.toUpperCase()} ${id} approccio alternativo: aggiunti ${knownForCredits.length} known_for_credits`);
      }
    } catch (error) {
      console.error(`Error fetching known_for for ${type} ${id}:`, error);
    }

    if (data && !data.error && !data.status_code) {
      // Verifica e log aggiuntivo per debug delle immagini
      if (data.poster_path || data.backdrop_path) {
        console.log(`Movie/TV ${id} full image check:`, {
          validPoster: isValidImagePath(data.poster_path),
          posterUrl: data.poster_path ? buildImageUrl(data.poster_path, "w500") : null,
          validBackdrop: isValidImagePath(data.backdrop_path),
          backdropUrl: data.backdrop_path ? buildImageUrl(data.backdrop_path, "original") : null,
        });
      }
      
      // Recupera i credits in inglese
      const englishCredits = await getCreditsEnglish(parseInt(id, 10), type)
      
      // Se abbiamo i credits in inglese, sostituiscili
      if (englishCredits) {
        data.credits = englishCredits
      }

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

export interface PersonDetails {
  id: number
  name: string
  name_en?: string
  profile_path: string | null
  biography: string
  place_of_birth: string | null
  birthday: string | null
  deathday: string | null
  known_for_department: string
  also_known_as: string[]
  gender: number
  popularity: number
  combined_credits?: {
    cast?: Credit[]
    crew?: Credit[]
  }
  images?: {
    profiles: Image[]
  }
}

export interface Credit {
  id: number
  name: string
  name_en?: string
  character?: string
  job?: string
  department?: string
  profile_path: string | null
  media_type: string
  title?: string
  release_date?: string
  first_air_date?: string
  episode_count?: number
  category?: string
  genre_ids?: number[]
  popularity?: number
  vote_average?: number
  vote_count?: number
  external_ids?: {
    imdb_id?: string
  }
}

export interface Image {
  aspect_ratio: number
  file_path: string
  height: number
  width: number
  vote_average: number
  vote_count: number
}

export async function getPersonDetails(id: number): Promise<PersonDetails | null> {
  try {
    // Usa un URL di base predefinito se la variabile d'ambiente non è impostata
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const response = await fetch(`${apiUrl}/api/person/${id}`)
    if (!response.ok) {
      console.error(`Error fetching person details: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    // Usa il nome in inglese se disponibile, altrimenti usa il nome in italiano
    const name = data.name_en || data.name

    return {
      ...data,
      name,
      combined_credits: data.combined_credits ? {
        cast: data.combined_credits.cast?.map((credit: Credit) => ({
          ...credit,
          name: credit.name_en || credit.name // Usa il nome in inglese per i crediti se disponibile
        })),
        crew: data.combined_credits.crew?.map((credit: Credit) => ({
          ...credit,
          name: credit.name_en || credit.name // Usa il nome in inglese per i crediti se disponibile
        }))
      } : undefined
    }
  } catch (error) {
    console.error('Error in getPersonDetails:', error)
    return null
  }
}


interface TMDBSearchResult {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  media_type: 'movie' | 'tv'
  release_date?: string
  first_air_date?: string
  popularity: number
  vote_average: number
  vote_count: number
  imdb_id?: string
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[]
  page: number
  total_pages: number
  total_results: number
}

export async function searchTMDB(
  query: string,
  type?: string | null,
  page: number = 1
): Promise<TMDBSearchResponse> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!apiKey) {
    throw new Error('TMDB API key is missing')
  }

  // Determina il tipo di ricerca
  const searchType = type === 'tv' ? 'tv' : type === 'movie' ? 'movie' : 'multi'

  const url = new URL(`https://api.themoviedb.org/3/search/${searchType}`)
  url.searchParams.append('api_key', apiKey)
  url.searchParams.append('query', query)
  url.searchParams.append('language', 'it-IT')
  url.searchParams.append('include_adult', 'false')
  url.searchParams.append('page', page.toString())

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`)
  }

  const data = await response.json()

  // Mappa i risultati per garantire la tipizzazione corretta
  const results = data.results.map((item: any): TMDBSearchResult => ({
    id: item.id,
    title: item.title,
    name: item.name,
    poster_path: item.poster_path,
    media_type: item.media_type || (searchType === 'movie' ? 'movie' : searchType === 'tv' ? 'tv' : 'movie'),
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    popularity: item.popularity || 0,
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    imdb_id: item.imdb_id
  }))

  return {
    results,
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results
  }
}