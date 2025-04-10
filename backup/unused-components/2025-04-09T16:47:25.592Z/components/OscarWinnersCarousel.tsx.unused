"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

// Interfaccia per i dati dei film vincitori di Oscar
interface OscarWinnerMovie {
  imdbId: string;
  tmdbId: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  voteAverage: number;
}

interface OscarWinnersCarouselProps {
  title?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export default function OscarWinnersCarousel({
  title = "Film vincitori di Oscar",
  startDate = "2015-01-01",
  endDate,
  limit = 10
}: OscarWinnersCarouselProps) {
  const [movies, setMovies] = useState<OscarWinnerMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOscarWinners = async () => {
      setLoading(true);
      try {
        // Imposto la data di fine al giorno corrente se non specificata
        const today = new Date().toISOString().split('T')[0];
        const endDateParam = endDate || today;
        
        // Chiamata al nostro nuovo endpoint
        const response = await fetch(
          `/api/oscar-winners?startDate=${startDate}&endDate=${endDateParam}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error(`Errore nel caricamento dei film: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.movies) {
          setMovies(data.movies);
        } else {
          throw new Error(data.error || 'Errore sconosciuto');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
        console.error('Errore nel caricamento dei vincitori di Oscar:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOscarWinners();
  }, [startDate, endDate, limit]);

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 dark:bg-opacity-20 text-red-700 dark:text-red-400">
        <p>Errore nel caricamento dei vincitori di Oscar: {error}</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-[180px] h-[270px] rounded-md shrink-0" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {movies.map((movie) => (
            <Link 
              href={`/movie/${movie.tmdbId}`} 
              key={movie.tmdbId}
              className="w-[180px] shrink-0 snap-start"
            >
              <div className="relative group rounded-md overflow-hidden transition-all duration-300 bg-gray-900 h-full">
                {movie.posterPath ? (
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <h3 className="text-white font-medium truncate">{movie.title}</h3>
                      <p className="text-white/80 text-sm">
                        {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}
                        {movie.voteAverage ? ` • ${movie.voteAverage.toFixed(1)}⭐` : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <span className="text-white/50 text-center p-4">{movie.title}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Nessun vincitore di Oscar trovato per il periodo selezionato.</p>
      )}
    </div>
  );
}