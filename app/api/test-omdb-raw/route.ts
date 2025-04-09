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
    const url = `${OMDB_API_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}&plot=short&r=json`
    
    console.log(`Requesting raw OMDB data for ${imdbId} from ${url}`)
    
    // Effettua la richiesta a OMDB dal lato server
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
    
    // Restituisci i dati grezzi di OMDB
    return NextResponse.json({ 
      rawData: data,
      type: data.Type || 'unknown',
      hasRatings: !!data.Ratings,
      ratingsCount: data.Ratings?.length || 0,
      ratingSources: data.Ratings?.map((r: any) => r.Source) || []
    })
  } catch (error) {
    console.error('Error in raw OMDB test API:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 })
  }
}