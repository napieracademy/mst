"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Play, Share2, Heart, Bell, RefreshCw } from "lucide-react"
import { TrailerModal } from "@/components/trailer-modal"
import { ShareMenu } from "@/components/share-menu"
import dynamic from 'next/dynamic'

// Importazione dinamica (lazy) del TrailerModal
const LazyTrailerModal = dynamic(() => import('@/components/trailer-modal').then(mod => ({ default: mod.TrailerModal })), {
  ssr: false,
  loading: () => <div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg overflow-hidden bg-black/40 shadow-2xl backdrop-blur-sm p-4 text-center text-sm text-white">Caricamento trailer...</div>
});

interface MovieHeroProps {
  movie: any
  posterUrl: string
  backdropUrl: string | null
  releaseDate: string | null
  trailers: any[]
}

export function MovieHero({ movie, posterUrl, backdropUrl, releaseDate, trailers }: MovieHeroProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [isPipTrailerActive, setIsPipTrailerActive] = useState(false)
  const [userScrolledPastThreshold, setUserScrolledPastThreshold] = useState(false)
  const [hasPipBeenShown, setHasPipBeenShown] = useState(false)
  const [posterSize, setPosterSize] = useState(1)
  const [posterPosition, setPosterPosition] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const [showActionButtons, setShowActionButtons] = useState(true)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollThreshold = 300
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const scrollThrottleDelay = 200
  const prefersReducedMotion = useRef(false)
  const hasBatteryInfo = useRef(false)
  const isSavingBattery = useRef(false)
  const isConnectionSlow = useRef(false)

  // Verifico se l'utente preferisce animazioni ridotte e il suo stato della batteria
  useEffect(() => {
    // Controlliamo le preferenze di motion reduction
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    // Controlliamo la connessione di rete
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        // Se la connessione è 2G o slow-2G, considerala lenta
        isConnectionSlow.current = conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g'

        // Aggiorna lo stato quando cambia la connessione
        const handleConnectionChange = () => {
          isConnectionSlow.current = conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g'
        }
        conn.addEventListener('change', handleConnectionChange)
        return () => {
          conn.removeEventListener('change', handleConnectionChange)
        }
      }
    }

    // Controlliamo lo stato della batteria
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        hasBatteryInfo.current = true
        isSavingBattery.current = battery.level <= 0.20 // Consideriamo la modalità risparmio se < 20%

        const handleBatteryChange = () => {
          isSavingBattery.current = battery.level <= 0.20
        }

        battery.addEventListener('levelchange', handleBatteryChange)
        return () => {
          battery.removeEventListener('levelchange', handleBatteryChange)
        }
      }).catch(() => {
        hasBatteryInfo.current = false
      })
    }
  }, [])

  // Determina se il PIP dovrebbe essere attivato in base alle condizioni
  const shouldEnablePip = useCallback(() => {
    return !(
      prefersReducedMotion.current || 
      (hasBatteryInfo.current && isSavingBattery.current) || 
      isConnectionSlow.current || 
      !isDesktop
    )
  }, [isDesktop])

  // Check if we're on desktop on component mount
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768)
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Gestisce lo scroll con throttling per migliorare le performance
  useEffect(() => {
    const handleScrollThrottled = () => {
      if (scrollTimerRef.current !== null) return;
      
      scrollTimerRef.current = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const hasScrolledPastThreshold = scrollY > scrollThreshold;
        
        if (hasScrolledPastThreshold !== userScrolledPastThreshold) {
          setUserScrolledPastThreshold(hasScrolledPastThreshold);
          setShowActionButtons(!hasScrolledPastThreshold);
          
          // Attiva il PIP solo se non è mai stato mostrato prima e le condizioni lo permettono
          if (hasScrolledPastThreshold && 
              trailers && 
              trailers.length > 0 && 
              !isTrailerOpen && 
              !hasPipBeenShown && 
              shouldEnablePip()) {
            setIsPipTrailerActive(true);
            setHasPipBeenShown(true);
          } else if (!hasScrolledPastThreshold) {
            setIsPipTrailerActive(false);
          }
        }
        
        scrollTimerRef.current = null;
      }, scrollThrottleDelay);
    };

    // Usa l'Intersection Observer quando possibile per prestazioni migliori
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          // Quando il contenitore esce dalla viewport
          if (!entries[0].isIntersecting) {
            // Applica la stessa logica di attivazione del PIP
            if (trailers && 
                trailers.length > 0 && 
                !isTrailerOpen && 
                !hasPipBeenShown && 
                shouldEnablePip()) {
              setIsPipTrailerActive(true);
              setHasPipBeenShown(true);
            }
          } else {
            // Quando il contenitore torna nella viewport
            setIsPipTrailerActive(false);
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      // Fallback all'evento scroll se IntersectionObserver non è supportato
      window.addEventListener('scroll', handleScrollThrottled);
      return () => {
        window.removeEventListener('scroll', handleScrollThrottled);
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
      };
    }
  }, [
    userScrolledPastThreshold, 
    trailers, 
    isTrailerOpen, 
    hasPipBeenShown, 
    shouldEnablePip
  ]);

  // Reset poster to original state
  const resetPoster = () => {
    setPosterSize(1)
    setPosterPosition({ x: 0, y: 0 })
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDesktop) return
    e.preventDefault()
    setIsDragging(true)
    setStartPoint({ x: e.clientX - posterPosition.x, y: e.clientY - posterPosition.y })
  }

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isDesktop) return
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setStartPoint({ x: e.clientX, y: e.clientY })
  }

  // Handle mouse move for both dragging and resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDesktop) return

    if (isDragging) {
      // Calcola nuova posizione
      const newX = e.clientX - startPoint.x
      const newY = e.clientY - startPoint.y

      // Limiti fissi semplici - non ci saranno calcoli complessi che possono causare errori
      // Valori ampi ma ragionevoli per evitare lo scroll orizzontale
      const maxX = 500
      const minX = -500
      const maxY = 300
      const minY = -300
      
      // Applica i limiti
      const constrainedX = Math.max(minX, Math.min(maxX, newX))
      const constrainedY = Math.max(minY, Math.min(maxY, newY))
      
      // Applica la posizione
      setPosterPosition({ x: constrainedX, y: constrainedY })
      
      // Controllo esplicito anti-scroll: se il posterRef è disponibile, verifichiamo se causa scroll
      if (posterRef.current) {
        const rect = posterRef.current.getBoundingClientRect()
        // Se il poster sta uscendo dallo schermo a destra, resettiamo la posizione
        if (rect.right > window.innerWidth + 5) { // +5 per un po' di margine
          setPosterPosition(prev => ({ ...prev, x: prev.x - 50 })) // Sposta indietro di 50px
        }
      }
    } else if (isResizing) {
      const deltaX = e.clientX - startPoint.x
      const deltaY = e.clientY - startPoint.y
      const maxDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY))
      const direction = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 1 : -1) : deltaY > 0 ? 1 : -1

      // Adjust size based on drag direction while maintaining aspect ratio
      const newSize = Math.max(0.5, Math.min(2.5, posterSize + direction * maxDelta * 0.01))
      setPosterSize(newSize)
      setStartPoint({ x: e.clientX, y: e.clientY })
    }
  }

  // Handle mouse up to stop dragging/resizing
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Gestisce i click fuori dal poster
  const handleOutsideClick = (e: MouseEvent) => {
    // Verifica che il poster sia stato ridimensionato o spostato
    if ((posterSize !== 1 || posterPosition.x !== 0 || posterPosition.y !== 0) && 
        posterRef.current && 
        !posterRef.current.contains(e.target as Node)) {
      // Reset solo se non stiamo trascinando o ridimensionando
      if (!isDragging && !isResizing) {
        resetPoster();
      }
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDesktop && (isDragging || isResizing)) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, isDesktop, startPoint, posterPosition, posterSize])

  // Aggiungi l'event listener per il click fuori dal poster
  useEffect(() => {
    if (isDesktop) {
      window.addEventListener("click", handleOutsideClick)
    }
    
    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
  }, [isDesktop, posterSize, posterPosition, isDragging, isResizing])

  return (
    <>
      <div className="relative h-[100dvh] sm:h-[60vh] md:h-[80vh] mb-[30px] sm:mb-0 pt-40 sm:pt-56">
        {/* Backdrop Image - Solo desktop/tablet */}
        {backdropUrl && (
          <div className="absolute inset-0 hidden sm:block">
            <Image
              src={backdropUrl || "/placeholder.svg"}
              alt={movie.title || ""}
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black to-transparent" />
          </div>
        )}

        {/* Poster come sfondo su mobile */}
        <div className="absolute inset-0 sm:hidden">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={movie.title || ""}
            fill
            className="object-cover object-center bg-black"
            priority
            quality={85}
          />
          {/* Gradiente più forte per garantire leggibilità del testo */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </div>

        {/* Header */}
        <Header />

        {/* Action buttons */}
        <div className={`fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 transition-opacity duration-300 ${showActionButtons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Heart className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
          <button className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Bell className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setIsShareMenuOpen(true)}
            className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <Share2 className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Movie Info - Desktop/Tablet */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full py-12 sm:py-16 md:py-24 z-10 hidden sm:block">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-8 flex items-center gap-8">
            {/* Poster */}
            <div className="w-48 h-72 md:w-64 md:h-96 relative rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={posterUrl}
                alt={movie.title || ""}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              {releaseDate && (
                <div className="text-sm text-yellow-400 mb-2">
                  Uscita: {releaseDate}
                </div>
              )}

              <h1 className="text-4xl md:text-6xl font-bold mb-6">{movie.title}</h1>

              {trailers.length > 0 && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/50 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Guarda trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:hidden z-10">
          <div className="flex flex-col items-center justify-center w-full space-y-2 mb-12 px-5">
            <h1 className="text-[47px] leading-tight font-bold text-white text-center w-full mb-2">{movie.title}</h1>
            {releaseDate && (
              <div className="text-sm text-yellow-400 text-center w-full mb-3">
                Uscita: {releaseDate}
              </div>
            )}
            {trailers && trailers.length > 0 && (
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="w-[60%] mx-auto py-3 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5" />
                <span>Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Menu */}
      {isShareMenuOpen && (
        <ShareMenu
          title={movie.title || ""}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          onClose={() => setIsShareMenuOpen(false)}
        />
      )}

      {/* Trailer Modal */}
      {isTrailerOpen && trailers && trailers.length > 0 && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name || `Trailer di ${movie.title || "film"}`}
        />
      )}

      {/* PIP Trailer */}
      {isPipTrailerActive && trailers && trailers.length > 0 && (
        <LazyTrailerModal
          isOpen={true}
          onClose={() => setIsPipTrailerActive(false)}
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name || `Trailer di ${movie.title || "film"}`}
          initialPIP={true}
          autoMute={true}
        />
      )}
    </>
  )
}

