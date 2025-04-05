"use client"

import { useState } from "react"
import { CheckCircle, X, Wand2 } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase-client"

interface EditableBioActorProps {
  initialBio: string
  actorName: string
  tmdbId: string | number
  onSave?: (newBio: string) => Promise<void>
}

export function EditableBioActor({ initialBio, actorName, tmdbId, onSave }: EditableBioActorProps) {
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (!bio.trim()) {
      setError("La biografia non può essere vuota")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      // Usa la funzione onSave se fornita dall'esterno
      if (onSave) {
        await onSave(bio)
      } else {
        // Crea il client Supabase
        const supabase = createSupabaseClient()
        
        // Converti tmdbId in stringa se necessario
        const tmdbIdStr = tmdbId?.toString()
        
        console.log(`Salvataggio biografia per: ${actorName} (TMDB ID: ${tmdbIdStr})`)
        
        // Query per trovare record esistente
        const { data: existingBio, error: queryError } = await supabase
          .from('actor_biographies')
          .select('id')
          .eq('tmdb_id', tmdbIdStr)
          .maybeSingle()
        
        if (queryError) {
          throw new Error(`Errore nella ricerca: ${queryError.message}`)
        }
        
        if (existingBio) {
          // Aggiorna il record esistente
          const { error: updateError } = await supabase
            .from('actor_biographies')
            .update({ 
              biography: bio,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingBio.id)
          
          if (updateError) {
            throw new Error(`Errore nell'aggiornamento: ${updateError.message}`)
          }
          
          console.log("Biografia aggiornata con successo")
        } else {
          // Crea un nuovo record
          const { error: insertError } = await supabase
            .from('actor_biographies')
            .insert({ 
              actor_name: actorName,
              tmdb_id: tmdbIdStr,
              biography: bio,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (insertError) {
            throw new Error(`Errore nell'inserimento: ${insertError.message}`)
          }
          
          console.log("Biografia inserita con successo")
        }
      }
    } catch (error) {
      console.error("Errore:", error)
      setError(error instanceof Error ? error.message : "Errore durante il salvataggio")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full h-64 p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700"
        placeholder="Inserisci la biografia dell'attore..."
      />
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span>Salvataggio...</span>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Salva</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
} 