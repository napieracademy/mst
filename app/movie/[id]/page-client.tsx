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
import { Container } from "@/components/container"
import { PreRenderizzazioneCheck } from "@/components/prerenderizzazione-check"
import { PersonFilmography } from "@/components/person-filmography"

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
      {/* Hero Section */}
      <div className="relative w-full h-[100dvh] sm:h-[60vh] md:h-[80vh]">
        <MovieHero
          movie={movie}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          trailers={trailers || []}
        />
        
        {/* Indicatore di prerenderizzazione */}
        <div className="absolute bottom-4 right-4 z-50">
          <PreRenderizzazioneCheck />
        </div>
      </div>

      {/* Content Section */}
      <Container className="py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row lg:relative gap-4 sm:gap-8">
          {/* Left Column - Movie Details */}
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
          <div className="w-full lg:w-[42%] lg:pl-8">
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
            
            {/* Mostriamo prima i "Più noti per questo film" se disponibili */}
            {hasKnownForCredits && (
              <div className="mb-12">
                <h3 className="text-sm font-medium text-yellow-500 mb-6">Più noti per questo film</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {knownForCredits.map((credit: any) => {
                    // Determiniamo il tipo di credit (attore o regista)
                    const isActor = credit.character;
                    const isDirector = credit.job === "Director";
                    
                    // Generiamo uno slug per l'URL della persona
                    const personSlug = credit.name ? 
                      `${credit.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${credit.id}` : 
                      `person-${credit.id}`;
                    
                    // Determiniamo l'URL corretto in base al ruolo
                    const href = isDirector
                      ? `/regista/${personSlug}`
                      : `/attore/${personSlug}`;
                      
                    // Determiniamo il testo del ruolo da mostrare
                    let roleText = "";
                    if (isDirector) {
                      roleText = "Regista";
                    } else if (isActor) {
                      roleText = credit.character || "Attore";
                    } else {
                      roleText = credit.job || "";
                    }
                    
                    return (
                      <Link 
                        key={`${credit.id}-${roleText}`} 
                        href={href} 
                        className="group relative block overflow-hidden rounded-lg ring-2 ring-yellow-500 bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
                      >
                        <div className="aspect-[2/3] relative">
                          {credit.profile_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w500${credit.profile_path}`}
                              alt={credit.name || ""}
                              fill
                              sizes="(max-width: 768px) 50vw, 20vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                              {credit.name ? credit.name.charAt(0) : "?"}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 right-2 text-white">
                              <h3 className="font-medium text-sm truncate">{credit.name}</h3>
                              <div className="flex items-center text-xs text-gray-300">
                                <span className="truncate">{roleText}</span>
                                <span className="mx-1">•</span>
                                <span className="text-yellow-500">Top</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Mostriamo sempre il cast completo subito dopo */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-6">Cast completo</h3>
              <CastCarousel cast={movie.credits?.cast || []} />
            </div>
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
      </Container>

      {/* Footer */}
      <Footer />
    </main>
  )
} 