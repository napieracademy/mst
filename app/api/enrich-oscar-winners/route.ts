import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOscarBestPictureWinners } from '@/lib/tmdb'
import { analyzeAwards } from '@/lib/awards-utils'

const OMDB_API_URL = 'https://www.omdbapi.com'
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e039393b'

export async function GET(request: NextRequest) {
  try {
    // Ottieni i vincitori originali
    const oscarWinners = await getOscarBestPictureWinners()
    
    if (!oscarWinners.length) {
      return NextResponse.json({
        error: 'Nessun vincitore Oscar trovato'
      }, { status: 404 })
    }
    
    // Arricchisci ogni film con i dati OMDB
    const enrichedMovies = await Promise.all(
      oscarWinners.map(async (movie) => {
        const imdbId = movie.external_ids?.imdb_id
        
        if (!imdbId) {
          return {
            ...movie,
            awards_data: null,
            best_picture_confirmed: false
          }
        }
        
        try {
          // Recupera i dati da OMDB
          const omdbUrl = `${OMDB_API_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`
          const response = await fetch(omdbUrl, {
            headers: {
              'Accept': 'application/json'
            }
          })
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}`)
          }
          
          const omdbData = await response.json()
          
          // Analizza i premi
          const awardsAnalysis = analyzeAwards(omdbData.Awards)
          
          // Verifica se il film ha davvero vinto l'Oscar come miglior film
          // Cerchiamo questi pattern nel testo dei premi
          const bestPicturePatterns = [
            /won.*oscar.*best picture/i,
            /won.*academy award.*best picture/i,
            /won.*best picture/i,
            /best picture winner/i
          ]
          
          const hasBestPictureAward = bestPicturePatterns.some(pattern => 
            pattern.test(omdbData.Awards || '')
          )
          
          return {
            ...movie,
            awards_data: {
              awards: omdbData.Awards || 'N/A',
              analysis: awardsAnalysis,
              box_office: omdbData.BoxOffice || 'N/A'
            },
            best_picture_confirmed: hasBestPictureAward
          }
        } catch (error) {
          console.error(`Error fetching OMDB data for ${movie.title || movie.name}:`, error)
          return {
            ...movie,
            awards_data: null,
            best_picture_confirmed: false
          }
        }
      })
    )
    
    // Filtra i film che sono confermati come vincitori del premio "Miglior Film"
    // e ordina per anno di vittoria (più recente prima)
    const confirmedBestPictureWinners = enrichedMovies
      .filter(movie => movie.best_picture_confirmed)
      .sort((a, b) => (b.oscar_win_year || 0) - (a.oscar_win_year || 0))
    
    // Se non abbiamo conferme sufficienti, usa i dati originali
    const finalMovies = confirmedBestPictureWinners.length >= 10 
      ? confirmedBestPictureWinners 
      : enrichedMovies.sort((a, b) => (b.oscar_win_year || 0) - (a.oscar_win_year || 0))
    
    return NextResponse.json({
      winners: finalMovies.slice(0, 21),
      winners_count: finalMovies.length,
      confirmed_count: confirmedBestPictureWinners.length
    })
  } catch (error) {
    console.error('Error in enrich-oscar-winners API:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 })
  }
}