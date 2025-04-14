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
  
    // Non controlliamo più response.ok perché ora l'API 
  // restituisce sempre 200 anche quando il film non viene trovato
  
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

    // Verifica che l'ID TMDB sia valido
    if (!tmdbId || isNaN(Number(tmdbId))) {
      throw new Error('ID TMDB non valido');
    }

    // Converti l'ID in numero se è una stringa
    const numericTmdbId = typeof tmdbId === 'string' ? parseInt(tmdbId) : tmdbId;

    // Tenta di salvare nel backend con un timeout più lungo (15 secondi)
    const response = await fetch('/api/movie-synopsis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdb_id: numericTmdbId, // Usa sempre l'ID numerico
        synopsis,
        imdb_id: imdbId
      }),
      // Imposta un timeout di 15 secondi per consentire inserimenti più lunghi
      signal: AbortSignal.timeout(15000)
    });

    // Stampiamo la risposta completa per debug
    console.log('[CLIENT] Risposta raw:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers])
    });
    
    // Leggiamo il corpo della risposta come testo
    const responseText = await response.text();
    console.log('[CLIENT] Risposta testuale:', responseText.slice(0, 200) + (responseText.length > 200 ? '...' : ''));
    
    let jsonResponse;
    
    try {
      // Tenta di analizzare la risposta come JSON
      jsonResponse = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('[CLIENT] Errore nel parsing della risposta JSON:', parseError);
      // Se la risposta non è un JSON valido ma lo status code è ok, presumiamo successo
      if (response.ok) {
        return { success: true, message: 'Sinossi salvata con successo' };
      }
      throw new Error('Formato risposta non valido dal server');
    }
    
    // Se la risposta non è ok, genera un errore
    if (!response.ok) {
      console.error('[CLIENT] Errore risposta API - Status:', response.status, response.statusText);
      console.error('[CLIENT] Errore risposta API - Body:', jsonResponse);
      
      // Formiamo un messaggio di errore chiaro
      const errorMessage = jsonResponse.error || jsonResponse.message || 
                          jsonResponse.detail || `Errore HTTP ${response.status}`;
      
      throw new Error(errorMessage);
    }
    
    console.log('[CLIENT] Salvataggio completato con successo:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('[CLIENT] Errore catturato in saveMovieSynopsis:', error);
    throw error; // Rilancia l'errore per gestirlo nell'UI
  }
} 