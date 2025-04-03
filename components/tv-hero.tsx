"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { TrailerModal } from "@/components/trailer-modal"
import { ShareMenu } from "@/components/share-menu"
import { TVInfo } from '@/atomic/molecules/tv-info'
import { ActionButtons } from '@/atomic/molecules/action-buttons'
import { InteractivePoster } from '@/atomic/molecules/interactive-poster'
import { useTVHeroState } from '@/hooks/useTVHeroState'
import { Header } from "@/components/header"

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
  const [isDesktop, setIsDesktop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Fornisce un valore predefinito per il titolo della serie
  const showTitle = show.name || "Serie TV";

  // Check if we're on desktop on component mount
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768)
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const {
    isTrailerOpen,
    setIsTrailerOpen,
    isPipTrailerActive,
    setIsPipTrailerActive,
    userScrolledPastThreshold,
    showActionButtons,
    isShareMenuOpen,
    setIsShareMenuOpen,
    isFavorite,
    toggleFavorite,
    isNotifying,
    toggleNotify,
  } = useTVHeroState({
    trailers,
    isDesktop,
  })

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const hasTrailer = trailers && trailers.length > 0;

  return (
    <>
      <div className="relative w-full h-[120dvh] sm:h-[70vh] md:h-[85vh] mb-0">
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

        {/* Container principale - senza padding laterali */}
        <div ref={containerRef} className="relative z-10 h-full w-full flex items-center">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start justify-start gap-6 sm:gap-16 px-0">
              {/* Poster - Adattivo per mobile e desktop */}
              <div className="flex items-start justify-start pl-4 sm:pl-8">
                {isDesktop ? (
                  <InteractivePoster
                    posterUrl={posterUrl}
                    title={showTitle}
                    isDesktop={isDesktop}
                  />
                ) : (
                  <div className="relative w-[200px] h-[300px]">
                    <Image
                      src={posterUrl}
                      alt={showTitle}
                      fill
                      className="object-cover rounded-lg shadow-lg"
                      priority
                    />
                  </div>
                )}
              </div>

              {/* Info - Allineato a sinistra sempre */}
              <div className="flex flex-col text-left max-w-2xl sm:self-start pr-4 sm:pr-8">
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
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 transition-opacity duration-300 ${showActionButtons ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ActionButtons
          onShare={() => setIsShareMenuOpen(true)}
          onFavorite={toggleFavorite}
          onNotify={toggleNotify}
        />
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
    </>
  )
}

