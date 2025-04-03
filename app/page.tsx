import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { MovieSection } from "@/components/movie-section"
import { MovieSectionInterattivo } from "@/components/movie-section-interattivo"
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularTVShows,
} from "@/lib/tmdb"
import Image from "next/image"
import type { Movie } from "@/lib/types"

// Disabilitiamo il caching per garantire un film diverso ad ogni refresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  // Recupera i dati in parallelo con gestione degli errori
  let nowPlayingMovies: Movie[] = []
  let popularMovies: Movie[] = []
  let topRatedMovies: Movie[] = []
  let upcomingMovies: Movie[] = []
  let popularTVShows: Movie[] = []

  try {
    // Utilizziamo Promise.allSettled per gestire meglio gli errori
    const results = await Promise.allSettled([
      getUpcomingMovies(),
      getPopularMovies(),
      getTopRatedMovies(),
      getTrendingMovies(),
      getPopularTVShows(),
    ])

    // Fix: Use a temporary array and then assign individual values
    const processedResults = results.map((result) => (result.status === "fulfilled" ? result.value : []))

    upcomingMovies = processedResults[0]
    popularMovies = processedResults[1]
    topRatedMovies = processedResults[2]
    nowPlayingMovies = processedResults[3]
    popularTVShows = processedResults[4]
  } catch (error) {
    console.error("Error fetching movie data:", error)
    // Non facciamo nulla qui, useremo gli array vuoti inizializzati sopra
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[90vh]">
        {/* Immagine di background casuale dai film "Ora al Cinema" - cambia ad ogni refresh */}
        {upcomingMovies.length > 0 &&
          (() => {
            // Usiamo il timestamp attuale come parte del calcolo per garantire variabilità
            const timestamp = Date.now();
            const randomIndex = Math.floor((Math.random() * timestamp) % upcomingMovies.length)
            const randomMovie = upcomingMovies[randomIndex]
            const backdropUrl = randomMovie.backdrop_path
              ? `https://image.tmdb.org/t/p/original${randomMovie.backdrop_path}`
              : null

            return backdropUrl ? (
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={backdropUrl || "/placeholder.svg"}
                  alt={randomMovie.title || "Movie backdrop"}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority
                  quality={90}
                />
                {/* Gradiente sopra l'immagine */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black"></div>
            )
          })()}

        {/* Barra di ricerca centrale */}
        <div className="absolute inset-0 flex items-center justify-center px-5 sm:px-8 lg:px-16 z-10">
          <div className="w-full max-w-lg mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Contenuto principale */}
      <div className="max-w-[1100px] mx-auto px-4 pb-20 relative z-10 mt-[-100px]">
        {/* Ora al Cinema - Solo qui usiamo isFirstSection={true} */}
        <MovieSectionInterattivo 
          title="Ora al Cinema" 
          movies={upcomingMovies.slice(0, 20)} 
          showDirector={false} 
          isFirstSection={true} 
        />

        {/* Film Premiati */}
        <MovieSectionInterattivo 
          title="Film Premiati" 
          movies={popularMovies.slice(0, 20)} 
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

