import React from 'react';
import { Share2, Heart, Bell } from 'lucide-react';

interface ActionButtonsProps {
  onShare: () => void;
  onFavorite: () => void;
  onNotify: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onShare, onFavorite, onNotify }) => {
  return (
    <div className="action-buttons flex flex-col gap-4">
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