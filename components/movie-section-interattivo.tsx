"use client"

import { useState, useRef, useEffect } from "react"
import type { Movie } from "@/lib/types"
import { MovieCard } from "./movie-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MovieSectionInterattivoProps {
  title: string
  movies: Movie[]
  showDirector?: boolean
  isFirstSection?: boolean
}

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

  // Se non ci sono film, non mostrare nulla
  if (!movies || movies.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <h2 className="text-xl font-medium mb-6">{title}</h2>

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
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-none w-[250px]">
              <MovieCard movie={movie} showDirector={showDirector} />
            </div>
          ))}
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
    </section>
  )
} 