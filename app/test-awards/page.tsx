"use client";

import { useState, useEffect } from "react";

export default function TestAwardsPage() {
  const [imdbId, setImdbId] = useState("tt0120338"); // Titanic come default
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/test-imdb-awards?id=${imdbId}`);
        if (!response.ok) {
          throw new Error(`Errore ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore sconosciuto");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [imdbId]);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-3xl font-bold mb-6">Test IMDb Awards API</h1>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">IMDb ID:</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={imdbId} 
            onChange={(e) => setImdbId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded"
          />
          <button 
            onClick={() => setImdbId(imdbId)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Cerca
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setImdbId("tt0120338")}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          Titanic
        </button>
        <button 
          onClick={() => setImdbId("tt0468569")}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          The Dark Knight
        </button>
        <button 
          onClick={() => setImdbId("tt28607951")}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          tt28607951
        </button>
      </div>
      
      {loading && <div className="text-lg">Caricamento...</div>}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          Errore: {error}
        </div>
      )}
      
      {data && !loading && (
        <div>
          <h2 className="text-xl font-bold mb-2">Risultati per {imdbId}:</h2>
          
          {data.error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              {data.error}
            </div>
          ) : (
            <div className="mt-4">
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[70vh] text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}