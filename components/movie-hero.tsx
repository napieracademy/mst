"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Header } from "./header"
import { Play } from "lucide-react"
import { TrailerModal } from "./trailer-modal"
import { ShareMenu } from "./share-menu"
import { MovieActions } from "@/atomic/organisms/movie-actions"
import { Button } from "@/atomic/atoms/button"
import dynamic from 'next/dynamic'
import { MovieInfo } from '@/atomic/molecules/movie-info'
import { Container } from "@/atomic/atoms/container"
import { DraggableContent } from "@/atomic/molecules/draggable-content"
import { MovieRatingsHero } from "./movie-ratings-hero"
import { cn } from "@/lib/utils"

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
  showReleaseDate?: boolean
}

export function MovieHero({ movie, posterUrl, backdropUrl, releaseDate, trailers }: MovieHeroProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [isPipTrailerActive, setIsPipTrailerActive] = useState(false)
  const [userScrolledPastThreshold, setUserScrolledPastThreshold] = useState(false)
  const [hasPipBeenShown, setHasPipBeenShown] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [showActionButtons, setShowActionButtons] = useState(true)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
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

  return (
    <>
      <div ref={containerRef} className="relative w-full h-[120dvh] sm:h-[70vh] md:h-[85vh] mb-0">
        {/* Backdrop Image - Al livello più basso */}
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full">
          <div className="relative w-full h-full">
            <Image
              src={backdropUrl || posterUrl}
              alt={movie.title}
              fill
              className="object-cover object-top"
              style={{ width: '100%', height: '100%' }}
              sizes="100vw"
              priority
              quality={95}
            />
            {/* Gradienti sopra l'immagine di sfondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
          </div>
        </div>

        {/* Header */}
        <Header />

        {/* Action buttons - z-index sotto l'header ma sopra il contenuto */}
        <div className={cn(
          "fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3",
          "transition-opacity duration-300 z-[200]",
          showActionButtons ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <MovieActions
            hasTrailer={trailers && trailers.length > 0}
            onWatchTrailer={() => setIsTrailerOpen(true)}
            onShare={() => setIsShareMenuOpen(true)}
            onFavorite={() => {/* TODO: Implementare */}}
            onNotify={() => {/* TODO: Implementare */}}
          />
        </div>

        {/* Container principale dei contenuti */}
        <div className="relative z-[100] h-full w-full flex items-center">
          <div className="w-full">
            <Container variant="default" className="max-w-[1100px]">
              <div className="flex flex-col sm:flex-row items-start justify-start gap-6 sm:gap-16">
                {/* Info - Allineato a sinistra */}
                <div className="flex flex-col text-left max-w-2xl">
                  <DraggableContent
                    dragConstraints={{ top: -50, right: 100, bottom: 50, left: -100 }}
                    snapBackDuration={0.6}
                  >
                    <MovieInfo
                      title={movie.title}
                      releaseDate={releaseDate || undefined}
                      hasTrailer={false}
                      onWatchTrailer={() => {}}
                    />
                  </DraggableContent>
                  
                  {/* Movie Ratings */}
                  <MovieRatingsHero
                    tmdbId={movie.id}
                    imdbId={movie.external_ids?.imdb_id}
                    tmdbRating={movie.vote_average}
                    tmdbVoteCount={movie.vote_count}
                  />
                  
                  {/* Trailer Button */}
                  {trailers && trailers.length > 0 && (
                    <div className="mt-4">
                      <DraggableContent
                        dragConstraints={{ top: -30, right: 60, bottom: 30, left: -60 }}
                        snapBackDuration={0.5}
                        dragElastic={0.6}
                      >
                        <button
                          onClick={() => setIsTrailerOpen(true)}
                          className="flex items-center gap-2 text-white bg-black/80 hover:bg-black/90 px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                        >
                          <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="white" />
                          <span>{isDesktop ? 'Guarda il trailer' : 'Guarda trailer'}</span>
                        </button>
                      </DraggableContent>
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* Modali e overlay - Massimo z-index ma sotto l'header */}
      {isShareMenuOpen && (
        <div className="z-[900]">
          <ShareMenu
            title={movie.title || ""}
            url={typeof window !== 'undefined' ? window.location.href : ''}
            onClose={() => setIsShareMenuOpen(false)}
          />
        </div>
      )}

      {isTrailerOpen && trailers && trailers.length > 0 && (
        <div className="z-[900]">
          <TrailerModal
            isOpen={isTrailerOpen}
            onClose={() => setIsTrailerOpen(false)}
            trailerKey={trailers[0].key}
            trailerName={trailers[0].name || `Trailer di ${movie.title || "film"}`}
          />
        </div>
      )}

      {isPipTrailerActive && trailers && trailers.length > 0 && (
        <div className="z-[900]">
          <LazyTrailerModal
            isOpen={true}
            onClose={() => setIsPipTrailerActive(false)}
            trailerKey={trailers[0].key}
            trailerName={trailers[0].name || `Trailer di ${movie.title || "film"}`}
            initialPIP={true}
            autoMute={true}
          />
        </div>
      )}
    </>
  )
}

