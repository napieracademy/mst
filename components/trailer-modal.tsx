"use client"

import { useEffect, useRef, useState, memo } from "react"
import { createPortal } from "react-dom"
import { X, Minimize, Maximize, ExternalLink } from "lucide-react"

interface TrailerModalProps {
  isOpen: boolean
  onClose: () => void
  trailerKey: string
  trailerName: string
  initialPIP?: boolean
  autoMute?: boolean
}

// Versione completamente riprogettata del TrailerModal che usa React Portal
// per evitare problemi di z-index e sovrapposizione
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
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const videoRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Inizializza l'elemento portale dopo il mount
  useEffect(() => {
    // Crea un div per il portale, che sarà collegato direttamente al body
    const portalNode = document.createElement('div')
    portalNode.id = 'trailer-modal-portal'
    
    // Assicurati che il modale sia sempre in cima con stili inline
    portalNode.style.position = 'fixed'
    portalNode.style.zIndex = '9999999'
    
    // Se non esiste già un portale, aggiungilo al body
    if (!document.getElementById('trailer-modal-portal')) {
      document.body.appendChild(portalNode)
    }
    
    setPortalElement(portalNode)
    
    // Rimuovi il portale dal DOM quando il componente viene smontato
    return () => {
      if (portalNode && portalNode.parentNode) {
        portalNode.parentNode.removeChild(portalNode)
      }
    }
  }, [])
  
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
      // Ripristina lo scroll quando il componente viene smontato o chiuso
      if (isOpen && !isPIP) {
        document.body.style.overflow = "auto"
      }
    }
  }, [isOpen, onClose, isPIP])

  const togglePIP = (e: React.MouseEvent) => {
    e.stopPropagation() // Previene la propagazione del click
    setIsPIP(!isPIP)
    
    // Gestisci lo scroll del body in base allo stato PIP
    if (!isPIP) {
      document.body.style.overflow = "auto"
    } else if (isOpen) {
      document.body.style.overflow = "hidden"
    }
  }

  const exitPIP = (e: React.MouseEvent) => {
    e.stopPropagation() // Previene la propagazione del click
    setIsPIP(false)
    onClose()
  }

  // Se il modale non è aperto o non c'è un elemento portale, non renderizzare nulla
  if (!isOpen || !portalElement) return null

  // Usa parametri YouTube ottimizzati
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1${autoMute ? '&mute=1' : ''}&rel=0&modestbranding=1&playsinline=1`;

  // Stili diretti per garantire che il modale sia sempre visibile
  const modalStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999999,
    ...(isPIP 
      ? {
          bottom: '1.5rem',
          right: '1.5rem',
          width: '20rem',
          height: 'auto',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
        } 
      : {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }
    )
  };

  // Contenuto del modale
  const modalContent = (
    <div
      style={modalStyles}
      onClick={isPIP ? undefined : onClose}
      ref={containerRef}
    >
      <div 
        className={`relative ${isPIP ? "w-full h-full" : "w-full max-w-5xl"}`} 
        onClick={(e) => e.stopPropagation()}
        style={{position: 'relative'}}
      >
        {/* Barra di controllo */}
        <div 
          className="absolute top-0 right-0 flex items-center gap-1 p-2 bg-black/70 rounded-bl-lg"
          onClick={(e) => e.stopPropagation()}
          style={{zIndex: 10, position: 'absolute'}}
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
          className="w-full overflow-hidden shadow-2xl bg-black"
          style={{
            position: 'relative', 
            aspectRatio: '16/9',
            width: '100%'
          }}
        >
          {/* Placeholder di caricamento */}
          {!hasLoaded && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000'
            }}>
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
              opacity: hasLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}
          ></iframe>
        </div>
      </div>
    </div>
  );

  // Renderizza il contenuto nel portale
  return createPortal(modalContent, portalElement);
});