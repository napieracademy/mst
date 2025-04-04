"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { generateSlug } from "@/lib/utils"

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
  role?: "acting" | "directing" | "both"
  is_known_for?: boolean
}

interface PersonFilmographyProps {
  credits: Credit[]
  name: string
  knownForCredits?: Credit[]
}

export function PersonFilmography({ credits, name, knownForCredits = [] }: PersonFilmographyProps) {
  console.log("PersonFilmography - knownForCredits:", knownForCredits.length, knownForCredits);

  const [activeTab, setActiveTab] = useState<"all" | "known_for" | "acting" | "directing" | "movie" | "tv">("all")
  
  // Set the initial active tab to "known_for" if there are known_for credits
  useEffect(() => {
    if (knownForCredits && knownForCredits.length > 0) {
      setActiveTab("known_for");
      console.log("Tab iniziale impostata su 'known_for' perché ci sono", knownForCredits.length, "crediti");
    }
  }, [knownForCredits]);

  // Marca i crediti che sono "known_for"
  const allCredits = credits.map(credit => {
    const isKnownFor = knownForCredits.some(kf => kf.id === credit.id && kf.media_type === credit.media_type);
    return {
      ...credit,
      is_known_for: isKnownFor
    };
  });

  // Filtra i crediti in base al tab attivo
  const filteredCredits = allCredits.filter((credit) => {
    if (activeTab === "all") return true;
    if (activeTab === "known_for") {
      // Mostriamo SOLO i film presenti in knownForCredits
      return knownForCredits.some(kfc => kfc.id === credit.id && kfc.media_type === credit.media_type);
    }
    if (activeTab === "acting") return credit.role === "acting" || credit.role === "both";
    if (activeTab === "directing") return credit.role === "directing" || credit.role === "both";
    if (activeTab === "movie") return credit.media_type === "movie";
    if (activeTab === "tv") return credit.media_type === "tv";
    return true;
  });

  // Ordina i crediti per data di uscita (più recenti prima)
  const sortedCredits = [...filteredCredits].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || ""
    const dateB = b.release_date || b.first_air_date || ""
    return dateB.localeCompare(dateA)
  })

  // Conta i crediti per tipo
  const knownForCount = allCredits.filter(c => c.is_known_for).length
  const actingCount = allCredits.filter((c) => c.role === "acting" || c.role === "both").length
  const directingCount = allCredits.filter((c) => c.role === "directing" || c.role === "both").length
  const movieCount = allCredits.filter((c) => c.media_type === "movie").length
  const tvCount = allCredits.filter((c) => c.media_type === "tv").length

  return (
    <div className="mt-12">
      {/* Tabs per ruolo */}
      <div className="border-b border-gray-800 mb-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          {knownForCount > 0 && (
            <button
              onClick={() => setActiveTab("known_for")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === "known_for" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Più noto per ({knownForCount})
            </button>
          )}
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
          {sortedCredits.map((credit) => {
            const mediaType = credit.media_type;
            const title = credit.title || credit.name || "";
            const date = credit.release_date || credit.first_air_date;
            const year = date ? new Date(date).getFullYear() : null;
            
            // Determina il ruolo da mostrare
            let roleText = "";
            if (credit.role === "both") {
              roleText = "Attore, Regista";
            } else if (credit.role === "acting") {
              roleText = credit.character || "Attore";
            } else if (credit.role === "directing") {
              roleText = "Regista";
            } else {
              roleText = credit.character || credit.job || "";
            }
            
            const posterPath = credit.poster_path;
            
            // Genera lo slug SEO-friendly per film o serie TV
            const slug = generateSlug(title, year, credit.id);
              
            // Genera l'URL corretto in base al tipo di media
            const href = mediaType === "movie" 
              ? `/film/${slug}` 
              : `/serie/${slug}`;

            return (
              <Link 
                key={`${credit.id}-${mediaType}`} 
                href={href} 
                className={`group relative block overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50`}
              >
                <div className="aspect-[2/3] relative">
                  {posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <h3 className="font-medium text-sm truncate">{title}</h3>
                      <div className="flex items-center text-xs text-gray-300">
                        {year && <span>{year}</span>}
                        {roleText && year && <span className="mx-1">•</span>}
                        {roleText && <span className="truncate">{roleText}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">Nessun titolo trovato per {name} in questa categoria.</p>
      )}
    </div>
  )
}

