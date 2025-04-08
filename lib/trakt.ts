/**
 * Interfaccia con le API di Trakt.tv
 * Utilizzato per ottenere dati di popolarità più accurati
 */

import { config } from './config'
import { getApiKey } from './api-keys-client'

// Configurazione di base per Trakt.tv
const TRAKT_API_URL = 'https://api.trakt.tv'
const TRAKT_API_VERSION = '2'
const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID

// Classe di errore per le API Trakt
class TraktError extends Error {
  status: number
  
  constructor(message: string, status: number = 500) {
    super(message)
    this.name = 'TraktError'
    this.status = status
  }
}

/**
 * Interfaccia per i risultati di popolarità dei film
 */
export interface TraktMoviePopularity {
  trakt_id: number
  tmdb_id?: number
  imdb_id?: string
  title: string
  year?: number
  watchers: number
  plays: number
  collected_count: number
  comment_count: number
  list_count: number
}

/**
 * Interfaccia per i risultati di popolarità delle serie TV
 */
export interface TraktShowPopularity {
  trakt_id: number
  tmdb_id?: number
  imdb_id?: string
  title: string
  year?: number
  watchers: number
  plays: number
  collected_count: number
  comment_count: number
  list_count: number
}

/**
 * Ottiene i dati di popolarità per un film specifico
 * @param id ID TMDB o IMDB del film
 * @param idType Tipo di ID ('tmdb' o 'imdb')
 * @returns I dati di popolarità del film
 */
export async function getMoviePopularity(
  id: string | number,
  idType: 'tmdb' | 'imdb' = 'tmdb'
): Promise<TraktMoviePopularity | null> {
  // Se Trakt API è disabilitato, restituisci null
  if (!config.enableTraktApi) {
    return null
  }
  
  try {
    // Ottieni la chiave API dal sistema centralizzato
    const clientId = TRAKT_CLIENT_ID || await getApiKey('trakt')
    
    if (!clientId) {
      throw new TraktError('Trakt Client ID non disponibile', 401)
    }
    
    // Costruisci l'URL per l'API
    const endpoint = `/movies/${idType}:${id}/stats`
    
    // Effettua la richiesta
    const response = await fetch(`${TRAKT_API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': TRAKT_API_VERSION,
        'trakt-api-key': clientId
      }
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      // Gestisce i 404 in modo elegante
      if (response.status === 404) {
        return null
      }
      
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error || `Error ${response.status}`
      throw new TraktError(errorMessage, response.status)
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    
    // Recupera i metadati del film per ottenere ID TMDB e IMDB
    const metadataEndpoint = `/movies/${idType}:${id}`
    const metadataResponse = await fetch(`${TRAKT_API_URL}${metadataEndpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': TRAKT_API_VERSION,
        'trakt-api-key': clientId
      }
    })
    
    let tmdbId, imdbId, title, year
    
    if (metadataResponse.ok) {
      const metadata = await metadataResponse.json()
      tmdbId = metadata.ids?.tmdb
      imdbId = metadata.ids?.imdb
      title = metadata.title
      year = metadata.year
    }
    
    // Formatta i dati di popolarità
    return {
      trakt_id: data.trakt_id || 0,
      tmdb_id: tmdbId,
      imdb_id: imdbId,
      title: title || '',
      year: year,
      watchers: data.watchers || 0,
      plays: data.plays || 0,
      collected_count: data.collected_count || 0,
      comment_count: data.comments || 0,
      list_count: data.lists || 0
    }
  } catch (error) {
    // Gestisci l'errore
    if (error instanceof TraktError) {
      throw error
    } else {
      console.error('Error calling Trakt API:', error)
      throw new TraktError(
        error instanceof Error ? error.message : 'Errore sconosciuto'
      )
    }
  }
}

/**
 * Ottiene i dati di popolarità per una serie TV specifica
 * @param id ID TMDB o IMDB della serie
 * @param idType Tipo di ID ('tmdb' o 'imdb')
 * @returns I dati di popolarità della serie
 */
export async function getShowPopularity(
  id: string | number,
  idType: 'tmdb' | 'imdb' = 'tmdb'
): Promise<TraktShowPopularity | null> {
  // Se Trakt API è disabilitato, restituisci null
  if (!config.enableTraktApi) {
    return null
  }
  
  try {
    // Ottieni la chiave API dal sistema centralizzato
    const clientId = TRAKT_CLIENT_ID || await getApiKey('trakt')
    
    if (!clientId) {
      throw new TraktError('Trakt Client ID non disponibile', 401)
    }
    
    // Costruisci l'URL per l'API
    const endpoint = `/shows/${idType}:${id}/stats`
    
    // Effettua la richiesta
    const response = await fetch(`${TRAKT_API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': TRAKT_API_VERSION,
        'trakt-api-key': clientId
      }
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      // Gestisce i 404 in modo elegante
      if (response.status === 404) {
        return null
      }
      
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error || `Error ${response.status}`
      throw new TraktError(errorMessage, response.status)
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    
    // Recupera i metadati della serie per ottenere ID TMDB e IMDB
    const metadataEndpoint = `/shows/${idType}:${id}`
    const metadataResponse = await fetch(`${TRAKT_API_URL}${metadataEndpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': TRAKT_API_VERSION,
        'trakt-api-key': clientId
      }
    })
    
    let tmdbId, imdbId, title, year
    
    if (metadataResponse.ok) {
      const metadata = await metadataResponse.json()
      tmdbId = metadata.ids?.tmdb
      imdbId = metadata.ids?.imdb
      title = metadata.title
      year = metadata.year
    }
    
    // Formatta i dati di popolarità
    return {
      trakt_id: data.trakt_id || 0,
      tmdb_id: tmdbId,
      imdb_id: imdbId,
      title: title || '',
      year: year,
      watchers: data.watchers || 0,
      plays: data.plays || 0,
      collected_count: data.collected_count || 0,
      comment_count: data.comments || 0,
      list_count: data.lists || 0
    }
  } catch (error) {
    // Gestisci l'errore
    if (error instanceof TraktError) {
      throw error
    } else {
      console.error('Error calling Trakt API:', error)
      throw new TraktError(
        error instanceof Error ? error.message : 'Errore sconosciuto'
      )
    }
  }
}

/**
 * Cerca film e serie su Trakt.tv
 * @param query La query di ricerca
 * @param type Il tipo di media ('movie', 'show', o 'all')
 * @param limit Numero massimo di risultati
 * @returns Lista dei risultati più popolari da Trakt
 */
export async function searchMedia(
  query: string,
  type: 'movie' | 'show' | 'all' = 'all',
  limit: number = 10
): Promise<Array<TraktMoviePopularity | TraktShowPopularity>> {
  // Se Trakt API è disabilitato, restituisci un array vuoto
  if (!config.enableTraktApi) {
    return []
  }
  
  try {
    // Ottieni la chiave API dal sistema centralizzato
    const clientId = TRAKT_CLIENT_ID || await getApiKey('trakt')
    
    if (!clientId) {
      throw new TraktError('Trakt Client ID non disponibile', 401)
    }
    
    // Determina i tipi di media da cercare
    let types = ['movie', 'show']
    if (type !== 'all') {
      types = [type]
    }
    
    // Costruisci l'URL per l'API
    const endpoint = `/search/${types.join(',')}?query=${encodeURIComponent(query)}&limit=${limit}`
    
    // Effettua la richiesta
    const response = await fetch(`${TRAKT_API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': TRAKT_API_VERSION,
        'trakt-api-key': clientId
      }
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error || `Error ${response.status}`
      throw new TraktError(errorMessage, response.status)
    }
    
    // Estrai i dati dalla risposta
    const searchResults = await response.json()
    
    // Processa i risultati e ottieni i dati di popolarità per ciascuno
    const results = await Promise.all(
      searchResults.map(async (result: any) => {
        const mediaType = result.type // 'movie' o 'show'
        const mediaData = result[mediaType] // Dati del media
        
        // Crea un oggetto di base con le informazioni disponibili
        const baseData = {
          trakt_id: mediaData.ids.trakt,
          tmdb_id: mediaData.ids.tmdb,
          imdb_id: mediaData.ids.imdb,
          title: mediaData.title,
          year: mediaData.year
        }
        
        try {
          // Ottieni i dati di popolarità
          if (mediaType === 'movie') {
            const popularity = await getMoviePopularity(mediaData.ids.trakt, 'tmdb')
            return {
              ...baseData,
              watchers: popularity?.watchers || 0,
              plays: popularity?.plays || 0,
              collected_count: popularity?.collected_count || 0,
              comment_count: popularity?.comment_count || 0,
              list_count: popularity?.list_count || 0
            }
          } else {
            const popularity = await getShowPopularity(mediaData.ids.trakt, 'tmdb')
            return {
              ...baseData,
              watchers: popularity?.watchers || 0,
              plays: popularity?.plays || 0,
              collected_count: popularity?.collected_count || 0,
              comment_count: popularity?.comment_count || 0,
              list_count: popularity?.list_count || 0
            }
          }
        } catch (error) {
          // In caso di errore, restituisci solo i dati di base
          return {
            ...baseData,
            watchers: 0,
            plays: 0,
            collected_count: 0,
            comment_count: 0,
            list_count: 0
          }
        }
      })
    )
    
    // Ordina i risultati per popolarità (watchers)
    return results.sort((a, b) => b.watchers - a.watchers)
  } catch (error) {
    // Gestisci l'errore
    if (error instanceof TraktError) {
      throw error
    } else {
      console.error('Error calling Trakt API:', error)
      throw new TraktError(
        error instanceof Error ? error.message : 'Errore sconosciuto'
      )
    }
  }
}