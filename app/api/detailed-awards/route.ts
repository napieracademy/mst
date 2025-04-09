import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { analyzeAwards } from '@/lib/awards-utils'

// Chiavi API
const OMDB_API_URL = 'https://www.omdbapi.com'
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e039393b'
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '93ba2d0ef4msh63a61e6cc307208p151d14jsnacb83f03f7ff'

/**
 * API endpoint per ottenere informazioni dettagliate sui premi
 * Combina dati da OMDB e da RapidAPI IMDb
 */
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
    
    // Esegui le richieste in parallelo per migliorare le performance
    const [omdbData, rapidApiData] = await Promise.allSettled([
      // 1. Richiesta a OMDB per informazioni di base
      fetch(`${OMDB_API_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}&plot=short&r=json`).then(res => res.json()),
      
      // 2. Richiesta a RapidAPI IMDb per informazioni più dettagliate
      fetch(`https://imdb236.p.rapidapi.com/imdb/title/${imdbId}/awards`, {
        headers: {
          'x-rapidapi-host': 'imdb236.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY
        }
      }).then(res => res.json())
    ])
    
    // Risultati finali combinati
    const result: any = {
      imdbId,
      basicInfo: null,
      detailedAwards: null,
      combinedAnalysis: null
    }
    
    // Elabora i dati OMDB
    if (omdbData.status === 'fulfilled') {
      const data = omdbData.value
      
      if (data.Response === 'True') {
        // Estrai le informazioni di base da OMDB
        result.basicInfo = {
          title: data.Title,
          year: data.Year,
          type: data.Type,
          awards: data.Awards,
          boxOffice: data.BoxOffice,
          awardsAnalysis: analyzeAwards(data.Awards)
        }
      }
    }
    
    // Elabora i dati RapidAPI
    if (rapidApiData.status === 'fulfilled') {
      const data = rapidApiData.value
      
      // Verifica che i dati siano validi
      if (data && !data.error) {
        result.detailedAwards = data
        
        // Struttura dati dettagliati per le categorie di premi
        const categorizedAwards = {
          oscars: [],
          goldenGlobes: [],
          bafta: [],
          cannes: [],
          venice: [],
          berlin: [],
          other: []
        }
        
        // Elabora i dati degli awards per categorizzarli
        if (data.awards && Array.isArray(data.awards)) {
          data.awards.forEach((award: any) => {
            const awardName = award.awardName?.toLowerCase() || ''
            const categoryItems = award.categoryItems || []
            
            // Estrai informazioni rilevanti per ogni premio
            const processedItems = categoryItems.map((item: any) => ({
              category: item.categoryName,
              isWinner: item.isWinner,
              year: item.year,
              awardName: award.awardName,
              description: item.notes || '',
              nominees: (item.nominations || []).map((nom: any) => ({
                name: nom.name,
                role: nom.description,
                isWinner: nom.isWinner
              }))
            }))
            
            // Categorizza i premi
            if (awardName.includes('oscar') || awardName.includes('academy award')) {
              categorizedAwards.oscars.push(...processedItems)
            } else if (awardName.includes('golden globe')) {
              categorizedAwards.goldenGlobes.push(...processedItems)
            } else if (awardName.includes('bafta')) {
              categorizedAwards.bafta.push(...processedItems)
            } else if (awardName.includes('cannes')) {
              categorizedAwards.cannes.push(...processedItems)
            } else if (awardName.includes('venice')) {
              categorizedAwards.venice.push(...processedItems)
            } else if (awardName.includes('berlin')) {
              categorizedAwards.berlin.push(...processedItems)
            } else {
              categorizedAwards.other.push(...processedItems)
            }
          })
        }
        
        // Aggiungi le categorie ai risultati
        result.categorizedAwards = categorizedAwards
        
        // Analisi combinata
        result.combinedAnalysis = {
          totalAwards: 0,
          totalNominations: 0,
          oscarsWon: 0,
          oscarNominations: 0,
          goldenGlobesWon: 0,
          goldenGlobeNominations: 0,
          baftaWon: 0,
          baftaNominations: 0,
          majorFestivalAwards: 0
        }
        
        // Calcola i totali per ogni categoria
        for (const category in categorizedAwards) {
          const items = categorizedAwards[category as keyof typeof categorizedAwards]
          
          items.forEach((item: any) => {
            // Conta nomination e vittorie
            if (item.isWinner) {
              result.combinedAnalysis.totalAwards++
              
              // Aggiorna contatori specifici
              if (category === 'oscars') result.combinedAnalysis.oscarsWon++
              if (category === 'goldenGlobes') result.combinedAnalysis.goldenGlobesWon++
              if (category === 'bafta') result.combinedAnalysis.baftaWon++
              if (['cannes', 'venice', 'berlin'].includes(category)) {
                result.combinedAnalysis.majorFestivalAwards++
              }
            } else {
              result.combinedAnalysis.totalNominations++
              
              // Aggiorna contatori specifici per nomination
              if (category === 'oscars') result.combinedAnalysis.oscarNominations++
              if (category === 'goldenGlobes') result.combinedAnalysis.goldenGlobeNominations++
              if (category === 'bafta') result.combinedAnalysis.baftaNominations++
            }
          })
        }
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching detailed awards:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 })
  }
}