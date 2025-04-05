"use client"

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { generateSlug } from '@/lib/utils'
import { Movie } from '@/lib/types'

interface Show {
  id: number
  name?: string
  poster_path?: string | null
  first_air_date?: string
  vote_average?: number
  overview?: string
  backdrop_path?: string | null
  popularity?: number
  availableOn?: string[]
}

interface TopRatedTVShowsCarouselProps {
  shows: Movie[] | Show[]
  title?: string
}

export default function TopRatedTVShowsCarousel({ shows, title = "Serie TV premiate dalla critica" }: TopRatedTVShowsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [isHovering, setIsHovering] = useState(-1)
  
  // Calcola lo scroll massimo quando il componente viene montato o i film cambiano
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.scrollWidth
      const viewportWidth = containerRef.current.clientWidth
      setMaxScroll(containerWidth - viewportWidth)
    }
  }, [shows])
  
  // Funzione per lo scroll
  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.9
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(maxScroll, scrollPosition + scrollAmount)
      
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
      
      setScrollPosition(newPosition)
    }
  }

  // Funzione per monitorare lo scroll
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft)
    }
  }

  // Aggiunge l'event listener per lo scroll
  useEffect(() => {
    const currentRef = containerRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll)
      return () => currentRef.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="w-full relative bg-gradient-to-b from-black via-gray-900 to-black py-10 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-red-500">
            {title}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => scroll('left')} 
              disabled={scrollPosition <= 0}
              className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              disabled={scrollPosition >= maxScroll}
              className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="flex gap-4 pb-4 overflow-x-auto hide-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >
          {shows.map((show, index) => {
            const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
            const slug = generateSlug(show.name || '', year?.toString() || null, show.id)
            const isHovered = isHovering === index
            
            return (
              <div 
                key={show.id}
                className="relative flex-shrink-0 transition-all duration-300"
                style={{ width: isHovered ? '400px' : '220px' }}
                onMouseEnter={() => setIsHovering(index)}
                onMouseLeave={() => setIsHovering(-1)}
              >
                <Link href={`/serie/${slug}`} className="block h-full">
                  <div className="relative rounded-lg overflow-hidden shadow-xl group">
                    <div className="aspect-[2/3] relative">
                      {show.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                          alt={show.name || ''}
                          fill
                          sizes="(max-width: 640px) 100vw, 300px"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          priority={index < 5}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-500">Immagine non disponibile</span>
                        </div>
                      )}
                      
                      {/* Gradiente dal basso */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    </div>

                    {/* Badge voto */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-amber-400 text-sm font-medium">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      <span>{show.vote_average?.toFixed(1) || "N/A"}</span>
                    </div>
                    
                    {/* Piattaforme */}
                    {show.availableOn && show.availableOn.length > 0 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        {show.availableOn.includes("Netflix") && (
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center" title="Netflix">
                            <span className="text-white text-xs font-bold">N</span>
                          </div>
                        )}
                        {show.availableOn.includes("Amazon Prime Video") && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center" title="Amazon Prime Video">
                            <span className="text-white text-xs font-bold">A</span>
                          </div>
                        )}
                        {show.availableOn.includes("Apple TV+") && (
                          <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center" title="Apple TV+">
                            <span className="text-white text-xs font-bold">TV</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-white line-clamp-2 mb-1">
                        {show.name || 'Nome non disponibile'}
                      </h3>
                      <p className="text-sm text-gray-300 mb-1">
                        {year}
                      </p>
                      {isHovered && (
                        <p className="text-sm text-gray-300 line-clamp-3 mt-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                          {show.overview || "Nessuna descrizione disponibile."}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// CSS per nascondere la scrollbar ma mantenere la funzionalità
const styleSheet = new CSSStyleSheet()
styleSheet.insertRule(`
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`, 0)

// Aggiungi lo stile se siamo in un ambiente browser
if (typeof document !== 'undefined') {
  try {
    // @ts-ignore - TypeScript non riconosce adoptedStyleSheets ma è supportato dai browser moderni
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet]
  } catch (e) {
    // Fallback per browser che non supportano adoptedStyleSheets
    const style = document.createElement('style')
    style.textContent = `.hide-scrollbar::-webkit-scrollbar { display: none; }`
    document.head.appendChild(style)
  }
} 