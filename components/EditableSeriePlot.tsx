"use client"

import { useState, useRef, useEffect } from "react"
import { CheckCircle, X, Wand2 } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase-client"

interface EditableSeriePlotProps {
  initialPlot: string
  serieTitle?: string
  serieMeta?: {
    id?: number
    releaseDate?: string
    creators?: string[] | string
    cast?: string[] | string
    genres?: string[] | string
    numberOfSeasons?: number
    numberOfEpisodes?: number
    networks?: string[] | string
    voteAverage?: number
  }
  onSave?: (newPlot: string) => Promise<void>
}

export function EditableSeriePlot({ initialPlot, serieTitle, serieMeta, onSave }: EditableSeriePlotProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [plot, setPlot] = useState(initialPlot)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Gestisce il doppio click per attivare la modalità di modifica
  const handleDoubleClick = () => {
    setIsEditing(true)
  }
  
  // Gestisce la cancellazione della modifica
  const handleCancel = () => {
    setPlot(initialPlot)
    setIsEditing(false)
    setError(null)
  }
  
  // Gestisce il salvataggio della trama
  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    
    try {
      if (onSave) {
        await onSave(plot)
      } else {
        // Crea il client Supabase
        const supabase = createSupabaseClient()
        
        // Prepara i dati per l'aggiornamento
        const slug = serieMeta?.id ? `${serieTitle?.toLowerCase().replace(/\s+/g, '-')}-${serieMeta.id}` : undefined
        
        if (!slug) {
          throw new Error('Impossibile generare lo slug')
        }
        
        // Crea l'excerpt per meta description
        const excerpt = plot && plot.length > 250 ? plot.substring(0, 250) + '...' : plot
        
        console.log(`Salvataggio trama per: ${serieTitle} (slug: ${slug})`)
        
        // Aggiorna direttamente su Supabase
        const { error: supabaseError } = await supabase
          .from('generated_pages')
          .update({ 
            biography: plot, // Usiamo lo stesso campo 'biography' per le trame
            excerpt: excerpt,
            last_visited_at: new Date().toISOString()
          })
          .eq('slug', slug)
          .eq('page_type', 'tv')
        
        if (supabaseError) {
          console.error("Errore Supabase:", supabaseError)
          throw new Error(supabaseError.message)
        }
        
        console.log("Trama serie TV salvata con successo:", serieTitle)
      }
      
      setIsEditing(false)
    } catch (error: any) {
      console.error("Errore durante il salvataggio della trama della serie TV:", error)
      setError("Errore durante il salvataggio. Riprova più tardi.")
    } finally {
      setIsSaving(false)
    }
  }

  // Gestisce la generazione della trama con OpenAI (bacchetta magica)
  const handleMagicGeneration = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Raccogliamo tutti i metadati disponibili
      const response = await fetch('/api/genera-biografia-magica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: serieTitle,
          id: serieMeta?.id,
          contentType: 'serie',
          currentContent: plot, // Passa la trama attuale per migliorarla
          releaseDate: serieMeta?.releaseDate,
          creators: serieMeta?.creators,
          cast: serieMeta?.cast,
          genres: serieMeta?.genres,
          numberOfSeasons: serieMeta?.numberOfSeasons,
          numberOfEpisodes: serieMeta?.numberOfEpisodes,
          networks: serieMeta?.networks,
          voteAverage: serieMeta?.voteAverage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione della trama');
      }

      const data = await response.json();
      setPlot(data.plot);
      
      // Se non eravamo già in modalità editing, entriamo in tale modalità per
      // permettere all'utente di rivedere e salvare la trama generata
      if (!isEditing) {
        setIsEditing(true);
      }

    } catch (error: any) {
      console.error("Errore durante la generazione magica:", error);
      setError(error.message || "Errore durante la generazione. Riprova più tardi.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Focus automatico sul textarea quando si entra in modalità editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])
  
  // Supporto per salvare con Ctrl+Enter o Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  if (isEditing) {
    return (
      <div className="relative">
        {error && (
          <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[180px] bg-transparent text-gray-200 p-0 focus:outline-none resize-none"
          disabled={isSaving || isGenerating}
          placeholder={`Inserisci la trama${serieTitle ? ` di "${serieTitle}"` : ''}...`}
        />
        
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={handleMagicGeneration}
            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 transition-opacity"
            disabled={isSaving || isGenerating}
          >
            <Wand2 className="w-4 h-4" />
            <span className="text-sm">{isGenerating ? "Generazione..." : "Bacchetta magica"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-white opacity-70 hover:opacity-100 transition-opacity"
              disabled={isSaving || isGenerating}
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Annulla</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-white opacity-70 hover:opacity-100 transition-opacity"
              disabled={isSaving || isGenerating}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{isSaving ? "Salvataggio..." : "Salva"}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative">
      <div 
        onDoubleClick={handleDoubleClick}
        className="text-gray-200 leading-relaxed cursor-text"
      >
        {plot || `Nessuna trama${serieTitle ? ` per "${serieTitle}"` : ''} disponibile. Doppio click per aggiungere.`}
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleDoubleClick}
          className="flex items-center gap-1 text-white opacity-70 hover:opacity-100 transition-opacity mr-2"
        >
          <span className="text-sm">Modifica</span>
        </button>

        <button
          onClick={handleMagicGeneration}
          className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 transition-opacity"
          disabled={isGenerating}
        >
          <Wand2 className="w-4 h-4" />
          <span className="text-sm">{isGenerating ? "Generazione..." : "Bacchetta magica"}</span>
        </button>
      </div>
    </div>
  )
} 