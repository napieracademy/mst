"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from "lucide-react"
import Image from "next/image"
import { buildImageUrl } from "@/lib/tmdb"

type ImageModalProps = {
  images: { file_path: string }[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function ImageModal({ images, initialIndex, isOpen, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen || !images.length) return null

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] p-2 bg-black/60 rounded-full"
      >
        <X className="h-6 w-6" />
      </button>
      
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 left-4 z-[60] p-2 bg-black/60 rounded-full"
      >
        {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
      </button>
      
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-2 bg-black/60 rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-2 bg-black/60 rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      
      <div className={`relative ${isFullscreen ? 'w-screen h-screen' : 'max-w-[1100px] max-h-[90vh] w-full'}`} style={{ minHeight: '70vh' }}>
        {currentImage && currentImage.file_path && (
          <Image
            src={buildImageUrl(currentImage.file_path, "original") || '/placeholder.jpg'}
            alt={`Immagine ${currentIndex + 1}`}
            fill
            priority
            sizes="100vw"
            className="object-contain"
            onError={(e) => {
              console.error("Errore nel caricamento dell'immagine:", currentImage.file_path);
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        )}
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}