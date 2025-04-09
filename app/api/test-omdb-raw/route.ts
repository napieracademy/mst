import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configurazione di base per OMDB
const OMDB_API_URL = 'https://www.omdbapi.com'
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e039393b'

// Funzione per analizzare la stringa Awards di OMDB
function analyzeAwards(awardsString: string | undefined | null): any {
  if (!awardsString || awardsString === 'N/A') {
    return {
      hasAwards: false,
      oscars: 0,
      nominations: 0,
      wins: 0,
      other: 0,
      summary: 'Nessun premio'
    }
  }

  // Struttura per memorizzare l'analisi
  const analysis = {
    hasAwards: true,
    oscars: 0,
    nominations: 0,
    wins: 0,
    other: 0,
    summary: '',
    rawText: awardsString
  }

  // Cerca le nomination agli Oscar
  const oscarWinsMatch = awardsString.match(/Won (\d+) Oscar/i)
  if (oscarWinsMatch) {
    analysis.oscars = parseInt(oscarWinsMatch[1], 10)
  }

  // Cerca le nomination a premi
  const nominationsMatch = awardsString.match(/Nominated for (\d+)/i)
  if (nominationsMatch) {
    analysis.nominations = parseInt(nominationsMatch[1], 10)
  }

  // Cerca le vittorie di premi
  const winsMatch = awardsString.match(/Won (\d+)/i)
  if (winsMatch && !oscarWinsMatch) {
    analysis.wins = parseInt(winsMatch[1], 10)
  } else if (winsMatch && oscarWinsMatch) {
    // Se ci sono sia "Won X Oscar" che "Won Y", sottrai gli Oscar dal totale
    analysis.wins = parseInt(winsMatch[1], 10) - analysis.oscars
    if (analysis.wins < 0) analysis.wins = 0 // Evita numeri negativi
  }

  // Crea un riepilogo
  const summaryParts = []
  if (analysis.oscars > 0) {
    summaryParts.push(`${analysis.oscars} Oscar`)
  }
  if (analysis.wins > 0) {
    summaryParts.push(`${analysis.wins} altri premi`)
  }
  if (analysis.nominations > 0) {
    summaryParts.push(`${analysis.nominations} nomination`)
  }

  analysis.summary = summaryParts.length > 0 
    ? summaryParts.join(', ') 
    : 'Informazioni sui premi non strutturate'

  return analysis
}

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
    
    // Restituisci i dati grezzi di OMDB con focus su premi e rating
    return NextResponse.json({ 
      rawData: data,
      type: data.Type || 'unknown',
      // Informazioni sui rating
      hasRatings: !!data.Ratings,
      ratingsCount: data.Ratings?.length || 0,
      ratingSources: data.Ratings?.map((r: any) => r.Source) || [],
      // Informazioni sui premi (Awards)
      hasAwards: !!data.Awards && data.Awards !== "N/A",
      awards: data.Awards || "N/A",
      // Analisi più approfondita del campo Awards
      awardsAnalysis: analyzeAwards(data.Awards)
    })
  } catch (error) {
    console.error('Error in raw OMDB test API:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 })
  }
}