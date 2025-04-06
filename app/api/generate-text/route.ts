import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/openai'

/**
 * API per generare testo utilizzando OpenAI
 * Utilizza il sistema centralizzato delle chiavi API
 */
export async function POST(request: NextRequest) {
  try {
    // Estrai i parametri dalla richiesta
    const { prompt, model, maxTokens, temperature } = await request.json()
    
    // Verifica che il prompt sia presente
    if (!prompt) {
      return NextResponse.json(
        { error: 'Il parametro prompt è obbligatorio' },
        { status: 400 }
      )
    }
    
    // Utilizza il servizio OpenAI per generare il testo
    const result = await generateText({
      prompt,
      model,
      maxTokens,
      temperature
    })
    
    // Restituisci il risultato
    return NextResponse.json({
      text: result.text,
      usage: result.usage
    })
  } catch (error) {
    console.error('Errore nella generazione di testo:', error)
    
    // Elabora e restituisci l'errore
    const status = error instanceof Error && 'status' in error ? (error as any).status : 500
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}