import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { MovieSection } from "@/components/movie-section"
import { MovieSectionInterattivo } from "@/components/movie-section-interattivo"
import { OscarWinnersSection } from "@/components/oscar-winners-section"
import { Hero } from "@/components/hero"
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularTVShows,
  getNowPlayingMovies,
  getOscarBestPictureWinners
} from "@/lib/tmdb"
import Image from "next/image"
import type { Movie } from "@/lib/types"
import { Suspense } from "react"

// Disabilitiamo il caching per garantire un film diverso ad ogni refresh
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function Home() {
  // Recupera i dati in parallelo con gestione degli errori
  const [
    trendingMovies,
    popularMovies,
    topRatedMovies,
    upcomingMovies,
    popularTVShows,
    oscarWinners
  ] = await Promise.all([
    getTrendingMovies().catch(error => {
      console.error("Errore nel recupero dei film di tendenza:", error);
      return [];
    }),
    getPopularMovies().catch(error => {
      console.error("Errore nel recupero dei film popolari:", error);
      return [];
    }),
    getTopRatedMovies().catch(error => {
      console.error("Errore nel recupero dei film più votati:", error);
      return [];
    }),
    getUpcomingMovies().catch(error => {
      console.error("Errore nel recupero dei film in uscita:", error);
      return [];
    }),
    getPopularTVShows().catch(error => {
      console.error("Errore nel recupero delle serie TV popolari:", error);
      return [];
    }),
    getOscarBestPictureWinners().catch(error => {
      console.error("Errore nel recupero dei film premiati agli Oscar:", error);
      return [];
    })
  ]);

  return (
    <main className="min-h-screen bg-black text-white z-[50]">
      {/* Header */}
      <Header />

      {/* ElevenLabs Convai Widget */}
      <elevenlabs-convai agent-id="dCfvKtT4U4EWOG64KSkG"></elevenlabs-convai>
      <script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[90vh]">
        {/* Immagine di background casuale dai film "Ora al Cinema" */}
        {upcomingMovies.length > 0 && (
          <>
            {(() => {
              const timestamp = Date.now();
              const randomIndex = Math.floor((Math.random() * timestamp) % upcomingMovies.length);
              const randomMovie = upcomingMovies[randomIndex];
              const backdropUrl = randomMovie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${randomMovie.backdrop_path}`
                : null;

              if (!backdropUrl) {
                return <div className="absolute inset-0 bg-black" />;
              }

              return (
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={backdropUrl}
                    alt={randomMovie.title || "Movie backdrop"}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority
                    quality={90}
                  />
                  {/* Gradiente sopra l'immagine */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
                </div>
              );
            })()}
          </>
        )}

        {/* Barra di ricerca centrale */}
        <div className="absolute inset-0 flex items-center justify-center px-5 sm:px-8 lg:px-16 z-10">
          <div className="w-full max-w-lg mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Contenuto principale */}
      <div className="max-w-[1100px] mx-auto px-4 pb-20 relative z-[5] mt-[-100px]">
        {/* Ora al Cinema - Solo qui usiamo isFirstSection={true} */}
        <MovieSectionInterattivo 
          title="Ora al Cinema" 
          movies={upcomingMovies.slice(0, 20)} 
          showDirector={false} 
          isFirstSection={true} 
        />

        {/* Film Premiati agli Oscar - Titolo più generico e accurato */}
        <OscarWinnersSection 
          title="Film Premiati agli Oscar (2004-2024)" 
          showDirector={true} 
        />

        {/* I più votati */}
        <MovieSectionInterattivo 
          title="I più votati" 
          movies={topRatedMovies.slice(0, 20)} 
          showDirector={false} 
        />

        {/* Serie TV */}
        <MovieSectionInterattivo 
          title="Serie TV" 
          movies={popularTVShows.slice(0, 20)} 
          showDirector={false} 
        />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}

