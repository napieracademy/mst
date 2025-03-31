"use client"

import { useState, useRef } from "react"
import type { Movie } from "@/lib/types"
import { MoviePoster } from "./movie-poster"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MovieRowProps {
  title: string
  movies: Movie[]
}

export function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Gestione dello scroll orizzontale
  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return

    const { scrollLeft, clientWidth } = rowRef.current
    const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

    rowRef.current.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!rowRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  if (movies.length === 0) {
    return null
  }

  return (
    <div className="px-4">
      <h2 className="text-xl md:text-2xl font-medium mb-4">{title}</h2>

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

        <div ref={rowRef} className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide" onScroll={handleScroll}>
          {movies.map((movie) => (
            <MoviePoster key={movie.id} movie={movie} />
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
    </div>
  )
}

