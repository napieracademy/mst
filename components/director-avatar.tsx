"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { isValidImagePath, buildImageUrl } from "@/lib/tmdb"
import { generateSlug } from "@/lib/utils"

// Interfaccia per i dettagli del regista
interface PersonDetails {
  id: number
  name: string
  birthday: string | null
  place_of_birth: string | null
  combined_credits?: {
    cast: any[]
  }
  profile_path?: string | null
  images?: {
    profiles?: Array<{ file_path: string }>
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

export function DirectorAvatar({ director }: DirectorAvatarProps) {
  const [activeTooltip, setActiveTooltip] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [directorDetails, setDirectorDetails] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [finalImagePath, setFinalImagePath] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  
  // Genera lo slug SEO-friendly per il regista
  const directorSlug = generateSlug(director.name, null, director.id);

  // Verifica se il percorso dell'immagine è valido usando la funzione centralizzata
  const hasValidProfilePath = isValidImagePath(director.profile_path);

  // Costruisci l'URL dell'immagine in modo sicuro
  const getImageUrl = () => {
    if (finalImagePath) {
      return buildImageUrl(finalImagePath, "w185") || "";
    }
    
    if (hasValidProfilePath) {
      return buildImageUrl(director.profile_path, "w185") || "";
    }
    
    return "";
  };

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
  
  // Formatta le date con fuso orario italiano
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Rome"
    })
  };

  // Gestisci errori caricamento immagine
  const handleImageError = () => {
    console.log(`Image error for director ${director.id}: ${director.profile_path}`);
    setImageError(true);
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
      
      // Log per debugging
      console.log("Director avatar details:", {
        id: director.id,
        name: director.name,
        profilePath: director.profile_path,
        responseProfilePath: data.profile_path,
        hasValidOriginalPath: hasValidProfilePath,
        hasValidResponsePath: isValidImagePath(data.profile_path)
      });
      
      // Se il percorso originale non è valido ma abbiamo un percorso valido dalla risposta
      if (!hasValidProfilePath && isValidImagePath(data.profile_path)) {
        setFinalImagePath(data.profile_path);
      }
      // Se abbiamo immagini alternative nella risposta
      else if (data.images?.profiles && data.images.profiles.length > 0) {
        // Cerca una immagine alternativa valida
        const alternativeImage = data.images.profiles.find((img: any) => 
          isValidImagePath(img.file_path)
        );
        
        if (alternativeImage) {
          console.log(`Using alternative image for director ${director.id}:`, alternativeImage.file_path);
          setFinalImagePath(alternativeImage.file_path);
        }
      }
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
    if (!avatarRef.current) return;
    
    const rect = avatarRef.current.getBoundingClientRect();
    
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

  // Determina se abbiamo un'immagine da mostrare
  const hasImage = hasValidProfilePath || finalImagePath || false;

  return (
    <div className="flex items-center gap-4">
      <div
        ref={avatarRef}
        className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-gray-700 shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:border-white"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/regista/${directorSlug}`} className="block w-full h-full">
          {hasImage && !imageError ? (
            <Image
              src={getImageUrl()}
              alt={director.name}
              fill
              sizes="64px"
              className="object-cover transition-transform duration-300 ease-out hover:scale-110"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 text-xl font-bold transition-transform duration-300 ease-out hover:scale-110 hover:bg-gray-700">
              {director.name.charAt(0)}
            </div>
          )}
        </Link>
      </div>
      <div>
        <Link href={`/regista/${directorSlug}`} className="text-sm hover:text-yellow-400 transition-colors">
          {director.name}
        </Link>
      </div>
      
      {activeTooltip && (
        <div 
          ref={tooltipRef}
          className="fixed z-[9999] bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl min-w-[180px] max-w-[260px] text-sm"
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-black/90"></div>
          
          <div className="text-center font-medium mb-1">{director.name}</div>
          
          {loading ? (
            <div className="flex justify-center items-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Caricamento...</span>
            </div>
          ) : directorDetails ? (
            <div className="space-y-2">
              {directorDetails?.combined_credits?.cast && (
                <p className="text-center text-gray-300">
                  <span className="text-yellow-400">{directorDetails.combined_credits.cast.length}</span> film
                </p>
              )}
              
              {directorDetails.birthday && (
                <p className="text-center text-gray-300">
                  {formatDate(directorDetails.birthday)}
                  {calculateAge(directorDetails.birthday) && (
                    <span> ({calculateAge(directorDetails.birthday)} anni)</span>
                  )}
                </p>
              )}
              
              {directorDetails.place_of_birth && (
                <p className="text-center text-gray-300">
                  {directorDetails.place_of_birth}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-300 py-1">
              Nessun dettaglio disponibile
            </p>
          )}
        </div>
      )}
    </div>
  );
} 