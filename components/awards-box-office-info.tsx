"use client"

import { useState, useEffect } from "react"
import { DetailedAwards } from "@/components/detailed-awards"

interface AwardsAndBoxOfficeInfoProps {
  imdbId: string
  useDetailedView?: boolean
}

export function AwardsAndBoxOfficeInfo({ imdbId, useDetailedView = false }: AwardsAndBoxOfficeInfoProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOmdbData = async () => {
      if (!imdbId) return
      
      try {
        // Solo se non utilizziamo la vista dettagliata, recuperiamo i dati base dall'API OMDB
        if (!useDetailedView) {
          const response = await fetch(`/api/test-omdb-raw?imdbId=${imdbId}`)
          
          if (!response.ok) {
            throw new Error(`Errore ${response.status}`)
          }
          
          const omdbData = await response.json()
          setData(omdbData)
        }
      } catch (err) {
        console.error("Errore nel recupero dati OMDB:", err)
        setError(err instanceof Error ? err.message : "Errore sconosciuto")
      } finally {
        setLoading(false)
      }
    }
    
    fetchOmdbData()
  }, [imdbId, useDetailedView])

  // Se utilizziamo la vista dettagliata, renderizziamo direttamente quel componente
  if (useDetailedView) {
    return <DetailedAwards imdbId={imdbId} />
  }

  // Se stiamo caricando o abbiamo un errore, non mostrare nulla
  if (loading || error || !data) {
    return null
  }

  // Costruiamo un testo più scorrevole e naturale
  let infoText = ''
  
  // Informazioni sul box office (per i film)
  if (data.rawData?.BoxOffice && data.rawData.BoxOffice !== 'N/A') {
    infoText += `Il film ha incassato ${data.rawData.BoxOffice}.`
  }
  
  // Informazioni sui premi
  if (data.hasAwards) {
    const awardsAnalysis = data.awardsAnalysis
    const hasPrizes = awardsAnalysis.oscars > 0 || awardsAnalysis.wins > 0
    
    // Aggiungi spazio se abbiamo già informazioni sul box office
    if (infoText && hasPrizes) {
      infoText += ' '
    }
    
    // Oscar
    if (awardsAnalysis.oscars > 0) {
      infoText += `Ha vinto ${awardsAnalysis.oscars} Oscar.`
      
      // Aggiungi spazio se ci sono altri premi da menzionare
      if (awardsAnalysis.wins > 0) {
        infoText += ' '
      }
    }
    
    // Altri premi
    if (awardsAnalysis.wins > 0) {
      infoText += `Ha ottenuto ${awardsAnalysis.wins} premi`
      
      // Menzione delle nomination
      if (awardsAnalysis.nominations > 0) {
        infoText += ` e un totale di ${awardsAnalysis.nominations} nomination in vari festival.`
      } else {
        infoText += '.'
      }
    } else if (awardsAnalysis.nominations > 0) {
      // Solo nomination, senza premi
      if (infoText) {
        infoText += ' '
      }
      infoText += `Ha ricevuto ${awardsAnalysis.nominations} nomination in vari festival.`
    }
  }

  if (!infoText) {
    return null
  }

  return (
    <span className="block mt-3 text-gray-300">
      {infoText}
    </span>
  )
}