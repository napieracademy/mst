import React from 'react';

interface TVInfoProps {
  title: string;
  releaseDate?: string;
  hasTrailer?: boolean;
  onWatchTrailer?: () => void;
}

export const TVInfo: React.FC<TVInfoProps> = ({ 
  title, 
  releaseDate, 
  hasTrailer = false, 
  onWatchTrailer 
}) => {
  return (
    <div className="tv-info text-left mt-2 sm:mt-0 space-y-2"> {/* Added space-y-2 for spacing */}
      {releaseDate && (
        <p className="text-sm sm:text-base text-yellow-400 mb-2"> {/* Reduced bottom margin */}
          {releaseDate.includes('Prima uscita:') ? releaseDate : `Prima uscita: ${releaseDate}`}
        </p>
      )}
      <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
        {title}
      </h1>
      {hasTrailer && onWatchTrailer && (
        <button 
          className="bg-transparent border border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-400 font-bold py-2 px-4 rounded inline-flex items-center" // Flat button style
          onClick={onWatchTrailer}
        >
          Guarda il trailer
        </button>
      )}
    </div>
  );
};