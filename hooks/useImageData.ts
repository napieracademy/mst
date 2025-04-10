import { useState, useEffect } from "react"

export type ImageType = "movie" | "person" | "tv"
export type ImageData = {
  backdrops?: { file_path: string }[]
  posters?: { file_path: string }[]
  profiles?: { file_path: string }[]
}

export function useImageData(movieId: string, type: ImageType, initialData?: ImageData) {
  const [images, setImages] = useState<{ file_path: string }[]>([])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      try {
        const extractedImages = type === "person"
          ? initialData.profiles || []
          : [...(initialData.backdrops || []), ...(initialData.posters || [])]
        
        if (!Array.isArray(extractedImages)) {
          throw new Error("Formato delle immagini non valido")
        }
        
        setImages(extractedImages)
        setLoading(false)
      } catch (error) {
        console.error("Errore nell'elaborazione delle immagini:", error)
        setError("Errore nell'elaborazione delle immagini")
        setImages([])
        setLoading(false)
      }
      return
    }

    const fetchImages = async () => {
      try {
        setLoading(true)
        setError(null)

        const endpoint = `/api/tmdb-test/images?type=${type}&id=${movieId}`
        console.log(`Fetching images from endpoint: ${endpoint}`)
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Errore nel recupero delle immagini: ${response.statusText}`)
        }
        
        // Preveniamo errori di parsing JSON intercettando il testo della risposta
        const responseText = await response.text()
        
        // Verifichiamo se la risposta è un HTML invece di un JSON
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          throw new Error('Risposta non valida: ricevuto HTML invece di JSON')
        }
        
        // Proviamo a fare il parsing manuale del JSON
        let data
        try {
          data = JSON.parse(responseText)
          console.log("Dati immagini ricevuti:", data)
        } catch (parseError) {
          console.error("Errore nel parsing JSON:", parseError, "Risposta originale:", responseText.substring(0, 200))
          throw new Error(`Errore nel parsing JSON: ${parseError.message}`)
        }

        if (!data || typeof data !== 'object') {
          throw new Error("Formato risposta non valido")
        }

        // Estraiamo le immagini appropriate in base al tipo
        let extractedImages = []
        
        if (type === "person" && Array.isArray(data.profiles)) {
          extractedImages = data.profiles
        } else {
          // Per film e serie TV, combiniamo backdrops e posters
          const backdrops = Array.isArray(data.backdrops) ? data.backdrops : []
          const posters = Array.isArray(data.posters) ? data.posters : []
          extractedImages = [...backdrops, ...posters]
        }
        
        if (!extractedImages.length) {
          console.warn("Nessuna immagine trovata nei dati:", data)
        }

        console.log(`Immagini estratte: ${extractedImages.length}`)
        setImages(extractedImages)
      } catch (error) {
        console.error("Errore nel recupero delle immagini:", error)
        
        // Messaggio di errore più dettagliato e utente-friendly
        let errorMessage = "Errore sconosciuto nel caricamento delle immagini"
        
        if (error instanceof Error) {
          if (error.message.includes("HTML invece di JSON") || error.message.includes("parsing JSON")) {
            errorMessage = "Errore di comunicazione con il server. Per favore, riprova più tardi."
          } else {
            errorMessage = error.message
          }
        }
        
        setError(errorMessage)
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [movieId, type, initialData])

  return { images, loading, error }
}