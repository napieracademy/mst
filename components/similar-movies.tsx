"use client"

import type { Movie } from "@/lib/types"
import { Carousel } from "../atomic/molecules/carousel"
import { Text } from "../atomic/atoms/text"
import { Container } from "@/atomic/atoms/container"
import { MovieImage } from "../atomic/atoms/image"
import { cn } from "../atomic/utils/cn"
import { ContentLink } from "./content-link"

interface SimilarMoviesProps {
  movies: Movie[]
}

export function SimilarMovies({ movies }: SimilarMoviesProps) {
  // Log per debugging
  console.log(`SimilarMovies component received ${movies?.length || 0} items`);
  
  if (!movies || movies.length === 0) {
    console.log("SimilarMovies: nessun contenuto simile trovato, componente non renderizzato");
    return null;
  }

  // Limitiamo la quantità di film/serie mostrate (max 10)
  const displayMovies = movies.slice(0, 10);
  
  // Determiniamo se sono film o serie TV
  const isMovieType = !!movies?.[0]?.title; // Se il primo elemento ha title, allora è di tipo "movie"
  const mediaType = isMovieType ? 'film' : 'serie';

  try {
    return (
      <section className="mt-24 pt-8 border-t border-gray-800">
        <Container>
          <div className="mb-6">
            <Text variant="h2">
              {isMovieType ? 'Film simili' : 'Serie TV simili'}
            </Text>
          </div>
          
          <Carousel showArrows showDots={false}>
            {displayMovies.map((movie) => {
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
                    title={movie.title || movie.name || "Contenuto"}
                    year={year}
                    type={mediaType as 'film' | 'attore' | 'regista' | 'serie'}
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
          </Carousel>
        </Container>
      </section>
    )
  } catch (error) {
    console.error("Errore nel rendering di SimilarMovies:", error);
    return (
      <section className="mt-24 pt-8 border-t border-gray-800">
        <Container>
          <Text variant="h2" className="mb-6">
            {isMovieType ? 'Film simili' : 'Serie TV simili'}
          </Text>
          <p className="text-red-500">Si è verificato un errore nel caricamento dei contenuti simili.</p>
        </Container>
      </section>
    );
  }
}

