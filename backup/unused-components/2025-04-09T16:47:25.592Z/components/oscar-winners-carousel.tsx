"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from "./movie-card";
import type { Movie } from "@/lib/types";

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchOscarWinners = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const endDateParam = endDate || today;
        
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

  // Gestione dello scroll orizzontale
  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const { scrollLeft, clientWidth } = carouselRef.current;
    const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;

    carouselRef.current.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;

    e.preventDefault();
    const x = e.pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Converti i dati nel formato richiesto da MovieCard
  const convertToMovieType = (oscarMovie: OscarWinnerMovie): Movie => ({
    id: oscarMovie.tmdbId,
    title: oscarMovie.title,
    poster_path: oscarMovie.posterPath,
    backdrop_path: oscarMovie.backdropPath,
    overview: oscarMovie.overview,
    vote_average: oscarMovie.voteAverage,
    release_date: oscarMovie.releaseDate,
    oscar_win_year: new Date(oscarMovie.releaseDate).getFullYear(),
    popularity: 0,
  });

  return (
    <section className="mt-8 mb-12">
      <h2 className="text-2xl font-medium mb-6">{title}</h2>
      
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
        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-r-lg transition-all"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-l-lg transition-all"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div
            ref={carouselRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          >
            {movies.map((movie) => (
              <div key={movie.tmdbId} className="flex-none w-48">
                <MovieCard 
                  movie={convertToMovieType(movie)}
                  showDirector={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}