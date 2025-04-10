"use client"

import { useState } from "react"
import { useImageData, ImageType } from "@/hooks/useImageData"
import { StatusDisplay } from "@/components/gallery/status-display"
import { GalleryImage } from "@/components/gallery/gallery-image"
import { GalleryNavigation } from "@/components/gallery/gallery-navigation"
import { ImageModal } from "@/components/gallery/image-modal"

interface MovieGalleryProps {
  movieId: string
  type?: ImageType
  imageData?: {
    backdrops?: { file_path: string }[]
    posters?: { file_path: string }[]
    profiles?: { file_path: string }[]
  }
}

export function MovieGallery({ movieId, type = "movie", imageData }: MovieGalleryProps) {
  const { images, loading, error } = useImageData(movieId, type, imageData)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(images.length / itemsPerRow))
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + Math.ceil(images.length / itemsPerRow)) % Math.ceil(images.length / itemsPerRow)
    )
  }

  const openModal = (index: number) => {
    console.log(`Apertura modale con immagine ${index}:`, images[index])
    setModalImageIndex(index)
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    console.log("Chiusura modale")
    setIsModalOpen(false)
    document.body.style.overflow = ""
  }

  const handleRetry = () => window.location.reload()

  const itemsPerRow = 4
  const startIdx = currentIndex * itemsPerRow
  const visibleImages = images.slice(startIdx, startIdx + itemsPerRow)
  const shouldShowNavigation = images.length > itemsPerRow

  // Rendering condizionale in base allo stato
  if (loading || error || images.length === 0) {
    return (
      <StatusDisplay 
        loading={loading} 
        error={error} 
        isEmpty={images.length === 0}
        emptyMessage="Nessuna immagine disponibile per questo contenuto"
        onRetry={handleRetry}
      />
    )
  }

  return (
    <>
      <div className="w-full overflow-hidden">
        <div className="relative">
          <GalleryNavigation 
            onPrev={handlePrev} 
            onNext={handleNext} 
            show={shouldShowNavigation} 
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {visibleImages.map((image, idx) => (
              <GalleryImage
                key={`${image.file_path}-${idx}`}
                filePath={image.file_path}
                index={startIdx + idx}
                onClick={openModal}
                alt={`Immagine ${startIdx + idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <ImageModal
        images={images}
        initialIndex={modalImageIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}