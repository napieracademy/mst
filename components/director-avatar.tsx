"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"

// Interfaccia per i dettagli del regista
interface PersonDetails {
  id: number
  name: string
  birthday: string | null
  place_of_birth: string | null
  combined_credits?: {
    cast: any[]
  }
}

// Interfaccia per le props del componente
interface DirectorAvatarProps {
  director: {
    id: number
    name: string
    profile_path?: string | null
    job: string
  }
}

export const DirectorAvatar = ({ director }: DirectorAvatarProps) => {
  const [activeTooltip, setActiveTooltip] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [directorDetails, setDirectorDetails] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calcola l'età
  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Formatta la data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Fetch dettagli del regista
  const fetchDirectorDetails = async () => {
    if (directorDetails || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/person/${director.id}`);
      if (!response.ok) throw new Error('Errore nel recupero dei dati');
      
      const data = await response.json();
      setDirectorDetails(data);
    } catch (error) {
      console.error("Errore nel recupero dei dettagli del regista:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gestore per i clic esterni
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setActiveTooltip(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calcola il centro dell'avatar
    const centerX = rect.left + rect.width / 2;
    const topY = rect.top - 10;
    
    setTooltipPosition({ x: centerX, y: topY });
    setActiveTooltip(true);
    fetchDirectorDetails();
  };
  
  const handleMouseLeave = () => {
    setActiveTooltip(false);
  };

  return (
    <>
      <div
        className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-gray-700 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:border-white"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/person/${director.id}`}>
          {director.profile_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
              alt={director.name}
              fill
              className="object-cover transition-transform duration-300 ease-out hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xl font-bold transition-transform duration-300 ease-out hover:scale-110 hover:bg-gray-700">
              {director.name.charAt(0)}
            </div>
          )}
        </Link>
      </div>
      
      {activeTooltip && (
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
          
          {directorDetails ? (
            <div className="space-y-2">
              {directorDetails?.combined_credits?.cast && (
                <p className="text-center text-gray-300 whitespace-normal">
                  {directorDetails.combined_credits.cast.length} film
                </p>
              )}
              
              {directorDetails.birthday && (
                <p className="text-center text-gray-300 whitespace-normal">
                  {formatDate(directorDetails.birthday)}
                  {calculateAge(directorDetails.birthday) && (
                    <span> ({calculateAge(directorDetails.birthday)} anni)</span>
                  )}
                </p>
              )}
              
              {directorDetails.place_of_birth && (
                <p className="text-center text-gray-300 whitespace-normal">
                  {directorDetails.place_of_birth}
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
    </>
  );
}; 