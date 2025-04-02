"use client"

import { DirectorAvatar } from "@/components/director-avatar"
import { EditableBio } from "@/components/editable-bio"
import Link from "next/link"
import { CastCarousel } from "@/components/cast-carousel"
import { MovieGallery } from "@/components/movie-gallery"
import { SimilarMovies } from "@/components/similar-movies"
import { MovieHero } from "@/components/movie-hero"
import { Footer } from "@/components/footer"
import { Movie } from "@/lib/types"
import { FadeInSection } from "@/components/fade-in-section"
import { useState } from "react"
import Image from "next/image"

interface MoviePageClientProps {
  movie: Movie
  posterUrl: string
  backdropUrl: string | null
  releaseDate: string | null
  releaseYear: string | null
  trailers: any[]
  similarMovies: any[]
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
  similarMovies,
  id,
  director,
  writers,
  producers
}: MoviePageClientProps) {
  const [isJustWatchExpanded, setIsJustWatchExpanded] = useState(false);

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[100dvh] sm:h-[60vh] md:h-[80vh]">
        <MovieHero
          movie={movie}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          trailers={trailers || []}
        />
      </div>

      {/* Content Section */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:relative gap-8 sm:gap-16">
          {/* Left Column - Movie Details */}
          <div className="w-full lg:w-2/3 pb-8 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-800 lg:pr-16">
            {/* Technical Details */}
            <FadeInSection>
              <p className="text-gray-300 mb-6 sm:mb-8">
                {releaseYear && `Uscito nel ${releaseYear}, `}
                {movie.title} è un film {movie.genres?.map((g) => g.name).join(", ") || ""}
                {movie.runtime && ` della durata di ${movie.runtime} minuti`}
                {movie.original_language && `, girato in ${movie.original_language.toUpperCase()}`}
                {movie.production_countries &&
                  movie.production_countries.length > 0 &&
                  ` e prodotto in ${movie.production_countries.map((c: { name: string }) => c.name).join(", ")}.`}
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

            {/* JustWatch Section */}
            <FadeInSection delay={200}>
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold text-sm">JustWatch</span>
                    <span className="sm:hidden text-sm text-gray-400">(7 servizi)</span>
                  </div>
                  <button
                    onClick={() => setIsJustWatchExpanded(!isJustWatchExpanded)}
                    className="sm:hidden text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {isJustWatchExpanded ? "Nascondi" : "Mostra"}
                  </button>
                </div>

                <div className={`sm:block ${isJustWatchExpanded ? 'block' : 'hidden'}`}>
                  {/* Noleggio */}
                  <div className="mb-8">
                    <h3 className="text-sm text-gray-400 mb-3">NOLEGGIO</h3>
                    <div className="flex flex-wrap gap-3">
                      <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg text-sm transition-colors">
                        Rakuten TV
                      </button>
                      <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg text-sm transition-colors">
                        Apple TV
                      </button>
                      <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg text-sm transition-colors">
                        Amazon Video
                      </button>
                    </div>
                  </div>

                  {/* Acquisto */}
                  <div>
                    <h3 className="text-sm text-gray-400 mb-3">ACQUISTO</h3>
                    <div className="flex flex-wrap gap-3">
                      <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg text-sm transition-colors">
                        Rakuten TV
                      </button>
                      <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg text-sm transition-colors">
                        Apple TV
                      </button>
                      <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg text-sm transition-colors">
                        Google Play Movies
                      </button>
                      <button className="bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-lg text-sm transition-colors">
                        Amazon Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* Right Column - Production Info */}
          <div className="w-full lg:w-1/3 lg:pl-16">
            {/* Director */}
            <FadeInSection delay={150}>
              {director && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">REGIA</h2>
                  <DirectorAvatar director={director} />
                </div>
              )}
            </FadeInSection>

            {/* Writers */}
            <FadeInSection delay={200}>
              {writers.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">SCENEGGIATURA</h2>
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
                  <h2 className="text-sm text-gray-400 mb-4">PRODUZIONE</h2>
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
                  <h2 className="text-sm text-gray-400 mb-4">CASE DI PRODUZIONE</h2>
                  <p className="text-sm text-gray-300">
                    {movie.production_companies.map((company: { name: string }) => company.name).join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>
          </div>
        </div>

        {/* Cast Section */}
        <FadeInSection delay={300} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            <h2 className="text-sm text-gray-400 mb-8">CAST</h2>
            <CastCarousel cast={movie.credits?.cast || []} />
          </div>
        </FadeInSection>

        {/* Gallery Section */}
        <FadeInSection delay={400} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            <h2 className="text-sm text-gray-400 mb-8">GALLERIA</h2>
            <MovieGallery movieId={id} type="movie" />
          </div>
        </FadeInSection>

        {/* Similar Movies */}
        <FadeInSection delay={500} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            <h2 className="text-sm text-gray-400 mb-8">FILM SIMILI</h2>
            <SimilarMovies movies={similarMovies} />
          </div>
        </FadeInSection>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
} 