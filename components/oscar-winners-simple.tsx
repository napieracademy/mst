"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { generateSlug } from "@/lib/utils"

interface OscarWinner {
  year: string
  imdbId: string
  title: string
  originalTitle?: string
  posterPath: string | null
  director?: {
    id: number
    name: string
    profilePath: string | null
  } | null
  oscarData: {
    bestPicture: boolean
    year: number
  }
}

export function OscarWinnersSimple({ startYear = 2015, endYear = 2024 }: { startYear?: number, endYear?: number }) {
  const [winners, setWinners] = useState<OscarWinner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/oscar-winners-simple?startYear=${startYear}&endYear=${endYear}`)
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.winners) {
          setWinners(data.winners)
        } else {
          throw new Error(data.error || "Dati non disponibili")
        }
      } catch (err) {
        console.error("Errore nel recupero dei vincitori dell'Oscar:", err)
        setError(err instanceof Error ? err.message : "Errore sconosciuto")
      } finally {
        setLoading(false)
      }
    }
    
    fetchWinners()
  }, [startYear, endYear])

  // Placeholder per il caricamento
  if (loading) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4">Miglior Film Oscar</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px]">
              <div className="aspect-[2/3] w-full rounded-md overflow-hidden bg-gray-800">
                <Skeleton className="h-full w-full" />
              </div>
              <Skeleton className="h-4 w-3/4 mt-2" />
              <Skeleton className="h-3 w-1/2 mt-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Messaggio di errore
  if (error) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4">Miglior Film Oscar</h2>
        <div className="p-4 rounded bg-gray-800 text-red-400">
          Errore nel caricamento: {error}
        </div>
      </div>
    )
  }

  // Se non ci sono vincitori
  if (winners.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4">Miglior Film Oscar</h2>
        <p className="text-gray-500">Nessun vincitore disponibile per il periodo selezionato.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Miglior Film Oscar</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {winners.map((movie) => {
          const slug = generateSlug(movie.title, movie.year, movie.imdbId)
          
          return (
            <Link 
              href={`/film/${slug}`} 
              key={movie.imdbId || movie.year}
              className="flex-shrink-0 w-[200px] group relative"
            >
              <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-gray-800">
                {movie.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-800">
                    <span className="text-gray-400 text-sm">Immagine non disponibile</span>
                  </div>
                )}
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                  🏆 {movie.year}
                </div>
              </div>
              <h3 className="font-medium mt-2 text-gray-100 line-clamp-1 group-hover:text-yellow-400 transition-colors">
                {movie.title}
              </h3>
              {movie.director && (
                <p className="text-xs text-gray-400 line-clamp-1">
                  {movie.director.name}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}