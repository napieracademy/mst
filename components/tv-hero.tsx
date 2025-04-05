
"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Header } from "./header"
import { Play } from "lucide-react"
import { TrailerModal } from "./trailer-modal"
import { ShareMenu } from "./share-menu"
import { ActionButtons } from '@/atomic/molecules/action-buttons'
import { Container } from "@/atomic/atoms/container"
import dynamic from 'next/dynamic'
import { TVInfo } from '@/atomic/molecules/tv-info'

// Importazione dinamica (lazy) del TrailerModal
const LazyTrailerModal = dynamic(() => import('@/components/trailer-modal').then(mod => ({ default: mod.TrailerModal })), {
  ssr: false,
  loading: () => <div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg overflow-hidden bg-black/40 shadow-2xl backdrop-blur-sm p-4 text-center text-sm text-white">Caricamento trailer...</div>
});

interface Show {
  name?: string;
  id: number;
  overview?: string;
  first_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
}

interface Trailer {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

interface TVHeroProps {
  show: Show;
  posterUrl: string;
  backdropUrl: string | null;
  releaseDate: string | null;
  trailers: Trailer[];
}

export function TVHero({ show, posterUrl, backdropUrl, releaseDate, trailers }: TVHeroProps) {
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
  
  // Fornisce un valore predefinito per il titolo della serie
  const showTitle = show.name || "Serie TV";

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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const hasTrailer = trailers && trailers.length > 0;

  return (
    <>
      <div ref={containerRef} className="relative w-full h-[120dvh] sm:h-[70vh] md:h-[85vh] mb-0">
        {/* Backdrop Image - Occupa tutta l'area senza restrizioni */}
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full">
          <div className="relative w-full h-full">
            <Image
              src={backdropUrl || posterUrl}
              alt={showTitle}
              fill
              className="object-cover object-center"
              style={{ width: '100%', height: '100%' }}
              sizes="100vw"
              priority
              quality={95}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
          </div>
        </div>

        {/* Header */}
        <Header />

        {/* Action buttons - posizionamento verticale coerente */}
        <div className={`fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 transition-opacity duration-300 ${showActionButtons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ActionButtons
            onShare={() => setIsShareMenuOpen(true)}
            onFavorite={() => {/* TODO: Implementare */}}
            onNotify={() => {/* TODO: Implementare */}}
          />
        </div>

        {/* Container principale - senza padding laterali */}
        <div className="relative z-10 h-full w-full flex items-center">
          <div className="w-full">
            <Container>
              <div className="flex flex-col sm:flex-row items-start justify-start gap-6 sm:gap-16">
                {/* Info - Allineato a sinistra sempre */}
                <div className="flex flex-col text-left max-w-2xl">
                  <TVInfo
                    title={showTitle}
                    releaseDate={releaseDate || undefined}
                    hasTrailer={false}
                    onWatchTrailer={() => {}}
                  />
                  
                  {/* Trailer Button - Sempre allineato a sinistra */}
                  {hasTrailer && (
                    <div className="mt-2 sm:mt-4">
                      <button
                        onClick={() => setIsTrailerOpen(true)}
                        className="flex items-center gap-3 text-white bg-red-600 hover:bg-red-700 transition-all duration-300 px-6 py-3 rounded-full text-base sm:text-lg font-medium shadow-lg hover:shadow-xl"
                      >
                        <Play className="w-6 h-6" fill="white" />
                        <span>{isDesktop ? 'Guarda il trailer' : 'Guarda trailer'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* Share Menu */}
      {isShareMenuOpen && (
        <ShareMenu
          title={showTitle}
          url={currentUrl}
          onClose={() => setIsShareMenuOpen(false)}
        />
      )}

      {/* Trailer Modal */}
      {isTrailerOpen && trailers?.[0] && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name || `Trailer di ${showTitle}`}
        />
      )}

      {/* PIP Trailer */}
      {isPipTrailerActive && trailers && trailers.length > 0 && (
        <LazyTrailerModal
          isOpen={true}
          onClose={() => setIsPipTrailerActive(false)}
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name || `Trailer di ${showTitle}`}
          initialPIP={true}
          autoMute={true}
        />
      )}
    </>
  )
}
