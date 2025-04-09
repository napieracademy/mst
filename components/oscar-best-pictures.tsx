"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { generateSlug } from "@/lib/utils"

interface OscarWinner {
  imdbId: string
  tmdbId: number
  title: string
  posterPath: string | null
  oscarData: {
    bestPicture: boolean
    totalWins: number
    totalNominations: number
  }
}

export function OscarBestPictures({ limit = 10 }: { limit?: number }) {
  const [winners, setWinners] = useState<OscarWinner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/best-picture-winners?limit=${limit}`)
        
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
  }, [limit])

  // Placeholder per il caricamento
  if (loading) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4">Oscar Miglior Film</h2>
        <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4 snap-x">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="snap-start min-w-[200px] w-[200px]">
              <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden">
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
        <h2 className="text-xl font-bold mb-4">Oscar Miglior Film</h2>
        <div className="p-4 rounded bg-red-100 text-red-700">
          Errore nel caricamento: {error}
        </div>
      </div>
    )
  }

  // Se non ci sono vincitori
  if (winners.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4">Oscar Miglior Film</h2>
        <p className="text-gray-500">Nessun vincitore disponibile per il periodo selezionato.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Oscar Miglior Film</h2>
      <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
        {winners.map((movie) => {
          const slug = generateSlug(movie.title, movie.releaseYear?.toString(), movie.tmdbId)
          
          return (
            <Link 
              href={`/film/${slug}`} 
              key={movie.imdbId}
              className="snap-start min-w-[200px] w-[200px] group relative"
            >
              <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden">
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
                  🏆 {movie.ceremonyYear || movie.releaseYear}
                </div>
              </div>
              <h3 className="font-medium mt-2 text-gray-100 line-clamp-1 group-hover:text-yellow-400 transition-colors">
                {movie.title}
              </h3>
              <p className="text-xs text-gray-400">
                {movie.director?.name}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}