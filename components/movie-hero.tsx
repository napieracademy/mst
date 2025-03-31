"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Play, Share2, Heart, Bell, RefreshCw } from "lucide-react"
import { TrailerModal } from "@/components/trailer-modal"
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
  const [posterSize, setPosterSize] = useState(1) // 1 is default size
  const [posterPosition, setPosterPosition] = useState({ x: 0, y: 0 }) // Position offset
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollThreshold = 300 // Soglia di scroll per attivare il PIP
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const scrollThrottleDelay = 200 // Ritardo per il throttling dello scroll in ms
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
    // Non attivare il PIP se:
    // 1. L'utente preferisce meno animazioni
    // 2. La batteria è bassa e in modalità risparmio
    // 3. La connessione è lenta
    // 4. Siamo su mobile (già controllato con isDesktop)
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
    // Funzione throttled per gestire lo scroll
    const handleScrollThrottled = () => {
      if (scrollTimerRef.current !== null) return;
      
      scrollTimerRef.current = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const hasScrolledPastThreshold = scrollY > scrollThreshold;
        
        if (hasScrolledPastThreshold !== userScrolledPastThreshold) {
          setUserScrolledPastThreshold(hasScrolledPastThreshold);
          
          // Attiva il PIP solo se non è mai stato mostrato prima e le condizioni lo permettono
          if (hasScrolledPastThreshold && 
              trailers && 
              trailers.length > 0 && 
              !isTrailerOpen && 
              !hasPipBeenShown && 
              shouldEnablePip()) {
            setIsPipTrailerActive(true);
            setHasPipBeenShown(true); // Imposta che il PIP è già stato mostrato
          } else if (!hasScrolledPastThreshold) {
            // Disattiva il PIP quando si torna sopra la soglia
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
        { threshold: 0.1 } // Quando il 10% del contenitore è visibile
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
      <div className="relative w-full h-[80vh]" ref={containerRef}>
        {/* Backdrop Image */}
        {backdropUrl && (
          <div className="absolute inset-0">
            <Image
              src={backdropUrl || "/placeholder.svg"}
              alt={movie.title || ""}
              fill
              className="object-cover object-top"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            {/* Gradiente verticale per degradare verso il main content nero */}
            <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-black to-transparent" />
          </div>
        )}

        {/* Header */}
        <Header />

        {/* Action buttons on the right */}
        <div className="fixed right-4 top-1/4 z-10 flex flex-col gap-4">
          <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Area di spostamento per il poster (invisibile ma funzionale) */}
        <div 
          id="poster-drag-area" 
          className="absolute left-0 top-0 w-full h-full"
          style={{ 
            pointerEvents: 'none', // Per non interferire con altri eventi
          }}
        ></div>

        {/* Movie Info */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full p-8 z-10">
          <div className="max-w-[1100px] mx-auto flex items-center gap-8">
            {/* Poster */}
            <div
              ref={posterRef}
              className={`w-48 h-72 md:w-64 md:h-96 relative rounded-lg overflow-hidden shadow-2xl transition-all ${isDesktop ? "cursor-move" : ""} z-20`}
              style={{
                transform: `scale(${posterSize}) translate(${posterPosition.x / posterSize}px, ${posterPosition.y / posterSize}px)`,
                transformOrigin: "center center",
              }}
              onMouseDown={handleMouseDown}
            >
              <Image src={posterUrl || "/placeholder.svg"} alt={movie.title || ""} fill className="object-cover" />

              {/* Controls for desktop */}
              {isDesktop && (
                <>
                  {/* Reset button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      resetPoster()
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="Ripristina poster"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* Resize handle - Versione migliorata e più stilosa */}
                  <div 
                    className="absolute bottom-0 right-0 w-10 h-10 cursor-se-resize group" 
                    onMouseDown={handleResizeStart}
                  >
                    <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden">
                      {/* Sfondo statico invece dell'animazione lampeggiante */}
                      <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tr from-transparent to-yellow-400/10" />
                      
                      {/* Maniglia stilizzata */}
                      <div className="absolute bottom-0 right-0 w-full h-full flex items-end justify-end p-1">
                        <div className="relative w-5 h-5">
                          {/* Linea orizzontale */}
                          <div className="absolute bottom-0 right-0 w-5 h-1 bg-white/90 rounded-full shadow-glow group-hover:bg-yellow-400 transition-colors duration-200"></div>
                          
                          {/* Linea verticale */}
                          <div className="absolute bottom-0 right-0 w-1 h-5 bg-white/90 rounded-full shadow-glow group-hover:bg-yellow-400 transition-colors duration-200"></div>
                          
                          {/* Punto all'angolo */}
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-white rounded-full shadow-glow group-hover:bg-yellow-400 group-hover:scale-110 transition-all duration-200"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-full mb-1 mr-1 px-2 py-1 bg-black/70 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Ridimensiona
                    </div>
                  </div>
                </>
              )}

              {/* Mobile controls */}
              {!isDesktop && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setPosterSize((prev) => Math.max(0.5, prev - 0.25))
                    }}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="Riduci poster"
                  >
                    <span className="text-white text-lg font-bold">-</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setPosterSize((prev) => Math.min(2.5, prev + 0.25))
                    }}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="Ingrandisci poster"
                  >
                    <span className="text-white text-lg font-bold">+</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      resetPoster()
                    }}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="Ripristina poster"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Rest of content */}
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md">
                {movie.title || ""}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4">
                {movie.vote_average ? (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-400 font-semibold">{Math.round(movie.vote_average * 10) / 10}</span>
                    <span className="text-yellow-400">/</span>
                    <span className="text-yellow-400">10</span>
                  </div>
                ) : null}
                
                {releaseDate && <div className="text-sm text-gray-300">{releaseDate}</div>}
                
                {movie.runtime ? (
                  <div className="text-sm text-gray-300">{movie.runtime} min</div>
                ) : null}
                
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.slice(0, 3).map((genre: { id: number; name: string }) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-gray-800/70 backdrop-blur-sm rounded-full text-xs"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tagline */}
              {movie.tagline && (
                <div className="text-lg italic text-gray-300 mt-4">{movie.tagline}</div>
              )}
              
              {/* Trailer button */}
              {trailers.length > 0 && (
                <button
                  onClick={() => {
                    setIsPipTrailerActive(false); // Disattiva il PIP quando si apre il modal completo
                    setIsTrailerOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium transition-colors mt-4"
                >
                  <Play className="w-5 h-5" fill="white" />
                  Guarda il trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal (in modalità normale) */}
      {isTrailerOpen && trailers.length > 0 && (
        <TrailerModal
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name || `Trailer di ${movie.title || "film"}`}
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          initialPIP={false}
        />
      )}
      
      {/* Trailer in modalità PIP attivato dallo scroll - usando lazy loading */}
      {isPipTrailerActive && trailers.length > 0 && !isTrailerOpen && (
        <LazyTrailerModal
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name || `Trailer di ${movie.title || "film"}`}
          isOpen={isPipTrailerActive}
          onClose={() => setIsPipTrailerActive(false)}
          initialPIP={true}
          autoMute={true}
        />
      )}
    </>
  )
}

