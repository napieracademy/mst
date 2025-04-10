import { ChevronLeft, ChevronRight } from "lucide-react"

type GalleryNavigationProps = {
  onPrev: () => void
  onNext: () => void
  show: boolean
}

export function GalleryNavigation({ onPrev, onNext, show }: GalleryNavigationProps) {
  if (!show) return null
  
  return (
    <>
      <button
        onClick={onPrev}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-all duration-300 shadow-lg"
        aria-label="Immagine precedente"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={onNext}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-all duration-300 shadow-lg"
        aria-label="Immagine successiva"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </>
  )
}