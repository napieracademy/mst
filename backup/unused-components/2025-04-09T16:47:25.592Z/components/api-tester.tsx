"use client"

import { useState } from "react"

export function ApiTester() {
  const [apiUrl, setApiUrl] = useState("https://napieracademy.eu/wp-json/wp/v2")
  const [endpoint, setEndpoint] = useState("/posts")
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}${endpoint}`)

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        setError("La risposta non è in formato JSON")
        setResult(text.substring(0, 500) + "...")
      } else {
        const data = await response.json()
        setResult(JSON.stringify(data, null, 2))
      }
    } catch (err) {
      setError(`Errore: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test API WordPress</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">URL API</label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
        <div className="flex">
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={testApi}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded-r hover:bg-orange-600 disabled:bg-gray-300"
          >
            {loading ? "Caricamento..." : "Test"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Errore</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Risultato:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}

