"use client"

import { useState, useRef, useEffect } from "react"
import type { Movie } from "@/lib/types"
import { Carousel } from "../atomic/molecules/carousel"
import { Text } from "../atomic/atoms/text"
import { Container } from "@/atomic/atoms/container"
import { MovieImage } from "../atomic/atoms/image"
import Link from "next/link"
import { cn } from "../atomic/utils/cn"
import { createGraphFromMovies, kruskalMST } from "../lib/graph"
import { ContentLink } from "./content-link"

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

  // Utilizziamo l'algoritmo MST per selezionare i contenuti più rilevanti
  // ma li mostriamo comunque nel carousel tradizionale
  const filteredMovies = useMSTToFilterMovies(movies);
  
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
            {filteredMovies.map((movie) => {
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
                    title={movie.title || movie.name || "Film"}
                    year={year}
                    type={mediaType as 'film' | 'attore' | 'regista'}
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

// Funzione che utilizza l'algoritmo MST per selezionare i film più rilevanti
function useMSTToFilterMovies(movies: Movie[], limit = 10): Movie[] {
  try {
    if (!movies || movies.length <= limit) return movies;
    
    // Crea il grafo completo
    const graph = createGraphFromMovies(movies);
    
    // Se il grafo non è valido, ritorniamo i primi "limit" film
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return movies.slice(0, limit);
    }
    
    // Applica l'algoritmo MST
    const mst = kruskalMST(graph);
    
    // Conta quante connessioni ha ogni nodo nel MST
    const nodeConnections = new Map<number, number>();
    mst.edges.forEach(edge => {
      const sourceCount = nodeConnections.get(edge.source) || 0;
      const targetCount = nodeConnections.get(edge.target) || 0;
      nodeConnections.set(edge.source, sourceCount + 1);
      nodeConnections.set(edge.target, targetCount + 1);
    });
    
    // Ordina i film per il numero di connessioni (più connessioni = più rilevante)
    const sortedMovies = [...movies].sort((a, b) => {
      const aConnections = nodeConnections.get(a.id) || 0;
      const bConnections = nodeConnections.get(b.id) || 0;
      return bConnections - aConnections; // Ordine decrescente
    });
    
    return sortedMovies.slice(0, limit);
  } catch (error) {
    console.error("Errore nell'applicazione dell'algoritmo MST:", error);
    return movies.slice(0, limit);
  }
}

