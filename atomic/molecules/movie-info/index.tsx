import React from 'react';

interface MovieInfoProps {
  title: string;
  releaseDate?: string;
  hasTrailer?: boolean;
  onWatchTrailer?: () => void;
}

export const MovieInfo: React.FC<MovieInfoProps> = ({ 
  title, 
  releaseDate, 
  hasTrailer = false, 
  onWatchTrailer 
}) => {
  return (
    <div className="movie-info text-left mt-2 sm:mt-0">
      {releaseDate && (
        <p className="text-sm sm:text-base text-yellow-400 mb-3 sm:mb-4">
          {releaseDate.includes('Data di uscita:') ? releaseDate : `Data di uscita: ${releaseDate}`}
        </p>
      )}
      <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
        {title}
      </h1>
    </div>
  );
}; 