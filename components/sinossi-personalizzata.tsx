'use client';

import { useState, useEffect } from 'react';
import { EditableBio } from './editable-bio';
import { getMovieSynopsis, saveMovieSynopsis } from '@/utils/api-client';

interface SinossiPersonalizzataProps {
  movie: any;
  id: string;
}

export default function SinossiPersonalizzata({ movie, id }: SinossiPersonalizzataProps) {
  const [customSynopsis, setCustomSynopsis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ID da utilizzare per le operazioni con la sinossi
  const movieId = movie.tmdb_id || movie.id || id;
  const imdbId = movie.external_ids?.imdb_id;
  
  // Utilizziamo la sinossi originale di TMDB come fallback
  const originalSynopsis = movie.overview || "Nessuna sinossi disponibile per questo film.";
  
  // Carica la sinossi personalizzata dal database all'avvio
  useEffect(() => {
    async function loadCustomSynopsis() {
      setIsLoading(true);
      try {
        // Tenta di recuperare la sinossi personalizzata dal database
        const synopsisData = await getMovieSynopsis({
          tmdbId: movieId,
          imdbId: imdbId
        });
        
        // Controlla se abbiamo ottenuto dati validi
        if (synopsisData === null || synopsisData.found === false) {
          // Se non c'è una sinossi personalizzata o c'è stato un errore, usiamo quella originale
          setCustomSynopsis(originalSynopsis);
          console.log('[SINOSSI] Nessuna sinossi personalizzata trovata, uso originale', synopsisData);
        } else if (synopsisData && synopsisData.overview) {
          // Se abbiamo trovato una sinossi personalizzata, la usiamo
          setCustomSynopsis(synopsisData.overview);
          console.log('[SINOSSI] Caricata sinossi personalizzata dal database');
        } else {
          // Fallback in caso di qualsiasi altra situazione imprevista
          setCustomSynopsis(originalSynopsis);
          console.log('[SINOSSI] Risposta API inattesa, uso sinossi originale:', synopsisData);
        }
      } catch (error) {
        console.error('[SINOSSI] Errore nel caricamento della sinossi:', error);
        // In caso di errore, usiamo la sinossi originale
        setCustomSynopsis(originalSynopsis);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCustomSynopsis();
  }, [movieId, imdbId, originalSynopsis]);
  
  // Funzione per salvare una nuova sinossi
  const handleSave = async (newBio: string) => {
    try {
      console.log('[SINOSSI] Tentativo di salvataggio nuova sinossi:', {
        id: movieId,
        imdbId,
        length: newBio.length
      });
      
      // Salva la nuova sinossi nel database
      await saveMovieSynopsis(
        movieId,
        newBio,
        imdbId
      );
      
      // Aggiorna lo stato locale
      setCustomSynopsis(newBio);
      console.log('[SINOSSI] Sinossi salvata con successo');
      
      return Promise.resolve();
    } catch (error) {
      console.error('[SINOSSI] Errore nel salvataggio della sinossi:', error);
      return Promise.reject(error);
    }
  };
  
  // Se stiamo ancora caricando, mostra un placeholder
  if (isLoading) {
    return <div className="text-gray-400">Caricamento sinossi...</div>;
  }
  
  return (
    <EditableBio
      initialBio={customSynopsis || originalSynopsis}
      onSave={handleSave}
    />
  );
}