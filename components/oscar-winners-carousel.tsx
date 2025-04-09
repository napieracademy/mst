"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

export function OscarWinnersCarousel({
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

  // Funzioni di stile riprese dalla struttura esistente del progetto
  return (
    <section className="mt-8 mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-md">
          <p className="text-red-500">Errore nel caricamento dei film: {error}</p>
        </div>
      ) : movies.length === 0 ? (
        <p className="text-gray-500 italic">Nessun vincitore di Oscar trovato per il periodo selezionato.</p>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-flow-col auto-cols-max gap-4">
            {movies.map((movie) => (
              <Link
                href={`/movie/${movie.tmdbId}`}
                key={movie.tmdbId}
                className="w-[160px] sm:w-[180px] transition-transform duration-300 hover:scale-105"
              >
                <div className="relative rounded-md overflow-hidden aspect-[2/3] bg-gray-900">
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 160px, 180px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/50 text-center p-4">{movie.title}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <h3 className="font-medium truncate">{movie.title}</h3>
                  <p className="text-sm text-gray-400">
                    {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}
                    {movie.voteAverage ? ` • ${movie.voteAverage.toFixed(1)}⭐` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}