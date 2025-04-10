"use client"

import { EditableBio } from "@/components/editable-bio"
import Link from "next/link"
import Image from "next/image"
import { CastCarousel } from "@/components/cast-carousel"
import { MovieGallery } from "@/components/movie-gallery"
// Nota: import SimilarMovies rimosso
import { TVHero } from "@/components/tv-hero"
import { Footer } from "@/components/footer"
import { SeasonsTable } from "@/components/seasons-table"
import { Movie } from "@/lib/types"
import { FadeInSection } from "@/components/fade-in-section"
import { useState } from "react"
import { generateSlug } from "@/lib/utils"
import { PreRenderizzazioneCheck } from "@/components/prerenderizzazione-check"
import { Container } from "@/components/container"
// AwardsAndBoxOfficeInfo import removed to prevent hydration errors

// Interfaccia compatibile con quella del TVHero
interface Show {
  name?: string;
  id: number;
  overview?: string;
  first_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
}

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
  const [isJustWatchExpanded, setIsJustWatchExpanded] = useState(false);

  // Compatibilità con l'interfaccia Show - converto null in undefined
  const heroShow: Show = {
    id: show.id,
    name: show.name,
    overview: show.overview,
    first_air_date: show.first_air_date,
    poster_path: show.poster_path ? show.poster_path : undefined,
    backdrop_path: show.backdrop_path ? show.backdrop_path : undefined
  };
  
  // Prepariamo i known_for_credits se esistono
  const knownForCredits = show.known_for_credits || [];
  const hasKnownForCredits = knownForCredits.length > 0;

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[100dvh] sm:h-[60vh] md:h-[80vh]">
        <TVHero
          show={heroShow}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          trailers={trailers || []}
          imdbId={show.external_ids?.imdb_id || null}
          tmdbRating={show.vote_average}
          tmdbVoteCount={show.vote_count}
        />
      </div>

      {/* Content Section */}
      <Container className="py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:relative gap-4 sm:gap-8">
          {/* Left Column - Show Details */}
          <div className="w-full lg:w-[58%] pb-8 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-800 lg:pr-8">
            {/* Technical Details */}
            <FadeInSection>
              <p className="text-gray-300 mb-6 sm:mb-8">
                {releaseYear && `Uscita nel ${releaseYear}, `}
                {show.name} è una serie TV {show.genres?.map((g) => g.name).join(", ") || ""}
                {show.episode_run_time &&
                  show.episode_run_time.length > 0 &&
                  ` con episodi di circa ${show.episode_run_time[0]} minuti`}
                {show.original_language && `, girata in ${show.original_language.toUpperCase()}`}
                {show.production_countries &&
                  show.production_countries.length > 0 &&
                  ` e prodotta in ${show.production_countries.map((c: { name: string }) => c.name).join(", ")}`}.
              </p>
            </FadeInSection>

            {/* Synopsis */}
            <FadeInSection delay={100}>
              <div className="mb-12">
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
          <div className="w-full lg:w-[42%] lg:pl-8">
            {/* Creators */}
            <FadeInSection delay={150}>
              {creators.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">CREATORI</h2>
                  <div className="space-y-4">
                    {creators.slice(0, 3).map((creator) => {
                      const creatorSlug = generateSlug(creator.name, null, creator.id);
                      return (
                        <div key={creator.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-gray-700 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:border-white">
                            <Link href={`/regista/${creatorSlug}`}>
                              {creator.profile_path ? (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w185${creator.profile_path}`}
                                  alt={creator.name}
                                  fill
                                  className="object-cover transition-transform duration-300 ease-out hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-sm font-bold transition-transform duration-300 ease-out hover:scale-110 hover:bg-gray-700">
                                  {creator.name.charAt(0)}
                                </div>
                              )}
                            </Link>
                          </div>
                          <div>
                            <Link href={`/regista/${creatorSlug}`} className="text-sm hover:text-yellow-400 transition-colors">
                              {creator.name}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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

            {/* Networks */}
            <FadeInSection delay={250}>
              {show.networks && show.networks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">RETI TELEVISIVE</h2>
                  <p className="text-sm text-gray-300">{show.networks.map((network: { name: string }) => network.name).join(", ")}</p>
                </div>
              )}
            </FadeInSection>

            {/* Production Companies */}
            <FadeInSection delay={300}>
              {show.production_companies && show.production_companies.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">CASE DI PRODUZIONE</h2>
                  <p className="text-sm text-gray-300">
                    {show.production_companies.map((company: { name: string }) => company.name).join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>
          </div>
        </div>
        
        {/* Seasons Section */}
        <FadeInSection delay={200} threshold={0.05}>
          {show.seasons && show.seasons.length > 0 && (
            <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
              <h2 className="text-sm text-gray-400 mb-8">STAGIONI</h2>
              <SeasonsTable seasons={show.seasons} />
            </div>
          )}
        </FadeInSection>
        
        {/* Cast Section */}
        <FadeInSection delay={300} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            <h2 className="text-sm text-gray-400 mb-8">CAST</h2>
            
            {/* Mostriamo solo il cast completo con CastCarousel */}
            {show.credits?.cast && show.credits.cast.length > 0 ? (
              <CastCarousel cast={show.credits.cast} />
            ) : (
              <p className="text-gray-500">Cast non disponibile</p>
            )}
          </div>
        </FadeInSection>

        {/* Gallery Section */}
        <FadeInSection delay={400} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
            <h2 className="text-sm text-gray-400 mb-8">GALLERIA</h2>
            <MovieGallery movieId={id} type="tv" />
          </div>
        </FadeInSection>

        {/* Sezione serie simili rimossa */}
      </Container>

      {/* Footer */}
      <Footer />
    </main>
  )
} 