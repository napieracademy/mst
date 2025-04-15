"use client"

import { useState, useRef, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface EditableBioProps {
  initialBio: string
  onSave?: (newBio: string) => Promise<void>
  title?: string
  year?: string | number
  director?: string
}

export const EditableBio = ({ initialBio, onSave, title, year, director }: EditableBioProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bioTextRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    console.log("EditableBio - initialBio ricevuto:", initialBio);
  }, [initialBio]);
  
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
    console.log("Debug AI - Valori ricevuti:", { title, year, director })
    try {
      if (!title || !year || !director) {
        setAiError('Dati insufficienti per la generazione AI.')
        setAiLoading(false)
        return
      }
      const prompt = `Scrivi una sinossi breve, precisa e oggettiva (max 3 frasi) per il film intitolato '${title}', uscito nel ${year}, diretto da ${director}. Se non hai informazioni certe su questo film, rispondi chiaramente che non hai dati e non inventare nulla.`
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'gpt-4', temperature: 0.2 })
      })
      const data = await response.json()
      if (data.text && !/non ho dati|non ho informazioni|non conosco|non sono a conoscenza/i.test(data.text.toLowerCase())) {
        setBio(data.text.trim())
      } else {
        setAiError("L'AI non ha trovato informazioni affidabili su questo film.")
      }
    } catch (err) {
      setAiError('Errore nella generazione della sinossi con AI.')
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