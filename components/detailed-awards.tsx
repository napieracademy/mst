"use client"

import { useState } from "react"
import { useDetailedAwards } from "@/hooks/useDetailedAwards"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface DetailedAwardsProps {
  imdbId: string
  showInitialSummary?: boolean
}

export function DetailedAwards({ imdbId, showInitialSummary = true }: DetailedAwardsProps) {
  const { data, loading, error } = useDetailedAwards(imdbId)
  const [showDetails, setShowDetails] = useState(false)

  // Mostra il caricamento
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  // Gestione errori
  if (error || !data) {
    if (showInitialSummary && data?.basicInfo) {
      // Mostra almeno i dati base se disponibili
      return (
        <span className="block mt-3 text-gray-300">
          {data.basicInfo.awards}
        </span>
      )
    }
    return null
  }

  // Se abbiamo solo informazioni di base e non vogliamo mostrarle, nascondi
  if (!showDetails && !showInitialSummary) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDetails(true)}
        className="mt-2"
      >
        Mostra premi dettagliati
      </Button>
    )
  }

  // Mostra il sommario iniziale se richiesto e non sono stati cliccati i dettagli
  if (!showDetails) {
    // Se abbiamo solo informazioni di base
    if (!data.detailedAwards && data.basicInfo) {
      return (
        <span className="block mt-3 text-gray-300">
          {data.basicInfo.awards}
        </span>
      )
    }

    // Se abbiamo anche informazioni dettagliate, mostra un sommario e il pulsante
    const { combinedAnalysis } = data
    if (combinedAnalysis) {
      return (
        <div className="mt-3">
          <div className="text-gray-300">
            {combinedAnalysis.oscarsWon > 0 && (
              <span className="mr-2">
                <Badge variant="outline" className="mr-1">Oscar</Badge> 
                {combinedAnalysis.oscarsWon} vinti, {combinedAnalysis.oscarNominations} nomination
              </span>
            )}
            
            {combinedAnalysis.goldenGlobesWon > 0 && (
              <span className="mr-2">
                <Badge variant="outline" className="mr-1">Golden Globe</Badge> 
                {combinedAnalysis.goldenGlobesWon} vinti, {combinedAnalysis.goldenGlobeNominations} nomination
              </span>
            )}
            
            {combinedAnalysis.baftaWon > 0 && (
              <span className="mr-2">
                <Badge variant="outline" className="mr-1">BAFTA</Badge> 
                {combinedAnalysis.baftaWon} vinti, {combinedAnalysis.baftaNominations} nomination
              </span>
            )}
            
            {combinedAnalysis.majorFestivalAwards > 0 && (
              <span className="mr-2">
                <Badge variant="outline" className="mr-1">Festival</Badge> 
                {combinedAnalysis.majorFestivalAwards} premi principali
              </span>
            )}
            
            <span>
              Totale: {combinedAnalysis.totalAwards} premi, {combinedAnalysis.totalNominations} nomination
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetails(true)}
            className="mt-2"
          >
            Mostra dettagli completi
          </Button>
        </div>
      )
    }
    
    return null
  }

  // Mostra i dettagli completi
  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-lg font-semibold">Premi e riconoscimenti</h3>
      
      {data.combinedAnalysis && (
        <div className="text-sm text-gray-300 mb-3">
          <p>
            Totale: {data.combinedAnalysis.totalAwards} premi e {data.combinedAnalysis.totalNominations} nomination
          </p>
        </div>
      )}
      
      <Accordion type="single" collapsible className="w-full">
        {/* Sezione Oscar */}
        {data.categorizedAwards?.oscars && data.categorizedAwards.oscars.length > 0 && (
          <AccordionItem value="oscars">
            <AccordionTrigger>
              <span className="flex items-center">
                Oscar 
                <Badge className="ml-2" variant="secondary">
                  {data.categorizedAwards.oscars.filter(a => a.isWinner).length} vinti
                </Badge>
                <Badge className="ml-2" variant="outline">
                  {data.categorizedAwards.oscars.filter(a => !a.isWinner).length} nomination
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {data.categorizedAwards.oscars.map((award, index) => (
                  <div key={index} className="border-l-2 pl-3 py-1 text-sm">
                    <div className="flex items-center">
                      <span className="font-semibold">{award.category}</span>
                      {award.isWinner && <Badge className="ml-2">Vinto</Badge>}
                      <span className="ml-auto">{award.year}</span>
                    </div>
                    {award.description && <p className="text-gray-400">{award.description}</p>}
                    {award.nominees.length > 0 && (
                      <div className="mt-1">
                        {award.nominees.map((nom, i) => (
                          <div key={i} className="text-xs text-gray-400">
                            {nom.name} {nom.role && `- ${nom.role}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        {/* Sezione Golden Globes */}
        {data.categorizedAwards?.goldenGlobes && data.categorizedAwards.goldenGlobes.length > 0 && (
          <AccordionItem value="goldenglobes">
            <AccordionTrigger>
              <span className="flex items-center">
                Golden Globes
                <Badge className="ml-2" variant="secondary">
                  {data.categorizedAwards.goldenGlobes.filter(a => a.isWinner).length} vinti
                </Badge>
                <Badge className="ml-2" variant="outline">
                  {data.categorizedAwards.goldenGlobes.filter(a => !a.isWinner).length} nomination
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {data.categorizedAwards.goldenGlobes.map((award, index) => (
                  <div key={index} className="border-l-2 pl-3 py-1 text-sm">
                    <div className="flex items-center">
                      <span className="font-semibold">{award.category}</span>
                      {award.isWinner && <Badge className="ml-2">Vinto</Badge>}
                      <span className="ml-auto">{award.year}</span>
                    </div>
                    {award.description && <p className="text-gray-400">{award.description}</p>}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        {/* Sezione BAFTA */}
        {data.categorizedAwards?.bafta && data.categorizedAwards.bafta.length > 0 && (
          <AccordionItem value="bafta">
            <AccordionTrigger>
              <span className="flex items-center">
                BAFTA
                <Badge className="ml-2" variant="secondary">
                  {data.categorizedAwards.bafta.filter(a => a.isWinner).length} vinti
                </Badge>
                <Badge className="ml-2" variant="outline">
                  {data.categorizedAwards.bafta.filter(a => !a.isWinner).length} nomination
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {data.categorizedAwards.bafta.map((award, index) => (
                  <div key={index} className="border-l-2 pl-3 py-1 text-sm">
                    <div className="flex items-center">
                      <span className="font-semibold">{award.category}</span>
                      {award.isWinner && <Badge className="ml-2">Vinto</Badge>}
                      <span className="ml-auto">{award.year}</span>
                    </div>
                    {award.description && <p className="text-gray-400">{award.description}</p>}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        {/* Sezione Festival principali */}
        {(data.categorizedAwards?.cannes.length || data.categorizedAwards?.venice.length || data.categorizedAwards?.berlin.length) ? (
          <AccordionItem value="festivals">
            <AccordionTrigger>
              <span className="flex items-center">
                Festival Internazionali
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {/* Cannes */}
              {data.categorizedAwards?.cannes.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold mb-2">Festival di Cannes</h4>
                  {data.categorizedAwards.cannes.map((award, index) => (
                    <div key={index} className="border-l-2 pl-3 py-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-semibold">{award.category}</span>
                        {award.isWinner && <Badge className="ml-2">Vinto</Badge>}
                        <span className="ml-auto">{award.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Venezia */}
              {data.categorizedAwards?.venice.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold mb-2">Festival di Venezia</h4>
                  {data.categorizedAwards.venice.map((award, index) => (
                    <div key={index} className="border-l-2 pl-3 py-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-semibold">{award.category}</span>
                        {award.isWinner && <Badge className="ml-2">Vinto</Badge>}
                        <span className="ml-auto">{award.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Berlino */}
              {data.categorizedAwards?.berlin.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Festival di Berlino</h4>
                  {data.categorizedAwards.berlin.map((award, index) => (
                    <div key={index} className="border-l-2 pl-3 py-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-semibold">{award.category}</span>
                        {award.isWinner && <Badge className="ml-2">Vinto</Badge>}
                        <span className="ml-auto">{award.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ) : null}
        
        {/* Altri premi */}
        {data.categorizedAwards?.other && data.categorizedAwards.other.length > 0 && (
          <AccordionItem value="other">
            <AccordionTrigger>
              <span className="flex items-center">
                Altri premi
                <Badge className="ml-2" variant="outline">
                  {data.categorizedAwards.other.length} in totale
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {/* Raggruppa per tipologia di premio */}
              {Object.entries(
                data.categorizedAwards.other.reduce((acc, award) => {
                  const key = award.awardName || 'Altro'
                  if (!acc[key]) acc[key] = []
                  acc[key].push(award)
                  return acc
                }, {} as Record<string, any[]>)
              ).map(([awardName, awards]) => (
                <div key={awardName} className="mb-3">
                  <h4 className="font-semibold mb-2">{awardName}</h4>
                  {awards.map((award, index) => (
                    <div key={index} className="border-l-2 pl-3 py-1 text-sm">
                      <div className="flex items-center">
                        <span className="font-semibold">{award.category}</span>
                        {award.isWinner && <Badge className="ml-2">Vinto</Badge>}
                        <span className="ml-auto">{award.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      
      {/* Pulsante per nascondere i dettagli */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDetails(false)}
        className="mt-2"
      >
        Nascondi dettagli
      </Button>
    </div>
  )
}