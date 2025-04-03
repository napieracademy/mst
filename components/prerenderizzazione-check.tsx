'use client';

import { useState } from 'react';

interface PreRenderCheckProps {
  className?: string;
}

export function PreRenderizzazioneCheck({ className = "" }: PreRenderCheckProps) {
  // Versione semplificata per Netlify, sempre verde (prerenderizzato)
  const [mostraInfo, setMostraInfo] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setMostraInfo(!mostraInfo)}
        className={`flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 border border-gray-700 hover:bg-black/70 transition-colors ${className}`}
        aria-label="Indicatore di build"
        title="Indicatore di build"
      >
        <div className="w-3 h-3 rounded-full bg-green-500 transition-colors" />
        <span className="text-xs text-white hidden sm:inline">Build</span>
      </button>
      
      {mostraInfo && (
        <div className="absolute top-full right-0 mt-2 p-3 rounded-lg bg-black/90 backdrop-blur-md border border-gray-800 shadow-lg z-50">
          <div className="text-sm font-medium mb-2 text-white">
            Indicatore di build
          </div>
          <p className="text-xs text-gray-300 mb-2">
            Questa è una versione semplificata per Netlify.
          </p>
        </div>
      )}
    </div>
  );
} 