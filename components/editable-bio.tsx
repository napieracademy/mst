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

// Componente overlay per mostrare i parametri di generazione AI
interface AIOverlayProps {
  prompt: string
  model: string
  temperature: number
  tmdbId: number | string | null
  title?: string
  year?: string | number
  director?: string
  finalPrompt?: string
  maxTokens?: number
  originalText?: string
  generatedText?: string
  onClose: () => void
}

const AIOverlay = ({ 
  prompt, 
  model, 
  temperature, 
  tmdbId, 
  title, 
  year, 
  director, 
  finalPrompt, 
  maxTokens,
  originalText,
  generatedText,
  onClose
}: AIOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg w-full max-w-5xl p-4">
        <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className={`${!generatedText ? "animate-pulse" : ""} text-blue-400 mr-2`}>
              {!generatedText ? "⚡" : "✓"}
            </span>
            {!generatedText ? "Generazione AI in corso" : "Generazione completata"}
          </h3>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-slate-400">Modello:</span>
            <span className="text-xs text-white bg-blue-900 px-2 py-0.5 rounded">{model}</span>
            <span className="text-xs text-slate-400 ml-2">Temp:</span>
            <span className="text-xs text-white bg-blue-900 px-2 py-0.5 rounded">{temperature}</span>
            
            <button 
              onClick={onClose}
              className="ml-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
              title="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prima colonna - Metadati */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800 p-2 rounded text-xs">
                <span className="text-blue-400 block mb-1">Film</span>
                <span className="text-white font-medium">{title || 'Non specificato'}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded text-xs">
                <span className="text-blue-400 block mb-1">TMDB ID</span>
                <span className="text-white font-medium">{tmdbId || 'Non specificato'}</span>
              </div>
              {director && (
                <div className="bg-slate-800 p-2 rounded text-xs">
                  <span className="text-blue-400 block mb-1">Regista</span>
                  <span className="text-white font-medium">{director}</span>
                </div>
              )}
              {year && (
                <div className="bg-slate-800 p-2 rounded text-xs">
                  <span className="text-blue-400 block mb-1">Anno</span>
                  <span className="text-white font-medium">{year}</span>
                </div>
              )}
            </div>
            
            <div className="bg-slate-800 p-2 rounded text-xs">
              <span className="text-blue-400 block mb-1">Prompt base</span>
              <span className="text-white break-words">{prompt}</span>
            </div>
            
            {finalPrompt && finalPrompt !== prompt && (
              <div className="bg-slate-800 p-2 rounded text-xs overflow-auto max-h-20">
                <span className="text-blue-400 block mb-1">Prompt arricchito</span>
                <span className="text-white break-words">{finalPrompt}</span>
              </div>
            )}
          </div>
          
          {/* Seconda colonna - Prima/Dopo */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-blue-400">Stato generazione</span>
              {!generatedText ? (
                <span className="animate-pulse text-blue-400 text-xs">
                  Elaborazione in corso...
                </span>
              ) : (
                <span className="text-green-400 text-xs">
                  Completata
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {originalText && (
                <div className="bg-slate-800 p-2 rounded text-xs">
                  <span className="text-blue-400 block mb-1">Testo originale</span>
                  <span className="text-slate-300 break-words">{originalText || 'Nessun testo originale'}</span>
                </div>
              )}
              
              {generatedText ? (
                <div className="bg-slate-800 p-2 rounded text-xs">
                  <span className="text-blue-400 block mb-1">Testo generato</span>
                  <span className="text-white break-words">{generatedText}</span>
                </div>
              ) : (
                <div className="bg-slate-800 p-2 rounded text-xs flex items-center justify-center h-24">
                  <div className="animate-pulse text-blue-400">
                    Generazione in corso...
                  </div>
                </div>
              )}
            </div>

            {/* Aggiungo un pulsante di chiusura in fondo */}
            {generatedText && (
              <div className="flex justify-end mt-2">
                <button 
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded flex items-center space-x-1"
                >
                  <span>Chiudi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EditableBio = ({ initialBio, onSave, title, year, director, tmdbId }: EditableBioProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiParams, setAiParams] = useState<AIOverlayProps | null>(null)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [showAIOverlay, setShowAIOverlay] = useState(false)
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
  
  const closeAIOverlay = () => {
    setShowAIOverlay(false);
    setAiParams(null);
    setGeneratedText(null);
  };
  
  const handleAIGenerate = async () => {
    setAiError(null)
    setAiLoading(true)
    setGeneratedText(null)
    setShowAIOverlay(true)
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
      const model = 'gpt-4'
      const temperature = 0.2
      const maxTokens = 1000
      
      // Salva i parametri iniziali per mostrarli nell'overlay
      setAiParams({
        prompt: basePrompt,
        model: model,
        temperature: temperature,
        tmdbId: movieTmdbId,
        title,
        year,
        director,
        maxTokens,
        originalText: bio,
        onClose: closeAIOverlay
      })
      
      console.log("[CLIENT-DEBUG] Invio richiesta a /api/generate-text")
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: basePrompt, 
          model: model, 
          temperature: temperature,
          maxTokens: maxTokens,
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
        
        // Gestione specifica dell'errore 401
        if (response.status === 401) {
          console.error("[CLIENT-ERROR] Errore di autenticazione 401 - Chiave API OpenAI non valida")
          setAiError("Errore di autenticazione con il servizio AI. Contatta l'amministratore.")
          return
        }
        
        throw new Error(`Errore API: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("[CLIENT-DEBUG] Dati ricevuti:", { 
        hasText: !!data.text,
        textLength: data.text?.length,
        error: data.error,
        metadata: data.metadata
      })
      
      if (data.text) {
        setGeneratedText(data.text.trim())
      }
      
      // Aggiorna l'overlay con i dati restituiti dall'API
      if (data.metadata) {
        setAiParams(prevParams => ({
          ...prevParams!,
          finalPrompt: data.metadata.finalPrompt,
          model: data.metadata.model,
          temperature: data.metadata.temperature,
          maxTokens: data.metadata.maxTokens,
          generatedText: data.text?.trim()
        }))
      }
      
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
      // La modale rimane visibile finché l'utente non la chiude
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
        {showAIOverlay && aiParams && <AIOverlay {...aiParams} />}
        
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