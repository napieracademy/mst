"use client"

import { useState } from "react"
import { Play } from "lucide-react"

interface TrailerProps {
  trailer: {
    key: string
    name: string
    site: string
  }
}

export function MovieTrailer({ trailer }: TrailerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!trailer || !trailer.key) return null

  // Supportiamo solo YouTube per ora
  if (trailer.site !== "YouTube") return null

  const thumbnailUrl = `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`

  if (isPlaying) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
          title={trailer.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    )
  }

  return (
    <div
      className="aspect-video w-full rounded-lg overflow-hidden relative cursor-pointer group"
      onClick={() => setIsPlaying(true)}
    >
      <img src={thumbnailUrl || "/placeholder.svg"} alt={trailer.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
          <Play className="w-8 h-8 text-white" fill="white" />
        </div>
      </div>
    </div>
  )
}

