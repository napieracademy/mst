'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface BiografiaEditorProps {
  nomeAttore: string;
  dataNascita?: string;
  luogoNascita?: string;
  filmNoti?: string[];
  biografiaAttuale?: string;
  onSalva?: (nuovaBiografia: string) => Promise<void>;
}

export default function BiografiaEditor({
  nomeAttore,
  dataNascita,
  luogoNascita,
  filmNoti,
  biografiaAttuale,
  onSalva
}: BiografiaEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [biografia, setBiografia] = useState(biografiaAttuale || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Gestisce il doppio click per attivare la modalità di modifica
  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  // Gestisce la cancellazione della modifica
  const handleCancel = () => {
    setBiografia(biografiaAttuale || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSalva = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      if (onSalva) {
        await onSalva(biografia);
        setSuccess('Biografia salvata con successo!');
      } else {
        // Implementazione fittizia del salvataggio
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log("Biografia salvata (simulato):", biografia);
        setSuccess('Biografia salvata con successo!');
      }
      
      setIsEditing(false);
    } catch (err: any) {
      console.error('Errore durante il salvataggio della biografia:', err);
      setError('Errore durante il salvataggio della biografia');
    } finally {
      setIsSaving(false);
    }
  };

  // Focus automatico sul textarea quando si entra in modalità editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
  // Supporto per salvare con Ctrl+Enter o Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSalva();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Modalità di generazione con AI (da implementare in futuro)
  const generaBiografia = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Per ora mostriamo solo un messaggio che questa funzionalità verrà implementata
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccess('La generazione automatica delle biografie sarà implementata in futuro');
    } catch (err: any) {
      console.error('Errore:', err);
      setError('Impossibile generare la biografia. Riprova più tardi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Biografia di {nomeAttore}</h2>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {success}
            </div>
          )}
        </div>
      
        <textarea
          ref={textareaRef}
          value={biografia}
          onChange={(e) => setBiografia(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Inserisci o genera la biografia dell'attore..."
          className="w-full min-h-[300px] bg-transparent text-gray-200 p-4 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500 resize-none"
          disabled={isSaving}
        />
        
        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-white opacity-70 hover:opacity-100 transition-opacity px-4 py-2 rounded-lg"
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
            <span>Annulla</span>
          </button>
          
          <button
            onClick={handleSalva}
            className="flex items-center gap-1 text-white bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSaving ? "Salvataggio..." : "Salva"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Biografia di {nomeAttore}</h2>
        <div className="flex gap-2">
          <button 
            onClick={generaBiografia} 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            disabled={isSaving}
          >
            {isSaving ? "Generazione..." : "Genera con AI"}
          </button>
          <button 
            onClick={handleDoubleClick}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors"
          >
            Modifica
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div 
        onDoubleClick={handleDoubleClick}
        className="text-gray-200 leading-relaxed cursor-text min-h-[200px] p-4 border border-gray-700 rounded-lg"
      >
        {biografia || "Nessuna biografia disponibile."}
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Suggerimento: Puoi modificare manualmente il testo facendo doppio click o usando il pulsante "Modifica".</p>
      </div>
    </div>
  );
} 