"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"
import { buildImageUrl } from "@/lib/tmdb"
import { cn } from "@/lib/utils"

interface MovieGalleryProps {
  movieId: string
  type?: "movie" | "person"
}

export function MovieGallery({ movieId, type = "movie" }: MovieGalleryProps) {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        const endpoint = type === "movie" 
          ? `/api/movie/${movieId}/images`
          : `/api/person/${movieId}/images`
          
        const res = await fetch(endpoint)
        const data = await res.json()
        
        // Estrai le immagini a seconda del tipo
        const extractedImages = type === "movie" 
          ? [...(data.backdrops || []), ...(data.posters || [])]
          : data.profiles || []
          
        setImages(extractedImages)
      } catch (error) {
        console.error("Errore nel recupero delle immagini:", error)
        setImages([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchImages()
  }, [movieId, type])
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(images.length / 4))
  }
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + Math.ceil(images.length / 4)) % Math.ceil(images.length / 4))
  }
  
  const openModal = (index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }
  
  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = ""
  }
  
  const nextImage = () => {
    setModalImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }
  
  const prevImage = () => {
    setModalImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (images.length === 0) {
    return <p className="text-gray-500">Nessuna immagine disponibile</p>
  }

  // Determina quali immagini mostrare nella vista attuale
  const itemsPerRow = 4 // Desktop
  const mobileItemsPerRow = 2 // Mobile
  const startIdx = currentIndex * itemsPerRow
  const visibleImages = images.slice(startIdx, startIdx + itemsPerRow)

  return (
    <div className="w-full overflow-hidden">
      <div className="relative">
        {/* Frecce di navigazione desktop */}
        {images.length > itemsPerRow && (
          <>
            <button
              onClick={handlePrev}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-all duration-300 shadow-lg"
              aria-label="Immagine precedente"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-all duration-300 shadow-lg"
              aria-label="Immagine successiva"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Grid delle immagini */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {visibleImages.map((image, idx) => (
            <div 
              key={`${image.file_path}-${idx}`} 
              className="relative aspect-[16/9] cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => openModal(startIdx + idx)}
            >
              <Image
                src={buildImageUrl(image.file_path, 'w500')}
                alt={`Immagine ${startIdx + idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indicatori di pagina per mobile */}
      <div className="flex justify-center mt-4 sm:hidden">
        {Array.from({ length: Math.ceil(images.length / mobileItemsPerRow) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "w-2 h-2 mx-1 rounded-full transition-all duration-300",
              currentIndex === idx ? "bg-white" : "bg-gray-600"
            )}
            aria-label={`Pagina ${idx + 1}`}
          />
        ))}
      </div>

      {/* Modal per la visualizzazione a schermo intero */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="absolute top-4 right-4 flex gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFullscreen()
              }}
              className="text-white bg-black/50 p-2 rounded-full"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3h8"></path><path d="M21 8v8"></path><path d="M3 16v-8"></path><path d="M16 21H8"></path><path d="m3 3 18 18"></path></svg>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeModal()
              }}
              className="text-white bg-black/50 p-2 rounded-full"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <div 
            className={cn(
              "relative transition-all duration-300",
              isFullscreen ? "w-screen h-screen" : "max-w-4xl max-h-[80vh] w-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={buildImageUrl(images[modalImageIndex]?.file_path, isFullscreen ? 'original' : 'w1280')}
              alt={`Immagine ${modalImageIndex + 1}`}
              fill
              sizes={isFullscreen ? "100vw" : "(max-width: 768px) 100vw, 80vw"}
              className="object-contain"
            />
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {modalImageIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

