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
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Errore nel salvataggio della sinossi');
  }

  return await response.json();
} 