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

  // Cerca le vittorie agli Oscar
  const oscarWinsMatch = awardsString.match(/Won (\d+) Oscar/i)
  if (oscarWinsMatch) {
    analysis.oscars = parseInt(oscarWinsMatch[1], 10)
  }

  // Cerca le nomination specifiche
  const nominationsMatch = awardsString.match(/Nominated for (\d+)/i)
  if (nominationsMatch) {
    analysis.nominations = parseInt(nominationsMatch[1], 10)
  } else {
    // Pattern alternativo per le nomination - "X nominations total" o "X nominations."
    const totalNominationsMatch = awardsString.match(/(\d+) nomination/i)
    if (totalNominationsMatch) {
      analysis.nominations = parseInt(totalNominationsMatch[1], 10)
    }
  }

  // Cerca vittorie non-Oscar con vari pattern
  // 1. Pattern "X wins & Y nominations"
  const winsAndNominationsMatch = awardsString.match(/(\d+) wins/i)
  if (winsAndNominationsMatch) {
    analysis.wins = parseInt(winsAndNominationsMatch[1], 10)
  } 
  // 2. Pattern "Another X wins"
  const anotherWinsMatch = awardsString.match(/Another (\d+) wins/i)
  if (anotherWinsMatch) {
    analysis.wins = parseInt(anotherWinsMatch[1], 10)
  }

  // Se ci sono sia Oscar che altre vittorie, gli Oscar sono già contati separatamente
  // Non dobbiamo sottrarli, poiché OMDB li conta già separatamente

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