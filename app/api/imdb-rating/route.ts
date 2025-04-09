import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configurazione di base per OMDB
const OMDB_API_URL = 'https://www.omdbapi.com'
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e039393b'

export async function GET(request: NextRequest) {
  try {
    // Ottieni l'IMDb ID dalla query string
    const imdbId = request.nextUrl.searchParams.get('imdbId')
    
    // Verifica che l'IMDb ID sia valido
    if (!imdbId || typeof imdbId !== 'string' || !imdbId.startsWith('tt') || imdbId.length < 7) {
      return NextResponse.json({ 
        error: `IMDb ID non valido: ${imdbId}` 
      }, { status: 400 })
    }
    
    // Costruisci l'URL per l'API OMDB
    const url = `${OMDB_API_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`
    
    // Effettua la richiesta a OMDB dal lato server
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 86400 } // Cache per 24 ore
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      const errorStatus = response.status
      let errorMessage = `Error ${errorStatus}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.Error || errorMessage
      } catch (e) {}
      
      return NextResponse.json({ error: errorMessage }, { status: errorStatus })
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    
    // Verifica se la risposta contiene un errore
    if (data.Response === 'False') {
      return NextResponse.json({ 
        error: data.Error || 'Error getting data' 
      }, { status: 404 })
    }
    
    // Restituisci tutti i rating disponibili
    return NextResponse.json({
      imdb: data.imdbRating ? {
        rating: parseFloat(data.imdbRating) || 0,
        votes: parseInt(data.imdbVotes?.replace(/,/g, '') || '0', 10)
      } : null,
      rottenTomatoes: data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value?.replace('%', '') 
        ? {
            rating: parseInt(data.Ratings.find(r => r.Source === 'Rotten Tomatoes').Value.replace('%', ''), 10)
          } 
        : null,
      metascore: data.Metascore ? parseInt(data.Metascore, 10) : null
    })
  } catch (error) {
    console.error('Error in IMDb rating API:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 })
  }
}