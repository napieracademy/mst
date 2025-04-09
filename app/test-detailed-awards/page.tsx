"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DetailedAwards } from "@/components/detailed-awards"

export default function TestDetailedAwardsPage() {
  const [imdbId, setImdbId] = useState("tt0111161") // The Shawshank Redemption
  const [currentImdbId, setCurrentImdbId] = useState(imdbId)

  const testMovies = [
    { id: "tt0111161", title: "The Shawshank Redemption" },
    { id: "tt0068646", title: "The Godfather" },
    { id: "tt0468569", title: "The Dark Knight" },
    { id: "tt0109830", title: "Forrest Gump" },
    { id: "tt0816692", title: "Interstellar" },
    { id: "tt0075148", title: "Rocky" },
    { id: "tt0120338", title: "Titanic" },
    { id: "tt0120815", title: "Saving Private Ryan" }
  ]

  const handleSearch = () => {
    setCurrentImdbId(imdbId)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test Detailed Awards API</h1>
      
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <Input
            type="text"
            value={imdbId}
            onChange={(e) => setImdbId(e.target.value)}
            placeholder="Inserisci IMDb ID (es. tt0111161)"
            className="max-w-md"
          />
          <Button onClick={handleSearch}>Cerca</Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {testMovies.map((movie) => (
            <Button
              key={movie.id}
              variant={currentImdbId === movie.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setImdbId(movie.id)
                setCurrentImdbId(movie.id)
              }}
            >
              {movie.title}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-gray-900">
        <h2 className="text-xl font-semibold mb-4">Risultati per IMDb ID: {currentImdbId}</h2>
        <DetailedAwards imdbId={currentImdbId} />
      </div>
    </div>
  )
}