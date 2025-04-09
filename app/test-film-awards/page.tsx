"use client"

import { useState, useEffect } from "react"

export default function TestFilmAwardsPage() {
  const [imdbId, setImdbId] = useState("tt0120338") // Titanic come default
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testIds = [
    { id: "tt0120338", title: "Titanic" },
    { id: "tt0109830", title: "Forrest Gump" },
    { id: "tt0088763", title: "Back to the Future" },
    { id: "tt0468569", title: "The Dark Knight" },
    { id: "tt0133093", title: "The Matrix" }
  ]

  const fetchAwards = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/film-awards?imdbId=${imdbId}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error fetching awards:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAwards()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Film Awards API Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl mb-3">Select a film:</h2>
        <div className="flex gap-2 flex-wrap">
          {testIds.map(film => (
            <button 
              key={film.id} 
              onClick={() => {
                setImdbId(film.id)
                setData(null)
              }}
              className={`px-3 py-1 ${imdbId === film.id ? 'bg-blue-600' : 'bg-gray-800'} rounded hover:bg-gray-700`}
            >
              {film.title}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 mt-4">
          <input 
            type="text" 
            value={imdbId} 
            onChange={e => setImdbId(e.target.value)} 
            placeholder="IMDb ID (ex: tt0120338)"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
          <button 
            onClick={fetchAwards}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Get Awards
          </button>
        </div>
      </div>

      {loading && <div className="text-lg">Loading...</div>}
      
      {error && (
        <div className="p-4 bg-red-900/30 text-red-400 rounded mb-6">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="mt-6">
          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl mb-2">
              {data.title || 'Film'} ({data.imdbId})
            </h2>

            {data.awards ? (
              <div>
                <h3 className="text-lg mt-4 mb-2">Awards Data</h3>
                <div className="bg-gray-800 p-4 rounded overflow-auto max-h-[600px] text-sm">
                  <pre>{JSON.stringify(data.awards, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="text-yellow-400">
                No awards data available for this film
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}