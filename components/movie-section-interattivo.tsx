"use client"

import { useRef, useState, useCallback, useEffect, useMemo } from "react"
import { Movie } from "@/lib/types"
import { MovieCard } from "./movie-card"
import { getOMDBDataByIMDbId } from "@/lib/omdb"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MovieSectionInterattivoProps {
  title: string
  movies: Movie[]
  showDirector?: boolean
  isFirstSection?: boolean
}

// Cache per i rating RT per evitare chiamate ripetute
const rtRatingsCache: { [key: string]: number | null } = {}

export function MovieSectionInterattivo({ 
  title, 
  movies, 
  showDirector = false, 
  isFirstSection = false 
}: MovieSectionInterattivoProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [movieRatings, setMovieRatings] = useState<{[key: number]: number}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [processedMovies, setProcessedMovies] = useState<Set<string>>(new Set())

  const fetchRottenTomatoesRating = useCallback(async (imdbId: string) => {
    // Se abbiamo già il rating in cache, lo usiamo
    if (rtRatingsCache[imdbId] !== undefined) {
      console.log(`Using cached RT rating for ${imdbId}:`, rtRatingsCache[imdbId]);
      return rtRatingsCache[imdbId];
    }

    try {
      console.log(`Fetching RT rating for ${imdbId}...`);
      const omdbData = await getOMDBDataByIMDbId(imdbId);
      console.log(`OMDB data for ${imdbId}:`, omdbData);
      
      const rtRating = omdbData?.ratings?.find(r => r.source === "Rotten Tomatoes");
      const rating = rtRating ? parseInt(rtRating.value) : null;
      
      console.log(`RT rating for ${imdbId}:`, rating);
      rtRatingsCache[imdbId] = rating;
      return rating;
    } catch (error) {
      console.error(`Error fetching rating for ${imdbId}:`, error);
      rtRatingsCache[imdbId] = null;
      return null;
    }
  }, [])

  useEffect(() => {
    const fetchRatings = async () => {
      if (!movies.length) return
      
      setIsLoading(true)
      const newRatings: {[key: number]: number} = { ...movieRatings }
      const newProcessedMovies = new Set(processedMovies)

      // Processa solo i film non ancora elaborati
      const unprocessedMovies = movies.filter(movie => 
        movie.imdb_id && !newProcessedMovies.has(movie.imdb_id)
      )

      if (unprocessedMovies.length === 0) {
        console.log("No movies with IMDB ID to process");
        setIsLoading(false)
        return
      }

      // Fetch ratings in parallel
      await Promise.all(
        unprocessedMovies.map(async (movie) => {
          if (!movie.imdb_id) return

          try {
            const rating = await fetchRottenTomatoesRating(movie.imdb_id)
            if (rating) {
              newRatings[movie.id] = rating
            }
            newProcessedMovies.add(movie.imdb_id)
          } catch (error) {
            console.error(`Error processing ${movie.title}:`, error);
          }
        })
      )

      setMovieRatings(newRatings)
      setProcessedMovies(newProcessedMovies)
      setIsLoading(false)
    }

    fetchRatings()
  }, [movies, fetchRottenTomatoesRating])

  // Gestione dello scroll orizzontale
  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return

    const { scrollLeft, clientWidth } = carouselRef.current
    const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

    carouselRef.current.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return

    e.preventDefault()
    const x = e.pageX - (carouselRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <section className={`relative ${isFirstSection ? 'mt-0' : 'mt-12'}`}>
      <h2 className="text-2xl font-medium mb-6">{title}</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-r-lg transition-all"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/75 rounded-l-lg transition-all"
            aria-label="Scorri a destra"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Movie Carousel */}
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
            <div key={movie.id} className="flex-none w-48">
              <MovieCard 
                movie={movie} 
                showDirector={showDirector}
                rtRating={movieRatings[movie.id]}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 