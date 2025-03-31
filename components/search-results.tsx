import { searchMovies } from "@/lib/tmdb"
import { MovieCard } from "./movie-card"
import type { Movie } from "@/lib/types"

export async function SearchResults({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-medium mb-4">Cerca film e serie TV</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Inserisci un termine di ricerca nella barra sopra per trovare film, serie TV, attori e altro ancora.
        </p>
      </div>
    )
  }

  let results: Movie[] = []
  let error = null

  try {
    results = await searchMovies(query)
  } catch (err) {
    console.error("Error searching movies:", err)
    error = err instanceof Error ? err.message : "Errore durante la ricerca"
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-medium mb-4">Errore</h2>
        <p className="text-red-400 max-w-md mx-auto">Si è verificato un errore durante la ricerca: {error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-medium mb-4">Nessun risultato trovato</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Non abbiamo trovato risultati per "{query}". Prova con un altro termine di ricerca.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <h2 className="text-2xl font-medium mb-6">Risultati per "{query}"</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

