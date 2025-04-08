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

// Funzione per recuperare i credits con nomi internazionali
async function getMovieCreditsEnglish(movieId: number) {
  try {
    // Prima recuperiamo i credits in inglese per avere i nomi internazionali
    const englishData = await fetchFromTMDB(`/movie/${movieId}/credits`, {}, "en-US")
    
    // Creiamo una mappa dei nomi internazionali
    const internationalNames = new Map()
    englishData.cast?.forEach((person: any) => {
      internationalNames.set(person.id, person.name)
    })
    englishData.crew?.forEach((person: any) => {
      internationalNames.set(person.id, person.name)
    })

    // Ora recuperiamo i credits in italiano per avere il resto delle informazioni localizzate
    const italianData = await fetchFromTMDB(`/movie/${movieId}/credits`, {}, "it-IT")

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
    console.error(`Error fetching credits for movie ${movieId}:`, error)
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
      const englishCredits = await getMovieCreditsEnglish(parseInt(id, 10))
      
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

// Modifica la funzione getPersonDetails per lanciare un errore quando le API sono disabilitate
export async function getPersonDetails(id: string): Promise<any | null> {
  if (!id) return null

  // Se le API sono disabilitate, lancia un errore
  if (!config.enableTMDBApi) {
    console.error(`TMDB API disabled: request for person ${id} blocked`)
    throw new Error("TMDB API is disabled")
  }

  try {
    // Ottieni i dettagli base in italiano
    const baseData = await fetchFromTMDB(`/person/${id}`, {
      append_to_response: "combined_credits,images,external_ids",
    }, "it-IT");

    // Log specifico per external_ids
    console.log(`TMDB person ${id} external_ids:`, {
      hasExternalIds: !!baseData.external_ids,
      imdbId: baseData.external_ids?.imdb_id || 'non disponibile',
      keys: baseData.external_ids ? Object.keys(baseData.external_ids) : []
    });

    // Ottieni i dettagli dei film nella filmografia
    if (baseData.combined_credits?.cast) {
      const moviePromises = baseData.combined_credits.cast.map(async (credit: any) => {
        if (credit.media_type === 'movie') {
          const movieDetails = await fetchFromTMDB(`/movie/${credit.id}`, {
            append_to_response: "external_ids"
          }, "it-IT");
          return {
            ...credit,
            external_ids: movieDetails.external_ids
          };
        }
        return credit;
      });
      baseData.combined_credits.cast = await Promise.all(moviePromises);
    }

    if (baseData.combined_credits?.crew) {
      const crewPromises = baseData.combined_credits.crew.map(async (credit: any) => {
        if (credit.media_type === 'movie') {
          const movieDetails = await fetchFromTMDB(`/movie/${credit.id}`, {
            append_to_response: "external_ids"
          }, "it-IT");
          return {
            ...credit,
            external_ids: movieDetails.external_ids
          };
        }
        return credit;
      });
      baseData.combined_credits.crew = await Promise.all(crewPromises);
    }

    const data = baseData;
    
    // Ottieni direttamente i known_for attraverso l'endpoint person/popular
    try {
      const popularPersons = await fetchFromTMDB(`/person/popular`, {}, "it-IT");
      const personInPopular = popularPersons.results?.find((p: any) => p.id === parseInt(id, 10));
      
      // Filtra i crediti escludendo talk show, reality, news e altri programmi non rilevanti
      const relevantCredits = [...(data.combined_credits?.cast || []), ...(data.combined_credits?.crew || [])]
        .filter(credit => {
          // Log per debug
          if (credit.media_type === 'tv' && credit.name?.toLowerCase().includes('late night')) {
            console.log('Filtering TV credit:', {
              title: credit.title || credit.name,
              character: credit.character,
              category: credit.category,
              genreIds: credit.genre_ids,
              episodeCount: credit.episode_count
            });
          }

          // Escludiamo i generi non rilevanti
          const excludedGenreIds = [
            10767, // Talk Show
            10764, // Reality
            10763  // News
          ];

          // Verifica se è un talk show o programma simile
          const isTalkShow = credit.genre_ids?.some((genreId: number) => excludedGenreIds.includes(genreId)) || false;

          // Verifica se è un'apparizione come "Self" (se stesso)
          const isSelf = 
            credit.character === 'Self' || 
            credit.character?.toLowerCase().includes('self') ||
            credit.character?.toLowerCase().includes('himself') ||
            credit.character?.toLowerCase().includes('herself');

          // Verifica se è un'apparizione come ospite
          const isGuestAppearance = 
            credit.category === 'guest_star' ||
            credit.character?.toLowerCase().includes('guest') ||
            credit.character?.toLowerCase().includes('host');

          // Verifica se è una serie TV con genere talk show
          const isTalkShowSeries = 
            credit.media_type === 'tv' && 
            (isTalkShow || 
             credit.name?.toLowerCase().includes('late night') ||
             credit.name?.toLowerCase().includes('talk show') ||
             credit.name?.toLowerCase().includes('tonight show'));

          // Per le serie TV, escludiamo anche quelle con pochi episodi (apparizioni sporadiche)
          const isMinorTVAppearance = 
            credit.media_type === 'tv' && 
            (credit.episode_count === 1 || credit.episode_count === undefined);

          // La logica finale di inclusione - dobbiamo escludere tutti i tipi di apparizioni come self o guest
          const shouldInclude = 
            // Per i film, includi tutti tranne quelli in cui appare come "self"
            (credit.media_type === 'movie' && !isSelf) ||
            // Per le serie TV, applica filtri più severi
            (credit.media_type === 'tv' && 
             !isTalkShow && 
             !isTalkShowSeries && 
             !isSelf && 
             !isGuestAppearance && 
             !isMinorTVAppearance && 
             credit.episode_count > 1);

          // Solo per debug: registra qualsiasi apparizione come Self o Guest che viene comunque inclusa
          if (shouldInclude && 
              (isSelf || isGuestAppearance || isTalkShowSeries || isMinorTVAppearance)) {
            console.log('WARNING: Including potentially unwanted credit:', {
              title: credit.title || credit.name,
              character: credit.character,
              category: credit.category,
              genreIds: credit.genre_ids,
              episodeCount: credit.episode_count,
              mediaType: credit.media_type,
              isSelf,
              isGuestAppearance,
              isTalkShowSeries,
              isMinorTVAppearance
            });
          }

          return shouldInclude;
        });

      // Nella funzione getPersonDetails, sostituisci il blocco di scoring esistente con:
      const scoredCredits = relevantCredits.map(credit => ({
        ...credit,
        score: calculateCreditScore(credit)
      }));

      // Ordina per punteggio e prendi i primi 12
      const sortedCredits = scoredCredits
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      data.known_for_credits = sortedCredits;
      console.log(`Person ${id}: found ${sortedCredits.length} most notable credits`);

    } catch (error) {
      console.error(`Error fetching known_for for person ${id}:`, error);
      // In caso di errore, usa un approccio di fallback simile
      const allCredits = [];
      if (data.combined_credits?.cast) {
        allCredits.push(...data.combined_credits.cast.map((credit: any) => ({
          ...credit,
          type: "cast"
        })));
      }
      if (data.combined_credits?.crew) {
        const directorCredits = data.combined_credits.crew
          .filter((c: any) => c.job === "Director")
          .map((credit: any) => ({
            ...credit,
            type: "crew"
          }));
        allCredits.push(...directorCredits);
      }

      const sortedCredits = allCredits.sort((a: any, b: any) => {
        const scoreA = (a.popularity || 0) * 0.7 + (a.vote_average || 0) * 0.3;
        const scoreB = (b.popularity || 0) * 0.7 + (b.vote_average || 0) * 0.3;
        return scoreB - scoreA;
      });

      const topCredits = sortedCredits.slice(0, 12).map((credit: any) => {
        const isDirector = credit.type === "crew" && credit.job === "Director";
        return {
          ...credit,
          media_type: credit.media_type || (credit.first_air_date ? "tv" : "movie"),
          role: isDirector ? "directing" : "acting"
        };
      });

      data.known_for_credits = topCredits;
      console.log(`Person ${id} fallback: found ${topCredits.length} most notable credits`);
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

// Lista dei film vincitori dell'Oscar come "Miglior Film" dal 2004 al 2025
const oscarBestPictureWinners = [
  { title: "Poor Things", year: 2025, tmdb_id: 792307 },
  { title: "Oppenheimer", year: 2024, tmdb_id: 872585 },
  { title: "Everything Everywhere All at Once", year: 2023, tmdb_id: 545611 },
  { title: "CODA", year: 2022, tmdb_id: 776503 },
  { title: "Nomadland", year: 2021, tmdb_id: 581734 },
  { title: "Parasite", year: 2020, tmdb_id: 496243 },
  { title: "Green Book", year: 2019, tmdb_id: 490132 },
  { title: "The Shape of Water", year: 2018, tmdb_id: 399055 },
  { title: "Moonlight", year: 2017, tmdb_id: 376867 },
  { title: "Spotlight", year: 2016, tmdb_id: 314365 },
  { title: "Birdman", year: 2015, tmdb_id: 194662 },
  { title: "12 Years a Slave", year: 2014, tmdb_id: 76203 },
  { title: "Argo", year: 2013, tmdb_id: 68734 },
  { title: "The Artist", year: 2012, tmdb_id: 74643 },
  { title: "The King's Speech", year: 2011, tmdb_id: 45269 },
  { title: "The Hurt Locker", year: 2010, tmdb_id: 12162 },
  { title: "Slumdog Millionaire", year: 2009, tmdb_id: 12405 },
  { title: "No Country for Old Men", year: 2008, tmdb_id: 6977 },
  { title: "The Departed", year: 2007, tmdb_id: 1422 },
  { title: "Crash", year: 2006, tmdb_id: 1640 },
  { title: "Million Dollar Baby", year: 2005, tmdb_id: 70 },
  { title: "The Lord of the Rings: The Return of the King", year: 2004, tmdb_id: 122 }
];

// Ottieni i film vincitori dell'Oscar come "Miglior Film"
export async function getOscarBestPictureWinners(): Promise<Movie[]> {
  try {
    console.log("Fetching Oscar Best Picture winners...");
    
    // Recupera i dettagli di ogni film in parallelo
    const moviesWithDetails = await Promise.all(
      oscarBestPictureWinners.map(async (winner) => {
        try {
          const details = await fetchFromTMDB(`/movie/${winner.tmdb_id}`, {
            append_to_response: "external_ids"
          });
          
          return {
            ...details,
            oscar_win_year: winner.year
          };
        } catch (error) {
          console.error(`Error fetching details for movie ${winner.title}:`, error);
          return null;
        }
      })
    );

    // Filtra eventuali errori e ordina per anno di vittoria (più recente prima)
    const validMovies = moviesWithDetails
      .filter((movie): movie is Movie => movie !== null)
      .sort((a, b) => (b.oscar_win_year || 0) - (a.oscar_win_year || 0));

    console.log(`Got ${validMovies.length} Oscar Best Picture winners`);
    return validMovies;
  } catch (error) {
    console.error("Error in getOscarBestPictureWinners:", error);
    return [];
  }
}