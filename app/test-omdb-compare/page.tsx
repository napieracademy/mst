"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Container } from "@/components/container"

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
    <Container className="py-12 bg-black text-white">
      <h1 className="text-2xl font-bold mb-6 text-white">Test comparativo OMDB: Film vs Serie TV</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block mb-2 text-white">ID IMDb Film:</label>
          <Input
            value={filmId}
            onChange={(e) => setFilmId(e.target.value)}
            placeholder="es. tt0111161"
            className="mb-4 bg-gray-800 text-white border-gray-700"
          />
        </div>
        
        <div>
          <label className="block mb-2 text-white">ID IMDb Serie:</label>
          <Input
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            placeholder="es. tt9055008"
            className="mb-4 bg-gray-800 text-white border-gray-700"
          />
        </div>
      </div>
      
      <Button 
        onClick={runTest} 
        disabled={loading}
        className="mb-8 bg-yellow-500 text-black hover:bg-yellow-600"
      >
        {loading ? "Caricamento..." : "Esegui test"}
      </Button>
      
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-gray-700 p-4 rounded-lg bg-gray-900">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Film: {result.filmData?.rawData?.Title || 'N/A'}</h2>
            {result.filmData?.error ? (
              <div className="text-red-500">Errore: {result.filmData.error}</div>
            ) : (
              <>
                <div className="mb-2 text-white">Tipo: <span className="font-semibold text-yellow-200">{result.filmData?.type}</span></div>
                
                {/* Rating Info */}
                <div className="mb-2 text-white">Ha Ratings: <span className="font-semibold text-yellow-200">{result.filmData?.hasRatings ? 'Sì' : 'No'}</span></div>
                <div className="mb-2 text-white">Numero ratings: <span className="font-semibold text-yellow-200">{result.filmData?.ratingsCount}</span></div>
                <div className="mb-2 text-white">Fonti ratings: <span className="font-semibold text-yellow-200">{result.filmData?.ratingSources?.join(', ') || 'Nessuna'}</span></div>
                
                {/* Awards Info */}
                <div className="mt-4 mb-2 text-white font-semibold text-yellow-400">PREMI E RICONOSCIMENTI:</div>
                <div className="mb-2 text-white">Ha Premi: <span className="font-semibold text-yellow-200">{result.filmData?.hasAwards ? 'Sì' : 'No'}</span></div>
                {result.filmData?.awardsAnalysis && (
                  <>
                    <div className="mb-2 text-white">Oscar: <span className="font-semibold text-yellow-200">{result.filmData.awardsAnalysis.oscars}</span></div>
                    <div className="mb-2 text-white">Altri premi: <span className="font-semibold text-yellow-200">{result.filmData.awardsAnalysis.wins}</span></div>
                    <div className="mb-2 text-white">Nomination: <span className="font-semibold text-yellow-200">{result.filmData.awardsAnalysis.nominations}</span></div>
                    <div className="mb-2 text-white">Riassunto: <span className="font-semibold text-yellow-200">{result.filmData.awardsAnalysis.summary}</span></div>
                    <div className="mb-2 text-white">Testo originale: <span className="font-semibold text-yellow-200">{result.filmData.awardsAnalysis.rawText || 'N/A'}</span></div>
                  </>
                )}
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white">Rating dettagliati:</h3>
                  <pre className="bg-gray-800 p-4 rounded-md overflow-auto text-xs text-green-300 border border-gray-700">
                    {JSON.stringify(result.filmData?.rawData?.Ratings || {}, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white">Dati grezzi:</h3>
                  <pre className="bg-gray-800 p-4 rounded-md overflow-auto text-xs text-green-300 border border-gray-700">
                    {JSON.stringify(result.filmData?.rawData || {}, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
          
          <div className="border border-gray-700 p-4 rounded-lg bg-gray-900">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Serie: {result.seriesData?.rawData?.Title || 'N/A'}</h2>
            {result.seriesData?.error ? (
              <div className="text-red-500">Errore: {result.seriesData.error}</div>
            ) : (
              <>
                <div className="mb-2 text-white">Tipo: <span className="font-semibold text-yellow-200">{result.seriesData?.type}</span></div>
                
                {/* Rating Info */}
                <div className="mb-2 text-white">Ha Ratings: <span className="font-semibold text-yellow-200">{result.seriesData?.hasRatings ? 'Sì' : 'No'}</span></div>
                <div className="mb-2 text-white">Numero ratings: <span className="font-semibold text-yellow-200">{result.seriesData?.ratingsCount}</span></div>
                <div className="mb-2 text-white">Fonti ratings: <span className="font-semibold text-yellow-200">{result.seriesData?.ratingSources?.join(', ') || 'Nessuna'}</span></div>
                
                {/* Awards Info */}
                <div className="mt-4 mb-2 text-white font-semibold text-yellow-400">PREMI E RICONOSCIMENTI:</div>
                <div className="mb-2 text-white">Ha Premi: <span className="font-semibold text-yellow-200">{result.seriesData?.hasAwards ? 'Sì' : 'No'}</span></div>
                {result.seriesData?.awardsAnalysis && (
                  <>
                    <div className="mb-2 text-white">Oscar: <span className="font-semibold text-yellow-200">{result.seriesData.awardsAnalysis.oscars}</span></div>
                    <div className="mb-2 text-white">Altri premi: <span className="font-semibold text-yellow-200">{result.seriesData.awardsAnalysis.wins}</span></div>
                    <div className="mb-2 text-white">Nomination: <span className="font-semibold text-yellow-200">{result.seriesData.awardsAnalysis.nominations}</span></div>
                    <div className="mb-2 text-white">Riassunto: <span className="font-semibold text-yellow-200">{result.seriesData.awardsAnalysis.summary}</span></div>
                    <div className="mb-2 text-white">Testo originale: <span className="font-semibold text-yellow-200">{result.seriesData.awardsAnalysis.rawText || 'N/A'}</span></div>
                  </>
                )}
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white">Rating dettagliati:</h3>
                  <pre className="bg-gray-800 p-4 rounded-md overflow-auto text-xs text-green-300 border border-gray-700">
                    {JSON.stringify(result.seriesData?.rawData?.Ratings || {}, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white">Dati grezzi:</h3>
                  <pre className="bg-gray-800 p-4 rounded-md overflow-auto text-xs text-green-300 border border-gray-700">
                    {JSON.stringify(result.seriesData?.rawData || {}, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Container>
  )
}