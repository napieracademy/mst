"use client";

import { useState, useEffect } from "react";

export function DatabaseCounter() {
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [sitemapCount, setSitemapCount] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);
        
        // 1. Fetch database count
        const dbResponse = await fetch('/api/check-api-key?check=db-count', {
          cache: 'no-store'
        });
        const dbData = await dbResponse.json();
        
        // 2. Fetch sitemap count by reading the first few lines of sitemap.xml
        const sitemapResponse = await fetch('/sitemap.xml', {
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Range': 'bytes=0-500' // Solo i primi 500 bytes per leggere l'intestazione
          }
        });
        
        const sitemapText = await sitemapResponse.text();
        const countMatch = sitemapText.match(/con (\d+) URL/);
        
        if (dbData.count) {
          setDbCount(dbData.count);
        }
        
        if (countMatch && countMatch[1]) {
          setSitemapCount(parseInt(countMatch[1], 10));
        }
      } catch (error) {
        console.error("Errore nel recupero conteggi:", error);
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
    return null;
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 border border-gray-700 hover:bg-black/70 transition-colors"
        aria-label="Conteggio database e sitemap"
        title="Conteggio database e sitemap"
      >
        <div className="w-3 h-3 rounded-full bg-blue-500 transition-colors" />
        <span className="text-xs text-white hidden sm:inline">
          {dbCount !== null ? `DB: ${dbCount}` : ''} 
          {dbCount !== null && sitemapCount !== null ? ' | ' : ''}
          {sitemapCount !== null ? `XML: ${sitemapCount}` : ''}
        </span>
      </button>
      
      {showInfo && (
        <div className="absolute top-full right-0 mt-2 p-3 rounded-lg bg-black/90 backdrop-blur-md border border-gray-800 shadow-lg z-50 w-64">
          <div className="text-sm font-medium mb-2 text-white">
            Statistiche contenuti
          </div>
          <p className="text-xs text-gray-300 mb-2">
            Record nel database: <span className="font-bold">{dbCount || 'N/A'}</span><br />
            URL nella sitemap: <span className="font-bold">{sitemapCount || 'N/A'}</span>
          </p>
          <div className="text-xs text-gray-400">
            <a href="/admin/statistiche-pagine" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              Visualizza statistiche complete
            </a>
          </div>
        </div>
      )}
    </div>
  );
}