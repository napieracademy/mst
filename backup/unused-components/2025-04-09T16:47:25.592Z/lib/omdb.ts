/**
 * Interfaccia con le API di OMDB
 * Utilizzato per ottenere dati di IMDb (rating, voti, ecc.)
 */

import { config } from './config'
import { getApiKey } from './api-keys-client'

// Configurazione di base per OMDB
const OMDB_API_URL = 'https://www.omdbapi.com'
// Legge la chiave API dalle variabili d'ambiente, con fallback al valore hardcoded per lo sviluppo
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e039393b'

// Classe di errore per le API OMDB
class OMDBError extends Error {
  status: number
  
  constructor(message: string, status: number = 500) {
    super(message)
    this.name = 'OMDBError'
    this.status = status
  }
}

/**
 * Interfaccia per i rating esterni dei media
 */
export interface ExternalRatings {
  source: string
  value: string
  // Valore numerico normalizzato su scala 0-100
  normalizedValue?: number
}

/**
 * Interfaccia per i dati OMDB/IMDb
 */
export interface OMDBData {
  imdb_id: string
  title: string
  year: string
  imdb_rating: number
  imdb_votes: number
  ratings: ExternalRatings[]
  metascore?: number
  type: 'movie' | 'series'
  fullResponse?: any
}

/**
 * Normalizza un valore di rating a una scala 0-100
 * @param value Il valore del rating come stringa (es. "8.5/10", "75%", "4/5")
 * @returns Il valore normalizzato (0-100)
 */
function normalizeRating(value: string): number {
  // Rating su scala 10 (es. "8.5/10")
  if (value.includes('/10')) {
    return parseFloat(value.split('/')[0]) * 10
  }
  
  // Percentuale (es. "75%")
  if (value.includes('%')) {
    return parseFloat(value.replace('%', ''))
  }
  
  // Scala 5 (es. "4/5")
  if (value.includes('/5')) {
    return parseFloat(value.split('/')[0]) * 20
  }
  
  // Numerico puro (es. "8.5")
  if (!isNaN(parseFloat(value))) {
    return parseFloat(value) * 10 // Assumiamo sia su scala 10
  }
  
  // Non possiamo determinare il formato, restituisci 0
  return 0
}

/**
 * Ottieni dati OMDB per un film o serie TV usando l'ID IMDb
 * @param imdbId L'ID IMDb del media
 * @returns I dati OMDB inclusi rating IMDb e altri rating esterni
 */
export async function getOMDBDataByIMDbId(imdbId: string): Promise<OMDBData | null> {
  if (!config.enableOMDBApi) {
    console.log('OMDB API è disabilitato nelle impostazioni');
    return null;
  }

  try {
    const apiKey = OMDB_API_KEY;
    
    if (!apiKey) {
      console.error('OMDB API key non disponibile');
      return null;
    }

    // Verifica che l'IMDb ID sia valido
    if (!imdbId || typeof imdbId !== 'string' || !imdbId.startsWith('tt') || imdbId.length < 7) {
      console.error('OMDB API: IMDb ID non valido:', imdbId);
      return null;
    }

    // Usa il proxy API sul client, chiamata diretta sul server
    const isServer = typeof window === 'undefined';
    const url = isServer 
      ? `${OMDB_API_URL}?i=${imdbId}&apikey=${apiKey}`
      : `/api/omdb-proxy?imdbId=${imdbId}`;

    console.log('OMDB API chiamata:', { isServer, url: url.split('?')[0] });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.Response === 'False') {
      console.error('OMDB API errore:', data.Error || response.statusText);
      return null;
    }

    return {
      imdb_id: data.imdbID,
      title: data.Title,
      year: data.Year,
      imdb_rating: parseFloat(data.imdbRating) || 0,
      imdb_votes: typeof data.imdbVotes === 'string' ? 
        parseInt(data.imdbVotes.replace(/,/g, ''), 10) : 
        parseInt(String(data.imdbVotes || '0'), 10),
      ratings: data.Ratings?.map((r: any) => ({
        source: r.Source,
        value: r.Value,
        normalizedValue: normalizeRating(r.Value)
      })) || [],
      metascore: parseInt(data.Metascore) || undefined,
      type: data.Type as 'movie' | 'series',
      fullResponse: data
    };
  } catch (error) {
    console.error('OMDB API errore:', error);
    return null;
  }
}

/**
 * Cerca film o serie TV su OMDB
 * @param title Il titolo da cercare
 * @param type Il tipo di media ('movie', 'series', o 'all')
 * @param year Anno opzionale per filtrare i risultati
 * @returns Lista dei risultati più rilevanti da OMDB
 */
export async function searchOMDB(
  title: string,
  type: 'movie' | 'series' | 'all' = 'all',
  year?: string
): Promise<OMDBData[]> {
  // Se OMDB API è disabilitato, restituisci un array vuoto
  if (!config.enableOMDBApi) {
    return []
  }
  
  try {
    // Otteniamo la chiave API dalle variabili d'ambiente o usiamo il fallback
    const apiKey = OMDB_API_KEY
    
    if (!apiKey) {
      console.error('OMDB API key non disponibile')
      throw new OMDBError('OMDB API key non disponibile', 401)
    }
    
    // Log della configurazione (per debug)
    console.log('OMDB Search API config:', {
      apiKeyAvailable: !!apiKey,
      apiKeyLength: apiKey.length,
      enableOMDBApi: config.enableOMDBApi,
      environment: process.env.NODE_ENV || 'unknown'
    });
    
    // Prepara i parametri di ricerca
    const params = new URLSearchParams({
      s: title,
      apikey: apiKey
    })
    
    // Aggiungi filtro per tipo se specificato
    if (type !== 'all') {
      params.append('type', type)
    }
    
    // Aggiungi filtro per anno se specificato
    if (year) {
      params.append('y', year)
    }
    
    // Utilizziamo il proxy API per evitare problemi CORS in produzione
    const isServer = typeof window === 'undefined';
    let url: string;
    
    if (isServer) {
      // Se siamo sul server, possiamo chiamare l'API direttamente
      url = `${OMDB_API_URL}?${params.toString()}`;
      console.log(`DEBUG-OMDB Search: Calling OMDB API directly from server for title "${title}"`);
    } else {
      // Se siamo sul client, utilizziamo il nostro proxy API (da implementare)
      // Per ora, questa funzione non è utilizzata dal client
      const origin = window.location.origin;
      url = `${origin}/api/omdb-search-proxy?${params.toString()}`;
      console.log(`DEBUG-OMDB Search: Using proxy API for title "${title}"`);
    }
    
    // Effettua la richiesta
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.Error || `Error ${response.status}`
      throw new OMDBError(errorMessage, response.status)
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    
    // Verifica se la risposta contiene un errore
    if (data.Response === 'False') {
      if (data.Error === 'Movie not found!') {
        return [] // Nessun risultato
      }
      throw new OMDBError(data.Error || 'Unknown error')
    }
    
    // Ottieni dati dettagliati per ogni risultato
    const detailedResults = await Promise.all(
      data.Search.map(async (item: any) => {
        try {
          const detail = await getOMDBDataByIMDbId(item.imdbID)
          return detail
        } catch (error) {
          console.error(`Error fetching details for ${item.imdbID}:`, error)
          return null
        }
      })
    )
    
    // Filtra i risultati nulli e restituisci i dati
    return detailedResults.filter((item): item is OMDBData => item !== null)
  } catch (error) {
    // Gestisci l'errore
    if (error instanceof OMDBError) {
      throw error
    } else {
      console.error('Error calling OMDB API:', error)
      throw new OMDBError(
        error instanceof Error ? error.message : 'Errore sconosciuto'
      )
    }
  }
}

function processOMDBResponse(data: any): OMDBData {
  // Normalizza i rating esterni
  const ratings = data.Ratings?.map((rating: any) => {
    let normalizedValue = 0
    
    switch (rating.Source) {
      case 'Internet Movie Database':
        normalizedValue = parseFloat(rating.Value.split('/')[0]) * 10
        break
      case 'Rotten Tomatoes':
        normalizedValue = parseInt(rating.Value)
        break
      case 'Metacritic':
        normalizedValue = parseInt(rating.Value)
        break
      default:
        normalizedValue = 0
    }
    
    return {
      source: rating.Source,
      value: rating.Value,
      normalizedValue
    }
  }) || []

  // Gestisci i voti IMDb
  let imdbVotes = 0
  if (typeof data.imdbVotes === 'string') {
    imdbVotes = parseInt(data.imdbVotes.replace(/,/g, ''))
  } else if (typeof data.imdbVotes === 'number') {
    imdbVotes = data.imdbVotes
  }

  // Normalizza il Metascore
  const metascore = data.Metascore ? parseInt(data.Metascore) : undefined

  return {
    imdb_id: data.imdbID,
    title: data.Title,
    year: data.Year,
    imdb_rating: parseFloat(data.imdbRating) || 0,
    imdb_votes: imdbVotes,
    ratings,
    metascore,
    type: data.Type as 'movie' | 'series',
    fullResponse: data
  }
}