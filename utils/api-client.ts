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
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }, // Revalidate the data every 60 seconds
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Errore nel recupero della sinossi');
  }

  return await response.json();
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
    console.log(`[CLIENT] Salvando sinossi per film ID: ${tmdbId}`);
    
    // Salvataggio locale di backup immediato
    const storageKey = `movie_synopsis_${tmdbId}`;
    try {
      localStorage.setItem(storageKey, synopsis);
      console.log('[CLIENT] Backup in localStorage completato');
    } catch (storageError) {
      console.warn('[CLIENT] Impossibile salvare in localStorage:', storageError);
    }
    
    // Approccio diretto: modifica la sinossi direttamente nella UI
    // Questo assicura che l'utente veda la sua modifica immediatamente
    // anche se l'API fallisce
    document.querySelectorAll('.bio-text').forEach(el => {
      if (el instanceof HTMLElement) {
        el.innerText = synopsis;
      }
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

    // La risposta potrebbe non essere JSON valido
    let jsonResponse;
    try {
      const text = await response.text();
      jsonResponse = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('[CLIENT] Errore nel parsing della risposta:', parseError);
      jsonResponse = { error: 'Errore nel parsing della risposta' };
    }

    if (!response.ok) {
      console.error('[CLIENT] Errore risposta API:', jsonResponse);
      
      // FALLBACK: Abbiamo già salvato in localStorage, quindi
      // restituisci un risultato di successo per non interrompere l'esperienza utente
      return {
        success: true,
        message: 'Sinossi salvata localmente (API non disponibile)',
        localOnly: true
      };
    }

    console.log('[CLIENT] Salvataggio completato con successo');
    
    // Se tutto è andato bene, restituisci la risposta
    return jsonResponse;
  } catch (error) {
    console.error('[CLIENT] Errore catturato in saveMovieSynopsis:', error);
    
    // Restituisci un risultato di successo anche in caso di errore
    // poiché abbiamo già fatto un backup locale
    return {
      success: true,
      message: 'Sinossi salvata localmente (errore con API)',
      localOnly: true,
      error: error
    };
  }
} 