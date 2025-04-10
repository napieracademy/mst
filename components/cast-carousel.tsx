"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { generateSlug } from "@/lib/utils"
import { buildImageUrl } from "@/lib/tmdb"

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface PersonDetails {
  id: number
  name: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  combined_credits?: {
    cast: any[]
  }
  loading: boolean
}

// Funzione per tradurre i luoghi di nascita più comuni in italiano
function translateBirthplace(place: string | null): string {
  if (!place) return '';
  
  const translations: Record<string, string> = {
    'Scotland': 'Scozia',
    'England': 'Inghilterra',
    'United Kingdom': 'Regno Unito',
    'UK': 'Regno Unito',
    'United States': 'Stati Uniti',
    'USA': 'Stati Uniti',
    'U.S.A.': 'Stati Uniti',
    'United States of America': 'Stati Uniti d\'America',
    'France': 'Francia',
    'Spain': 'Spagna',
    'Germany': 'Germania',
    'Italy': 'Italia',
    'London': 'Londra',
    'New York': 'New York',
    'California': 'California',
    'Los Angeles': 'Los Angeles',
    'Canada': 'Canada',
    'Australia': 'Australia',
    'Ireland': 'Irlanda',
    'Japan': 'Giappone',
    'China': 'Cina',
    'Russia': 'Russia',
    'Brazil': 'Brasile',
    'India': 'India',
    'Mexico': 'Messico',
    'South Africa': 'Sud Africa',
    'Sweden': 'Svezia',
    'Norway': 'Norvegia',
    'Denmark': 'Danimarca',
    'Finland': 'Finlandia',
    'Netherlands': 'Paesi Bassi',
    'Belgium': 'Belgio',
    'Portugal': 'Portogallo',
    'Greece': 'Grecia',
    'Poland': 'Polonia',
    'Austria': 'Austria',
    'Switzerland': 'Svizzera',
    'Czech Republic': 'Repubblica Ceca'
  };

  // Gestisci luoghi composti come "London, England"
  const parts = place.split(',').map(part => part.trim());
  const translatedParts = parts.map(part => translations[part] || part);
  
  return translatedParts.join(', ');
}

interface CastCarouselProps {
  cast: CastMember[]
}

export function CastCarousel({ cast }: CastCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [personDetails, setPersonDetails] = useState<Record<number, PersonDetails>>({})
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  
  // Aggiungo un riferimento per tenere traccia dei clic esterni
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Carico i dettagli di tutte le persone all'inizializzazione
  useEffect(() => {
    cast.forEach(person => {
      fetchPersonDetails(person.id);
    });
  }, [cast]);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return

    const { scrollLeft, clientWidth } = carouselRef.current
    const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

    carouselRef.current.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }
  
  const fetchPersonDetails = async (personId: number) => {
    if (personDetails[personId] && !personDetails[personId].loading) {
      return
    }
    
    // Inizializza lo stato per questa persona con loading = true
    setPersonDetails(prev => ({
      ...prev,
      [personId]: { id: personId, name: "", birthday: null, deathday: null, place_of_birth: null, loading: true }
    }))
    
    try {
      console.log('Fetching data for person:', personId);
      const response = await fetch(`/api/person/${personId}?lang=it-IT&_=${Date.now()}`)
      if (!response.ok) throw new Error('Errore nel recupero dei dati')
      
      const data = await response.json()
      console.log('Received data:', data);
      
      setPersonDetails(prev => ({
        ...prev,
        [personId]: {
          ...data,
          loading: false
        }
      }))
    } catch (error) {
      console.error("Errore nel recupero dei dettagli della persona:", error)
      setPersonDetails(prev => ({
        ...prev,
        [personId]: {
          ...prev[personId],
          loading: false
        }
      }))
    }
  }
  
  const handleMouseEnter = (e: React.MouseEvent, personId: number) => {
    console.log('Mouse enter su:', personId);
    
    // Calcoliamo la posizione e attiviamo il tooltip
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calcola il centro dell'avatar
    const centerX = rect.left + rect.width / 2;
    const topY = rect.top - 10; // Leggermente sopra l'avatar
    
    setTooltipPosition({ x: centerX, y: topY });
    setActiveTooltip(personId);
    fetchPersonDetails(personId);
  }
  
  const handleMouseLeave = () => {
    console.log('Mouse leave');
    setActiveTooltip(null);
  }
  
  // Calcola l'età
  const calculateAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Formatta le date con fuso orario italiano
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Rome"
    })
  }

  return (
    <div className="relative group">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          aria-label="Scorri a sinistra"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        ref={carouselRef}
        className="flex space-x-10 overflow-x-auto py-4 px-2 scrollbar-hide"
        onScroll={handleScroll}
      >
        {cast.slice(0, 15).map((person) => {
          // Genera lo slug SEO-friendly per l'attore
          const actorSlug = generateSlug(person.name, null, person.id);
          
          return (
            <div
              key={person.id}
              className="flex-none px-2 relative"
            >
              <Link
                href={`/attore/${actorSlug}`}
                className="block text-center"
                onMouseEnter={(e) => handleMouseEnter(e, person.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="relative h-24 w-24 md:h-28 md:w-28 mx-auto mb-2">
                  <div className="w-full h-full rounded-full border-2 border-gray-700 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:border-white">
                    {/* Removed nested Link, using a div instead */}
                    <div className="block w-full h-full">
                      {person.profile_path ? (
                        <Image 
                          src={buildImageUrl(person.profile_path, 'w185') || ''} 
                          alt={person.name}
                          fill
                          sizes="(max-width: 768px) 96px, 112px"
                          className="object-cover transition-transform duration-300 ease-out hover:scale-110 rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xl font-bold transition-transform duration-300 ease-out hover:scale-110 hover:bg-gray-700 rounded-full">
                          {person.name.charAt(0)}
                        </div>
                      )}
                      
                      {/* Age/Death Indicator - Mostrato solo se ci sono dati significativi */}
                      {personDetails[person.id] && (
                        personDetails[person.id].loading ? (
                          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-black/90 flex items-center justify-center text-xs font-medium border-2 border-gray-700 shadow-md text-white">
                            <Loader2 className="h-3 w-3 animate-spin" />
                          </div>
                        ) : personDetails[person.id].deathday ? (
                          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-black/90 flex items-center justify-center text-xs font-medium shadow-md text-gray-600">
                            {calculateAge(personDetails[person.id].birthday, personDetails[person.id].deathday)}
                          </div>
                        ) : personDetails[person.id].birthday && calculateAge(personDetails[person.id].birthday, null) ? (
                          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-black/90 flex items-center justify-center text-xs font-medium shadow-md text-white">
                            {calculateAge(personDetails[person.id].birthday, null)}
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm truncate max-w-[100px] mx-auto hover:text-white transition-colors duration-300">
                    {person.name}
                  </p>
                  <p className="text-gray-400 text-xs truncate max-w-[100px] mx-auto hover:text-gray-300 transition-colors duration-300">
                    {person.character}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          aria-label="Scorri a destra"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {activeTooltip !== null && (
        <div 
          ref={tooltipRef}
          className="fixed z-[9999] bg-black/80 text-white p-3 rounded-lg shadow-md min-w-[150px] max-w-[240px] text-xs"
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/80"></div>
          
          {personDetails[activeTooltip] && !personDetails[activeTooltip].loading ? (
            <div className="space-y-2">
              {personDetails[activeTooltip]?.combined_credits?.cast && (
                <p className="text-center text-gray-300 whitespace-normal">
                  {personDetails[activeTooltip]?.combined_credits?.cast.length} {personDetails[activeTooltip]?.combined_credits?.cast.length === 1 ? 'film' : 'film'} in carriera
                </p>
              )}
              
              {personDetails[activeTooltip].birthday && (
                <p className="text-center text-gray-300 whitespace-normal">
                  {new Date(personDetails[activeTooltip].birthday).getFullYear()}
                  {personDetails[activeTooltip].deathday && (
                    <span> - {new Date(personDetails[activeTooltip].deathday).getFullYear()}</span>
                  )}
                  {calculateAge(personDetails[activeTooltip].birthday, personDetails[activeTooltip].deathday) && (
                    <span> ({calculateAge(personDetails[activeTooltip].birthday, personDetails[activeTooltip].deathday)} anni)</span>
                  )}
                </p>
              )}
              
              {personDetails[activeTooltip].place_of_birth && (
                <p className="text-center text-gray-300 whitespace-normal">
                  Nato a: {translateBirthplace(personDetails[activeTooltip].place_of_birth)}
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Caricamento...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

