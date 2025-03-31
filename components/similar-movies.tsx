"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Movie } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SimilarMoviesProps {
  movies: Movie[]
}

export function SimilarMovies({ movies }: SimilarMoviesProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  if (!movies || movies.length === 0) return null

  // Limit to 20 movies maximum
  const displayMovies = movies.slice(0, 20)

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return

    const { scrollLeft, clientWidth } = carouselRef.current
    // Scroll by the width of 4 items
    const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth

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

  return (
    <section className="mt-24 pt-8 border-t border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Film simili</h2>

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

        <div ref={carouselRef} className="flex overflow-x-auto pb-4 scrollbar-hide" onScroll={handleScroll}>
          {displayMovies.map((movie, index) => (
            <div key={movie.id} className="flex-none relative" style={{ width: "calc(25% - 12px)" }}>
              <Link href={`/${movie.title ? "movie" : "tv"}/${movie.id}`} className="block px-2">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title || movie.name || ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </Link>
              {/* Add separator line after each card except the last one */}
              {index < displayMovies.length - 1 && (
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gray-800"></div>
              )}
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

