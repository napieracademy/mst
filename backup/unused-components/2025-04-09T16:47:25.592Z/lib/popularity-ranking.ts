/**
 * Sistema di ranking ibrido che combina popolarità da diverse fonti
 * TMDB, Trakt.tv, IMDb, ecc.
 */

import { config } from './config'
import { getMoviePopularity, getShowPopularity } from './trakt'
import { getOMDBDataByIMDbId } from './omdb'

// Interfaccia per il punteggio di popolarità
export interface PopularityScore {
  // Punteggio composito finale (0-100)
  score: number
  
  // Punteggi dalle varie fonti (0-100)
  sources: {
    tmdb?: number
    trakt?: number
    imdb?: number
    rottenTomatoes?: number
  }
  
  // Metadati utili per il debug
  metadata: {
    imdb_id?: string
    trakt_id?: number
    imdb_rating?: number
    imdb_votes?: number
    trakt_watchers?: number
    trakt_plays?: number
    tmdb_popularity?: number
    tmdb_vote_average?: number
    tmdb_vote_count?: number
  }
}

/**
 * Normalizza un valore su una scala 0-100
 * @param value Valore da normalizzare
 * @param min Valore minimo nella scala originale
 * @param max Valore massimo nella scala originale
 * @returns Valore normalizzato (0-100)
 */
function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 50 // Evita divisione per zero
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

/**
 * Calcola uno score di popolarità composito per un film
 * @param tmdbId ID TMDB del film
 * @param imdbId ID IMDB del film (opzionale)
 * @returns Score di popolarità con dettagli sulle varie fonti
 */
export async function getMoviePopularityScore(
  tmdbId: number | string,
  imdbId?: string,
  tmdbPopularity?: number,
  tmdbVoteAverage?: number,
  tmdbVoteCount?: number
): Promise<PopularityScore> {
  const weights = config.popularityRanking.weights
  const result: PopularityScore = {
    score: 0,
    sources: {},
    metadata: {
      tmdb_popularity: tmdbPopularity,
      tmdb_vote_average: tmdbVoteAverage,
      tmdb_vote_count: tmdbVoteCount
    }
  }
  
  // Converti tmdbId a numero se è una stringa
  const tmdbIdNum = typeof tmdbId === 'string' ? parseInt(tmdbId, 10) : tmdbId
  
  // Ottieni dati da Trakt.tv
  if (weights.trakt > 0 && config.enableTraktApi) {
    try {
      const traktData = await getMoviePopularity(tmdbIdNum)
      
      if (traktData) {
        // Se non abbiamo l'imdbId, prova a ottenerlo da Trakt
        if (!imdbId && traktData.imdb_id) {
          imdbId = traktData.imdb_id
        }
        
        // Memorizza i metadati Trakt
        result.metadata.trakt_id = traktData.trakt_id
        result.metadata.trakt_watchers = traktData.watchers
        result.metadata.trakt_plays = traktData.plays
        
        // Calcola un punteggio da Trakt (watchers è il valore più significativo)
        // Logaritmico per ridurre l'effetto dei valori estremi
        const watchers = Math.log(traktData.watchers + 1) * 10 // +1 per evitare log(0)
        const plays = Math.log(traktData.plays + 1) * 5
        const lists = Math.log(traktData.list_count + 1) * 3
        
        // Normalizziamo su scala 0-100
        // I valori massimi sono approssimativi, basati su film molto popolari
        const maxWatchers = Math.log(100000 + 1) * 10
        const maxPlays = Math.log(500000 + 1) * 5
        const maxLists = Math.log(50000 + 1) * 3
        
        const watchersScore = normalizeValue(watchers, 0, maxWatchers)
        const playsScore = normalizeValue(plays, 0, maxPlays)
        const listsScore = normalizeValue(lists, 0, maxLists)
        
        // Peso relativo dei diversi fattori Trakt
        const traktScore = (watchersScore * 0.6) + (playsScore * 0.3) + (listsScore * 0.1)
        result.sources.trakt = traktScore
      }
    } catch (error) {
      console.error(`Error fetching Trakt data for movie ${tmdbId}:`, error)
    }
  }
  
  // Ottieni dati da OMDB/IMDb
  if (weights.imdb > 0 && config.enableOMDBApi && imdbId) {
    try {
      const omdbData = await getOMDBDataByIMDbId(imdbId)
      
      if (omdbData) {
        // Memorizza i metadati IMDb
        result.metadata.imdb_id = omdbData.imdb_id
        result.metadata.imdb_rating = omdbData.imdb_rating
        result.metadata.imdb_votes = omdbData.imdb_votes
        
        // Calcola un punteggio IMDb combinando rating e numero di voti
        // Rating è su scala 0-10, voti è logaritmico
        const rating = omdbData.imdb_rating * 7 // Moltiplichiamo per dare più peso
        const votes = Math.log(omdbData.imdb_votes + 1) * 3 // +1 per evitare log(0)
        
        // Normalizziamo su scala 0-100
        const maxRating = 10 * 7
        const maxVotes = Math.log(2000000 + 1) * 3 // 2M è un numero alto di voti per film popolari
        
        const ratingScore = normalizeValue(rating, 0, maxRating)
        const votesScore = normalizeValue(votes, 0, maxVotes)
        
        // Peso relativo dei diversi fattori IMDb
        const imdbScore = (ratingScore * 0.7) + (votesScore * 0.3)
        result.sources.imdb = imdbScore
        
        // Cerca anche Rotten Tomatoes se abilitato
        if (weights.rottenTomatoes > 0 && config.enableRottenTomatoesApi) {
          const rtRating = omdbData.ratings.find(r => 
            r.source === "Rotten Tomatoes" || r.source === "Internet Movie Database"
          )
          
          if (rtRating && rtRating.normalizedValue) {
            result.sources.rottenTomatoes = rtRating.normalizedValue
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching OMDB data for movie ${imdbId}:`, error)
    }
  }
  
  // Calcola il punteggio TMDB se abbiamo i dati
  if (weights.tmdb > 0 && (tmdbPopularity !== undefined || tmdbVoteAverage !== undefined)) {
    // Popolarità TMDB è su una scala non lineare, usiamo log per normalizzare
    let tmdbScore = 0
    
    if (tmdbPopularity !== undefined) {
      const popularity = Math.log(tmdbPopularity + 1) * 15 // +1 per evitare log(0)
      const maxPopularity = Math.log(1000 + 1) * 15 // 1000 è un valore alto per film molto popolari
      const popularityScore = normalizeValue(popularity, 0, maxPopularity)
      tmdbScore += popularityScore * 0.5
    }
    
    if (tmdbVoteAverage !== undefined && tmdbVoteCount !== undefined) {
      const voteAvg = tmdbVoteAverage * 6 // Scala 0-10, moltiplicata per dare più peso
      const maxVoteAvg = 10 * 6
      const voteAvgScore = normalizeValue(voteAvg, 0, maxVoteAvg)
      
      const voteCount = Math.log(tmdbVoteCount + 1) * 4
      const maxVoteCount = Math.log(20000 + 1) * 4
      const voteCountScore = normalizeValue(voteCount, 0, maxVoteCount)
      
      tmdbScore += (voteAvgScore * 0.3) + (voteCountScore * 0.2)
    }
    
    result.sources.tmdb = tmdbScore
  }
  
  // Calcola il punteggio ponderato finale basato sui pesi configurati
  let totalWeight = 0
  let weightedScore = 0
  
  // Aggiunge ogni fonte disponibile al punteggio finale
  for (const [source, weight] of Object.entries(weights)) {
    const sourceScore = result.sources[source as keyof typeof result.sources]
    if (sourceScore !== undefined && weight > 0) {
      weightedScore += sourceScore * weight
      totalWeight += weight
    }
  }
  
  // Calcola il punteggio finale
  if (totalWeight > 0) {
    // Normalizza in base ai pesi effettivamente utilizzati
    result.score = weightedScore / totalWeight
  } else {
    // Fallback se non abbiamo dati da nessuna fonte
    if (result.sources.tmdb !== undefined) {
      result.score = result.sources.tmdb
    } else {
      result.score = 50 // Valore neutro
    }
  }
  
  return result
}

/**
 * Calcola uno score di popolarità composito per una serie TV
 * @param tmdbId ID TMDB della serie
 * @param imdbId ID IMDB della serie (opzionale)
 * @returns Score di popolarità con dettagli sulle varie fonti
 */
export async function getShowPopularityScore(
  tmdbId: number | string,
  imdbId?: string,
  tmdbPopularity?: number,
  tmdbVoteAverage?: number,
  tmdbVoteCount?: number
): Promise<PopularityScore> {
  const weights = config.popularityRanking.weights
  const result: PopularityScore = {
    score: 0,
    sources: {},
    metadata: {
      tmdb_popularity: tmdbPopularity,
      tmdb_vote_average: tmdbVoteAverage,
      tmdb_vote_count: tmdbVoteCount
    }
  }
  
  // Converti tmdbId a numero se è una stringa
  const tmdbIdNum = typeof tmdbId === 'string' ? parseInt(tmdbId, 10) : tmdbId
  
  // Ottieni dati da Trakt.tv
  if (weights.trakt > 0 && config.enableTraktApi) {
    try {
      const traktData = await getShowPopularity(tmdbIdNum)
      
      if (traktData) {
        // Se non abbiamo l'imdbId, prova a ottenerlo da Trakt
        if (!imdbId && traktData.imdb_id) {
          imdbId = traktData.imdb_id
        }
        
        // Memorizza i metadati Trakt
        result.metadata.trakt_id = traktData.trakt_id
        result.metadata.trakt_watchers = traktData.watchers
        result.metadata.trakt_plays = traktData.plays
        
        // Calcola un punteggio da Trakt (watchers è il valore più significativo)
        // Logaritmico per ridurre l'effetto dei valori estremi
        const watchers = Math.log(traktData.watchers + 1) * 10 // +1 per evitare log(0)
        const plays = Math.log(traktData.plays + 1) * 5
        const lists = Math.log(traktData.list_count + 1) * 3
        
        // Normalizziamo su scala 0-100
        // I valori massimi sono approssimativi, basati su serie molto popolari
        const maxWatchers = Math.log(300000 + 1) * 10 // Le serie tendono ad avere più watchers
        const maxPlays = Math.log(1000000 + 1) * 5
        const maxLists = Math.log(100000 + 1) * 3
        
        const watchersScore = normalizeValue(watchers, 0, maxWatchers)
        const playsScore = normalizeValue(plays, 0, maxPlays)
        const listsScore = normalizeValue(lists, 0, maxLists)
        
        // Peso relativo dei diversi fattori Trakt
        const traktScore = (watchersScore * 0.6) + (playsScore * 0.3) + (listsScore * 0.1)
        result.sources.trakt = traktScore
      }
    } catch (error) {
      console.error(`Error fetching Trakt data for show ${tmdbId}:`, error)
    }
  }
  
  // Ottieni dati da OMDB/IMDb
  if (weights.imdb > 0 && config.enableOMDBApi && imdbId) {
    try {
      const omdbData = await getOMDBDataByIMDbId(imdbId)
      
      if (omdbData) {
        // Memorizza i metadati IMDb
        result.metadata.imdb_id = omdbData.imdb_id
        result.metadata.imdb_rating = omdbData.imdb_rating
        result.metadata.imdb_votes = omdbData.imdb_votes
        
        // Calcola un punteggio IMDb combinando rating e numero di voti
        // Rating è su scala 0-10, voti è logaritmico
        const rating = omdbData.imdb_rating * 7 // Moltiplichiamo per dare più peso
        const votes = Math.log(omdbData.imdb_votes + 1) * 3 // +1 per evitare log(0)
        
        // Normalizziamo su scala 0-100
        const maxRating = 10 * 7
        const maxVotes = Math.log(1500000 + 1) * 3 // Valore alto per serie popolari
        
        const ratingScore = normalizeValue(rating, 0, maxRating)
        const votesScore = normalizeValue(votes, 0, maxVotes)
        
        // Peso relativo dei diversi fattori IMDb
        const imdbScore = (ratingScore * 0.7) + (votesScore * 0.3)
        result.sources.imdb = imdbScore
        
        // Cerca anche Rotten Tomatoes se abilitato
        if (weights.rottenTomatoes > 0 && config.enableRottenTomatoesApi) {
          const rtRating = omdbData.ratings.find(r => 
            r.source === "Rotten Tomatoes" || r.source === "Internet Movie Database"
          )
          
          if (rtRating && rtRating.normalizedValue) {
            result.sources.rottenTomatoes = rtRating.normalizedValue
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching OMDB data for show ${imdbId}:`, error)
    }
  }
  
  // Calcola il punteggio TMDB se abbiamo i dati
  if (weights.tmdb > 0 && (tmdbPopularity !== undefined || tmdbVoteAverage !== undefined)) {
    // Popolarità TMDB è su una scala non lineare, usiamo log per normalizzare
    let tmdbScore = 0
    
    if (tmdbPopularity !== undefined) {
      const popularity = Math.log(tmdbPopularity + 1) * 15 // +1 per evitare log(0)
      const maxPopularity = Math.log(2000 + 1) * 15 // Le serie tendono ad avere valori più alti
      const popularityScore = normalizeValue(popularity, 0, maxPopularity)
      tmdbScore += popularityScore * 0.5
    }
    
    if (tmdbVoteAverage !== undefined && tmdbVoteCount !== undefined) {
      const voteAvg = tmdbVoteAverage * 6 // Scala 0-10, moltiplicata per dare più peso
      const maxVoteAvg = 10 * 6
      const voteAvgScore = normalizeValue(voteAvg, 0, maxVoteAvg)
      
      const voteCount = Math.log(tmdbVoteCount + 1) * 4
      const maxVoteCount = Math.log(15000 + 1) * 4
      const voteCountScore = normalizeValue(voteCount, 0, maxVoteCount)
      
      tmdbScore += (voteAvgScore * 0.3) + (voteCountScore * 0.2)
    }
    
    result.sources.tmdb = tmdbScore
  }
  
  // Calcola il punteggio ponderato finale basato sui pesi configurati
  let totalWeight = 0
  let weightedScore = 0
  
  // Aggiunge ogni fonte disponibile al punteggio finale
  for (const [source, weight] of Object.entries(weights)) {
    const sourceScore = result.sources[source as keyof typeof result.sources]
    if (sourceScore !== undefined && weight > 0) {
      weightedScore += sourceScore * weight
      totalWeight += weight
    }
  }
  
  // Calcola il punteggio finale
  if (totalWeight > 0) {
    // Normalizza in base ai pesi effettivamente utilizzati
    result.score = weightedScore / totalWeight
  } else {
    // Fallback se non abbiamo dati da nessuna fonte
    if (result.sources.tmdb !== undefined) {
      result.score = result.sources.tmdb
    } else {
      result.score = 50 // Valore neutro
    }
  }
  
  return result
}