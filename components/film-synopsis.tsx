'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { EditableBio } from './editable-bio';
import { saveMovieSynopsis } from '@/utils/api-client';

interface FilmSynopsisProps {
  tmdbId: number | string;
  originalSynopsis: string;
  title: string;
  year: string | number;
  director: string;
}

// Backup della funzione AI per generare la sinossi
// Puoi incollarla dove vuoi in futuro
const handleAIGenerate = async () => {
  setAiError(null);
  setAiLoading(true);
  try {
    const prompt = `Scrivi una sinossi breve, precisa e oggettiva (max 3 frasi) per il film intitolato '${title}', uscito nel ${year}, diretto da ${director}. Se non hai informazioni certe su questo film, rispondi chiaramente che non hai dati e non inventare nulla.`;
    const response = await fetch('/api/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gpt-3.5-turbo', temperature: 0.2 })
    });
    const data = await response.json();
    if (data.text && !/non ho dati|non ho informazioni|non conosco|non sono a conoscenza/i.test(data.text.toLowerCase())) {
      setSynopsis(data.text.trim());
    } else {
      setAiError('L\'AI non ha trovato informazioni affidabili su questo film.');
    }
  } catch (err) {
    setAiError('Errore nella generazione della sinossi con AI.');
  } finally {
    setAiLoading(false);
  }
};

export default function FilmSynopsis({ tmdbId, originalSynopsis, title, year, director }: FilmSynopsisProps) {
  const [synopsis, setSynopsis] = useState(originalSynopsis);
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalizza l'ID TMDB
  const normalizedTmdbId = typeof tmdbId === 'string' ? parseInt(tmdbId) : tmdbId;

  const fetchSynopsis = async () => {
    try {
      setIsLoading(true);
      
      if (!normalizedTmdbId || isNaN(Number(normalizedTmdbId))) {
        console.error('ID film non valido:', tmdbId);
        setSynopsis(originalSynopsis);
        setIsCustom(false);
        return;
      }
      
      console.log('Recupero sinossi per ID film:', normalizedTmdbId);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('movies')
        .select('custom_overview')
        .eq('tmdb_id', normalizedTmdbId);
      
      if (error) {
        console.error('Errore recupero sinossi:', error);
        setSynopsis(originalSynopsis);
        setIsCustom(false);
      } else if (data && data.length > 0) {
        const movieData = data[0];
        if (movieData.custom_overview) {
          setSynopsis(movieData.custom_overview);
          setIsCustom(true);
        } else {
          // Non c'è più tmdb_overview nel database, usiamo direttamente originalSynopsis
          setSynopsis(originalSynopsis);
          setIsCustom(false);
        }
      } else {
        console.log('Nessun risultato dal database, uso la sinossi originale');
        setSynopsis(originalSynopsis);
        setIsCustom(false);
      }
    } catch (err) {
      console.error('Errore nel recupero della sinossi:', err);
      setSynopsis(originalSynopsis);
      setIsCustom(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSynopsis();
  }, [tmdbId, originalSynopsis]);

  const handleSave = async (newSynopsis: string) => {
    try {
      console.log('Tentativo di salvare sinossi per ID:', normalizedTmdbId, 'typeof:', typeof normalizedTmdbId);
      
      if (!normalizedTmdbId || isNaN(Number(normalizedTmdbId))) {
        console.error('ID TMDB non valido per il salvataggio:', normalizedTmdbId);
        throw new Error('ID TMDB non valido');
      }
      
      // Utilizziamo la funzione API client invece di Supabase diretto
      const result = await saveMovieSynopsis(normalizedTmdbId, newSynopsis);
      
      console.log('Risultato salvataggio sinossi:', result);
      setSynopsis(newSynopsis);
      setIsCustom(true);
      
      setTimeout(() => {
        fetchSynopsis();
      }, 500);
    } catch (error) {
      console.error('Errore nel salvataggio della sinossi:', error);
      return Promise.reject(error);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Caricamento sinossi...</div>;
  }

  return (
    <div className="relative mb-8">
      {isCustom && (
        <div 
          className="absolute -top-4 right-0 w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
          title="Sinossi personalizzata" 
        />
      )}
      <EditableBio
        initialBio={synopsis || "Nessuna sinossi disponibile."}
        onSave={handleSave}
        title={title}
        year={year}
        director={director}
      />
    </div>
  );
}