"use client";

import { useState, useEffect } from "react";

interface PageGenerationIndicatorProps {
  className?: string;
  pathname?: string;
}

export function PageGenerationIndicator({ 
  className = "",
  pathname
}: PageGenerationIndicatorProps) {
  const [isGenerated, setIsGenerated] = useState<boolean | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    console.log("PageGenerationIndicator montato, pathname:", pathname);
    
    async function checkPageGeneration() {
      try {
        // Ottiene il percorso corrente se non fornito
        const currentPath = pathname || window.location.pathname;
        console.log("Verificando generazione pagina per:", currentPath);
        
        // Fa una richiesta HEAD alla pagina corrente
        const response = await fetch(currentPath, { method: 'HEAD' });
        
        // Controlla l'header x-nextjs-cache
        const cacheStatus = response.headers.get('x-nextjs-cache');
        console.log("Stato cache x-nextjs-cache:", cacheStatus);
        
        // Se l'header è "HIT", significa che la pagina è stata pre-renderizzata o generata in precedenza
        setIsGenerated(cacheStatus === 'HIT');
        console.log("Pagina pre-renderizzata:", cacheStatus === 'HIT');
      } catch (error) {
        console.error("Errore nel controllo dello stato di generazione:", error);
        setIsGenerated(null);
      }
    }
    
    checkPageGeneration();
  }, [pathname]);

  // Se non siamo ancora riusciti a determinare lo stato, mostriamo un indicatore neutro
  if (isGenerated === null) {
    console.log("Stato di generazione non ancora determinato, non mostro nulla");
    return null;
  }

  console.log("Renderizzando indicatore con stato:", isGenerated ? "pre-renderizzato (verde)" : "on-demand (giallo)");
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 border border-gray-700 hover:bg-black/70 transition-colors"
        aria-label={isGenerated ? "Pagina pre-renderizzata" : "Pagina generata on-demand"}
        title={isGenerated ? "Pagina pre-renderizzata" : "Pagina generata on-demand"}
      >
        <div 
          className={`w-3 h-3 rounded-full ${isGenerated ? 'bg-green-500' : 'bg-yellow-500'} transition-colors`}
        />
        <span className="text-xs text-white hidden sm:inline">
          {isGenerated ? "Pre-renderizzata" : "On-demand"}
        </span>
      </button>
      
      {showInfo && (
        <div className="absolute top-full right-0 mt-2 p-3 rounded-lg bg-black/90 backdrop-blur-md border border-gray-800 shadow-lg z-50 w-64">
          <div className="text-sm font-medium mb-2 text-white">
            {isGenerated ? "Pagina pre-renderizzata" : "Pagina generata on-demand"}
          </div>
          <p className="text-xs text-gray-300 mb-2">
            {isGenerated 
              ? "Questa pagina è stata generata durante il build o in precedenza e servita dalla cache." 
              : "Questa pagina è stata generata al momento della richiesta."}
          </p>
          <div className="text-xs text-gray-400">
            Cache status: <span className="font-mono">{isGenerated ? 'HIT' : 'MISS'}</span>
          </div>
        </div>
      )}
    </div>
  );
} 