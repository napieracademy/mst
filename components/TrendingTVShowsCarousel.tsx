"use client"

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Flame, Star } from 'lucide-react'
import { generateSlug } from '@/lib/utils'
import { Movie } from '@/lib/types'

interface Show {
  id: number
  name?: string
  backdrop_path?: string | null
  poster_path?: string | null
  first_air_date?: string
  vote_average?: number
  overview?: string
  popularity?: number
}

interface TrendingTVShowsCarouselProps {
  shows: Movie[] | Show[]
  title?: string
}

export default function TrendingTVShowsCarousel({ shows, title = "Serie TV di tendenza" }: TrendingTVShowsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Calcola lo scroll massimo quando il componente viene montato o i film cambiano
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.scrollWidth
      const viewportWidth = containerRef.current.clientWidth
      setMaxScroll(containerWidth - viewportWidth)
    }
    
    // Auto-play carousel
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(shows.length, 10))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [shows])
  
  // Funzione per lo scroll
  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8
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

  const featured = shows.slice(0, 1)[0]
  const otherShows = shows.slice(1, 15)
  
  if (!featured) return null
  
  const featuredYear = featured.first_air_date ? new Date(featured.first_air_date).getFullYear() : null
  const featuredSlug = generateSlug(featured.name || 'Serie TV', featuredYear?.toString() || null, featured.id)

  return (
    <div className="w-full relative mb-8">
      {/* Featured show - backdrop style */}
      <div className="relative w-full h-[60vh] mb-8 overflow-hidden">
        <Link href={`/serie/${featuredSlug}`} className="block h-full">
          <div className="relative w-full h-full">
            {featured.backdrop_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
                alt={featured.name || 'Serie TV in evidenza'}
                fill
                priority
                className="object-cover"
              />
            ) : featured.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/original${featured.poster_path}`}
                alt={featured.name || 'Serie TV in evidenza'}
                fill
                priority
                className="object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800" />
            )}
            
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            
            {/* Info box */}
            <div className="absolute bottom-0 left-0 w-full md:w-2/3 lg:w-1/2 p-6 md:p-10 lg:p-16">
              <div className="flex items-center space-x-2 mb-4">
                <Flame className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium uppercase tracking-wider text-red-400">In tendenza questa settimana</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">{featured.name || 'Serie TV in evidenza'}</h2>
              
              <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                {featuredYear && <span>{featuredYear}</span>}
                {featured.vote_average && featured.vote_average > 0 && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{featured.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300 line-clamp-3 mb-6">{featured.overview || 'Nessuna descrizione disponibile.'}</p>
              
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors">
                Scopri di più
              </button>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Carousel di altri show */}
      <div className="max-w-screen-xl mx-auto px-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {title}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => scroll('left')} 
              disabled={scrollPosition <= 0}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              disabled={scrollPosition >= maxScroll}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {otherShows.map((show, index) => {
            const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
            const slug = generateSlug(show.name || 'Serie TV', year?.toString() || null, show.id)
            
            return (
              <div 
                key={show.id}
                className="relative flex-shrink-0 w-[280px] transition-all"
              >
                <Link href={`/serie/${slug}`} className="block h-full">
                  <div className="relative rounded-lg overflow-hidden shadow-lg group">
                    <div className="aspect-video relative">
                      {show.backdrop_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w780${show.backdrop_path}`}
                          alt={show.name || 'Serie TV'}
                          fill
                          sizes="280px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : show.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${show.poster_path}`}
                          alt={show.name || 'Serie TV'}
                          fill
                          sizes="280px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-500">Immagine non disponibile</span>
                        </div>
                      )}
                      
                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />
                    </div>
                    
                    {/* Indicator di popolarità */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-red-600/90 text-white text-xs font-medium">
                      <Flame className="w-3 h-3" />
                      <span>{Math.round(show.popularity || 0)}</span>
                    </div>
                    
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-base font-semibold text-white line-clamp-1 mb-1">
                        {show.name || 'Serie TV'}
                      </h3>
                      <p className="text-xs text-gray-300">
                        {year}
                      </p>
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