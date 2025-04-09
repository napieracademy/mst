import { useState, useEffect } from 'react'

interface DetailedAwardsData {
  imdbId: string
  basicInfo: {
    title: string
    year: string
    type: string
    awards: string
    boxOffice: string
    awardsAnalysis: {
      hasAwards: boolean
      oscars: number
      nominations: number
      wins: number
      other: number
      summary: string
      rawText?: string
    }
  } | null
  detailedAwards: any
  categorizedAwards: {
    oscars: AwardItem[]
    goldenGlobes: AwardItem[]
    bafta: AwardItem[]
    cannes: AwardItem[]
    venice: AwardItem[]
    berlin: AwardItem[]
    other: AwardItem[]
  } | null
  combinedAnalysis: {
    totalAwards: number
    totalNominations: number
    oscarsWon: number
    oscarNominations: number
    goldenGlobesWon: number
    goldenGlobeNominations: number
    baftaWon: number
    baftaNominations: number
    majorFestivalAwards: number
  } | null
}

interface AwardItem {
  category: string
  isWinner: boolean
  year: string
  awardName: string
  description: string
  nominees: {
    name: string
    role: string
    isWinner: boolean
  }[]
}

export function useDetailedAwards(imdbId: string | null | undefined) {
  const [data, setData] = useState<DetailedAwardsData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Se non c'è un imdbId valido, non fare nulla
    if (!imdbId) {
      setData(null)
      setError(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/detailed-awards?imdbId=${imdbId}`)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Errore ${response.status}: ${errorText}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Errore nel recupero dei premi dettagliati:", err)
        setError(err instanceof Error ? err.message : "Errore sconosciuto")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [imdbId])

  return { data, loading, error }
}