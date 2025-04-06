"use client"

import { useState } from "react"
import type { Movie } from "@/lib/types"
import { Carousel } from "../atomic/molecules/carousel"
import { Text } from "../atomic/atoms/text"
import { Container } from "@/atomic/atoms/container"
import { MovieImage } from "../atomic/atoms/image"
import { cn } from "../atomic/utils/cn"
import { ContentLink } from "./content-link"

interface NowPlayingMoviesProps {
  movies: Movie[]
}

export function NowPlayingMovies({ movies }: NowPlayingMoviesProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Log per debugging
  console.log(`NowPlayingMovies component received ${movies?.length || 0} items`);
  
  if (!movies || movies.length === 0) {
    console.log("NowPlayingMovies: nessun film trovato, componente non renderizzato");
    return null;
  }

  // Limitiamo la quantità di film mostrati (max 10)
  const displayMovies = movies.slice(0, 10);

  return (
    <section className="mt-24 pt-8 border-t border-gray-800">
      <Container>
        <div className="mb-6">
          <Text variant="h2">
            Film ora al cinema
          </Text>
        </div>
        
        <Carousel showArrows showDots={false}>
          {displayMovies.map((movie) => {
            // Estrai l'anno dalla data di rilascio
            const year = movie.release_date 
              ? movie.release_date.split('-')[0] 
              : null;
              
            return (
              <div
                key={movie.id}
                className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-12px)]"
              >
                <ContentLink
                  id={movie.id}
                  title={movie.title || "Film"}
                  year={year}
                  type="film"
                  className={cn(
                    'group relative block overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50'
                  )}
                >
                  <div className="aspect-[2/3] relative">
                    <MovieImage
                      src={movie.poster_path}
                      alt={movie.title || "Locandina"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoadingComplete={() => setIsLoaded(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </ContentLink>
              </div>
            );
          })}
        </Carousel>
      </Container>
    </section>
  );
}