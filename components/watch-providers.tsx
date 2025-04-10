"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface WatchProvidersProps {
  movieId: string
  type: "movie" | "tv"
}

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
}

interface ProviderData {
  flatrate?: Provider[]
  rent?: Provider[]
  buy?: Provider[]
}

// Componente che mostra i provider solo se sono disponibili
export function WatchProvidersConditional({ movieId, type }: WatchProvidersProps) {
  const [hasProviders, setHasProviders] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Controlla se ci sono provider disponibili
    async function checkProviders() {
      try {
        const response = await fetch(`/api/watch-providers?id=${movieId}&type=${type}`);
        if (!response.ok) {
          setHasProviders(false);
          return;
        }
        
        const data = await response.json();
        const providers = data.results?.IT;
        setHasProviders(!!(providers?.flatrate || providers?.rent || providers?.buy));
      } catch (error) {
        setHasProviders(false);
      }
    }
    
    checkProviders();
  }, [movieId, type]);
  
  if (hasProviders === null) return null; // Loading
  if (hasProviders === false) return null; // Nessun provider
  
  return (
    <div className="mb-8">
      <h2 className="text-sm text-gray-400 mb-4">Guardalo su</h2>
      <WatchProviders movieId={movieId} type={type} />
    </div>
  );
}

export function WatchProviders({ movieId, type }: WatchProvidersProps) {
  const [providers, setProviders] = useState<ProviderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch(`/api/watch-providers?id=${movieId}&type=${type}`)
        if (!response.ok) throw new Error("Failed to fetch providers")

        const data = await response.json()
        setProviders(data.results?.IT || null)
      } catch (error) {
        console.error("Error fetching watch providers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [movieId, type])

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse mb-2"></div>
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse mb-2"></div>
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
    return null;
  }

  return (
    <div className="space-y-2">
        {providers.flatrate && (
          <div className="mb-4">
            <h3 className="text-xs text-gray-500 mb-2">Streaming</h3>
            <div className="flex flex-wrap gap-2">
              {providers.flatrate.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="w-10 h-10 relative rounded-lg overflow-hidden border border-gray-800"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {providers.rent && (
          <div className="mb-4">
            <h3 className="text-xs text-gray-500 mb-2">Noleggio</h3>
            <div className="flex flex-wrap gap-2">
              {providers.rent.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="w-10 h-10 relative rounded-lg overflow-hidden border border-gray-800"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {providers.buy && (
          <div>
            <h3 className="text-xs text-gray-500 mb-2">Acquisto</h3>
            <div className="flex flex-wrap gap-2">
              {providers.buy.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="w-10 h-10 relative rounded-lg overflow-hidden border border-gray-800"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  )
}

