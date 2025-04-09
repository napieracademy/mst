import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TMDB_API_KEY = process.env.TMDB_API_KEY || ''
const TMDB_API_URL = 'https://api.themoviedb.org/3'

export async function GET(request: NextRequest) {
  try {
    // Ottieni il TMDB ID dalla query string
    const tmdbId = request.nextUrl.searchParams.get('id')
    const type = request.nextUrl.searchParams.get('type') || 'tv'
    
    if (!tmdbId) {
      return NextResponse.json({ 
        error: 'TMDB ID mancante' 
      }, { status: 400 })
    }
    
    // Costruisci l'URL per l'API TMDB
    const url = `${TMDB_API_URL}/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`
    
    console.log(`Fetching external IDs for TMDB ID ${tmdbId} (type: ${type})`)
    
    // Effettua la richiesta a TMDB
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      const errorStatus = response.status
      let errorMessage = `Error ${errorStatus}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.status_message || errorMessage
      } catch (e) {}
      
      return NextResponse.json({ error: errorMessage }, { status: errorStatus })
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    
    // Restituisci i dati
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching external IDs:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 })
  }
}