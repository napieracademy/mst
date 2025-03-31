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
      <section className="mt-8">
        <div className="h-20 bg-gray-900 rounded-lg animate-pulse"></div>
      </section>
    )
  }

  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">JustWatch</h2>
        <p className="text-gray-400">Nessun provider di streaming disponibile in Italia.</p>
      </section>
    )
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4">JustWatch</h2>

      <div className="space-y-6">
        {providers.flatrate && (
          <div>
            <h3 className="text-sm text-gray-400 mb-2">STREAMING</h3>
            <div className="flex flex-wrap gap-2">
              {providers.flatrate.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-800"
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
          <div>
            <h3 className="text-sm text-gray-400 mb-2">NOLEGGIO</h3>
            <div className="flex flex-wrap gap-2">
              {providers.rent.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-800"
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
            <h3 className="text-sm text-gray-400 mb-2">ACQUISTO</h3>
            <div className="flex flex-wrap gap-2">
              {providers.buy.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-800"
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
    </section>
  )
}

