import Image from "next/image"
import Link from "next/link"
import type { Movie } from "@/lib/types"

interface MovieCardProps {
  movie: Movie
  showDirector?: boolean
}

export function MovieCard({ movie, showDirector = false }: MovieCardProps) {
  const mediaType = movie.title ? "movie" : "tv"
  const title = movie.title || movie.name || "Titolo sconosciuto"
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=450&width=300"

  // Estrai il regista se disponibile
  const director = movie.credits?.crew?.find((person) => person.job === "Director")

  return (
    <div className="flex flex-col">
      <Link href={`/${mediaType}/${movie.id}`} className="block relative group">
        <div className="aspect-[2/3] relative rounded-md overflow-hidden border border-gray-800">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 250px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </Link>

      {/* Title removed as requested */}
    </div>
  )
}

