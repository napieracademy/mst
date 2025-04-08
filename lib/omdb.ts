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
  // Se OMDB API è disabilitato, restituisci null
  if (!config.enableOMDBApi) {
    console.log('OMDB API è disabilitato nelle impostazioni');
    return null
  }
  
  try {
    // Otteniamo la chiave API dalle variabili d'ambiente o usiamo il fallback
    const apiKey = OMDB_API_KEY
    
    if (!apiKey) {
      console.error('OMDB API key non disponibile');
      throw new OMDBError('OMDB API key non disponibile', 401);
    }
    
    // Log della configurazione (per debug)
    console.log('OMDB API config:', {
      apiKeyAvailable: !!apiKey,
      apiKeyLength: apiKey.length,
      enableOMDBApi: config.enableOMDBApi,
      environment: process.env.NODE_ENV || 'unknown'
    });
    
    // Verifica che l'IMDb ID sia valido
    if (!imdbId || typeof imdbId !== 'string' || !imdbId.startsWith('tt') || imdbId.length < 7) {
      console.error('OMDB API: IMDb ID non valido:', imdbId);
      throw new OMDBError(`IMDb ID non valido: ${imdbId}`, 400);
    }
    
    // Utilizziamo il proxy API per evitare problemi CORS in produzione
    const isServer = typeof window === 'undefined';
    let url: string;
    
    if (isServer) {
      // Se siamo sul server, possiamo chiamare l'API direttamente
      url = `${OMDB_API_URL}?i=${imdbId}&apikey=${apiKey}`;
      console.log(`DEBUG-OMDB: Calling OMDB API directly from server for IMDb ID ${imdbId}`);
    } else {
      // Se siamo sul client, utilizziamo il nostro proxy API
      // Costruisci l'URL relativo per il nostro proxy
      const origin = window.location.origin;
      url = `${origin}/api/omdb-proxy?imdbId=${imdbId}`;
      console.log(`DEBUG-OMDB: Using proxy API for IMDb ID ${imdbId}`);
    }
    
    // Implementazione con retry automatico
    const maxRetries = 2;
    let attempt = 0;
    let lastError: Error | null = null;
    
    while (attempt <= maxRetries) {
      try {
        attempt++;
        if (attempt > 1) {
          console.log(`Tentativo ${attempt}/${maxRetries + 1} per IMDb ID ${imdbId}...`);
        }
        
        // Effettua la richiesta
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          // Evita l'uso della cache per ogni nuovo tentativo
          cache: attempt === 1 ? 'default' : 'no-cache'
        });
        
        console.log(`OMDB API response status: ${response.status}`);
        
        // Verifica se la risposta è ok
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.Error || `Error ${response.status}`;
          throw new OMDBError(errorMessage, response.status);
        }
        
        // Estrai i dati dalla risposta
        const data = await response.json();
        
        // Verifica se la risposta contiene un errore
        if (data.Response === 'False') {
          if (data.Error === 'Error getting data.') {
            return null; // Media non trovato
          }
          throw new OMDBError(data.Error || 'Error getting data');
        }
        
        // Se arriviamo qui, il recupero è riuscito
        return processOMDBResponse(data, imdbId);
        
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        
        if (attempt <= maxRetries) {
          // Attesa prima del prossimo tentativo (backoff esponenziale)
          const waitTime = Math.min(500 * Math.pow(2, attempt - 1), 2000);
          console.log(`Attesa di ${waitTime}ms prima del tentativo successivo...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // Se arriviamo qui, tutti i tentativi sono falliti
    console.error(`Tutti i ${maxRetries + 1} tentativi falliti per IMDb ID ${imdbId}:`, lastError);
    throw lastError;
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

/**
 * Funzione per processare la risposta da OMDB e formattarla per l'uso interno
 * @param data Dati grezzi dalla risposta OMDB
 * @param imdbId L'ID IMDb del media
 * @returns I dati OMDB formattati
 */
function processOMDBResponse(data: any, imdbId: string): OMDBData {
  try {
    // Normalizza e formatta i dati di rating esterni
    const ratings: ExternalRatings[] = (data.Ratings || []).map((rating: any) => {
      const source = rating.Source // Manteniamo il formato originale del Source
      const value = rating.Value
      
      // Normalizza il valore numerico
      let normalizedValue = normalizeRating(value)
      
      // Per Metacritic, usa anche il campo Metascore se disponibile
      if (source === "Metacritic" && data.Metascore) {
        normalizedValue = parseInt(data.Metascore, 10)
      }
      
      // Per IMDb, usa anche il campo imdbRating se disponibile
      if (source === "Internet Movie Database" && data.imdbRating) {
        normalizedValue = parseFloat(data.imdbRating) * 10
      }
      
      return {
        source,
        value,
        normalizedValue
      }
    })
    
    // Gestione sicura dei voti IMDb
    let imdbVotes = 0;
    if (data.imdbVotes) {
      // Rimuovi le virgole solo se imdbVotes è una stringa
      const votesStr = typeof data.imdbVotes === 'string' ? data.imdbVotes.replace(/,/g, '') : data.imdbVotes;
      imdbVotes = parseInt(votesStr, 10) || 0;
    }
    
    // Formatta i dati OMDB
    return {
      imdb_id: data.imdbID,
      title: data.Title,
      year: data.Year,
      imdb_rating: parseFloat(data.imdbRating) || 0,
      imdb_votes: imdbVotes,
      ratings,
      metascore: data.Metascore ? parseInt(data.Metascore, 10) : undefined,
      type: data.Type === 'movie' ? 'movie' : 'series',
      fullResponse: data // Aggiungiamo i dati originali completi
    }
  } catch (error) {
    // Gestisci l'errore
    if (error instanceof OMDBError) {
      throw error
    } else {
      console.error('Error processing OMDB response:', error)
      throw new OMDBError(
        error instanceof Error ? error.message : 'Errore nel processamento dei dati OMDB'
      )
    }
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