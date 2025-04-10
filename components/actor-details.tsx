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

interface ActorDetailsProps {
  actor: {
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

export default function ActorDetails({ actor }: ActorDetailsProps) {
  const [bioExpanded, setBioExpanded] = useState(false)

  // Prepara biografia e credits
  const shortBio = actor.biography ? actor.biography.slice(0, 300) + (actor.biography.length > 300 ? '...' : '') : null
  const fullBio = actor.biography || null

  // Prepara la filmografia
  const credits: Credit[] = []

  // Aggiungi i film dove ha recitato
  if (actor.combined_credits?.cast) {
    // Filtra solo i ruoli di attore, escludendo apparizioni come "Self" e apparizioni minori in TV
    actor.combined_credits.cast
      .filter(credit => {
        // Escludiamo apparizioni come "Self" in qualsiasi media
        const isSelf = 
          credit.character === 'Self' || 
          credit.character?.toLowerCase().includes('self') ||
          credit.character?.toLowerCase().includes('himself') ||
          credit.character?.toLowerCase().includes('herself');
        
        // Escludiamo guest appearances in TV
        const isGuestAppearance = 
          credit.category === 'guest_star' ||
          credit.character?.toLowerCase().includes('guest') ||
          credit.character?.toLowerCase().includes('host');
          
        // Escludiamo apparizioni minori in serie TV (1 episodio)
        const isMinorTVAppearance = 
          credit.media_type === 'tv' && 
          (credit.episode_count === 1 || credit.episode_count === undefined);
          
        // Includi se è un film e non è un'apparizione come Self, oppure
        // se è una serie TV e non è una guest appearance o un'apparizione minore
        return (credit.media_type === 'movie' && !isSelf) || 
               (credit.media_type === 'tv' && !isSelf && !isGuestAppearance && !isMinorTVAppearance);
      })
      .forEach(credit => {
        credits.push({
          ...credit,
          role: "acting"
        })
      })
  }

  // Aggiungi i film dove ha lavorato come regista
  if (actor.combined_credits?.crew) {
    actor.combined_credits.crew
      .filter(credit => credit.job === "Director")
      .forEach(credit => {
        // Verifica se è già presente come attore
        const existingCredit = credits.find(c => 
          c.id === credit.id && 
          c.media_type === credit.media_type && 
          c.role === "acting"
        )

        if (existingCredit) {
          // Se è già presente come attore, aggiorna il ruolo a "both"
          existingCredit.role = "both"
        } else {
          // Altrimenti aggiungilo come regista
          credits.push({
            ...credit,
            role: "directing"
          })
        }
      })
  }

  // Prepara i known_for_credits
  const knownForCredits = actor.known_for_credits || [];

  // Ottieni l'URL dell'immagine del profilo
  const profileUrl = actor.profile_path 
    ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
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

  const birthDate = formatDate(actor.birthday)
  const deathDate = formatDate(actor.deathday)

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <div className="pt-24 pb-16">
        <Container maxWidth="standardized" className="px-0">
          <div className="flex flex-col items-start">
            {/* Hero Section con avatar tondo e info principali */}
            <div className="flex flex-col md:flex-row w-full mb-12 gap-8">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden relative flex-shrink-0 self-start">
                <Image
                  src={profileUrl}
                  alt={actor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 12rem, 16rem"
                />
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{actor.name}</h1>

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

                  {actor.place_of_birth && (
                    <div>
                      <h3 className="text-white text-sm font-medium mb-1">Luogo di nascita</h3>
                      <p className="text-sm">{actor.place_of_birth}</p>
                    </div>
                  )}
                </div>
                {fullBio && (
                  <div className="mb-12">
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
              </div>
            </div>

            {/* Contenuto impilato in colonna */}
            <div className="w-full flex flex-col mt-8 border-t border-gray-800 pt-8">
              {/* Filmografia */}
              {credits.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-xl font-semibold mb-2">Filmografia</h2>
                  <PersonFilmography 
                    credits={credits} 
                    name={actor.name} 
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