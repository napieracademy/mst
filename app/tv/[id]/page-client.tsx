"use client"

import { EditableBio } from "@/components/editable-bio"
import Link from "next/link"
import Image from "next/image"
import { CastCarousel } from "@/components/cast-carousel"
import { MovieGallery } from "@/components/movie-gallery"
import { SimilarMovies } from "@/components/similar-movies"
import { TVHero } from "@/components/tv-hero"
import { Footer } from "@/components/footer"
import { SeasonsTable } from "@/components/seasons-table"
import { Movie } from "@/lib/types"
import { FadeInSection } from "@/components/fade-in-section"

interface TVShow extends Movie {
  name?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  networks?: { name: string }[];
  seasons?: any[];
}

interface TVPageClientProps {
  show: TVShow
  posterUrl: string
  backdropUrl: string | null
  releaseDate: string | null
  releaseYear: string | null
  trailers: any[]
  similarShows: any[]
  id: string
  creators: any[]
  writers: any[]
  producers: any[]
}

export function TVPageClient({
  show,
  posterUrl,
  backdropUrl,
  releaseDate,
  releaseYear,
  trailers,
  similarShows,
  id,
  creators,
  writers,
  producers
}: TVPageClientProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[70vh]">
        <TVHero
          show={show}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          trailers={trailers || []}
        />
      </div>

      {/* Content Section */}
      <div className="max-w-[1100px] mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Show Details */}
          <div className="w-full lg:w-2/3">
            {/* Technical Details */}
            <FadeInSection>
              <p className="text-gray-300 mb-6">
                {releaseYear && `Uscita nel ${releaseYear}, `}
                {show.name} è una serie TV {show.genres?.map((g) => g.name).join(", ") || ""}
                {show.episode_run_time &&
                  show.episode_run_time.length > 0 &&
                  ` con episodi di circa ${show.episode_run_time[0]} minuti`}
                {show.original_language && `, girata in ${show.original_language.toUpperCase()}`}
                {show.production_countries &&
                  show.production_countries.length > 0 &&
                  ` e prodotta in ${show.production_countries.map((c: { name: string }) => c.name).join(", ")}.`}
              </p>
            </FadeInSection>

            {/* Synopsis */}
            <FadeInSection delay={100}>
              <div className="mb-8">
                <EditableBio
                  initialBio={show.overview || "Nessuna descrizione disponibile per questa serie TV."}
                  onSave={async (newBio) => {
                    // Simulazione del salvataggio
                    await new Promise(resolve => setTimeout(resolve, 800));
                    console.log("Sinossi salvata (simulato):", newBio);
                    return Promise.resolve();
                  }}
                />
              </div>
            </FadeInSection>

            {/* Stagioni e episodi */}
            <FadeInSection delay={150}>
              <div className="flex items-center gap-4 mb-8 text-sm">
                {show.number_of_seasons && (
                  <div className="px-4 py-2 bg-gray-800 rounded-full">{show.number_of_seasons} stagioni</div>
                )}
                {show.number_of_episodes && (
                  <div className="px-4 py-2 bg-gray-800 rounded-full">{show.number_of_episodes} episodi</div>
                )}
                {show.status && (
                  <div className="px-4 py-2 bg-gray-800 rounded-full">
                    {show.status === "Ended"
                      ? "Terminata"
                      : show.status === "Returning Series"
                        ? "In corso"
                        : show.status === "Canceled"
                          ? "Cancellata"
                          : show.status}
                  </div>
                )}
              </div>
            </FadeInSection>

            {/* JustWatch Section */}
            <FadeInSection delay={200}>
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-400 font-bold">JustWatch</span>
                </div>

                {/* Streaming */}
                <div className="mb-6">
                  <h3 className="text-xs text-gray-400 mb-2">STREAMING</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Netflix
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Disney+
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Prime Video
                    </button>
                  </div>
                </div>

                {/* Acquisto */}
                <div>
                  <h3 className="text-xs text-gray-400 mb-2">ACQUISTO</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Apple TV
                    </button>
                    <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded text-sm transition-colors">
                      Google Play Movies
                    </button>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* Right Column - Production Info */}
          <div className="w-full lg:w-1/3">
            {/* Creators */}
            <FadeInSection delay={150}>
              {creators.length > 0 && (
                <div className="mb-8">
                  <div className="space-y-4">
                    {creators.slice(0, 3).map((creator) => (
                      <div key={creator.id} className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-gray-700 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:border-white"
                        >
                          <Link href={`/person/${creator.id}`}>
                            {creator.profile_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w185${creator.profile_path}`}
                                alt={creator.name}
                                fill
                                className="object-cover transition-transform duration-300 ease-out hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xl font-bold transition-transform duration-300 ease-out hover:scale-110 hover:bg-gray-700">
                                {creator.name.charAt(0)}
                              </div>
                            )}
                          </Link>
                        </div>
                        <div>
                          <Link
                            href={`/person/${creator.id}`}
                            className="font-medium hover:text-gray-300 transition-colors"
                          >
                            {creator.name}
                          </Link>
                          <p className="text-gray-400 text-sm">Creatore</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FadeInSection>

            {/* Networks */}
            <FadeInSection delay={250}>
              {show.networks && show.networks.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-2">Reti televisive</h3>
                  <p className="text-gray-300">{show.networks.map((network: { name: string }) => network.name).join(", ")}</p>
                </div>
              )}
            </FadeInSection>

            {/* Production Companies */}
            <FadeInSection delay={300}>
              {show.production_companies && show.production_companies.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-2">Case di produzione</h3>
                  <p className="text-gray-300">
                    {show.production_companies.map((company: { name: string }) => company.name).join(", ")}
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

            {/* Writers */}
            <FadeInSection delay={400}>
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

        {/* Seasons Section */}
        <FadeInSection delay={200} threshold={0.05}>
          {show.seasons && show.seasons.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800">
              <h2 className="text-2xl font-semibold mb-6">Stagioni</h2>
              <SeasonsTable seasons={show.seasons} />
            </div>
          )}
        </FadeInSection>
        
        {/* Cast Section */}
        <FadeInSection delay={300} threshold={0.05}>
          {show.credits?.cast && show.credits.cast.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800">
              <CastCarousel cast={show.credits.cast} />
            </div>
          )}
        </FadeInSection>

        {/* Gallery */}
        <FadeInSection delay={400} threshold={0.05}>
          <MovieGallery movieId={id} type="tv" />
        </FadeInSection>

        {/* Similar Shows */}
        <FadeInSection delay={500} threshold={0.05}>
          <SimilarMovies movies={similarShows} />
        </FadeInSection>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
} 