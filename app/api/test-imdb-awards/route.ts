import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Endpoint per testare l'API IMDb AWARDS di RapidAPI
export async function GET(request: NextRequest) {
  try {
    // Parametri
    const imdbId = request.nextUrl.searchParams.get('id') || 'tt0120338' // Titanic come default
    
    // Costruisci l'URL completo per la richiesta awards
    const apiUrl = `https://imdb8.p.rapidapi.com/title/v2/get-awards?tconst=${imdbId}&first=20&country=US&language=en-US`
    
    console.log(`Testing IMDb Awards API for ID: ${imdbId}`)
    
    // Effettua la richiesta all'API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': '93ba2d0ef4msh63a61e6cc307208p151d14jsnacb83f03f7ff'
      }
    })
    
    if (!response.ok) {
      console.error(`Error response from RapidAPI: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`Error details: ${errorText}`)
      
      return NextResponse.json({
        error: `API Error: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status })
    }
    
    // Estrai e restituisci i dati
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      imdbId,
      data
    })
  } catch (error) {
    console.error('Error testing IMDb Awards API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}