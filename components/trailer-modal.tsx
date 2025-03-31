"use client"

import { useEffect, useRef, useState, memo } from "react"
import { X, Minimize, Maximize, ExternalLink } from "lucide-react"

interface TrailerModalProps {
  isOpen: boolean
  onClose: () => void
  trailerKey: string
  trailerName: string
  initialPIP?: boolean
  autoMute?: boolean
}

// Memorizzo il componente per evitare re-render non necessari
export const TrailerModal = memo(function TrailerModal({ 
  isOpen, 
  onClose, 
  trailerKey, 
  trailerName, 
  initialPIP = false, 
  autoMute = false 
}: TrailerModalProps) {
  const [isPIP, setIsPIP] = useState(initialPIP)
  const [hasLoaded, setHasLoaded] = useState(false)
  const videoRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Imposta lo stato iniziale di PIP quando cambia la prop initialPIP
  useEffect(() => {
    setIsPIP(initialPIP)
  }, [initialPIP])
  
  // Imposta hasLoaded dopo che il componente è montato
  useEffect(() => {
    if (isOpen) {
      // Breve ritardo prima di segnalare il caricamento completato
      // per dare tempo all'iframe di inizializzarsi
      const timer = setTimeout(() => {
        setHasLoaded(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
    
    return () => {
      // Reset di hasLoaded quando il modale si chiude
      setHasLoaded(false)
    }
  }, [isOpen])
  
  // Gestisce la chiusura con il tasto ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPIP) onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      // Blocca lo scroll del body quando il modale è aperto e non in modalità PIP
      if (!isPIP) {
        document.body.style.overflow = "hidden"
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      // Ripristina lo scroll quando il componente viene smontato
      if (!isPIP) {
        document.body.style.overflow = "auto"
      }
    }
  }, [isOpen, onClose, isPIP])

  const togglePIP = (e: React.MouseEvent) => {
    e.stopPropagation() // Previene la propagazione del click
    setIsPIP(!isPIP)
    
    // Quando attiviamo PIP, riabilita lo scroll
    if (!isPIP) {
      document.body.style.overflow = "auto"
    } else {
      // Se usciamo dalla modalità PIP e il modale è ancora aperto, blocca lo scroll
      if (isOpen) {
        document.body.style.overflow = "hidden"
      }
    }
  }

  const exitPIP = (e: React.MouseEvent) => {
    e.stopPropagation() // Previene la propagazione del click
    setIsPIP(false)
    onClose()
  }

  if (!isOpen) return null

  // Usa parametri YouTube ottimizzati
  // Aggiungiamo playsinline=1 per iOS e modestbranding=1 per ridurre marchi di YouTube
  // Aggiungiamo loading=lazy per consentire al browser di posticipare il caricamento dell'iframe
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1${autoMute ? '&mute=1' : ''}&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div
      className={`${
        isPIP 
          ? "fixed bottom-6 right-6 z-50 w-80 h-auto shadow-2xl rounded-lg overflow-hidden"
          : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      }`}
      onClick={isPIP ? undefined : onClose}
      ref={containerRef}
    >
      <div 
        className={`relative ${isPIP ? "w-full h-full" : "w-full max-w-5xl"}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra di controllo */}
        <div 
          className="absolute top-0 right-0 z-10 flex items-center gap-1 p-2 bg-black/70 rounded-bl-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pulsante PIP */}
          <button
            onClick={togglePIP}
            className="p-1.5 text-white hover:text-yellow-400 transition-colors"
            aria-label={isPIP ? "Esci da Picture in Picture" : "Attiva Picture in Picture"}
          >
            {isPIP ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
          </button>
          
          {/* Pulsante YouTube */}
          <a
            href={`https://www.youtube.com/watch?v=${trailerKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-white hover:text-yellow-400 transition-colors"
            aria-label="Apri su YouTube"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          
          {/* Pulsante di chiusura */}
          <button
            onClick={isPIP ? exitPIP : onClose}
            className="p-1.5 text-white hover:text-yellow-400 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player YouTube con iframe */}
        <div
          className={`relative ${isPIP ? "" : "aspect-video"} w-full overflow-hidden shadow-2xl bg-black`}
          style={isPIP ? { aspectRatio: "16/9" } : {}}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Placeholder di caricamento */}
          {!hasLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-sm">Caricamento del trailer...</div>
            </div>
          )}
          
          <iframe
            ref={videoRef}
            src={youtubeEmbedUrl}
            title={trailerName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy" 
            className={`absolute top-0 left-0 w-full h-full ${hasLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          ></iframe>
        </div>
      </div>
    </div>
  )
})

