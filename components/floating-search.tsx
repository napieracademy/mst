"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { slugify } from "@/lib/utils"
import { Portal } from "./ui/portal"

interface SearchResult {
  id: number
  title?: string
  name?: string
  media_type: "movie" | "tv" | "person"
  poster_path: string | null
  profile_path: string | null
  release_date?: string
  first_air_date?: string
}

export function FloatingSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Gestisce la chiusura del menu quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus sull'input quando si apre la ricerca
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Ricerca quando la query cambia
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearch = async () => {
    if (query.length < 2) return;
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.slice(0, 6)) // Limita a 6 risultati
    } catch (error) {
      console.error("Errore durante la ricerca:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = () => {
    setIsOpen(prev => !prev)
    if (!isOpen) {
      setQuery("")
      setResults([])
    }
  }

  const getMediaType = (type: string) => {
    switch (type) {
      case "movie":
        return "Film"
      case "tv":
        return "Serie TV"
      case "person":
        return "Persona"
      default:
        return type
    }
  }

  const getImagePath = (result: SearchResult) => {
    if (result.media_type === "person" && result.profile_path) {
      return `https://image.tmdb.org/t/p/w92${result.profile_path}`
    } else if (result.poster_path) {
      return `https://image.tmdb.org/t/p/w92${result.poster_path}`
    }
    return "/placeholder.svg?height=138&width=92"
  }

  const getHref = (result: SearchResult) => {
    // Per persone, manteniamo il path originale
    if (result.media_type === "person") {
      return `/person/${result.id}`
    } 
    
    // Per film, usiamo il nuovo formato con slug
    else if (result.media_type === "movie") {
      const title = result.title || "Film";
      const year = result.release_date ? result.release_date.split('-')[0] : "";
      const slug = `${slugify(title)}-${year}-${result.id}`;
      return `/film/${slug}`;
    } 
    
    // Per serie TV, usiamo il nuovo formato con slug
    else {
      const title = result.name || "Serie";
      const year = result.first_air_date ? result.first_air_date.split('-')[0] : "";
      const slug = `${slugify(title)}-${year}-${result.id}`;
      return `/serie/${slug}`;
    }
  }

  return (
    <Portal zIndex={8000} id="floating-search-portal">
      <div ref={searchRef} className="fixed bottom-6 right-6">
        {/* Pulsante flottante */}
      <motion.button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg ${isOpen ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Search className="w-6 h-6 text-white" />
      </motion.button>

      {/* Barra di ricerca espandibile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, width: 56 }}
            animate={{ opacity: 1, y: 0, width: 300 }}
            exit={{ opacity: 0, y: 20, width: 56 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute bottom-0 right-0"
          >
            <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              {/* Input di ricerca */}
              <div className="flex items-center p-4 border-b border-gray-800">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca film, serie TV o persone..."
                  className="flex-1 bg-transparent text-white border-none outline-none placeholder-gray-500"
                />
                <button 
                  onClick={handleToggle} 
                  className="ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Area risultati (verso l'alto) */}
              <div className="absolute bottom-full right-0 mb-2 w-full">
                <AnimatePresence>
                  {query.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden max-h-[80vh] overflow-y-auto"
                    >
                      {isLoading ? (
                        <div className="p-4 text-center text-gray-400">
                          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                          <p>Ricerca in corso...</p>
                        </div>
                      ) : results.length > 0 ? (
                        <div className="p-2">
                          {results.map((result) => (
                            <Link
                              key={`${result.media_type}-${result.id}`}
                              href={getHref(result)}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <div className="w-12 h-18 relative flex-shrink-0 rounded overflow-hidden">
                                <Image
                                  src={getImagePath(result)}
                                  alt={result.title || result.name || ""}
                                  width={48}
                                  height={72}
                                  className="object-cover"
                                />
                              </div>
                              <div className="ml-3 flex-1 overflow-hidden">
                                <p className="text-white font-medium truncate">
                                  {result.title || result.name}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {getMediaType(result.media_type)}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : query.length >= 2 ? (
                        <div className="p-4 text-center text-gray-400">
                          Nessun risultato trovato
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </Portal>
  )
} 