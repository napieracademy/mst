import Image from "next/image"
import Link from "next/link"
import type { Movie } from "@/lib/types"
import { generateSlug } from "@/lib/utils"

interface MoviePosterProps {
  movie: Movie
  href?: string
}

export function MoviePoster({ movie, href: customHref }: MoviePosterProps) {
  const mediaType = movie.title ? "movie" : "tv"
  const title = movie.title || movie.name || "Film"
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=450&width=300"
  const year = movie.release_date 
    ? movie.release_date.split('-')[0] 
    : (movie.first_air_date ? movie.first_air_date.split('-')[0] : null)
  
  const slug = generateSlug(title, year, movie.id)
  const href = customHref || `/${movie.first_air_date ? 'serie' : 'film'}/${slug}`

  // Estrai il regista se disponibile
  const director = movie.credits?.crew?.find((person) => person.job === "Director")

  return (
    <Link href={href} className="flex-none relative group">
      <div className="w-[180px] h-[270px] relative rounded-md overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          sizes="180px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium truncate">{title}</h3>
        {director && <p className="text-xs text-gray-400">Regia di: {director.name}</p>}
      </div>
    </Link>
  )
}

