"use client"

import { useState, useEffect } from "react"

export function TMDBTester() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    configured: boolean
    keyPreview: string
    environment: string
  } | null>(null)

  const testEndpoints = [
    { name: "Configurazione API", endpoint: "/configuration" },
    { name: "Film popolari", endpoint: "/movie/popular" },
    { name: "Serie TV popolari", endpoint: "/tv/popular" },
    { name: "Film di tendenza", endpoint: "/trending/movie/week" },
  ]

  useEffect(() => {
    // Controlla lo stato della chiave API all'avvio
    async function checkApiKey() {
      try {
        const response = await fetch("/api/check-api-key")
        const data = await response.json()
        setApiKeyStatus(data)
      } catch (err) {
        console.error("Errore nel controllo della chiave API:", err)
      }
    }

    checkApiKey()
  }, [])

  const testAPI = async (endpoint: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/tmdb-test?endpoint=${encodeURIComponent(endpoint)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || `Errore ${response.status}`)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(`Errore: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stato della chiave API */}
      {apiKeyStatus && (
        <div
          className={`p-4 rounded-lg ${apiKeyStatus.configured ? "bg-green-900/20 border border-green-700" : "bg-red-900/20 border border-red-700"}`}
        >
          <h3 className="font-semibold mb-2">Stato chiave API TMDB</h3>
          <p>
            <strong>Configurata:</strong> {apiKeyStatus.configured ? "Sì" : "No"}
          </p>
          <p>
            <strong>Anteprima chiave:</strong> {apiKeyStatus.keyPreview}
          </p>
          <p>
            <strong>Ambiente:</strong> {apiKeyStatus.environment}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testEndpoints.map((endpoint) => (
          <button
            key={endpoint.endpoint}
            onClick={() => testAPI(endpoint.endpoint)}
            disabled={loading}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors disabled:opacity-50"
          >
            <h3 className="font-medium">{endpoint.name}</h3>
            <p className="text-sm text-gray-400">{endpoint.endpoint}</p>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <h3 className="font-semibold text-red-400 mb-2">Errore</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Risultato</h3>
          <pre className="overflow-auto max-h-96 text-sm p-4 bg-gray-900 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

