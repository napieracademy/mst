
"use client";

import React from "react";
import type { Movie } from "@/lib/types";
import { InteractiveCarousel } from "@/atomic/molecules/interactive-carousel";
import { Text } from "../atomic/atoms/text";
import { Container } from "@/atomic/atoms/container";
import { MovieImage } from "../atomic/atoms/image";
import { cn } from "../atomic/utils/cn";
import { ContentLink } from "./content-link";

interface SimilarMoviesUnifiedProps {
  movies: Movie[];
  title?: string;
  className?: string;
}

export function SimilarMoviesUnified({
  movies,
  title = "Film simili",
  className
}: SimilarMoviesUnifiedProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <Container className={cn("mt-16", className)}>
      <Text variant="h2" className="mb-6">{title}</Text>
      
      <InteractiveCarousel 
        itemWidth={200} 
        dragSpeed={3}
        showDots={movies.length > 5}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex flex-col">
            <ContentLink 
              href={`/movie/${movie.id}`} 
              className="block rounded-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <MovieImage 
                movie={movie} 
                width={200}
                height={300}
                alt={movie.title || movie.name || "Film simile"}
                className="w-full h-auto"
              />
            </ContentLink>
            <Text variant="h4" className="mt-2 text-center truncate">
              {movie.title || movie.name}
            </Text>
          </div>
        ))}
      </InteractiveCarousel>
    </Container>
  );
}
