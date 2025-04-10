import { useState } from "react"
import Image from "next/image"
import { buildImageUrl } from "@/lib/tmdb"

type GalleryImageProps = {
  filePath: string
  index: number
  onClick: (index: number) => void
  alt?: string
}

export function GalleryImage({ filePath, index, onClick, alt }: GalleryImageProps) {
  const [imageError, setImageError] = useState(false)
  
  const handleError = () => {
    console.error("Errore nel caricamento dell'immagine di anteprima:", filePath)
    setImageError(true)
  }
  
  return (
    <div
      className="relative aspect-[16/9] cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.02]"
      onClick={() => onClick(index)}
    >
      <Image
        src={!imageError && filePath ? buildImageUrl(filePath, "w500") || '/placeholder.jpg' : '/placeholder.jpg'}
        alt={alt || `Immagine ${index + 1}`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 hover:scale-105"
        onError={handleError}
      />
    </div>
  )
}