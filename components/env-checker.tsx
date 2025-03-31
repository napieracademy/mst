"use client"

import { useState } from "react"

export function EnvChecker() {
  const [showInstructions, setShowInstructions] = useState(false)

  const handleShowInstructions = () => {
    setShowInstructions(true)
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Configurazione TMDB API</h2>

      <div className="space-y-4">
        <p className="text-sm">
          Per configurare correttamente l'applicazione, è necessario impostare la chiave API TMDB.
        </p>

        <button
          onClick={handleShowInstructions}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors"
        >
          Mostra istruzioni
        </button>
      </div>

      {showInstructions && (
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded">
          <h3 className="font-medium mb-2">Istruzioni:</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Crea un file .env.local nella directory principale del tuo progetto</li>
            <li>
              Aggiungi la variabile d'ambiente TMDB_API_KEY con la tua chiave API di TMDB:
              <pre className="bg-gray-800 px-2 py-1 rounded mt-1">TMDB_API_KEY=your_api_key_here</pre>
            </li>
            <li>
              Riavvia il server di sviluppo con <code className="bg-gray-800 px-1 py-0.5 rounded">npm run dev</code>
            </li>
            <li>Aggiorna la pagina per verificare la connessione</li>
          </ol>
          <p className="mt-4 text-sm">
            Puoi ottenere una chiave API TMDB registrandoti su{" "}
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              themoviedb.org
            </a>
            .
          </p>
        </div>
      )}
    </div>
  )
}

