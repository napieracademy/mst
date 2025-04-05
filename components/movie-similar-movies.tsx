
"use client"

import { useState, useRef, useEffect } from "react"
import type { Movie } from "@/lib/types"
import { Text } from "../atomic/atoms/text"
import { Container } from "@/atomic/atoms/container"
import { MovieImage } from "../atomic/atoms/image"
import { cn } from "../atomic/utils/cn"
import { ContentLink } from "./content-link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MovieSimilarMoviesProps {
  movies: Movie[]
  title?: string
}

export function MovieSimilarMovies({ movies, title = "Film simili" }: MovieSimilarMoviesProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

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

  // Gestione del drag con il mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return

    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return

    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2 // Velocità di scorrimento
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  // Gestione del touch per dispositivi mobili
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return

    setIsDragging(true)
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return

    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  // Verifica iniziale per le frecce
  useEffect(() => {
    if (carouselRef.current) {
      const { scrollWidth, clientWidth } = carouselRef.current
      setShowRightArrow(scrollWidth > clientWidth)
    }
  }, [movies])

  // Verificare se i film hanno title (film) o name (serie TV)
  const isMovieType = !!movies?.[0]?.title
  const mediaType = isMovieType ? 'film' : 'serie'

  return (
    <section className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
      <Container>
        <div className="mb-6">
          <Text variant="h2" className="text-gray-400">
            {title}
          </Text>
        </div>
        
        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          <div
            ref={carouselRef}
            className="flex space-x-4 overflow-x-auto py-4 px-2 scrollbar-hide"
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
