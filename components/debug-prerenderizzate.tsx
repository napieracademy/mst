'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PaginaPrerendering {
  tipo: string;
  nome: string;
  slug: string;
  url: string;
  dimensione: number;
}

export function DebugPrerenderizzate() {
  const [isLoading, setIsLoading] = useState(true);
  const [pagine, setPagine] = useState<{film: PaginaPrerendering[], serie: PaginaPrerendering[]}>({
    film: [],
    serie: []
  });
  const [error, setError] = useState<string | null>(null);
  const [tipoCorrente, setTipoCorrente] = useState<'film' | 'serie'>('film');
  
  useEffect(() => {
    const fetchPagine = async () => {
      setIsLoading(true);
      try {
        // Dummy data per evitare errori di build
        // In produzione, questo verrà sostituito con i dati reali
        setPagine({
          film: [
            { 
              tipo: 'film', 
              nome: 'Inception', 
              slug: 'inception-2010-27205', 
              url: '/film/inception-2010-27205',
              dimensione: 102400
            },
            { 
              tipo: 'film', 
              nome: 'Il Padrino', 
              slug: 'il-padrino-1972-238', 
              url: '/film/il-padrino-1972-238',
              dimensione: 98765
            }
          ],
          serie: [
            { 
              tipo: 'serie', 
              nome: 'Breaking Bad', 
              slug: 'breaking-bad-2008-1396', 
              url: '/serie/breaking-bad-2008-1396',
              dimensione: 87654
            }
          ]
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento delle pagine prerenderizzate:', err);
        setError('Errore nel caricamento dei dati. Verifica la console per dettagli.');
        setIsLoading(false);
      }
    };
    
    fetchPagine();
  }, []);
  
  // Conteggio totale
  const conteggioPagine = pagine.film.length + pagine.serie.length;
  
  return (
    <div className="bg-black text-white rounded-lg border border-gray-800 p-4">
      <h2 className="text-lg font-medium mb-4">Debug Pagine Prerenderizzate</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-400">Recupero pagine prerenderizzate...</span>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 border border-red-800 rounded bg-red-900/20">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-400">
            Totale pagine prerenderizzate: <span className="font-medium text-white">{conteggioPagine}</span>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b border-gray-800 mb-4">
            <button
              onClick={() => setTipoCorrente('film')}
              className={`px-4 py-2 text-sm ${tipoCorrente === 'film' 
                ? 'border-b-2 border-yellow-500 text-white' 
                : 'text-gray-400 hover:text-white'}`}
            >
              Film ({pagine.film.length})
            </button>
            <button
              onClick={() => setTipoCorrente('serie')}
              className={`px-4 py-2 text-sm ${tipoCorrente === 'serie' 
                ? 'border-b-2 border-yellow-500 text-white' 
                : 'text-gray-400 hover:text-white'}`}
            >
              Serie ({pagine.serie.length})
            </button>
          </div>
          
          {/* Contenuto */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {pagine[tipoCorrente].map((pagina, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-gray-900 rounded border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <Link 
                    href={pagina.url} 
                    className="text-sm text-yellow-500 hover:text-yellow-400 hover:underline truncate"
                  >
                    {pagina.nome || pagina.slug}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {Math.round(pagina.dimensione / 1024)} KB
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate mt-1">
                  {pagina.url}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 