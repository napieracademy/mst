"use client";

import { useState, useEffect } from "react";

// Interfaccia per le statistiche della sitemap
interface SitemapStats {
  totalCount: number;
  sitemapCount: number;
  lastGeneration: string;
  filmCount: number;
  serieCount: number;
  isError: boolean;
  errorMessage: string | null;
}

export function DatabaseCounter() {
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        
        // Usa il nuovo endpoint che fornisce tutte le statistiche
        const response = await fetch('/api/sitemap-stats', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Errore API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Errore sconosciuto');
        }
        
        setStats({
          totalCount: data.totalCount || 0,
          sitemapCount: data.sitemapCount || 0,
          lastGeneration: data.lastGeneration || null,
          filmCount: data.filmCount || 0,
          serieCount: data.serieCount || 0,
          isError: data.isError || false,
          errorMessage: data.errorMessage || null
        });
        
        // Formatta la data dell'ultima generazione
        if (data.lastGeneration) {
          try {
            const date = new Date(data.lastGeneration);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffHours < 1) {
              setLastUpdate(`${Math.floor(diffMs / (1000 * 60))} minuti fa`);
            } else if (diffHours < 24) {
              setLastUpdate(`${diffHours} ore fa`);
            } else {
              setLastUpdate(`${Math.floor(diffHours / 24)} giorni fa`);
            }
          } catch (e) {
            setLastUpdate(null);
          }
        }
      } catch (error) {
        console.error("Errore nel recupero statistiche:", error);
        setError(error instanceof Error ? error.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
    
    // Aggiorna ogni 5 minuti
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 border border-gray-700">
        <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
        <span className="text-xs text-white hidden sm:inline">
          Caricamento...
        </span>
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 border border-red-700">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-xs text-white hidden sm:inline">
          Errore stats
        </span>
      </div>
    );
  }
  
  // Verifica se c'è una discrepanza significativa
  const hasMismatch = stats.totalCount && stats.sitemapCount && (stats.totalCount - stats.sitemapCount > 50);
  
  // Determina il colore dell'indicatore
  let indicatorColor = "bg-blue-500"; // Default: blu
  if (hasMismatch) {
    indicatorColor = "bg-yellow-500"; // Discrepanza: giallo
  } else if (stats.isError) {
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
          {stats.totalCount ? `DB: ${stats.totalCount.toLocaleString()}` : ''} 
          {stats.totalCount && stats.sitemapCount ? ' | ' : ''}
          {stats.sitemapCount ? `XML: ${stats.sitemapCount.toLocaleString()}` : ''}
        </span>
      </button>
      
      {showInfo && (
        <div className="absolute top-full right-0 mt-2 p-3 rounded-lg bg-black/90 backdrop-blur-md border border-gray-800 shadow-lg z-50 w-72">
          <div className="text-sm font-medium mb-2 text-white flex items-center gap-2">
            <span>Statistiche contenuti</span>
            {stats.isError ? (
              <span className="text-red-500 text-lg">⚠</span>
            ) : (
              <span className="text-green-500 text-lg">✓</span>
            )}
          </div>
          
          <div className="text-xs text-gray-300 mb-2">
            <div className="flex justify-between mb-1">
              <span>Record nel database:</span>
              <span className="font-bold">{stats.totalCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>URL nella sitemap:</span>
              <span className="font-bold">{stats.sitemapCount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between mb-1">
              <span>Film nella sitemap:</span>
              <span className="font-bold">{stats.filmCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Serie nella sitemap:</span>
              <span className="font-bold">{stats.serieCount.toLocaleString()}</span>
            </div>
            
            {lastUpdate && (
              <div className="flex justify-between mb-1">
                <span>Ultimo aggiornamento:</span>
                <span className="font-bold">{lastUpdate}</span>
              </div>
            )}
            
            {hasMismatch && (
              <div className="mt-2 text-yellow-400 font-medium">
                Attenzione: {stats.totalCount - stats.sitemapCount} record non inclusi nella sitemap
              </div>
            )}
            
            {stats.isError && stats.errorMessage && (
              <div className="mt-2 text-red-400 font-medium">
                Errore: {stats.errorMessage}
              </div>
            )}
          </div>
          
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