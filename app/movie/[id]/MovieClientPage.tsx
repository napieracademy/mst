"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getMovieDetails, getTrailers, getSimilarMovies } from "@/lib/tmdb"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Play, Share2, Heart, Bell } from "lucide-react"
import { CastCarousel } from "@/components/cast-carousel"
import { MovieGallery } from "@/components/movie-gallery"
import { SimilarMovies } from "@/components/similar-movies"
import { TrailerModal } from "@/components/trailer-modal"

export default function MovieClientPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState(null)
  const [trailers, setTrailers] = useState([])
  const [similarMovies, setSimilarMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieData = await getMovieDetails(params.id, "movie")
        const trailersData = await getTrailers(params.id, "movie")
        const similarMoviesData = await getSimilarMovies(params.id, "movie")

        if (!movieData) {
          notFound()
        }

        setMovie(movieData)
        setTrailers(trailersData)
        setSimilarMovies(similarMoviesData)
      } catch (error) {
        console.error("Error fetching movie data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (isLoading || !movie) {
    return <main className="min-h-screen bg-black text-white">Loading...</main>
  }

  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  // Formatta la data di uscita
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  // Estrai l'anno di uscita
  const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : null

  // Estrai il regista
  const director = movie.credits?.crew?.find((person) => person.job === "Director")

  // Estrai gli sceneggiatori
  const writers = movie.credits?.crew?.filter((person) => ["Writer", "Screenplay"].includes(person.job)) || []

  // Estrai i produttori
  const producers =
    movie.credits?.crew?.filter((person) => ["Producer", "Executive Producer"].includes(person.job)) || []

  // Durata in ore e minuti
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full h-screen">
        {/* Backdrop Image */}
        {backdropUrl && (
          <div className="absolute inset-0">
            <Image
              src={backdropUrl || "/placeholder.svg"}
              alt={movie.title || ""}
              fill
              className="object-cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </div>
        )}

        {/* Header */}
        <Header />

        {/* Action buttons on the right */}
        <div className="fixed right-4 top-1/4 z-10 flex flex-col gap-4">
          <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Movie Info */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full p-8 z-10">
          <div className="max-w-7xl mx-auto flex items-center gap-8">
            {/* Poster */}
            <div className="w-48 h-72 md:w-64 md:h-96 relative rounded-lg overflow-hidden shadow-2xl">
              <Image src={posterUrl || "/placeholder.svg"} alt={movie.title || ""} fill className="object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1">
              {releaseDate && <div className="text-sm text-yellow-400 mb-2">Release: {releaseDate}</div>}

              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">{movie.title}</h1>

              {trailers.length > 0 && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center gap-2 text-white bg-black/70 hover:bg-black/90 transition-all duration-200 px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 hover:border-white/40"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Guarda trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Movie Details */}
          <div className="w-full lg:w-2/3">
            {/* Technical Details */}
            <p className="text-gray-300 mb-6">
              Uscito nel {releaseYear}, {movie.title} è un film {movie.genres?.map((g) => g.name).join(", ")}
              {movie.runtime && ` della durata di ${movie.runtime} minuti`}
              {movie.original_language && `, girato in ${movie.original_language.toUpperCase()}`}
              {movie.production_countries &&
                movie.production_countries.length > 0 &&
                ` e prodotto in ${movie.production_countries.map((c) => c.name).join(", ")}.`}
            </p>

            {/* Synopsis */}
            <p className="text-gray-200 mb-8 leading-relaxed">{movie.overview}</p>

            {/* JustWatch Section */}
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
          </div>

          {/* Right Column - Production Info */}
          <div className="w-full lg:w-1/3">
            {/* Director */}
            {director && (
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 relative rounded-full overflow-hidden">
                    {director.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
                        alt={director.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        {director.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{director.name}</p>
                    <p className="text-gray-400 text-sm">Regista</p>
                  </div>
                </div>
              </div>
            )}

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-2">Case di produzione</h3>
                <p className="text-gray-300">{movie.production_companies.map((company) => company.name).join(", ")}</p>
              </div>
            )}

            {/* Producers */}
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

            {/* Screenplay */}
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
          </div>
        </div>

        {/* Cast Section */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <CastCarousel cast={movie.credits.cast} />
          </div>
        )}

        {/* Gallery */}
        <MovieGallery movieId={params.id} type="movie" />

        {/* Similar Movies */}
        <SimilarMovies movies={similarMovies} />
      </div>

      {/* Trailer Modal */}
      {trailers.length > 0 && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name}
        />
      )}

      {/* Footer */}
      <Footer />
    </main>
  )
}

