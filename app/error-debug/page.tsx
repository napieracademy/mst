"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ErrorDebugPage() {
  const [errorInfo, setErrorInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchErrorInfo() {
      try {
        // Tenta di recuperare informazioni sull'errore dal server
        const response = await fetch("/api/debug/error?digest=1374498358")
        if (response.ok) {
          const data = await response.json()
          setErrorInfo(data)
        } else {
          setErrorInfo({ error: "Impossibile recuperare informazioni sull'errore" })
        }
      } catch (error) {
        console.error("Errore durante il recupero delle informazioni sull'errore:", error)
        setErrorInfo({ error: "Errore durante la richiesta" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchErrorInfo()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-6">Debug Errore</h1>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informazioni sull'errore (Digest: 1374498358)</h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div>
              {errorInfo ? (
                <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-96 text-sm">
                  {JSON.stringify(errorInfo, null, 2)}
                </pre>
              ) : (
                <p className="text-red-400">Nessuna informazione disponibile per questo errore.</p>
              )}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium">Possibili cause e soluzioni:</h3>
            <div className="space-y-2">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium">1. Problemi con la chiave API TMDB</h4>
                <p className="text-gray-400 mt-1">
                  Verifica che la chiave API TMDB sia configurata correttamente nelle variabili d'ambiente.
                </p>
                <div className="mt-2">
                  <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                    TMDB_API_KEY={process.env.TMDB_API_KEY ? "✓ Configurata" : "✗ Non configurata"}
                  </code>
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium">2. Errori nella gestione dei dati</h4>
                <p className="text-gray-400 mt-1">
                  Potrebbe esserci un errore nell'accesso a proprietà di oggetti che sono null o undefined.
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium">3. Problemi con le funzioni asincrone</h4>
                <p className="text-gray-400 mt-1">
                  Verifica che tutte le funzioni asincrone siano gestite correttamente con try/catch.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Test API TMDB</h2>
          <TMDBErrorTest />
        </div>
      </div>
      <Footer />
    </main>
  )
}

function TMDBErrorTest() {
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testEndpoints = [
    { name: "Configurazione API", endpoint: "/configuration" },
    { name: "Film popolari", endpoint: "/movie/popular" },
    { name: "Dettagli film (ID: 550)", endpoint: "/movie/550" },
  ]

  const testAPI = async (endpoint: string) => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`/api/tmdb-test?endpoint=${encodeURIComponent(endpoint)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || `Errore ${response.status}`)
      } else {
        setResults(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <p className="mb-4">
        Testa le chiamate API TMDB per verificare se ci sono problemi di connessione o autenticazione.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {testEndpoints.map((endpoint) => (
          <button
            key={endpoint.endpoint}
            onClick={() => testAPI(endpoint.endpoint)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
          >
            <h3 className="font-medium">{endpoint.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{endpoint.endpoint}</p>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-red-400 mb-2">Errore</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Risultato</h3>
          <pre className="overflow-auto max-h-96 text-sm">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

