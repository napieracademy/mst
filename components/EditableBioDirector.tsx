"use client"

import { useState, useRef, useEffect } from "react"
import { CheckCircle, X, Wand2 } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase-client"

interface EditableBioDirectorProps {
  initialBio: string
  directorName?: string
  directorMeta?: {
    id?: number
    birthDate?: string
    birthPlace?: string
    deathDate?: string
    knownFor?: string[] | string
    popularity?: number
    imdbId?: string
    profilePath?: string
  }
  onSave?: (newBio: string) => Promise<void>
}

export function EditableBioDirector({ initialBio, directorName, directorMeta, onSave }: EditableBioDirectorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(initialBio)
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
    setBio(initialBio)
    setIsEditing(false)
    setError(null)
  }
  
  // Gestisce il salvataggio della biografia
  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    
    try {
      if (onSave) {
        await onSave(bio)
      } else {
        // Crea il client Supabase
        const supabase = createSupabaseClient()
        
        // Prepara i dati per l'aggiornamento
        const slug = directorMeta?.id ? `${directorName?.toLowerCase().replace(/\s+/g, '-')}-${directorMeta.id}` : undefined
        
        if (!slug) {
          throw new Error('Impossibile generare lo slug')
        }
        
        // Crea l'excerpt per meta description
        const excerpt = bio && bio.length > 250 ? bio.substring(0, 250) + '...' : bio
        
        console.log(`Salvataggio biografia per: ${directorName} (slug: ${slug})`)
        
        // Approccio super semplificato: inserisci direttamente, gestisci i conflitti
        try {
          // 1. Prima inserisci o aggiorna l'entità principale
          const { data: entityData, error: entityError } = await supabase
            .from('entities')
            .upsert({
              tmdb_id: directorMeta?.id || 0,
              entity_type: 'person',
              slug: slug,
              title: directorName || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_visited_at: new Date().toISOString(),
              visit_count: 1
            }, { 
              onConflict: 'slug',
              ignoreDuplicates: false
            })
            .select('id')
            .single();
            
          if (entityError) {
            console.error("Errore nel salvataggio dell'entità:", entityError);
            throw entityError;
          }
          
          if (!entityData || !entityData.id) {
            throw new Error("Nessun ID entità restituito dopo l'inserimento");
          }
          
          console.log("Entità inserita/aggiornata con successo, ID:", entityData.id);
          
          // 2. Ora inserisci o aggiorna i dettagli della persona
          const { error: detailsError } = await supabase
            .from('person_details')
            .upsert({
              entity_id: entityData.id,
              person_type: 'director',
              biography: bio,
              excerpt: excerpt,
              birth_date: directorMeta?.birthDate || null,
              birth_place: directorMeta?.birthPlace || null,
              profile_path: directorMeta?.profilePath || null
            }, {
              onConflict: 'entity_id',
              ignoreDuplicates: false
            });
          
          if (detailsError) {
            console.error("Errore nel salvataggio dei dettagli:", detailsError);
            throw detailsError;
          }
          
          console.log("Biografia regista salvata con successo");
        } catch (error) {
          console.error("Errore durante l'upsert:", error);
          throw error;
        }
      }
      
      setIsEditing(false)
    } catch (error: any) {
      console.error("Errore durante il salvataggio della biografia del regista:", error)
      setError("Errore durante il salvataggio. Riprova più tardi.")
    } finally {
      setIsSaving(false)
    }
  }

  // Gestisce la generazione della biografia con OpenAI (bacchetta magica)
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
          name: directorName,
          id: directorMeta?.id,
          contentType: 'director',
          currentContent: bio, // Passa la biografia attuale per migliorarla
          birthDate: directorMeta?.birthDate,
          birthPlace: directorMeta?.birthPlace,
          deathDate: directorMeta?.deathDate,
          knownFor: directorMeta?.knownFor,
          popularity: directorMeta?.popularity,
          imdbId: directorMeta?.imdbId,
          profilePath: directorMeta?.profilePath
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione della biografia');
      }

      const data = await response.json();
      setBio(data.biography);
      
      // Se non eravamo già in modalità editing, entriamo in tale modalità per
      // permettere all'utente di rivedere e salvare la biografia generata
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
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[180px] bg-transparent text-gray-200 p-0 focus:outline-none resize-none"
          disabled={isSaving || isGenerating}
          placeholder={`Inserisci la biografia${directorName ? ` di ${directorName}` : ''}...`}
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
        {bio || `Nessuna biografia${directorName ? ` per ${directorName}` : ''} disponibile. Doppio click per aggiungere.`}
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