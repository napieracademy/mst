"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Play, Share2, Heart, Bell, RefreshCw } from "lucide-react"
import { TrailerModal } from "@/components/trailer-modal"

interface TVHeroProps {
  show: any
  posterUrl: string
  backdropUrl: string | null
  releaseDate: string | null
  trailers: any[]
}

export function TVHero({ show, posterUrl, backdropUrl, releaseDate, trailers }: TVHeroProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [posterSize, setPosterSize] = useState(1) // 1 is default size
  const [posterPosition, setPosterPosition] = useState({ x: 0, y: 0 }) // Position offset
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  // Check if we're on desktop on component mount
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768)
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

  return (
    <>
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[70vh]">
        {/* Backdrop Image - Visibile solo su tablet e desktop */}
        {backdropUrl && (
          <div className="absolute inset-0 hidden sm:block">
            <Image
              src={backdropUrl || "/placeholder.svg"}
              alt={show.name || ""}
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
            {/* Gradiente verticale per degradare verso il main content nero */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black to-transparent" />
          </div>
        )}

        {/* Poster come sfondo su mobile */}
        <div className="absolute inset-0 sm:hidden">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={show.name || ""}
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        </div>

        {/* Header */}
        <Header />

        {/* Action buttons on the right - Nascondi su mobile */}
        <div className="hidden sm:flex fixed right-4 top-1/4 z-10 flex-col gap-4">
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

        {/* Show Info - Desktop e Tablet */}
        <div className="absolute top-0 left-0 w-full h-full hidden sm:flex items-center p-3 sm:p-8 z-10">
          <div className="max-w-[1100px] w-full mx-auto flex flex-col md:flex-row md:items-start items-start gap-3 md:gap-8">
            {/* Poster */}
            <div
              ref={posterRef}
              className={`movie-poster-mobile w-32 sm:h-48 md:w-64 md:h-96 relative rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${isDesktop ? "cursor-move" : ""} z-20`}
              style={{
                transform: `scale(${posterSize}) translate(${posterPosition.x / posterSize}px, ${posterPosition.y / posterSize}px)`,
                transformOrigin: "center center",
              }}
              onMouseDown={handleMouseDown}
            >
              <Image src={posterUrl || "/placeholder.svg"} alt={show.name || ""} fill className="object-cover" />

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

                  {/* Resize handle */}
                  <div 
                    className="absolute bottom-0 right-0 w-10 h-10 cursor-se-resize group" 
                    onMouseDown={handleResizeStart}
                  >
                    <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden">
                      <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tr from-transparent to-yellow-400/10" />
                      
                      <div className="absolute bottom-0 right-0 w-full h-full flex items-end justify-end p-1">
                        <div className="relative w-5 h-5">
                          <div className="absolute bottom-0 right-0 w-5 h-1 bg-white/90 rounded-full shadow-glow group-hover:bg-yellow-400 transition-colors duration-200"></div>
                          <div className="absolute bottom-0 right-0 w-1 h-5 bg-white/90 rounded-full shadow-glow group-hover:bg-yellow-400 transition-colors duration-200"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-white rounded-full shadow-glow group-hover:bg-yellow-400 group-hover:scale-110 transition-all duration-200"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-full right-full mb-1 mr-1 px-2 py-1 bg-black/70 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Ridimensiona
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Info - Desktop e Tablet */}
            <div className="space-y-2 md:space-y-4 max-w-2xl md:pt-4 md:min-h-[142px] md:relative md:top-[251px]">
              {releaseDate && <div className="text-xs sm:text-sm text-yellow-400 mb-1 sm:mb-2">Prima uscita: {releaseDate}</div>}

              <h1 className="text-lg sm:text-2xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-4">{show.name}</h1>

              {trailers && trailers.length > 0 && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="inline-flex items-center text-xs sm:text-sm text-gray-300 hover:text-white transition-colors group"
                >
                  <Play className="w-3 h-3 mr-1 group-hover:text-red-500 transition-colors" />
                  Guarda trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Layout Mobile - Contenuto in basso */}
        <div className="absolute bottom-0 left-0 right-0 sm:hidden p-4 z-10">
          <div className="w-full text-center">
            {releaseDate && <div className="text-xs text-yellow-400 mb-1">Prima uscita: {releaseDate}</div>}
            
            <h1 className="text-xl font-bold text-white drop-shadow-md mb-1">
              {show.name || ""}
            </h1>
            
            {/* Pulsante trailer mobile - ottimizzato e minimalista */}
            {trailers && trailers.length > 0 && (
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="mx-auto flex items-center justify-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white hover:bg-white/20 transition-colors mt-2"
              >
                <Play className="w-3 h-3 text-red-500" />
                Guarda trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailers && trailers.length > 0 && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerKey={trailers[0].key}
          trailerName={trailers[0].name}
        />
      )}
    </>
  )
}

