"use client"

import { useState } from "react"

export function ApiTestButton() {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-api")
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setIsLoading(false)
    }
  }

  const testGenerateApi = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Genera un breve testo di prova",
          maxLength: 100,
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Test API</h3>

      <div className="flex gap-4 mb-4">
        <button
          onClick={testApi}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          Test API Base
        </button>

        <button
          onClick={testGenerateApi}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          Test API Generate
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500 rounded-md mb-4">
          <p className="text-red-400 font-medium">Errore:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="p-3 bg-gray-800 rounded-md overflow-auto">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}

