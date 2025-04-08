"use client"

import Link from "next/link"
import Image from "next/image"
import type { Movie } from "@/lib/types"
import { MovieImage } from "@/atomic/atoms/image"
import { generateSlug } from "@/lib/utils"

interface MovieCardProps {
  movie: Movie
  showDirector?: boolean
  rtRating?: number
}

export function MovieCard({ movie, showDirector = false, rtRating }: MovieCardProps) {
  // Genera lo slug per il link senza l'anno
  const slug = generateSlug(movie.title || movie.name || "Film", null, movie.id)
  const href = `/${movie.first_air_date ? 'serie' : 'film'}/${slug}`

  return (
    <Link 
      href={href}
      className="group relative block overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
    >
      <div className="aspect-[2/3] relative">
        <MovieImage
          src={movie.poster_path}
          alt={movie.title || movie.name || "Locandina"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Oscar Badge */}
        {movie.oscar_win_year && (
          <div className="absolute top-2 left-2 bg-black/80 rounded-lg px-2 py-1 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0C38.0435 0 28.2609 9.78261 28.2609 21.7391C28.2609 26.087 29.5652 30 31.7391 33.4783C27.3913 37.3913 24.3478 42.6087 23.4783 48.2609C20 48.6957 17.3913 51.7391 17.3913 55.2174C17.3913 58.6957 20 61.7391 23.4783 62.1739C24.3478 67.8261 27.3913 73.0435 31.7391 76.9565C29.5652 80.4348 28.2609 84.3478 28.2609 88.6957C28.2609 90.4348 28.6957 92.1739 29.1304 93.9131L32.1739 100H67.8261L70.8696 93.9131C71.3043 92.1739 71.7391 90.4348 71.7391 88.6957C71.7391 84.3478 70.4348 80.4348 68.2609 76.9565C72.6087 73.0435 75.6522 67.8261 76.5217 62.1739C80 61.7391 82.6087 58.6957 82.6087 55.2174C82.6087 51.7391 80 48.6957 76.5217 48.2609C75.6522 42.6087 72.6087 37.3913 68.2609 33.4783C70.4348 30 71.7391 26.087 71.7391 21.7391C71.7391 9.78261 61.9565 0 50 0Z" fill="#FFD700"/>
              <path d="M50 13.0435C56.5217 13.0435 61.7391 18.2609 61.7391 24.7826C61.7391 31.3043 56.5217 36.5217 50 36.5217C43.4783 36.5217 38.2609 31.3043 38.2609 24.7826C38.2609 18.2609 43.4783 13.0435 50 13.0435Z" fill="#FFD700"/>
            </svg>
            <span className="text-xs font-bold text-yellow-400">
              {movie.oscar_win_year}
            </span>
          </div>
        )}
        
        {/* Rotten Tomatoes Rating Badge */}
        {rtRating && rtRating > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 rounded-lg px-2 py-1 flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12.3 6.5c-.7 0-1.2.6-1.2 1.2 0 .7.6 1.2 1.2 1.2.7 0 1.2-.6 1.2-1.2 0-.7-.5-1.2-1.2-1.2z" fill="#F93208"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.3 14.5c-3.4 0-6.2-2.8-6.2-6.2s2.8-6.2 6.2-6.2 6.2 2.8 6.2 6.2-2.8 6.2-6.2 6.2z" fill={rtRating >= 60 ? "#00E100" : "#FF0000"}/>
            </svg>
            <span className={`text-sm font-bold ${rtRating >= 60 ? "text-green-500" : "text-red-500"}`}>
              {rtRating}%
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

