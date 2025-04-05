import { config } from "./config"
import type { Movie } from "./types"

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

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
  url.searchParams.append("language", language)
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  try {
    console.log(`Fetching from TMDB: ${endpoint}`, {
      apiKeyPresent: !!TMDB_API_KEY,
      apiKeyLength: TMDB_API_KEY?.length || 0,
      url: url.toString().replace(TMDB_API_KEY, "API_KEY_HIDDEN"),
      language: language
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

// Ottieni dettagli di un film o serie TV
export async function getMovieDetails(id: string, type: "movie" | "tv"): Promise<Movie | null> {
  if (!id) return null

  try {
    // Ottieni i dettagli base in italiano
    const baseData = await fetchFromTMDB(`/${type}/${id}`, {
      append_to_response: "videos,recommendations,similar",
    }, "it-IT");
    
    // Ottieni i crediti (cast e crew) in inglese
    const creditsData = await fetchFromTMDB(`/${type}/${id}/credits`, {}, "en-US");
    
    // Combina i dati
    const data = {
      ...baseData,
      credits: creditsData,
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

// Ottieni film correlati a un attore/persona
export async function getActorRelatedMovies(personId: string): Promise<Movie[]> {
  try {
    // Otteniamo i film in cui l'attore ha recitato
    const data = await fetchFromTMDB(`/person/${personId}/movie_credits`)
    
    if (data && !data.error && data.cast) {
      // Prendiamo solo i film più popolari (massimo 10)
      return data.cast
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, 10)
    }
    
    console.error(`Failed to fetch actor related movies:`, data?.error)
    return []
  } catch (error) {
    console.error("Error fetching actor related movies:", error)
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
    // Ottieni i dettagli della persona in inglese per avere i nomi corretti
    const basicData = await fetchFromTMDB(`/person/${id}`, {}, "en-US");
    
    // Ottieni i dettagli della persona in italiano (che includono i known_for)
    const localizedData = await fetchFromTMDB(`/person/${id}`, {
      append_to_response: "combined_credits,images,movie_credits,tv_credits"
    }, "it-IT");
    
    // Combina tutti i dati
    const data = {
      ...basicData,
      biography: localizedData.biography || basicData.biography,
      combined_credits: localizedData.combined_credits || {},
      movie_credits: localizedData.movie_credits || {},
      tv_credits: localizedData.tv_credits || {},
      images: localizedData.images || {},
      // Inizializza l'array dei known_for_credits
      known_for_credits: []
    };
    
    // Ottieni direttamente i known_for attraverso l'endpoint person/popular
    // Nota: questo è un workaround dato che non c'è un endpoint diretto per known_for
    try {
      const popularPersons = await fetchFromTMDB(`/person/popular`, {}, "it-IT");
      const personInPopular = popularPersons.results?.find((p: any) => p.id === parseInt(id, 10));
      
      if (personInPopular && personInPopular.known_for && Array.isArray(personInPopular.known_for)) {
        console.log(`Person ${id} trovato nei popolari con ${personInPopular.known_for.length} known_for`);
        
        // Estrai gli ID dei film/serie per cui la persona è nota
        const knownForIds = personInPopular.known_for.map((item: any) => item.id);
        console.log(`Person ${id} known_for IDs:`, knownForIds);
        
        // Filtra i crediti per includere solo known_for
        let knownForCredits: any[] = [];
        
        if (data.combined_credits?.cast) {
          const knownForCast = data.combined_credits.cast.filter((item: any) => 
            knownForIds.includes(item.id)
          );
          knownForCredits.push(...knownForCast);
        }
        
        if (data.combined_credits?.crew) {
          const knownForCrew = data.combined_credits.crew.filter((item: any) => 
            knownForIds.includes(item.id) && item.job === "Director"
          );
          knownForCredits.push(...knownForCrew);
        }
        
        // Assegna i crediti filtrati
        data.known_for_credits = knownForCredits;
        
        console.log(`Person ${id} known for ${knownForIds.length} titles, extracted ${data.known_for_credits.length} matching credits`);
        console.log(`Known for credits sample:`, data.known_for_credits.slice(0, 2));
      } else {
        // Se la persona non è tra i popolari, usa un approccio alternativo
        // Seleziona i film/serie con più voti o più popolari dai crediti
        console.log(`Person ${id} non trovato nei popolari, utilizzo metodo alternativo`);
        
        const allCredits = [];
        if (data.combined_credits?.cast) allCredits.push(...data.combined_credits.cast);
        if (data.combined_credits?.crew) {
          const directorCredits = data.combined_credits.crew.filter((c: any) => c.job === "Director");
          allCredits.push(...directorCredits);
        }
        
        // Ordina per popolarità e prendi i primi 5
        const topCredits = [...allCredits]
          .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 5);
        
        data.known_for_credits = topCredits;
        console.log(`Person ${id} alternate method: found ${topCredits.length} top credits`);
      }
    } catch (error) {
      console.error(`Error fetching known_for for person ${id}:`, error);
      // In caso di errore nell'ottenere i known_for, utilizziamo un approccio di fallback
      // Basato sui credits più popolari che abbiamo già
      const allCredits = [];
      if (data.combined_credits?.cast) allCredits.push(...data.combined_credits.cast);
      if (data.combined_credits?.crew) {
        const directorCredits = data.combined_credits.crew.filter((c: any) => c.job === "Director");
        allCredits.push(...directorCredits);
      }
      
      // Ordina per popolarità e prendi i primi 5
      const topCredits = [...allCredits]
        .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 5);
      
      data.known_for_credits = topCredits;
      console.log(`Person ${id} fallback: found ${topCredits.length} top credits`);
    }
    
    // Log esteso per debug delle immagini
    if (data && data.profile_path) {
      console.log(`Person ${id} image details:`, {
        profilePath: data.profile_path,
        isValid: isValidImagePath(data.profile_path),
        profileUrl: buildImageUrl(data.profile_path, "h632"),
        hasImagesCollection: Boolean(data.images && data.images.profiles && data.images.profiles.length > 0),
        alternativeImagesCount: data.images?.profiles?.length || 0
      });
      
      // Verificare anche immagini alternative se disponibili
      if (data.images && data.images.profiles && data.images.profiles.length > 0) {
        const altImages = data.images.profiles.slice(0, 3).map((img: any) => ({
          path: img.file_path,
          isValid: isValidImagePath(img.file_path),
          url: buildImageUrl(img.file_path, "w185")
        }));
        console.log(`Person ${id} alternative images:`, altImages);
      }
    }

    return data
  } catch (error) {
    console.error("Error fetching person details:", error)
    throw error // Rilancia l'errore
  }
}