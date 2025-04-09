"use client"

import { useState, useEffect } from 'react'
import { Container } from '@/components/container'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  endpoint?: string
  details?: string
}

export default function TestImdbApiPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [endpoint, setEndpoint] = useState<string>('lowest-rated-movies')
  
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/test-imdb-api?url=${endpoint}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('API test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndpoint(e.target.value)
  }
  
  const availableEndpoints = [
    'lowest-rated-movies', 
    'highest-rated-movies',
    'most-popular-movies',
    'top-250-movies'
  ]
  
  return (
    <Container className="py-12 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">Test RapidAPI IMDb</h1>
      
      <div className="mb-6 flex gap-4 items-center">
        <select 
          value={endpoint}
          onChange={handleEndpointChange}
          className="bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2"
        >
          {availableEndpoints.map(ep => (
            <option key={ep} value={ep}>{ep}</option>
          ))}
        </select>
        
        <button
          onClick={fetchData}
          className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          disabled={loading}
        >
          {loading ? 'Caricamento...' : 'Testa API'}
        </button>
      </div>
      
      {loading && (
        <div className="animate-pulse p-4 bg-gray-800 rounded-md">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
        </div>
      )}
      
      {error && !loading && (
        <div className="p-4 bg-red-900/50 border border-red-800 rounded-md text-red-300">
          <h2 className="text-xl font-semibold mb-2">Errore</h2>
          <p>{error}</p>
        </div>
      )}
      
      {data && !loading && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">
            Risultati per: {data.endpoint}
          </h2>
          
          {data.success === false && (
            <div className="text-red-400 mb-4">
              <p>Errore: {data.error}</p>
              {data.details && <p className="mt-2 text-sm">Dettagli: {data.details}</p>}
            </div>
          )}
          
          {data.success && data.data && (
            <>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(data.data) && data.data.slice(0, 12).map((item, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md">
                    <h3 className="font-medium mb-1 text-lg">{item.title || item.name || `Item ${index + 1}`}</h3>
                    {item.rating && <p className="text-yellow-400 mb-2">Rating: {item.rating}</p>}
                    {item.year && <p className="text-gray-400">Anno: {item.year}</p>}
                    {item.image && (
                      <div className="mt-2">
                        <img 
                          src={item.image} 
                          alt={item.title || item.name || 'Movie poster'} 
                          className="rounded-md max-w-full h-auto max-h-32 object-contain" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <details className="mt-6">
                <summary className="cursor-pointer text-gray-400 hover:text-white">
                  Mostra risposta API completa
                </summary>
                <pre className="mt-4 p-4 bg-gray-800 rounded-md overflow-auto text-xs text-green-300">
                  {JSON.stringify(data.data, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      )}
    </Container>
  )
}