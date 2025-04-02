"use client"

import { useState, useRef, useEffect } from "react"
import type { Movie } from "@/lib/types"
import { Carousel } from "@/atomic/molecules/carousel"
import { Text } from "@/atomic/atoms/text"
import { Container } from "@/atomic/atoms/container"
import { MovieImage } from "@/atomic/atoms/image"
import Link from "next/link"
import { cn } from "@/atomic/utils/cn"

interface SimilarMoviesProps {
  movies: Movie[]
}

// Adapter per rendere compatibile il tipo Movie con il nostro componente
const adaptMovie = (movie: Movie) => ({
  id: movie.id,
  title: movie.title || movie.name || "Film",
  poster_path: movie.poster_path,
  release_date: movie.release_date || new Date().toISOString(),
  vote_average: movie.vote_average || 0
});

export function SimilarMovies({ movies }: SimilarMoviesProps) {
  if (!movies || movies.length === 0) return null

  // Limita il numero di film a 10
  const displayMovies = movies.slice(0, 10)

  return (
    <section className="mt-24 pt-8 border-t border-gray-800">
      <Container>
        <Text variant="h2" className="mb-6">
          Film simili
        </Text>

        <Carousel showArrows showDots={false}>
          {displayMovies.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-12px)]"
            >
              <Link
                href={`/movie/${movie.id}`}
                className={cn(
                  'group relative block overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50'
                )}
              >
                <div className="aspect-[2/3] relative">
                  <MovieImage
                    src={movie.poster_path}
                    alt={movie.title || movie.name || "Locandina film"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </div>
          ))}
        </Carousel>
      </Container>
    </section>
  )
}

