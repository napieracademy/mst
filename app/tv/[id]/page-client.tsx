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
import { useState, useEffect } from "react"
import { generateSlug, translateCountries, translateLanguage, translateStatus } from "@/lib/utils"
import { PreRenderizzazioneCheck } from "@/components/prerenderizzazione-check"
import { Container } from "@/components/container"
import { WatchProviders, WatchProvidersConditional } from "@/components/watch-providers"
import { fetchImdbAwards } from '@/utils/imdb-api';
import AwardsSection from '@/components/awards-section';
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
  id,
  creators,
  writers,
  producers
}: TVPageClientProps) {

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
  
  // Funzione per calcolare l'età di una persona
  const calculateAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // State per salvare i dettagli dei creatori
  const [creatorsDetails, setCreatorsDetails] = useState<Record<number, any>>({});
  const [loadingCreators, setLoadingCreators] = useState<Record<number, boolean>>({});
  
  // Recupera i dettagli di un creatore
  const fetchCreatorDetails = async (creatorId: number) => {
    // Evitiamo di fare richieste duplicate
    if (creatorsDetails[creatorId] || loadingCreators[creatorId]) return;
    
    setLoadingCreators(prev => ({ ...prev, [creatorId]: true }));
    
    try {
      const response = await fetch(`/api/person/${creatorId}`);
      if (!response.ok) throw new Error('Errore nel recupero dei dati');
      
      const data = await response.json();
      setCreatorsDetails(prev => ({ ...prev, [creatorId]: data }));
    } catch (error) {
      console.error(`Errore nel recupero dei dettagli del creatore ${creatorId}:`, error);
    } finally {
      setLoadingCreators(prev => ({ ...prev, [creatorId]: false }));
    }
  };
  
  // Carica i dettagli dei primi tre creatori all'avvio
  useEffect(() => {
    if (creators && creators.length > 0) {
      creators.slice(0, 3).forEach(creator => {
        fetchCreatorDetails(creator.id);
      });
    }
  }, [creators]);

  const [awardsData, setAwardsData] = useState(null);

  useEffect(() => {
    // Fetch awards data if the TV show has an IMDb ID
    if (show?.external_ids?.imdb_id) {
      fetchImdbAwards(show.external_ids.imdb_id)
        .then(data => setAwardsData(data))
        .catch(error => console.error("Error fetching awards:", error));
    }
  }, [show]);

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Section - con z-index */}
      <div className="relative w-full h-[100dvh] sm:h-[60vh] md:h-[80vh] z-10">
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

      {/* Content Section - con z-index e posizionamento relativo */}
      <Container className="py-8 sm:py-16 relative z-20" maxWidth="standardized">
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
                {show.original_language && `, girata in ${translateLanguage(show.original_language)}`}
                {show.production_countries &&
                  show.production_countries.length > 0 &&
                  ` e prodotta ${show.production_countries.map((c: { name: string }) => c.name).includes("United States") || 
                    show.production_countries.map((c: { name: string }) => c.name).includes("United States of America") ? 
                    "negli " : "in "}${translateCountries(show.production_countries.map((c: { name: string }) => c.name))}`}.
                {show.status && ` Attualmente ${translateStatus(show.status)}`}
                {show.number_of_seasons && show.number_of_episodes && 
                  `, con ${show.number_of_seasons} stagioni e ${show.number_of_episodes} episodi totali`}.
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

            {/* Rimossa la sezione "Confetti" perché già inclusa nel paragrafo descrittivo */}

          </div>

          {/* Right Column - Production Info */}
          <div className="w-full lg:w-[42%] lg:pl-8">
            {/* Creators */}
            <FadeInSection delay={150}>
              {creators.length > 0 && (
                <div className="mb-8">
                  <div className="space-y-4">
                    {creators.slice(0, 3).map((creator) => {
                      const creatorSlug = generateSlug(creator.name, null, creator.id);
                      return (
                        <div key={creator.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 relative">
                            <div className="w-full h-full rounded-full border-2 border-gray-700 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:border-white">
                              <Link href={`/regista/${creatorSlug}`} className="block w-full h-full">
                                {creator.profile_path ? (
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w185${creator.profile_path}`}
                                    alt={creator.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover transition-transform duration-300 ease-out hover:scale-110 rounded-full"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xl font-bold transition-transform duration-300 ease-out hover:scale-110 hover:bg-gray-700 rounded-full">
                                    {creator.name.charAt(0)}
                                  </div>
                                )}
                                
                                {/* Age/Death Indicator - Mostrato sempre */}
                                <div 
                                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/90 flex items-center justify-center text-xs font-medium shadow-md ${
                                    creatorsDetails[creator.id]?.deathday ? 'text-red-400' : 'text-white'
                                  }`}
                                >
                                  {loadingCreators[creator.id] ? (
                                    <span className="animate-pulse">•</span>
                                  ) : creatorsDetails[creator.id]?.deathday ? (
                                    '✝'
                                  ) : creatorsDetails[creator.id]?.birthday ? (
                                    calculateAge(creatorsDetails[creator.id]?.birthday, creatorsDetails[creator.id]?.deathday)
                                  ) : (
                                    null
                                  )}
                                </div>
                              </Link>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <Link 
                              href={`/regista/${creatorSlug}`} 
                              className="font-medium text-sm hover:text-white transition-colors duration-300"
                            >
                              {creator.name}
                            </Link>
                            <p className="text-gray-400 text-xs hover:text-gray-300 transition-colors duration-300">
                              Creatore
                            </p>
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

            {/* Networks */}
            <FadeInSection delay={250}>
              {show.networks && show.networks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">Reti Televisive</h2>
                  <p className="text-sm text-gray-300">{show.networks.map((network: { name: string }) => network.name).join(", ")}</p>
                </div>
              )}
            </FadeInSection>

            {/* Production Companies */}
            <FadeInSection delay={300}>
              {show.production_companies && show.production_companies.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm text-gray-400 mb-4">Case di Produzione</h2>
                  <p className="text-sm text-gray-300">
                    {show.production_companies.map((company: { name: string }) => company.name).join(", ")}
                  </p>
                </div>
              )}
            </FadeInSection>
            
            {/* Guardalo su - viene mostrato solo se ci sono provider disponibili */}
            <FadeInSection delay={350}>
              <WatchProvidersConditional movieId={id} type="tv" />
            </FadeInSection>
          </div>
        </div>
        
        {/* Seasons Section - senza titolo */}
        <FadeInSection delay={200} threshold={0.05}>
          {show.seasons && show.seasons.length > 0 && (
            <div className="mt-12 sm:mt-16 pt-12">
              <SeasonsTable seasons={show.seasons} />
            </div>
          )}
        </FadeInSection>
        
        {/* Cast Section */}
        <FadeInSection delay={300} threshold={0.05}>
          <div className="mt-12 sm:mt-16 pt-12">
            <h2 className="text-sm text-gray-400 mb-8">Cast</h2>
            
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
          <div className="mt-12 sm:mt-16 pt-12">
            <h2 className="text-sm text-gray-400 mb-8">Galleria</h2>
            <MovieGallery movieId={id} type="tv" />
          </div>
        </FadeInSection>

        {/* Awards Section rimossa per richiesta utente */}

        {/* Sezione serie simili rimossa */}
      </Container>

      {/* Footer */}
      <Footer />
    </main>
  )
}