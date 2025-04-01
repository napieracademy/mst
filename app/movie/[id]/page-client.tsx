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
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[70vh]">
        <MovieHero
          movie={movie}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          trailers={trailers || []}
        />
      </div>

      {/* Content Section */}
      <div className="max-w-[1100px] mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:relative">
          {/* Left Column - Movie Details */}
          <div className="w-full lg:w-2/3 lg:pr-12">
            {/* Vertical separator line that only appears on large screens */}
            <div className="hidden lg:block absolute right-1/3 top-0 bottom-0 w-px bg-gray-800"></div>
            
            <FadeInSection>
              {/* Technical Details */}
              <p className="text-gray-300 mb-6">
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
              <div className="mb-8">
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-400 font-bold">JustWatch</span>
                </div>

                {/* Noleggio */}
                <div className="mb-6">
                  <h3 className="text-xs text-gray-400 mb-2">NOLEGGIO</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Rakuten TV
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Apple TV
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Amazon Video
                    </button>
                  </div>
                </div>

                {/* Acquisto */}
                <div>
                  <h3 className="text-xs text-gray-400 mb-2">ACQUISTO</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Rakuten TV
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Apple TV
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Google Play Movies
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Amazon Video
                    </button>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* Right Column - Production Info */}
          <div className="w-full lg:w-1/3 lg:pl-12">
            {/* Director */}
            <FadeInSection delay={150}>
              {director && (
                <div className="mb-8">
                  <div className="flex items-center gap-4">
                    <DirectorAvatar director={director} />
                    <div>
                      <Link
                        href={`/person/${director.id}`}
                        className="font-medium hover:text-gray-300 transition-colors"
                      >
                        {director.name}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </FadeInSection>

            {/* Production Companies */}
            <FadeInSection delay={250}>
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-2">Case di produzione</h3>
                  <p className="text-gray-300">
                    {movie.production_companies.map((company: { name: string }) => company.name).join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>

            {/* Producers */}
            <FadeInSection delay={350}>
              {producers.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-2">Produttori</h3>
                  <p className="text-gray-300">
                    {producers
                      .slice(0, 8)
                      .map((person) => person.name)
                      .join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>

            {/* Screenplay */}
            <FadeInSection delay={450}>
              {writers.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-2">Sceneggiatura</h3>
                  <p className="text-gray-300">
                    {writers
                      .slice(0, 3)
                      .map((person) => person.name)
                      .join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>
          </div>
        </div>

        {/* Cast Section */}
        <FadeInSection delay={200} threshold={0.05}>
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800">
              <CastCarousel cast={movie.credits.cast} />
            </div>
          )}
        </FadeInSection>

        {/* Gallery */}
        <FadeInSection delay={300} threshold={0.05}>
          <MovieGallery movieId={id} type="movie" />
        </FadeInSection>

        {/* Similar Movies */}
        <FadeInSection delay={400} threshold={0.05}>
          <SimilarMovies movies={similarMovies} />
        </FadeInSection>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
} 