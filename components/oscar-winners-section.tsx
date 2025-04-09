"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { MovieCard } from "./movie-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useOscarWinners } from "@/hooks/useOscarWinners"

interface OscarWinnersSectionProps {
  title: string
  showDirector?: boolean
  isFirstSection?: boolean
}

export function OscarWinnersSection({ 
  title, 
  showDirector = true, 
  isFirstSection = false 
}: OscarWinnersSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  // Ottiene i vincitori degli Oscar arricchiti con dati OMDB
  const { winners, loading, error } = useOscarWinners()

  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    
    setShowLeftArrow(scrollLeft > 20)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
  }, [])

  const scroll = useCallback((direction: "left" | "right") => {
    if (!carouselRef.current) return
    
    const { clientWidth } = carouselRef.current
    const scrollAmount = clientWidth * 0.8
    
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }, [])

  const startDragging = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }, [])

  const stopDragging = useCallback(() => {
    setIsDragging(false)
  }, [])

  const doDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !carouselRef.current) return
      
      e.preventDefault()
      const x = e.pageX - carouselRef.current.offsetLeft
      const walk = (x - startX) * 2 // Velocità di scroll
      carouselRef.current.scrollLeft = scrollLeft - walk
    },
    [isDragging, startX, scrollLeft]
  )

  useEffect(() => {
    const carousel = carouselRef.current
    if (carousel) {
      handleScroll() // Controlla inizialmente
      carousel.addEventListener("scroll", handleScroll)
      return () => carousel.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  return (
    <section 
      className={`my-16 ${isFirstSection ? 'lg:mt-0' : ''}`}
      aria-labelledby={`section-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 
          id={`section-title-${title.replace(/\s+/g, '-').toLowerCase()}`} 
          className="text-xl md:text-2xl font-bold text-white flex-1"
        >
          {title}
          {loading && <span className="ml-2 text-sm font-normal text-gray-400">(Caricamento...)</span>}
        </h2>
        
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => scroll("left")}
            className={`p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-opacity duration-300 ${
              showLeftArrow ? "opacity-100" : "opacity-40 cursor-not-allowed"
            }`}
            disabled={!showLeftArrow}
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-opacity duration-300 ${
              showRightArrow ? "opacity-100" : "opacity-40 cursor-not-allowed"
            }`}
            disabled={!showRightArrow}
            aria-label="Scorri a destra"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="relative overflow-x-auto scrollbar-hide"
        onMouseDown={startDragging}
        onMouseLeave={stopDragging}
        onMouseUp={stopDragging}
        onMouseMove={doDrag}
      >
        {/* Indicatori frecce per mobile */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none transition-opacity duration-300 sm:hidden ${
            showLeftArrow ? "opacity-100" : "opacity-0"
          }`}
        ></div>
        <div
          className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none transition-opacity duration-300 sm:hidden ${
            showRightArrow ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        {/* Griglia di film */}
        <div className={`grid grid-flow-col auto-cols-max gap-4 pb-4 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}>
          {loading ? (
            // Skeleton loader durante il caricamento
            Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={`skeleton-${i}`} 
                className="w-36 md:w-48 animate-pulse"
              >
                <div className="bg-gray-800 h-56 md:h-72 rounded-md mb-2"></div>
                <div className="bg-gray-800 h-5 rounded mb-1 w-5/6"></div>
                <div className="bg-gray-800 h-4 rounded w-4/6"></div>
              </div>
            ))
          ) : error ? (
            <div className="text-red-500 p-4">
              Errore: impossibile caricare i vincitori dell'Oscar. {error}
            </div>
          ) : winners.length === 0 ? (
            <div className="text-yellow-500 p-4">
              Nessun film vincitore di Oscar trovato. Verifica la console per i dettagli.
            </div>
          ) : (
            winners.map((movie) => {
              // Log per debug
              console.log(`Rendering movie: ${movie.title || movie.name} (${movie.id}), year: ${movie.oscar_win_year}`)
              
              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  showDirector={showDirector}
                  showYear={true}
                  extraInfo={movie.oscar_win_year ? `Oscar ${movie.oscar_win_year}` : undefined}
                  extraInfoClass="text-yellow-400"
                />
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}