'use client';

import { useState } from 'react';
import { EditableBio } from './editable-bio';

interface SinossiPersonalizzataProps {
  movie: any;
  id: string;
}

export default function SinossiPersonalizzata({ movie, id }: SinossiPersonalizzataProps) {
  const [bio, setBio] = useState<string>(movie.overview || 'Nessuna sinossi disponibile per questo film.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const title = movie.title || movie.original_title || '';
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const director = Array.isArray(movie.directors) && movie.directors.length > 0 ? movie.directors[0].name : (movie.director || '');

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
        setBio(data.text.trim());
      } else {
        setAiError('L\'AI non ha trovato informazioni affidabili su questo film.');
      }
    } catch (err) {
      setAiError('Errore nella generazione della sinossi con AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // Il salvataggio non fa nulla
  const handleSave = async (_newBio: string) => {
    // Non salvare nulla, funzione vuota
    return Promise.resolve();
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          onClick={handleAIGenerate}
          disabled={aiLoading}
        >
          {aiLoading ? 'Generazione...' : 'Genera con AI'}
        </button>
        {aiError && <span className="text-red-500 text-xs">{aiError}</span>}
      </div>
      <EditableBio
        initialBio={bio}
        onSave={handleSave}
        title={title}
        year={year}
        director={director}
      />
    </div>
  );
}