"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/container"

export default function TestTmdbIdPage() {
  const [tmdbId, setTmdbId] = useState<string>("85271") // ID predefinito da cercare
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/tmdb-external-ids?id=${tmdbId}&type=tv`)
        
        if (!response.ok) {
          throw new Error(`Errore ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Errore nel recupero dati:", err)
        setError(err instanceof Error ? err.message : "Errore sconosciuto")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [tmdbId])

  return (
    <Container className="py-12 bg-black text-white">
      <h1 className="text-2xl font-bold mb-6 text-white">TMDB External IDs - ID {tmdbId}</h1>
      
      {loading && (
        <div className="text-white">Caricamento in corso...</div>
      )}
      
      {error && (
        <div className="text-red-500 mb-4">Errore: {error}</div>
      )}
      
      {data && !loading && (
        <div className="border border-gray-700 p-6 rounded-lg bg-gray-900">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Risultati</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID TMDB:</span> {tmdbId}
            </div>
            
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID IMDb:</span> {data.imdb_id || 'Non disponibile'}
            </div>
            
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID Tvdb:</span> {data.tvdb_id || 'Non disponibile'}
            </div>
            
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID Wikidata:</span> {data.wikidata_id || 'Non disponibile'}
            </div>
            
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID Freebase:</span> {data.freebase_mid || 'Non disponibile'}
            </div>
            
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID Facebook:</span> {data.facebook_id || 'Non disponibile'}
            </div>
            
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID Instagram:</span> {data.instagram_id || 'Non disponibile'}
            </div>
            
            <div className="mb-2 text-white">
              <span className="font-semibold text-yellow-200">ID Twitter:</span> {data.twitter_id || 'Non disponibile'}
            </div>
          </div>
          
          <h3 className="font-semibold mb-2 text-white">Dati grezzi:</h3>
          <pre className="bg-gray-800 p-4 rounded-md overflow-auto text-xs text-green-300 border border-gray-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </Container>
  )
}