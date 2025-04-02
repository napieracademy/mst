import { getMovieDetails, getTrailers, getSimilarMovies } from "@/lib/tmdb"
import { notFound } from "next/navigation"
import { TVPageClient } from "./page-client"

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const show = await getMovieDetails(params.id, "tv")

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
    const { id } = await params;
    const show = await getMovieDetails(id, "tv")

    if (!show) {
      notFound()
    }

    // Assicuriamoci che trailers e similarShows siano sempre array, anche in caso di errore
    const trailers = (await getTrailers(id, "tv").catch(() => [])) || []
    const similarShows = (await getSimilarMovies(id, "tv").catch(() => [])) || []

    // Gestione migliorata delle immagini con verifica di validità
    const checkImagePath = (path: string | null | undefined): boolean => {
      return !!path && typeof path === 'string' && path.startsWith('/');
    };

    // Controllo più robusto per il backdrop_path
    const backdropUrl = checkImagePath(show.backdrop_path) 
      ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
      : null

    // Controllo più robusto per il poster_path con fallback migliorato
    const posterUrl = checkImagePath(show.poster_path)
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : "/placeholder.svg?height=750&width=500"

    // Formatta la data di uscita
    const releaseDate = show.first_air_date
      ? new Date(show.first_air_date).toLocaleDateString("it-IT", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null

    // Estrai l'anno di uscita
    const releaseYear = show.first_air_date ? show.first_air_date.split("-")[0] : null

    // Estrai i creatori
    const creators = show.created_by || []

    // Estrai gli sceneggiatori
    const writers = show.credits?.crew?.filter((person) => ["Writer", "Screenplay"].includes(person.job)) || []

    // Estrai i produttori
    const producers =
      show.credits?.crew?.filter((person) => ["Producer", "Executive Producer"].includes(person.job)) || []

    // Log per il debug del recupero delle immagini
    console.log(`TV Show ${id} image paths:`, {
      posterPath: show.poster_path,
      posterUrl,
      backdropPath: show.backdrop_path,
      backdropUrl,
      validPoster: checkImagePath(show.poster_path),
      validBackdrop: checkImagePath(show.backdrop_path)
    });

    return (
      <TVPageClient
        show={show}
        posterUrl={posterUrl}
        backdropUrl={backdropUrl}
        releaseDate={releaseDate}
        releaseYear={releaseYear}
        trailers={trailers}
        similarShows={similarShows}
        id={id}
        creators={creators}
        writers={writers}
        producers={producers}
      />
    )
  } catch (error) {
    console.error("Error rendering TV show page:", error)
    throw error // Let the error boundary handle it
  }
}

