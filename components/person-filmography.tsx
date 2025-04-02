"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface Credit {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  character?: string
  job?: string
  media_type: "movie" | "tv"
}

interface PersonFilmographyProps {
  credits: Credit[]
  name: string
}

export function PersonFilmography({ credits, name }: PersonFilmographyProps) {
  const [activeTab, setActiveTab] = useState<"all" | "acting" | "directing" | "movie" | "tv">("all")

  // Filtra i crediti in base al tab attivo
  const filteredCredits = credits.filter((credit) => {
    if (activeTab === "all") return true
    if (activeTab === "acting") return credit.character
    if (activeTab === "directing") return credit.job === "Director"
    if (activeTab === "movie") return credit.media_type === "movie"
    if (activeTab === "tv") return credit.media_type === "tv"
    return true
  })

  // Ordina i crediti per data di uscita (più recenti prima)
  const sortedCredits = [...filteredCredits].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || ""
    const dateB = b.release_date || b.first_air_date || ""
    return dateB.localeCompare(dateA)
  })

  // Conta i crediti per tipo
  const actingCount = credits.filter((c) => c.character).length
  const directingCount = credits.filter((c) => c.job === "Director").length
  const movieCount = credits.filter((c) => c.media_type === "movie").length
  const tvCount = credits.filter((c) => c.media_type === "tv").length

  return (
    <div className="mt-12">
      {/* Tabs per ruolo */}
      <div className="border-b border-gray-800 mb-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === "all" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Tutti i ruoli
          </button>
          {actingCount > 0 && (
            <button
              onClick={() => setActiveTab("acting")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === "acting" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Attore ({actingCount})
            </button>
          )}
          {directingCount > 0 && (
            <button
              onClick={() => setActiveTab("directing")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === "directing" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Regista ({directingCount})
            </button>
          )}
        </div>
      </div>

      {/* Tabs per tipo di media */}
      <div className="border-b border-gray-800 mb-8">
        <div className="flex">
          <button
            onClick={() => setActiveTab("movie")}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === "movie" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Film ({movieCount})
          </button>
          <button
            onClick={() => setActiveTab("tv")}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === "tv" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Serie TV ({tvCount})
          </button>
        </div>
      </div>

      {/* Griglia di film/serie */}
      {sortedCredits.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {sortedCredits.map((credit, index) => {
            const mediaType = credit.media_type
            const title = credit.title || credit.name || ""
            const date = credit.release_date || credit.first_air_date
            const year = date ? new Date(date).getFullYear() : null
            const role = credit.character || credit.job || ""

            return (
              <Link key={`${credit.id}-${mediaType}-${role}-${index}`} href={`/${mediaType}/${credit.id}`} className="group">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
                  {credit.poster_path ? (
                    <Image
                      src={`/api/image-proxy?url=${encodeURIComponent(`https://image.tmdb.org/t/p/w500${credit.poster_path}`)}`}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm truncate">{title}</h3>
                <div className="flex items-center text-xs text-gray-400">
                  {year && <span>{year}</span>}
                  {role && year && <span className="mx-1">•</span>}
                  {role && <span className="truncate">{role}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-gray-400">Nessun titolo trovato per {name} in questa categoria.</p>
      )}
    </div>
  )
}

