"use client"

import { useState } from "react"
import Image from "next/image"
import { Container } from "@/components/container"
import { Text } from "@/atomic/atoms/text"
import { PersonFilmography } from "@/components/person-filmography"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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
}

interface DirectorDetailsProps {
  director: {
    id: number
    name: string
    biography?: string
    profile_path?: string
    birthday?: string
    deathday?: string
    place_of_birth?: string
    combined_credits?: {
      cast?: Credit[]
      crew?: Credit[]
    }
  }
}

export default function DirectorDetails({ director }: DirectorDetailsProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  
  // Prepara biografia e credits
  const shortBio = director.biography ? director.biography.slice(0, 300) + (director.biography.length > 300 ? '...' : '') : null
  const fullBio = director.biography || null
  
  // Prepara la filmografia, enfatizzando il ruolo di regista
  const credits: Credit[] = []
  
  // Aggiungi i film dove ha lavorato come regista
  if (director.combined_credits?.crew) {
    director.combined_credits.crew
      .filter(credit => credit.job === "Director")
      .forEach(credit => {
        credits.push({
          ...credit,
          role: "directing"
        })
      })
  }
  
  // Aggiungi i film dove ha recitato
  if (director.combined_credits?.cast) {
    director.combined_credits.cast.forEach(credit => {
      // Verifica se è già presente come regista
      const existingCredit = credits.find(c => 
        c.id === credit.id && 
        c.media_type === credit.media_type && 
        c.role === "directing"
      )
      
      if (existingCredit) {
        // Se è già presente come regista, aggiorna il ruolo a "both"
        existingCredit.role = "both"
      } else {
        // Altrimenti aggiungilo come attore
        credits.push({
          ...credit,
          role: "acting"
        })
      }
    })
  }
  
  // Ottieni l'URL dell'immagine del profilo
  const profileUrl = director.profile_path 
    ? `https://image.tmdb.org/t/p/w500${director.profile_path}`
    : "/placeholder-person.svg?height=500&width=500"
    
  // Formatta data di nascita e morte
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }
  
  const birthDate = formatDate(director.birthday)
  const deathDate = formatDate(director.deathday)
  
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-24 pb-16">
        <Container>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Colonna sinistra: immagine e info */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <div className="rounded-lg overflow-hidden relative aspect-[2/3] mb-6">
                <Image
                  src={profileUrl}
                  alt={director.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              
              <div className="space-y-4 text-gray-300">
                {birthDate && (
                  <div>
                    <h3 className="text-white text-sm font-medium mb-1">Data di nascita</h3>
                    <p className="text-sm">{birthDate}</p>
                  </div>
                )}
                
                {deathDate && (
                  <div>
                    <h3 className="text-white text-sm font-medium mb-1">Data di morte</h3>
                    <p className="text-sm">{deathDate}</p>
                  </div>
                )}
                
                {director.place_of_birth && (
                  <div>
                    <h3 className="text-white text-sm font-medium mb-1">Luogo di nascita</h3>
                    <p className="text-sm">{director.place_of_birth}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Colonna destra: biografia e filmografia */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{director.name}</h1>
              
              {/* Biografia */}
              {fullBio && (
                <div className="mb-12">
                  <h2 className="text-xl font-semibold mb-4">Biografia</h2>
                  <div className="text-gray-300">
                    {bioExpanded ? (
                      <>
                        <p className="mb-4">{fullBio}</p>
                        <button 
                          onClick={() => setBioExpanded(false)}
                          className="text-sm text-red-500 hover:text-red-400 transition-colors"
                        >
                          Mostra meno
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="mb-4">{shortBio}</p>
                        {fullBio.length > 300 && (
                          <button 
                            onClick={() => setBioExpanded(true)}
                            className="text-sm text-red-500 hover:text-red-400 transition-colors"
                          >
                            Leggi la biografia completa
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Filmografia */}
              {credits.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Filmografia</h2>
                  <PersonFilmography credits={credits} name={director.name} />
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
      
      <Footer />
    </main>
  )
} 