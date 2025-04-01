"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MovieGalleryProps {
  movieId: string
  type: "movie" | "tv"
}

interface GalleryImage {
  file_path: string
  width: number
  height: number
}

export function MovieGallery({ movieId, type }: MovieGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(`/api/images?id=${movieId}&type=${type}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.status}`)
        }

        const data = await response.json()
        setImages(data.backdrops || [])
      } catch (error) {
        console.error("Error fetching images:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch images")
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [movieId, type])

  if (loading) {
    return (
      <section className="mt-24">
        <div className="h-[400px] bg-gray-900 rounded-lg animate-pulse"></div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-24">
        <div className="h-[100px] bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center justify-center">
          <p className="text-red-400">Errore nel caricamento delle immagini: {error}</p>
        </div>
      </section>
    )
  }

  if (images.length === 0) {
    return null
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <section className="mt-24">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image
          src={`https://image.tmdb.org/t/p/original${images[currentIndex].file_path}`}
          alt="Movie image"
          fill
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <a
          href={`https://image.tmdb.org/t/p/original${images[currentIndex].file_path}`}
          download={`movie-image-${currentIndex}.jpg`}
          className="absolute bottom-4 right-4 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
          aria-label="Scarica immagine"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-3-3m3 3l3-3m-9 0h12" />
          </svg>
        </a>
      </div>
    </section>
  )
}

