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
    return null
  }
  
  try {
    // Utilizziamo direttamente la chiave API hardcoded
    const apiKey = OMDB_API_KEY
    
    if (!apiKey) {
      console.error('OMDB API key non disponibile')
      throw new OMDBError('OMDB API key non disponibile', 401)
    }
    
    // Verifica che l'IMDb ID sia valido
    if (!imdbId || typeof imdbId !== 'string' || !imdbId.startsWith('tt') || imdbId.length < 7) {
      console.error('OMDB API: IMDb ID non valido:', imdbId);
      throw new OMDBError(`IMDb ID non valido: ${imdbId}`, 400);
    }
    
    // Costruisci l'URL per l'API
    const url = `${OMDB_API_URL}?i=${imdbId}&apikey=${apiKey}`
    // URL sicuro per il log (nasconde la chiave API)
    const safeUrl = `${OMDB_API_URL}?i=${imdbId}&apikey=***${apiKey.slice(-4)}`
    console.log(`DEBUG-OMDB: Requesting URL ${safeUrl}`)
    
    // Effettua la richiesta
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
      if (data.Error === 'Error getting data.') {
        return null // Media non trovato
      }
      throw new OMDBError(data.Error || 'Error getting data')
    }
    
    // Normalizza e formatta i dati di rating esterni
    const ratings: ExternalRatings[] = (data.Ratings || []).map((rating: any) => {
      const source = rating.Source
      const value = rating.Value
      
      return {
        source,
        value,
        normalizedValue: normalizeRating(value)
      }
    })
    
    // Formatta i dati OMDB
    return {
      imdb_id: data.imdbID,
      title: data.Title,
      year: data.Year,
      imdb_rating: parseFloat(data.imdbRating) || 0,
      imdb_votes: parseInt(data.imdbVotes?.replace(/,/g, '') || '0', 10),
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
      console.error('Error calling OMDB API:', error)
      throw new OMDBError(
        error instanceof Error ? error.message : 'Errore sconosciuto'
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
    // Utilizziamo direttamente la chiave API hardcoded
    const apiKey = OMDB_API_KEY
    
    if (!apiKey) {
      console.error('OMDB API key non disponibile')
      throw new OMDBError('OMDB API key non disponibile', 401)
    }
    
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
    
    // Costruisci l'URL per l'API
    const url = `${OMDB_API_URL}?${params.toString()}`
    
    // Effettua la richiesta
    const response = await fetch(url)
    
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