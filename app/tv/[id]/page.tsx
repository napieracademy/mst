import { getMovieDetails, getTrailers, getSimilarMovies } from "@/lib/tmdb"
import { notFound, redirect } from "next/navigation"
import { TVPageClient } from "./page-client"
import { isValidShow, generateSlug } from "@/lib/utils"

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const id = await params.id;
    const show = await getMovieDetails(id, "tv")

    if (!show) {
      return {
        title: "Serie TV non trovata",
        description: "La serie TV richiesta non è stata trovata",
      }
    }

    return {
      title: `${show.name || "Serie TV"} | Mastroianni`,
      description: show.overview || "Guarda i dettagli della serie TV su Mastroianni",
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Errore | Mastroianni",
      description: "Si è verificato un errore durante il caricamento della pagina",
    }
  }
}

export default async function TVShowPage({ params }: { params: { id: string } }) {
  try {
    const id = await params.id;
    const show = await getMovieDetails(id, "tv")

    if (!show) {
      notFound()
    }

    // Reindirizza alla nuova URL SEO-friendly
    const year = show.first_air_date ? show.first_air_date.split("-")[0] : null;
    const slug = generateSlug(show.name || "Serie TV", year, id);
    redirect(`/serie/${slug}`);
    
    // Questo codice non verrà mai eseguito a causa del redirect
    return null;
  } catch (error) {
    console.error("Error rendering TV show page:", error)
    throw error // Let the error boundary handle it
  }
}

