"use client"

import { useState, useRef, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface EditableBioProps {
  initialBio: string
  onSave?: (newBio: string) => Promise<void>
  title?: string
  year?: string | number
  director?: string
  tmdbId?: number | string
}

export const EditableBio = ({ initialBio, onSave, title, year, director, tmdbId }: EditableBioProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bioTextRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    console.log("EditableBio - initialBio ricevuto:", initialBio);
    // Verifica tmdbId
    if (tmdbId !== undefined) {
      console.log("EditableBio - tmdbId ricevuto:", tmdbId, "tipo:", typeof tmdbId);
    }
  }, [initialBio, tmdbId]);
  
  const handleDoubleClick = () => {
    setIsEditing(true)
  }
  
  const handleCancel = () => {
    setBio(initialBio)
    setIsEditing(false)
  }
  
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      console.log("Iniziando il salvataggio della biografia...");
      
      if (onSave) {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout durante il salvataggio")), 10000)
        );
        
        await Promise.race([
          onSave(bio),
          timeoutPromise
        ]);
        
        console.log("Salvataggio completato con successo");
      } else {
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log("Bio salvata (simulato):", bio)
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error("Errore durante il salvataggio della biografia:", error)
      alert('Si è verificato un problema durante il salvataggio. La modifica potrebbe non essere stata salvata.')
      setIsEditing(false)
    } finally {
      setIsSaving(false)
      console.log("Stato di salvataggio resettato");
    }
  }
  
  const handleAIGenerate = async () => {
    setAiError(null)
    setAiLoading(true)
    console.log("[CLIENT-DEBUG] Inizio generazione AI", { title, year, director, tmdbId })
    
    try {
      // Usa il tmdbId passato come prop se disponibile
      let movieTmdbId = tmdbId || null
      
      // Se non disponibile come prop, prova a estrarlo dall'URL
      if (!movieTmdbId && typeof window !== 'undefined') {
        const urlParts = window.location.pathname.split('/')
        const idIndex = urlParts.findIndex(part => part === 'movie') + 1
        if (idIndex > 0 && idIndex < urlParts.length) {
          movieTmdbId = parseInt(urlParts[idIndex])
          if (isNaN(Number(movieTmdbId))) movieTmdbId = null
        }
      }
      
      console.log("[CLIENT-DEBUG] TMDB ID finale:", movieTmdbId)
      
      // Utilizza il prompt semplificato e lascia che il backend recuperi i metadati
      const basePrompt = "Scrivi una sinossi breve, precisa e oggettiva per il film."
      
      console.log("[CLIENT-DEBUG] Invio richiesta a /api/generate-text")
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: basePrompt, 
          model: 'gpt-4', 
          temperature: 0.2,
          tmdb_id: movieTmdbId
        })
      })
      
      console.log("[CLIENT-DEBUG] Risposta ricevuta:", { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("[CLIENT-ERROR] Errore API:", errorText)
        throw new Error(`Errore API: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("[CLIENT-DEBUG] Dati ricevuti:", { 
        hasText: !!data.text,
        textLength: data.text?.length,
        error: data.error
      })
      
      if (data.error) {
        console.error("[CLIENT-ERROR] Errore ricevuto dall'API:", data.error)
        throw new Error(data.error)
      }
      
      if (data.text && !/non ho dati|non ho informazioni|non conosco|non sono a conoscenza/i.test(data.text.toLowerCase())) {
        console.log("[CLIENT-DEBUG] Aggiornamento sinossi con testo generato")
        setBio(data.text.trim())
      } else {
        console.warn("[CLIENT-WARN] L'AI non ha trovato informazioni sul film")
        setAiError("L'AI non ha trovato informazioni affidabili su questo film.")
      }
    } catch (err) {
      console.error("[CLIENT-ERROR] Errore completo:", err)
      setAiError('Errore nella generazione della sinossi con AI: ' + (err instanceof Error ? err.message : 'Errore sconosciuto'))
    } finally {
      setAiLoading(false)
    }
  }
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])
  
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
        <textarea
          ref={textareaRef}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[180px] bg-transparent text-gray-200 p-0 focus:outline-none resize-none"
          disabled={isSaving}
        />
        
        <div className="flex justify-end gap-4 mt-2 items-center">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-white opacity-70 hover:opacity-100 transition-opacity"
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Annulla</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-white opacity-70 hover:opacity-100 transition-opacity"
            disabled={isSaving}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{isSaving ? "Salvataggio..." : "Salva"}</span>
          </button>
          
          <button
            type="button"
            onClick={handleAIGenerate}
            className="flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 rounded px-2 py-1 text-sm disabled:opacity-50"
            disabled={aiLoading || isSaving}
            title="Genera sinossi con AI"
          >
            <span role="img" aria-label="AI">🪄</span>
            {aiLoading ? 'Generazione...' : 'AI'}
          </button>
          
          {aiError && <span className="text-red-500 text-xs ml-2">{aiError}</span>}
        </div>
      </div>
    )
  }
  
  return (
    <div 
      ref={bioTextRef}
      onDoubleClick={handleDoubleClick}
      className="text-gray-200 leading-relaxed cursor-text bio-text"
    >
      {bio || "Nessuna biografia disponibile."}
    </div>
  )
}