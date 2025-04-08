/**
 * Script di debug per verificare il funzionamento delle API OMDB
 */

// Configurazione di base per OMDB
const OMDB_API_URL = 'https://www.omdbapi.com'
// Legge la chiave API dalle variabili d'ambiente, con fallback al valore hardcoded per lo sviluppo
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e039393b'

/**
 * Funzione per testare il recupero dei dati da OMDB
 * @param imdbId L'ID IMDb del film da cercare
 */
export async function testOMDB(imdbId: string = 'tt0111161'): Promise<any> {
  try {
    console.log(`Testing OMDB API with IMDb ID: ${imdbId}`)
    
    // Info sulla configurazione
    const apiKeyInfo = {
      apiKeyAvailable: !!OMDB_API_KEY,
      apiKeyLength: OMDB_API_KEY?.length || 0,
      apiKeyFirstChar: OMDB_API_KEY ? OMDB_API_KEY.charAt(0) : 'none',
      apiKeyLastChar: OMDB_API_KEY ? OMDB_API_KEY.charAt(OMDB_API_KEY.length - 1) : 'none',
    }
    console.log('API Key info:', apiKeyInfo)
    
    // Costruisci l'URL per l'API
    const url = `${OMDB_API_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`
    // URL sicuro per il log (nasconde la chiave completa)
    const safeUrl = `${OMDB_API_URL}?i=${imdbId}&apikey=***${OMDB_API_KEY.slice(-4)}`
    console.log(`Request URL (safe): ${safeUrl}`)
    
    // Effettua la richiesta
    const response = await fetch(url)
    console.log(`Response status: ${response.status}`)
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    console.log('Data received:', data)
    
    // Verifica se la risposta contiene un errore
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Unknown error in OMDB response')
    }
    
    // Log specifico per le valutazioni (il problema che stiamo investigando)
    console.log('IMDb Rating:', data.imdbRating)
    console.log('IMDb Votes:', data.imdbVotes)
    console.log('Metascore:', data.Metascore)
    console.log('Ratings array:', data.Ratings)
    
    // Verifica se ci sono valutazioni di Rotten Tomatoes
    const rtRating = data.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes")
    console.log('Rotten Tomatoes rating found:', rtRating ? 'YES' : 'NO')
    if (rtRating) {
      console.log('Rotten Tomatoes value:', rtRating.Value)
    }
    
    return {
      success: true,
      data,
      imdbRating: data.imdbRating,
      rtRating: rtRating ? rtRating.Value : 'Not available',
      metascore: data.Metascore || 'Not available',
      apiConfig: {
        apiKeyAvailable: !!OMDB_API_KEY,
        apiKeyLength: OMDB_API_KEY?.length || 0,
        apiKeyFirstChar: OMDB_API_KEY ? OMDB_API_KEY.charAt(0) : 'none',
        apiKeyLastChar: OMDB_API_KEY ? OMDB_API_KEY.charAt(OMDB_API_KEY.length - 1) : 'none',
      }
    }
  } catch (error) {
    console.error('Error testing OMDB API:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}