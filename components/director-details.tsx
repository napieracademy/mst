
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
    known_for_credits?: Credit[]
  }
}

export default function DirectorDetails({ director }: DirectorDetailsProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  
  // Prepara biografia e credits
  const shortBio = director.biography ? director.biography.slice(0, 300) + (director.biography.length > 300 ? '...' : '') : null
  const fullBio = director.biography || null
  
  // Prepara la filmografia
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
  
  // Prepara i known_for_credits
  const knownForCredits = director.known_for_credits || [];
  
  // Ottieni l'URL dell'immagine del profilo
  const profileUrl = director.profile_path 
    ? `https://image.tmdb.org/t/p/w500${director.profile_path}`
    : "/placeholder-person.svg?height=500&width=500"
    
  // Formatta data di nascita e morte con il fuso orario italiano
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Rome"
    })
  }
  
  const birthDate = formatDate(director.birthday)
  const deathDate = formatDate(director.deathday)
  
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-24 pb-16">
        <Container>
          <div className="max-w-[1100px] mx-auto">
            <div className="flex flex-col gap-8 mb-12">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar in suo div a sinistra */}
                <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 mx-auto md:mx-0 rounded-full overflow-hidden border-2 border-gray-700 shadow-xl">
                  <Image
                    src={profileUrl}
                    alt={director.name}
                    width={192}
                    height={192}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Div che contiene nome, anagrafica e biografia */}
                <div className="flex-1 text-center md:text-left">
                  {/* Nome e informazioni biografiche */}
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">{director.name}</h1>
                  
                  <div className="flex flex-col space-y-2 text-gray-300 mb-6">
                    {birthDate && (
                      <p className="text-sm">
                        <span className="font-medium">Nato il:</span> {birthDate}
                      </p>
                    )}
                    
                    {deathDate && (
                      <p className="text-sm">
                        <span className="font-medium">Morto il:</span> {deathDate}
                      </p>
                    )}
                    
                    {director.place_of_birth && (
                      <p className="text-sm">
                        <span className="font-medium">Luogo di nascita:</span> {director.place_of_birth}
                      </p>
                    )}
                  </div>
                  
                  {/* Biografia */}
                  {fullBio && (
                    <div>
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
                </div>
              </div>
            </div>
            
            {/* Filmografia */}
            <div className="mt-10 border-t border-gray-800 pt-10">
              <PersonFilmography 
                credits={credits} 
                name={director.name} 
                knownForCredits={knownForCredits}
              />
            </div>
          </div>
        </Container>
      </div>
      
      <Footer />
    </main>
  )
} 
