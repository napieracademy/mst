"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from "lucide-react"
import Image from "next/image"
import { buildImageUrl } from "@/lib/tmdb"
import { Portal } from "../ui/portal"

type ImageModalProps = {
  images: { file_path: string }[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function ImageModal({ images, initialIndex, isOpen, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Aggiorna l'indice quando cambiano le prop
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Gestisce la chiusura con il tasto ESC e blocca lo scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = "auto"
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
    <Portal zIndex={9500} id="image-gallery-modal">
      <div 
        className="fixed inset-0 bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-4 right-4 p-2 bg-black/60 rounded-full"
          style={{ zIndex: 1 }}
        >
          <X className="h-6 w-6" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFullscreen()
          }}
          className="absolute top-4 left-4 p-2 bg-black/60 rounded-full"
          style={{ zIndex: 1 }}
        >
          {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            prevImage()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full"
          style={{ zIndex: 1 }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            nextImage()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full"
          style={{ zIndex: 1 }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        <div 
          className={`relative ${isFullscreen ? 'w-screen h-screen' : 'max-w-[1100px] max-h-[90vh] w-full'}`} 
          style={{ minHeight: '70vh' }}
          onClick={(e) => e.stopPropagation()}
        >
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
        
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </Portal>
  )
}