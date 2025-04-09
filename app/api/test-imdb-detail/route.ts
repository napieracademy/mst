import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Endpoint per testare l'API IMDb di RapidAPI con un ID specifico
export async function GET(request: NextRequest) {
  try {
    // Parametro per l'ID
    const imdbId = request.nextUrl.searchParams.get('id') || 'tt28607951'
    
    // Costruisci l'URL completo
    const apiUrl = `https://imdb236.p.rapidapi.com/imdb/title/${imdbId}`
    
    console.log(`Testing IMDb API for ID: ${imdbId}`)
    
    // Effettua la richiesta all'API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'imdb236.p.rapidapi.com',
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
    console.error('Error testing IMDb API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}