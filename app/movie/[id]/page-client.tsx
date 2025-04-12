"use client"

import { RegistaAvatar } from "@/components/director-avatar"
import { EditableBio } from "@/components/editable-bio"
import Link from "next/link"
import { CastCarousel } from "@/components/cast-carousel"
import { MovieGallery } from "@/components/movie-gallery"
import { MovieSectionInterattivo } from "@/components/movie-section-interattivo"
import { MovieHero } from "@/components/movie-hero"
import { Footer } from "@/components/footer"
import { Movie } from "@/lib/types"
import { FadeInSection } from "@/components/fade-in-section"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Container } from "@/components/container"
import { PreRenderizzazioneCheck } from "@/components/prerenderizzazione-check"
import { PersonFilmography } from "@/components/person-filmography"
import { WatchProviders, WatchProvidersConditional } from "@/components/watch-providers"
import { MovieAwards } from "@/components/movie-awards"
import { fetchImdbAwards } from "@/utils/imdb-api"
import AwardsSection from "@/components/awards-section"
import { AwardsTextDisplay } from "@/components/awards-text-display"
// AwardsAndBoxOfficeInfo import removed to prevent hydration errors

import { translateCountries, translateLanguage } from "@/lib/utils";

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
  const [awardsData, setAwardsData] = useState(null);

  useEffect(() => {
    if (movie?.external_ids?.imdb_id) {
      fetchImdbAwards(movie.external_ids.imdb_id)
        .then(data => setAwardsData(data))
        .catch(error => console.error("Error fetching awards:", error));
    }
  }, [movie]);

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Section - riduciamo z-index per evitare conflitti con l'header */}
      <div className="relative w-full h-[100dvh] sm:h-[60vh] md:h-[80vh] z-0">
        <MovieHero
          movie={movie}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          trailers={trailers || []}
        />
      </div>

      {/* Content Section - aumentiamo z-index per stare sopra lo sfondo ma sotto l'header */}
      <Container className="py-8 sm:py-16 relative z-20" maxWidth="standardized">
        <div className="flex flex-col lg:flex-row lg:relative gap-4 sm:gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-[58%] pb-8 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-800 lg:pr-8">
            <FadeInSection>
              <p className="text-gray-300 mb-6 sm:mb-8">
                {releaseYear && `Uscito nel ${releaseYear}, `}
                {movie.title} è un film {movie.genres?.map((g) => g.name).join(", ") || ""}
                {movie.runtime && ` della durata di ${movie.runtime} minuti`}
                {movie.original_language && `, girato in ${translateLanguage(movie.original_language)}`}
                {movie.production_countries &&
                  movie.production_countries.length > 0 &&
                  ` e prodotto ${movie.production_countries.map((c: { name: string }) => c.name).includes("United States") || 
                    movie.production_countries.map((c: { name: string }) => c.name).includes("United States of America") ? 
                    "negli " : "in "}${translateCountries(movie.production_countries.map((c: { name: string }) => c.name))}`}.
              </p>
            </FadeInSection>

            <FadeInSection delay={100}>
              <div className="mb-12">
                <EditableBio
                  initialBio={movie.overview || "Nessuna sinossi disponibile per questo film."}
                  onSave={async (newBio) => {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    console.log("Sinossi salvata (simulato):", newBio);
                    return Promise.resolve();
                  }}
                />
                
                {awardsData?.awardsText && (
                  <AwardsTextDisplay awardsText={awardsData.awardsText} />
                )}
              </div>
            </FadeInSection>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[42%] lg:pl-8">
            <FadeInSection delay={150}>
              {director && (
                <div className="mb-8">
                  <RegistaAvatar director={director} />
                </div>
              )}
            </FadeInSection>

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
            
            <FadeInSection delay={350}>
              <WatchProvidersConditional movieId={id} type="movie" />
            </FadeInSection>
          </div>
        </div>
        
        {/* Cast Section */}
        <FadeInSection delay={300} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12">
            <h2 className="text-sm text-gray-400 mb-8">Cast</h2>
            
            {movie.credits?.cast && movie.credits.cast.length > 0 ? (
              <CastCarousel cast={movie.credits.cast} />
            ) : (
              <p className="text-gray-500">Cast non disponibile</p>
            )}
          </div>
        </FadeInSection>

        {/* Gallery Section */}
        <FadeInSection delay={400} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12">
            <h2 className="text-sm text-gray-400 mb-8">Galleria</h2>
            <MovieGallery movieId={id} type="movie" />
          </div>
        </FadeInSection>

        {/* Awards Section rimossa per richiesta utente */}

        {/* Now Playing Section */}
        <FadeInSection delay={500} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12">
            <MovieSectionInterattivo 
              title={nowPlayingTitle} 
              movies={nowPlayingMovies || []} 
              showDirector={false} 
            />
          </div>
        </FadeInSection>
      </Container>

      <Footer />
    </main>
  )
}