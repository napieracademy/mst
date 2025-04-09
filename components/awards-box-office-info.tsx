"use client"

import { useState, useEffect } from "react"

interface AwardsAndBoxOfficeInfoProps {
  imdbId: string
}

export function AwardsAndBoxOfficeInfo({ imdbId }: AwardsAndBoxOfficeInfoProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOmdbData = async () => {
      if (!imdbId) return
      
      try {
        // Usa l'endpoint test-omdb-raw creato in precedenza
        const response = await fetch(`/api/test-omdb-raw?imdbId=${imdbId}`)
        
        if (!response.ok) {
          throw new Error(`Errore ${response.status}`)
        }
        
        const omdbData = await response.json()
        setData(omdbData)
      } catch (err) {
        console.error("Errore nel recupero dati OMDB:", err)
        setError(err instanceof Error ? err.message : "Errore sconosciuto")
      } finally {
        setLoading(false)
      }
    }
    
    fetchOmdbData()
  }, [imdbId])

  // Se stiamo caricando o abbiamo un errore, non mostrare nulla
  if (loading || error || !data) {
    return null
  }

  // Costruiamo le informazioni sul box office (per i film)
  const boxOfficeInfo = data.rawData?.BoxOffice && data.rawData.BoxOffice !== 'N/A' 
    ? ` Ha incassato ${data.rawData.BoxOffice}.` 
    : ''

  // Costruiamo le informazioni sui premi
  let awardsInfo = ''
  
  if (data.hasAwards) {
    const awardsAnalysis = data.awardsAnalysis
    
    if (awardsAnalysis.oscars > 0) {
      awardsInfo += ` Ha vinto ${awardsAnalysis.oscars} Oscar.`
    }
    
    if (awardsAnalysis.wins > 0) {
      awardsInfo += ` Ha ottenuto ${awardsAnalysis.wins} premi.`
    }
    
    if (awardsAnalysis.nominations > 0) {
      awardsInfo += ` Ha ricevuto ${awardsAnalysis.nominations} nomination.`
    }
  }

  if (!boxOfficeInfo && !awardsInfo) {
    return null
  }

  return (
    <span className="block mt-3 text-gray-300">
      {boxOfficeInfo} {awardsInfo}
    </span>
  )
}