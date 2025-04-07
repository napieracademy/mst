import Link from "next/link"
import type { Movie } from "@/lib/types"
import { MovieImage } from "@/atomic/atoms/image"
import { Text } from "@/atomic/atoms/text"
import { cn } from "@/atomic/utils/cn"
import { generateSlug } from "@/lib/utils"

interface MovieCardProps {
  movie: Movie
  showDirector?: boolean
}

export function MovieCard({ movie, showDirector = false }: MovieCardProps) {
  const mediaType = movie.title ? "movie" : "tv"
  const title = movie.title || movie.name || "Titolo sconosciuto"
  const year = movie.release_date ? movie.release_date.split('-')[0] : null
  
  // Genera lo slug SEO-friendly per i film
  const slug = mediaType === "movie" 
    ? generateSlug(title, year, movie.id)
    : movie.id.toString()
    
  // Genera l'URL corretto in base al tipo di media
  const href = mediaType === "movie" 
    ? `/film/${slug}` 
    : `/${mediaType}/${movie.id}`

  // Estrai il regista se disponibile
  const director = movie.credits?.crew?.find((person) => person.job === "Director")

  return (
    <div className="flex flex-col">
      <Link 
        href={href} 
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

      <div className="mt-2">
        <Text variant="h3" className="text-sm font-medium line-clamp-2">
          {title}
        </Text>
        {showDirector && director && (
          <Text variant="p" className="text-xs text-gray-400 mt-1">
            {director.name}
          </Text>
        )}
      </div>
    </div>
  )
}

