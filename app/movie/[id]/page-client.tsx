"use client"

import { DirectorAvatar } from "@/components/director-avatar"
import { EditableBio } from "@/components/editable-bio"
import Link from "next/link"
import { CastCarousel } from "@/components/cast-carousel"
import { MovieGallery } from "@/components/movie-gallery"
import { MovieSectionInterattivo } from "@/components/movie-section-interattivo"
import { MovieHero } from "@/components/movie-hero"
import { Footer } from "@/components/footer"
import { Movie } from "@/lib/types"
import { FadeInSection } from "@/components/fade-in-section"
import { useState } from "react"
import Image from "next/image"
import { Container } from "@/components/container"
import { PreRenderizzazioneCheck } from "@/components/prerenderizzazione-check"
import { PersonFilmography } from "@/components/person-filmography"
// AwardsAndBoxOfficeInfo import removed to prevent hydration errors

interface MoviePageClientProps {
  movie: Movie
  posterUrl: string
  backdropUrl: string | null
  releaseDate: string | null
  releaseYear: string | null
  trailers: any[]
  nowPlayingMovies: any[]
  nowPlayingTitle?: string
  id: string
  director: any
  writers: any[]
  producers: any[]
}

export function MoviePageClient({
  movie,
  posterUrl,
  backdropUrl,
  releaseDate,
  releaseYear,
  trailers,
  nowPlayingMovies,
  nowPlayingTitle = "Film ora al cinema",
  id,
  director,
  writers,
  producers
}: MoviePageClientProps) {
  console.log("MoviePageClient inizializzato con", {
    hasMovie: !!movie,
    hasNowPlayingMovies: !!nowPlayingMovies,
    nowPlayingCount: nowPlayingMovies?.length || 0
  });
  // const [isJustWatchExpanded, setIsJustWatchExpanded] = useState(false) // Rimosso perché non più necessario;
  
  // Prepariamo i known_for_credits se esistono
  const knownForCredits = movie.known_for_credits || [];
  const hasKnownForCredits = knownForCredits.length > 0;
  
  // Convertiamo i credits nel formato atteso da PersonFilmography
  const castCredits = movie.credits?.cast?.map(member => ({
    ...member,
    media_type: "movie" as "movie" | "tv",
    role: "acting" as "acting" | "directing" | "both",
    poster_path: member.profile_path // Usiamo profile_path come poster_path per soddisfare l'interfaccia
  })) || [];

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Section - con z-index */}
      <div className="relative w-full h-[100dvh] sm:h-[60vh] md:h-[80vh] z-10">
        <MovieHero
          movie={movie}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          trailers={trailers || []}
        />
      </div>

      {/* Content Section - con z-index e posizionamento relativo */}
      <Container className="py-8 sm:py-16 relative z-20" maxWidth="standardized">
        <div className="flex flex-col lg:flex-row lg:relative gap-4 sm:gap-8">
          {/* Left Column - Movie Details - Rimossa proprietà opacity */}
          <div className="w-full lg:w-[58%] pb-8 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-800 lg:pr-8">
            {/* Technical Details */}
            <FadeInSection>
              <p className="text-gray-300 mb-6 sm:mb-8">
                {releaseYear && `Uscito nel ${releaseYear}, `}
                {movie.title} è un film {movie.genres?.map((g) => g.name).join(", ") || ""}
                {movie.runtime && ` della durata di ${movie.runtime} minuti`}
                {movie.original_language && `, girato in ${movie.original_language.toUpperCase()}`}
                {movie.production_countries &&
                  movie.production_countries.length > 0 &&
                  ` e prodotto in ${movie.production_countries.map((c: { name: string }) => c.name).join(", ")}`}.
              </p>
            </FadeInSection>

            {/* Synopsis */}
            <FadeInSection delay={100}>
              <div className="mb-12">
                <EditableBio
                  initialBio={movie.overview || "Nessuna sinossi disponibile per questo film."}
                  onSave={async (newBio) => {
                    // Simulazione del salvataggio
                    await new Promise(resolve => setTimeout(resolve, 800));
                    console.log("Sinossi salvata (simulato):", newBio);
                    return Promise.resolve();
                  }}
                />
              </div>
            </FadeInSection>

          </div>

          {/* Right Column - Production Info */}
          <div className="w-full lg:w-[42%] lg:pl-8">
            {/* Regista */}
            <FadeInSection delay={150}>
              {director && (
                <div className="mb-8">
                  <DirectorAvatar director={director} />
                </div>
              )}
            </FadeInSection>

            {/* Writers */}
            <FadeInSection delay={200}>
              {writers.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">Sceneggiatura</h2>
                  <p className="text-sm text-gray-300">
                    {writers.slice(0, 3).map((writer) => writer.name).join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>

            {/* Producers */}
            <FadeInSection delay={250}>
              {producers.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">Produzione</h2>
                  <p className="text-sm text-gray-300">
                    {producers.slice(0, 3).map((producer) => producer.name).join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>

            {/* Production Companies */}
            <FadeInSection delay={300}>
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">Case di produzione</h2>
                  <p className="text-sm text-gray-300">
                    {movie.production_companies.map((company: { name: string }) => company.name).join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>
            
            {/* Guardalo su (Versione solo testo) */}
            <FadeInSection delay={350}>
              <div className="mb-8">
                <h2 className="text-sm text-gray-400 mb-4">Guardalo su</h2>
                
                {/* Sezione Noleggio */}
                <div className="mb-4">
                  <h3 className="text-xs text-gray-500 mb-2">Noleggio</h3>
                  <p className="text-sm text-gray-300">
                    Rakuten TV, Apple TV, Amazon Video
                  </p>
                </div>
                
                {/* Sezione Acquisto */}
                <div className="mb-4">
                  <h3 className="text-xs text-gray-500 mb-2">Acquisto</h3>
                  <p className="text-sm text-gray-300">
                    Rakuten TV, Apple TV, Google Play Movies, Amazon Video
                  </p>
                </div>
                
                {/* Sezione Streaming */}
                <div>
                  <h3 className="text-xs text-gray-500 mb-2">Streaming</h3>
                  <p className="text-sm text-gray-300">
                    Netflix, Disney+, Amazon Prime Video
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
        
        {/* Cast Section */}
        <FadeInSection delay={300} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            
            {/* Mostriamo solo il cast completo con CastCarousel */}
            {movie.credits?.cast && movie.credits.cast.length > 0 ? (
              <CastCarousel cast={movie.credits.cast} />
            ) : (
              <p className="text-gray-500">Cast non disponibile</p>
            )}
          </div>
        </FadeInSection>

        {/* Gallery Section */}
        <FadeInSection delay={400} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            <h2 className="text-sm text-gray-400 mb-8">GALLERIA</h2>
            <MovieGallery movieId={id} type="movie" />
          </div>
        </FadeInSection>

        {/* Ora al Cinema - Identico alla home */}
        <FadeInSection delay={500} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            {/* Rimuoviamo l'h2 per replicare esattamente la struttura della home */}
            <MovieSectionInterattivo 
              title={nowPlayingTitle} 
              movies={nowPlayingMovies || []} 
              showDirector={false} 
            />
          </div>
        </FadeInSection>
      </Container>

      {/* Footer */}
      <Footer />
    </main>
  )
}