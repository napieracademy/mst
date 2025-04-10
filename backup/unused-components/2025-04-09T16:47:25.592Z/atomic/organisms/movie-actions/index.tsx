'use client';

import React from 'react';
import { Share2, Heart, Bell, Play } from 'lucide-react';

interface MovieActionsProps {
  hasTrailer?: boolean;
  onWatchTrailer?: () => void;
  onShare: () => void;
  onFavorite: () => void;
  onNotify: () => void;
}

export const MovieActions: React.FC<MovieActionsProps> = ({
  hasTrailer,
  onWatchTrailer,
  onShare,
  onFavorite,
  onNotify
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Pulsanti di azione verticali */}
      <button 
        onClick={onShare} 
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Condividi"
      >
        <Share2 className="w-5 h-5" />
      </button>
      <button 
        onClick={onFavorite} 
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Aggiungi ai preferiti"
      >
        <Heart className="w-5 h-5" />
      </button>
      <button 
        onClick={onNotify} 
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Ricevi notifiche"
      >
        <Bell className="w-5 h-5" />
      </button>
    </div>
  );
}; 