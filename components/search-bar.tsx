"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X, Film, Tv } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { slugify, generateSlug } from "@/lib/utils"

interface AutocompleteResult {
  id: number
  title: string
  poster_path: string | null
  media_type: "movie" | "tv"
  year: string | null
  popularity: number
  director?: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AutocompleteResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Gestisce il click fuori dal dropdown per chiuderlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Effettua la ricerca quando l'utente digita
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search-autocomplete?query=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error("Failed to fetch results")

        const data = await response.json()
        setResults(data.results || [])
        setShowResults(true)
      } catch (error) {
        console.error("Error fetching autocomplete results:", error)
        setResults([])
        if (error instanceof Error && error.message.includes('ENOTFOUND')) {
          setNetworkError(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce per evitare troppe richieste
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        fetchResults()
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Gestisce la navigazione da tastiera
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return

    // Freccia giù
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    }
    // Freccia su
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    }
    // Invio
    else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0) {
        const selected = results[selectedIndex]
        if (selected.media_type === "movie") {
          // Usa il nuovo formato per i film
          const title = selected.title;
          const year = selected.year || "";
          const slug = `${slugify(title)}-${year}-${selected.id}`;
          router.push(`/film/${slug}`);
        } else {
          // Usa il nuovo formato per le serie TV
          const title = selected.title;
          const year = selected.year || "";
          const slug = `${slugify(title)}-${year}-${selected.id}`;
          router.push(`/serie/${slug}`);
        }
        setShowResults(false)
        setQuery("")
      } else {
        handleSearch(e)
      }
    }
    // Escape
    else if (e.key === "Escape") {
      setShowResults(false)
      inputRef.current?.blur()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setShowResults(false)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className="w-full max-w-xl mx-auto relative z-[99999]">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-opacity ${isFocused ? "text-red-500" : "text-gray-400"}`}
          >
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="search"
            className={`block w-full p-4 pl-12 pr-10 text-base bg-black/80 backdrop-blur-md border-2 rounded-full focus:outline-none transition-all duration-300 
              ${isFocused ? "border-red-500 shadow-lg shadow-red-500/20" : "border-gray-700 hover:border-gray-500"}`}
            placeholder="Cerca film e serie TV..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true)
              if (query.length >= 2) setShowResults(true)
            }}
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown dei risultati con animazione */}
      {showResults && (
        <div className="absolute mt-2 w-full bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-800 transition-all duration-300 animate-fadeIn z-[999999]">
          <ul className="max-h-[70vh] overflow-auto">
            {isLoading ? (
              <li className="p-6 flex justify-center">
                <div className="w-8 h-8 border-2 border-t-transparent border-red-500 rounded-full animate-spin"></div>
              </li>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <li key={`${result.media_type}-${result.id}`}>
                  <Link
                    href={result.media_type === "movie" 
                      ? `/film/${slugify(result.title)}-${result.year || ""}-${result.id}` 
                      : `/serie/${slugify(result.title)}-${result.year || ""}-${result.id}`}
                    className={`flex items-center p-4 hover:bg-gray-800/50 transition-colors ${
                      index === selectedIndex ? "bg-gray-800/70" : ""
                    }`}
                    onClick={() => {
                      setShowResults(false)
                      setQuery("")
                    }}
                  >
                    <div className="w-12 h-18 relative flex-shrink-0 mr-4 overflow-hidden rounded-md">
                      {result.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                          alt={result.title}
                          width={48}
                          height={72}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-12 h-18 bg-gray-800 rounded flex items-center justify-center">
                          {result.media_type === "movie" ? (
                            <Film className="w-6 h-6 text-gray-400" />
                          ) : (
                            <Tv className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{result.title}</p>
                      <div className="flex items-center mt-1 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            result.media_type === "movie"
                              ? "bg-red-900/50 text-red-200"
                              : "bg-blue-900/50 text-blue-200"
                          }`}
                        >
                          {result.media_type === "movie" ? "Film" : "Serie TV"}
                        </span>
                        {result.year && <span className="ml-2 text-gray-400">{result.year}</span>}
                        {result.director && <span className="ml-2 text-gray-400">• {result.director}</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : networkError ? (
              <li className="p-6 text-center text-gray-400">
                <p>Errore di connessione al servizio di ricerca</p>
                <p className="text-sm mt-1">Verifica la tua connessione internet e riprova</p>
              </li>
            ) : (
              <li className="p-6 text-center text-gray-400">Nessun risultato trovato per "{query}"</li>
            )}
          </ul>

          {results.length > 0 && (
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleSearch}
                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-full text-sm font-medium transition-colors"
              >
                Vedi tutti i risultati per "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

