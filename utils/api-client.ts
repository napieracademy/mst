// Funzioni cliente per le API

/**
 * Ottiene la sinossi di un film dal database
 * @param tmdbId ID TMDB del film (opzionale se imdbId è fornito)
 * @param imdbId ID IMDb del film (opzionale se tmdbId è fornito)
 * @returns Dati della sinossi
 */
export async function getMovieSynopsis(options: { tmdbId?: number | string, imdbId?: string }) {
  const { tmdbId, imdbId } = options;
  
  if (!tmdbId && !imdbId) {
    throw new Error('È necessario fornire almeno uno tra tmdbId e imdbId');
  }
  
  let url = '/api/movie-synopsis?';
  if (tmdbId) url += `tmdb_id=${tmdbId}`;
  else if (imdbId) url += `imdb_id=${imdbId}`;
  
  try {
    console.log(`[CLIENT] Recupero sinossi personalizzata per film ID: ${tmdbId || imdbId}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Revalidate the data every 60 seconds
    });
  
    if (!response.ok) {
      console.error(`[CLIENT] Errore nel recupero della sinossi: ${response.status} ${response.statusText}`);
      return null; // Restituisci null invece di lanciare un errore
    }
  
    const data = await response.json();
    console.log(`[CLIENT] Sinossi recuperata con successo:`, {
      has_custom: !!data.has_custom_overview,
      overview_preview: data.overview ? data.overview.substring(0, 40) + '...' : 'nessuna'
    });
    
    return data;
  } catch (error) {
    console.error(`[CLIENT] Errore nel recupero della sinossi:`, error);
    return null; // Restituisci null in caso di errore
  }
}

/**
 * Salva la sinossi personalizzata di un film
 * @param tmdbId ID TMDB del film
 * @param synopsis Testo della sinossi
 * @param imdbId ID IMDb del film (opzionale)
 * @returns Risultato dell'operazione
 */
export async function saveMovieSynopsis(
  tmdbId: number | string, 
  synopsis: string, 
  imdbId?: string
) {
  try {
    console.log(`[CLIENT] Salvando sinossi per film ID: ${tmdbId}`, {
      tmdbId,
      imdbId,
      synopsis_length: synopsis?.length || 0
    });

    // Tenta di salvare nel backend
    const response = await fetch('/api/movie-synopsis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdb_id: tmdbId,
        synopsis,
        imdb_id: imdbId
      }),
      // Imposta un timeout di 8 secondi
      signal: AbortSignal.timeout(8000)
    });

    // Stampiamo la risposta completa per debug
    console.log('[CLIENT] Risposta raw:', response);
    
    if (!response.ok) {
      // Log completo dell'errore
      const errorText = await response.text();
      console.error('[CLIENT] Errore risposta API - Status:', response.status, response.statusText);
      console.error('[CLIENT] Errore risposta API - Body:', errorText);
      
      let errorObject;
      try {
        errorObject = JSON.parse(errorText);
      } catch (e) {
        errorObject = { error: errorText || 'Errore sconosciuto' };
      }
      
      throw new Error(errorObject.error || `Errore HTTP ${response.status}`);
    }
    
    // Leggiamo e loggiamo la risposta di successo
    const responseText = await response.text();
    console.log('[CLIENT] Risposta testuale:', responseText);
    
    let jsonResponse;
    try {
      jsonResponse = responseText ? JSON.parse(responseText) : {};
      console.log('[CLIENT] Salvataggio completato con successo:', jsonResponse);
    } catch (parseError) {
      console.error('[CLIENT] Errore nel parsing della risposta JSON:', parseError);
      throw new Error('Errore nel parsing della risposta dal server');
    }
    
    return jsonResponse;
  } catch (error) {
    console.error('[CLIENT] Errore catturato in saveMovieSynopsis:', error);
    throw error; // Rilancia l'errore per gestirlo nell'UI
  }
} 