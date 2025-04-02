import { getMovieDetails, getTrailers, getSimilarMovies } from "@/lib/tmdb"
import { notFound } from "next/navigation"
import { MoviePageClient } from "./page-client"

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const movie = await getMovieDetails(id, "movie")

    if (!movie) {
      return {
        title: "Film non trovato",
        description: "Il film richiesto non è stato trovato",
      }
    }

    return {
      title: `${movie.title || "Film"} | Mastroianni`,
      description: movie.overview || "Guarda i dettagli del film su Mastroianni",
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Errore | Mastroianni",
      description: "Si è verificato un errore durante il caricamento della pagina",
    }
  }
}

export default async function MoviePage({ params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const movie = await getMovieDetails(id, "movie")

    if (!movie) {
      notFound()
    }

    // Assicuriamoci che trailers e similarMovies siano sempre array, anche in caso di errore
    const trailers = (await getTrailers(id, "movie").catch(() => [])) || []
    const similarMovies = (await getSimilarMovies(id, "movie").catch(() => [])) || []

    // Gestione migliorata delle immagini con verifica di validità
    const checkImagePath = (path: string | null | undefined): boolean => {
      return !!path && typeof path === 'string' && path.startsWith('/');
    };

    // Controllo più robusto per il backdrop_path
    const backdropUrl = checkImagePath(movie.backdrop_path) 
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : null

    // Controllo più robusto per il poster_path con fallback migliorato
    const posterUrl = checkImagePath(movie.poster_path)
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "/placeholder.svg?height=750&width=500"

    // Formatta la data di uscita
    const releaseDate = movie.release_date
      ? new Date(movie.release_date).toLocaleDateString("it-IT", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null

    // Estrai l'anno di uscita
    const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : null

    // Estrai il regista
    const director = movie.credits?.crew?.find((person) => person.job === "Director") || null

    // Estrai gli sceneggiatori
    const writers = movie.credits?.crew?.filter((person) => ["Writer", "Screenplay"].includes(person.job)) || []

    // Estrai i produttori
    const producers =
      movie.credits?.crew?.filter((person) => ["Producer", "Executive Producer"].includes(person.job)) || []

    // Log per il debug del recupero delle immagini
    console.log(`Movie ${id} image paths:`, {
      posterPath: movie.poster_path,
      posterUrl,
      backdropPath: movie.backdrop_path,
      backdropUrl,
      validPoster: checkImagePath(movie.poster_path),
      validBackdrop: checkImagePath(movie.backdrop_path)
    });

    return (
      <MoviePageClient
        movie={movie}
        posterUrl={posterUrl}
        backdropUrl={backdropUrl}
        releaseDate={releaseDate}
        releaseYear={releaseYear}
        trailers={trailers}
        similarMovies={similarMovies}
        id={id}
        director={director}
        writers={writers}
        producers={producers}
      />
    )
  } catch (error) {
    console.error("Error rendering movie page:", error)
    throw error // Let the error boundary handle it
  }
}

