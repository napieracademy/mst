import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const digest = searchParams.get("digest")

  // Qui potremmo implementare una logica per recuperare informazioni sull'errore
  // basate sul digest, ma per ora restituiamo informazioni generiche

  return NextResponse.json({
    digest,
    possibleCauses: [
      "Chiave API TMDB non valida o non configurata",
      "Errore nell'accesso a proprietà di oggetti null o undefined",
      "Errore nella gestione delle promesse o funzioni asincrone",
      "Errore di rete durante la chiamata all'API TMDB",
    ],
    recommendations: [
      "Verifica che la chiave API TMDB sia configurata correttamente nelle variabili d'ambiente",
      "Aggiungi controlli null/undefined prima di accedere alle proprietà degli oggetti",
      "Usa try/catch per gestire gli errori nelle funzioni asincrone",
      "Verifica la connessione di rete e lo stato dell'API TMDB",
    ],
    apiKeyStatus: process.env.TMDB_API_KEY ? "configured" : "missing",
    environment: process.env.NODE_ENV,
  })
}

