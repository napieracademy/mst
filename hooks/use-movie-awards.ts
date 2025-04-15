import { useState, useEffect } from 'react';

interface MovieAwardsOptions {
  tmdbId?: number | string;
  imdbId?: string;
  autoFetch?: boolean;
  forceUpdate?: boolean;
}

/**
 * Hook per recuperare e salvare automaticamente i premi di un film
 */
export default function useMovieAwards({
  tmdbId,
  imdbId,
  autoFetch = true,
  forceUpdate = false
}: MovieAwardsOptions) {
  const [awards, setAwards] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Funzione per recuperare i premi
  const fetchAwards = async (options?: { force?: boolean }) => {
    if (!tmdbId) {
      setError('È necessario specificare tmdbId');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const force = options?.force ?? forceUpdate;
      let url = `/api/movie-awards?tmdb_id=${tmdbId}`;
      
      if (imdbId) {
        url += `&imdb_id=${imdbId}`;
      }
      
      if (force) {
        url += '&force=true';
      }

      console.log(`[useMovieAwards] Recupero premi per tmdbId: ${tmdbId}, imdbId: ${imdbId || 'non fornito'}`);
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Errore sconosciuto';
        const errorDetails = data.details ? ` - ${data.details}` : '';
        console.error(`[useMovieAwards] Errore API (${response.status}): ${errorMsg}${errorDetails}`);
        throw new Error(errorMsg);
      }

      console.log('[useMovieAwards] Premi recuperati con successo:', {
        source: data.source,
        has_awards: !!data.awards
      });
      
      setAwards(data.awards);
      return data.awards;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('[useMovieAwards] Errore nel recupero dei premi:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Effetto per il recupero automatico dei premi
  useEffect(() => {
    if (autoFetch && tmdbId) {
      fetchAwards();
    }
  }, [tmdbId, imdbId, autoFetch]);

  return {
    awards,
    isLoading,
    error,
    fetchAwards
  };
} 