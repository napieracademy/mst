import type { Movie } from "@/lib/types"
import { Star, Calendar, Clock } from "lucide-react"

interface MovieInfoProps {
  movie: Movie
  type: "movie" | "tv"
}

export function MovieInfo({ movie, type }: MovieInfoProps) {
  const isMovie = type === "movie"
  const title = isMovie ? movie.title : movie.name
  const releaseDate = isMovie ? movie.release_date : movie.first_air_date
  const runtime = isMovie ? movie.runtime : movie.episode_run_time?.[0]

  // Formatta la data di uscita
  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  // Formatta il runtime
  const formattedRuntime = runtime ? `${runtime} min` : null

  // Informazioni specifiche per serie TV
  const seasons = !isMovie ? movie.number_of_seasons : null
  const episodes = !isMovie ? movie.number_of_episodes : null

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {title}
        {releaseDate && <span className="text-gray-400 text-xl ml-2">({releaseDate.split("-")[0]})</span>}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm">
        {movie.vote_average !== undefined && (
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" />
            <span>{movie.vote_average.toFixed(1)}/10</span>
          </div>
        )}

        {formattedDate && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        )}

        {formattedRuntime && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-gray-400" />
            <span>{formattedRuntime}</span>
          </div>
        )}

        {seasons && (
          <div className="flex items-center">
            <span>
              {seasons} stagion{seasons === 1 ? "e" : "i"}
            </span>
          </div>
        )}

        {episodes && (
          <div className="flex items-center">
            <span>
              {episodes} episod{episodes === 1 ? "io" : "i"}
            </span>
          </div>
        )}
      </div>

      {movie.genres && movie.genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genres.map((genre) => (
            <span key={genre.id} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
              {genre.name}
            </span>
          ))}
        </div>
      )}

      {movie.tagline && <p className="text-gray-400 italic mb-4">{movie.tagline}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Trama</h2>
        <p className="text-gray-200">{movie.overview || "Nessuna descrizione disponibile."}</p>
      </div>

      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Cast principale</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movie.credits.cast.slice(0, 8).map((person) => (
              <div key={person.id} className="text-sm">
                <p className="font-medium">{person.name}</p>
                <p className="text-gray-400">{person.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {movie.credits?.crew && movie.credits.crew.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Crew</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movie.credits.crew
              .filter((person) => ["Director", "Producer", "Screenplay", "Writer"].includes(person.job))
              .slice(0, 4)
              .map((person) => (
                <div key={`${person.id}-${person.job}`} className="text-sm">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-gray-400">{person.job}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

