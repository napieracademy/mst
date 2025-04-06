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
        <Container maxWidth="custom">
          <div className="flex flex-col items-start max-w-4xl mx-auto">
            {/* Hero Section con avatar tondo e info principali */}
            <div className="flex flex-col md:flex-row w-full mb-12 gap-8">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden relative flex-shrink-0 self-start">
                <Image
                  src={profileUrl}
                  alt={director.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 12rem, 16rem"
                />
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{director.name}</h1>
                
                <div className="flex flex-wrap gap-6 text-gray-300 mb-4">
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
            </div>
            
            {/* Contenuto impilato in colonna */}
            <div className="w-full flex flex-col mt-8 border-t border-gray-800 pt-8">
              {/* Biografia chiaramente separata e sotto l'anagrafica */}
              {fullBio && (
                <div className="mb-12 mt-2">
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-semibold">Biografia</h2>
                    {fullBio.length > 300 && (
                      <button 
                        onClick={() => setBioExpanded(!bioExpanded)}
                        className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                        aria-label={bioExpanded ? "Riduci biografia" : "Espandi biografia"}
                      >
                        <span className="text-xl font-semibold">{bioExpanded ? "-" : "+"}</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-gray-300">
                    <p className="mb-4">{bioExpanded ? fullBio : shortBio}</p>
                  </div>
                </div>
              )}
              
              {/* Filmografia */}
              {credits.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Filmografia</h2>
                  <PersonFilmography 
                    credits={credits} 
                    name={director.name} 
                    knownForCredits={knownForCredits}
                  />
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