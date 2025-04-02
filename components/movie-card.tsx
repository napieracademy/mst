import Link from "next/link"
import type { Movie } from "@/lib/types"
import { MovieImage } from "@/atomic/atoms/image"
import { Text } from "@/atomic/atoms/text"
import { cn } from "@/atomic/utils/cn"

interface MovieCardProps {
  movie: Movie
  showDirector?: boolean
}

export function MovieCard({ movie, showDirector = false }: MovieCardProps) {
  const mediaType = movie.title ? "movie" : "tv"
  const title = movie.title || movie.name || "Titolo sconosciuto"

  // Estrai il regista se disponibile
  const director = movie.credits?.crew?.find((person) => person.job === "Director")

  return (
    <div className="flex flex-col">
      <Link 
        href={`/${mediaType}/${movie.id}`} 
        className={cn(
          "block relative group",
          "rounded-md overflow-hidden",
          "transition-all duration-300",
          "hover:shadow-lg hover:shadow-black/20"
        )}
      >
        <div className="aspect-[2/3] relative rounded-md overflow-hidden border border-gray-800">
          <MovieImage
            src={movie.poster_path}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 250px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      {/* Title removed as requested */}
    </div>
  )
}

