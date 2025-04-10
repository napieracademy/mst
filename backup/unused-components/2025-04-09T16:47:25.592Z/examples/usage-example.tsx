
"use client";

import { MovieSectionUnified } from "@/components/movie-section-unified";
import { SimilarMoviesUnified } from "@/components/similar-movies-unified";
import { Container } from "@/atomic/atoms/container";
import type { Movie } from "@/lib/types";

// Esempio di utilizzo dei componenti unificati con movimento più veloce
export default function ExamplePage({ movies, similarMovies }: { movies: Movie[], similarMovies: Movie[] }) {
  return (
    <Container>
      <h1 className="text-2xl font-bold my-8">Collezione Film</h1>
      
      {/* Componente per le sezioni di film con movimento velocizzato */}
      <MovieSectionUnified 
        title="Film popolari" 
        movies={movies} 
        dragSpeed={3} // Velocità aumentata (valore standard: 2.5)
      />
      
      {/* Componente per i film simili */}
      <SimilarMoviesUnified
        movies={similarMovies}
        title="Ti potrebbe interessare"
      />
      
      {/* Esempio con larghezza degli elementi personalizzata */}
      <MovieSectionUnified 
        title="Film di tendenza" 
        movies={movies.slice(0, 8)} 
        itemWidth={180} // Elementi più stretti
        dragSpeed={4} // Velocità ancora maggiore
        className="mt-24" // Stile aggiuntivo
      />
    </Container>
  );
}
