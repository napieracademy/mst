"use client"

import { useState, useRef } from "react"
import type { Movie } from "@/lib/types"
import { MovieCard } from "./movie-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function MovieSlider({ movies }: { movies: Movie[] }) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return

    const { scrollLeft, clientWidth } = sliderRef.current
    const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

    sliderRef.current.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!sliderRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  return (
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

      <div ref={sliderRef} className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" onScroll={handleScroll}>
        {movies.map((movie) => (
          <div key={movie.id} className="flex-none w-[180px]">
            <MovieCard movie={movie} />
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
  )
}

