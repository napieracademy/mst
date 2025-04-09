"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TestResult {
  filmData?: any
  seriesData?: any
  error?: string
}

export default function TestOmdbComparePage() {
  const [filmId, setFilmId] = useState<string>("tt0111161") // The Shawshank Redemption
  const [seriesId, setSeriesId] = useState<string>("tt9055008") // Evil
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const runTest = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Fetch film data
      const filmResponse = await fetch(`/api/test-omdb-raw?imdbId=${filmId}`)
      const filmData = await filmResponse.json()
      
      // Fetch series data
      const seriesResponse = await fetch(`/api/test-omdb-raw?imdbId=${seriesId}`)
      const seriesData = await seriesResponse.json()
      
      setResult({
        filmData,
        seriesData
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Errore sconosciuto"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test comparativo OMDB: Film vs Serie TV</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block mb-2">ID IMDb Film:</label>
          <Input
            value={filmId}
            onChange={(e) => setFilmId(e.target.value)}
            placeholder="es. tt0111161"
            className="mb-4"
          />
        </div>
        
        <div>
          <label className="block mb-2">ID IMDb Serie:</label>
          <Input
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            placeholder="es. tt9055008"
            className="mb-4"
          />
        </div>
      </div>
      
      <Button 
        onClick={runTest} 
        disabled={loading}
        className="mb-8"
      >
        {loading ? "Caricamento..." : "Esegui test"}
      </Button>
      
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Film: {result.filmData?.rawData?.Title || 'N/A'}</h2>
            {result.filmData?.error ? (
              <div className="text-red-500">Errore: {result.filmData.error}</div>
            ) : (
              <>
                <div className="mb-2">Tipo: <span className="font-semibold">{result.filmData?.type}</span></div>
                <div className="mb-2">Ha Ratings: <span className="font-semibold">{result.filmData?.hasRatings ? 'Sì' : 'No'}</span></div>
                <div className="mb-2">Numero ratings: <span className="font-semibold">{result.filmData?.ratingsCount}</span></div>
                <div className="mb-2">Fonti ratings: <span className="font-semibold">{result.filmData?.ratingSources?.join(', ') || 'Nessuna'}</span></div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Rating dettagliati:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(result.filmData?.rawData?.Ratings || {}, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Dati grezzi:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(result.filmData?.rawData || {}, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
          
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Serie: {result.seriesData?.rawData?.Title || 'N/A'}</h2>
            {result.seriesData?.error ? (
              <div className="text-red-500">Errore: {result.seriesData.error}</div>
            ) : (
              <>
                <div className="mb-2">Tipo: <span className="font-semibold">{result.seriesData?.type}</span></div>
                <div className="mb-2">Ha Ratings: <span className="font-semibold">{result.seriesData?.hasRatings ? 'Sì' : 'No'}</span></div>
                <div className="mb-2">Numero ratings: <span className="font-semibold">{result.seriesData?.ratingsCount}</span></div>
                <div className="mb-2">Fonti ratings: <span className="font-semibold">{result.seriesData?.ratingSources?.join(', ') || 'Nessuna'}</span></div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Rating dettagliati:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(result.seriesData?.rawData?.Ratings || {}, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Dati grezzi:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(result.seriesData?.rawData || {}, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}