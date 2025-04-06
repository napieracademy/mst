import { getMovieDetails, getTrailers, getNowPlayingMovies } from "@/lib/tmdb"
import { notFound, redirect } from "next/navigation"
import { MoviePageClient } from "./page-client"
import { isValidFilm, generateSlug } from "@/lib/utils"

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
    
    // Verifica che il film sia valido
    if (!movie || !isValidFilm(movie)) {
      notFound()
    }
    
    // Reindirizza alla nuova URL SEO-friendly
    const year = movie.release_date ? movie.release_date.split("-")[0] : null;
    const slug = generateSlug(movie.title || "Film", year, id);
    redirect(`/film/${slug}`);
    
    // Questo codice non verrà mai eseguito a causa del redirect
    return null;
  } catch (error) {
    console.error("Error in movie page:", error)
    notFound()
  }
}

