
"use client"

import { useState, useRef, useEffect } from "react"
import type { Movie } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MovieImage } from "./movie-image"
import { Container } from "@/atomic/atoms/container"
import { Text } from "@/atomic/atoms/text"
import { ContentLink } from "./content-link"
import { cn } from "@/atomic/utils/cn"

interface ActorSimilarMoviesProps {
  movies: Movie[]
  title?: string
}

export function ActorSimilarMovies({ movies, title = "Film correlati" }: ActorSimilarMoviesProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Se non ci sono film, non mostrare nulla
  if (!movies || movies.length === 0) {
    return null
  }

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

  // Verificare se i film hanno title (film) o name (serie TV)
  const isMovieType = !!movies?.[0]?.title
  const mediaType = isMovieType ? 'film' : 'serie'

  return (
    <section className="mt-24 pt-8 border-t border-gray-800">
      <Container>
        <div className="mb-6">
          <Text variant="h2">
            {title}
          </Text>
        </div>
        
        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            ref={carouselRef}
            className="flex space-x-4 overflow-x-auto py-4 px-2 scrollbar-hide"
            onScroll={handleScroll}
          >
            {movies.map((movie) => {
              // Estrai l'anno dalla data di rilascio
              const year = movie.release_date 
                ? movie.release_date.split('-')[0] 
                : (movie.first_air_date ? movie.first_air_date.split('-')[0] : null);
                
              return (
                <div
                  key={movie.id}
                  className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-12px)]"
                >
                  <ContentLink
                    id={movie.id}
                    title={movie.title || movie.name || "Film"}
                    year={year}
                    type={mediaType as 'film' | 'attore' | 'regista'}
                    className={cn(
                      'group relative block overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50'
                    )}
                  >
                    <div className="aspect-[2/3] relative">
                      <MovieImage
                        src={movie.poster_path}
                        alt={movie.title || movie.name || "Locandina"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </ContentLink>
                </div>
              );
            })}
          </div>

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </Container>
    </section>
  )
}
