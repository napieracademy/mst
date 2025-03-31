"use client"

import { useState, useRef, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface EditableBioProps {
  initialBio: string
  onSave?: (newBio: string) => Promise<void>
}

export const EditableBio = ({ initialBio, onSave }: EditableBioProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Gestisce il doppio click per attivare la modalità di modifica
  const handleDoubleClick = () => {
    setIsEditing(true)
  }
  
  // Gestisce la cancellazione della modifica
  const handleCancel = () => {
    setBio(initialBio)
    setIsEditing(false)
  }
  
  // Gestisce il salvataggio della biografia
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      if (onSave) {
        await onSave(bio)
      } else {
        // Implementazione fittizia del salvataggio
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log("Bio salvata (simulato):", bio)
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error("Errore durante il salvataggio della biografia:", error)
    } finally {
      setIsSaving(false)
    }
  }
  
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
        <textarea
          ref={textareaRef}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[180px] bg-transparent text-gray-200 p-0 focus:outline-none resize-none"
          disabled={isSaving}
        />
        
        <div className="flex justify-end gap-4 mt-2">
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
        </div>
      </div>
    )
  }
  
  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className="text-gray-200 leading-relaxed cursor-text"
    >
      {bio || "Nessuna biografia disponibile."}
    </div>
  )
} 