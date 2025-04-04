import { getMovieDetails, getTrailers, getSimilarMovies } from "@/lib/tmdb"
import { notFound } from "next/navigation"
import { MoviePageClient } from "./page-client"
import { isValidFilm } from "@/lib/utils"

export async function generateMetadata({ params }: { params: { id: string } }) {
  // In Next.js 15, dobbiamo attendere i parametri
  const id = await params.id;
  
  try {
    const movie = await getMovieDetails(id, "movie")

    // Verifica che il film sia valido
    if (!movie || !isValidFilm(movie)) {
      return {
        title: "Film non trovato",
        description: "Il film richiesto non è stato trovato o non contiene informazioni complete",
      }
    }
    
    return {
      title: `${movie.title || "Film"} | Mastroianni`,
      description: movie.overview?.slice(0, 150) || 'Scheda film su Mastroianni'
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
  // In Next.js 15, dobbiamo attendere i parametri
  const id = await params.id;
  
  try {
    const movie = await getMovieDetails(id, "movie")
    const trailers = await getTrailers(id, "movie")
    const similarMovies = await getSimilarMovies(id, "movie")
    
    // Verifica che il film sia valido
    if (!movie || !isValidFilm(movie)) {
      notFound()
    }
    
    const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null

    const posterUrl = movie.poster_path
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
    const director = movie.credits?.crew?.find((person) => person.job === "Director")

    // Estrai gli sceneggiatori
    const writers = movie.credits?.crew?.filter((person) => ["Writer", "Screenplay"].includes(person.job)) 
  || []

    // Estrai i produttori
    const producers =
      movie.credits?.crew?.filter((person) => ["Producer", "Executive Producer"].includes(person.job)) || []
    
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
    console.error("Error in movie page:", error)
    notFound()
  }
}

