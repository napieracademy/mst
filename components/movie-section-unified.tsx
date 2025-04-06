
"use client";

import React from "react";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./movie-card";
import { InteractiveCarousel } from "@/atomic/molecules/interactive-carousel";

interface MovieSectionUnifiedProps {
  title: string;
  movies: Movie[];
  showDirector?: boolean;
  className?: string;
  itemWidth?: number;
  dragSpeed?: number;
}

export function MovieSectionUnified({
  title,
  movies,
  showDirector = false,
  className = "",
  itemWidth = 250,
  dragSpeed = 2.5
}: MovieSectionUnifiedProps) {
  // Se non ci sono film, non mostrare nulla
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className={`mt-16 ${className}`}>
      <h2 className="text-xl font-medium mb-6">{title}</h2>

      <InteractiveCarousel 
        itemWidth={itemWidth}
        dragSpeed={dragSpeed}
        showDots={movies.length > 4}
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} showDirector={showDirector} />
        ))}
      </InteractiveCarousel>
    </section>
  );
}
