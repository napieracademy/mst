"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase';

// Interfaccia per le statistiche della sitemap
interface SitemapStats {
  id: number;
  last_generation: string;
  urls_count: number;
  film_count: number;
  serie_count: number;
  is_error: boolean;
  error_message: string | null;
}

export function DatabaseCounter() {
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [sitemapCount, setSitemapCount] = useState<number | null>(null);
  const [sitemapStats, setSitemapStats] = useState<SitemapStats | null>(null);
  const [lastGeneration, setLastGeneration] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch database count 
        const dbResponse = await fetch('/api/check-api-key?check=db-count', {
          cache: 'no-store'
        });
        const dbData = await dbResponse.json();
        
        if (dbData.count) {
          setDbCount(dbData.count);
        }

        // 2. Recupera statistiche della sitemap dalla tabella sitemap_stats
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('sitemap_stats')
            .select('*')
            .eq('id', 1)
            .single();
            
          if (error) {
            console.error("Errore nel recupero statistiche sitemap:", error);
            
            // Fallback al metodo precedente se il nuovo non funziona
            const sitemapResponse = await fetch('/sitemap.xml', {
              cache: 'no-store',
              method: 'GET',
              headers: {
                'Range': 'bytes=0-500' // Solo i primi 500 bytes per leggere l'intestazione
              }
            });
            
            const sitemapText = await sitemapResponse.text();
            const countMatch = sitemapText.match(/con (\d+) URL/);
            
            if (countMatch && countMatch[1]) {
              setSitemapCount(parseInt(countMatch[1], 10));
            }
          } else if (data) {
            // Usa i dati dalla tabella sitemap_stats
            setSitemapStats(data as SitemapStats);
            setSitemapCount(data.urls_count);
            
            // Formatta la data dell'ultima generazione
            if (data.last_generation) {
              try {
                const date = new Date(data.last_generation);
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                
                if (diffHours < 1) {
                  setLastGeneration(`${Math.floor(diffMs / (1000 * 60))} minuti fa`);
                } else if (diffHours < 24) {
                  setLastGeneration(`${diffHours} ore fa`);
                } else {
                  setLastGeneration(`${Math.floor(diffHours / 24)} giorni fa`);
                }
              } catch (e) {
                setLastGeneration(null);
              }
            }
          }
        } catch (supabaseError) {
          console.error("Errore Supabase:", supabaseError);
          setError("Errore nel caricamento delle statistiche sitemap");
        }
      } catch (error) {
        console.error("Errore nel recupero conteggi:", error);
        setError("Errore nel recupero dei conteggi");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCounts();
    
    // Aggiorna ogni 5 minuti
    const interval = setInterval(fetchCounts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || (!dbCount && !sitemapCount)) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 border border-gray-700">
        <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
        <span className="text-xs text-white hidden sm:inline">
          Caricamento...
        </span>
      </div>
    );
  }
  
  // Verifica se c'è una discrepanza significativa
  const hasMismatch = dbCount && sitemapCount && (dbCount - sitemapCount > 50);
  
  // Determina il colore dell'indicatore
  let indicatorColor = "bg-blue-500"; // Default: blu
  if (hasMismatch) {
    indicatorColor = "bg-yellow-500"; // Discrepanza: giallo
  } else if (sitemapStats?.is_error) {
    indicatorColor = "bg-red-500"; // Errore: rosso
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 border border-gray-700 hover:bg-black/70 transition-colors"
        aria-label="Conteggio database e sitemap"
        title="Conteggio database e sitemap"
      >
        <div className={`w-3 h-3 rounded-full ${indicatorColor} transition-colors`} />
        <span className="text-xs text-white hidden sm:inline">
          {dbCount !== null ? `DB: ${dbCount}` : ''} 
          {dbCount !== null && sitemapCount !== null ? ' | ' : ''}
          {sitemapCount !== null ? `XML: ${sitemapCount}` : ''}
        </span>
      </button>
      
      {showInfo && (
        <div className="absolute top-full right-0 mt-2 p-3 rounded-lg bg-black/90 backdrop-blur-md border border-gray-800 shadow-lg z-50 w-72">
          <div className="text-sm font-medium mb-2 text-white">
            Statistiche contenuti
          </div>
          
          {error ? (
            <p className="text-xs text-red-400 mb-2">{error}</p>
          ) : (
            <>
              <div className="text-xs text-gray-300 mb-2">
                <div className="flex justify-between mb-1">
                  <span>Record nel database:</span>
                  <span className="font-bold">{dbCount?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>URL nella sitemap:</span>
                  <span className="font-bold">{sitemapCount?.toLocaleString() || 'N/A'}</span>
                </div>
                
                {sitemapStats && (
                  <>
                    <div className="flex justify-between mb-1">
                      <span>Film nella sitemap:</span>
                      <span className="font-bold">{sitemapStats.film_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Serie nella sitemap:</span>
                      <span className="font-bold">{sitemapStats.serie_count.toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                {lastGeneration && (
                  <div className="flex justify-between mb-1">
                    <span>Ultimo aggiornamento:</span>
                    <span className="font-bold">{lastGeneration}</span>
                  </div>
                )}
                
                {hasMismatch && (
                  <div className="mt-2 text-yellow-400 font-medium">
                    Attenzione: {dbCount! - sitemapCount!} record non inclusi nella sitemap
                  </div>
                )}
                
                {sitemapStats?.is_error && (
                  <div className="mt-2 text-red-400 font-medium">
                    Errore nell'ultima generazione sitemap
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="text-xs text-gray-400 mt-3">
            <a href="/admin/statistiche-pagine" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              Visualizza statistiche complete
            </a>
          </div>
        </div>
      )}
    </div>
  );
}