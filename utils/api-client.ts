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
    let numericTmdbId: number;
    
    if (typeof tmdbId === 'number') {
      numericTmdbId = tmdbId;
    } else if (typeof tmdbId === 'string') {
      const parsedId = parseInt(tmdbId.trim(), 10);
      if (isNaN(parsedId)) {
        console.error('[CLIENT] ID TMDB non valido:', tmdbId, 'typeof:', typeof tmdbId);
        throw new Error('ID TMDB non valido');
      }
      numericTmdbId = parsedId;
    } else {
      throw new Error(`Tipo di ID TMDB non supportato: ${typeof tmdbId}`);
    }
    
    console.log('[CLIENT] ID TMDB convertito:', numericTmdbId, 'typeof:', typeof numericTmdbId);

    // Prepara il payload
    const payload = {
      tmdb_id: numericTmdbId,
      overview: synopsis.trim(),
      imdb_id: imdbId
    };
    
    console.log('[CLIENT] Payload richiesta POST:', JSON.stringify(payload));

    // Ottieni token utente se disponibile
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    try {
      const session = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
      const access_token = session?.currentSession?.access_token;
      if (access_token) {
        headers['Authorization'] = `Bearer ${access_token}`;
      }
    } catch (e) {
      console.warn('[CLIENT] Impossibile recuperare token di sessione:', e);
    }
    
    // Tenta di salvare nel backend con un timeout di 15 secondi
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch('/api/movie-synopsis', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
  
      // Log della risposta completa per debug
      console.log('[CLIENT] Risposta raw:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      // Analizza la risposta come testo
      const responseText = await response.text();
      
      // Se è vuota, gestisci errore
      if (!responseText) {
        if (response.ok) {
          return { success: true, message: 'Sinossi salvata con successo' };
        }
        throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Prova a convertire in JSON
      try {
        const jsonResponse = JSON.parse(responseText);
        
        // Se la risposta non è ok, genera un errore
        if (!response.ok) {
          const errorMessage = jsonResponse.error || jsonResponse.message || 
                           jsonResponse.detail || `Errore HTTP ${response.status}`;
          throw new Error(errorMessage);
        }
        
        return jsonResponse;
      } catch (parseError) {
        // Errore di parsing JSON
        console.error('[CLIENT] Errore parsing JSON:', parseError);
        throw new Error('Formato risposta non valido dal server');
      }
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout nella richiesta al server');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('[CLIENT] Errore in saveMovieSynopsis:', error);
    throw error; // Rilancia l'errore per gestirlo nell'UI
  }
} 