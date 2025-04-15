/**
 * Interfaccia con le API di OpenAI
 * Utilizza il sistema centralizzato delle chiavi API
 */

import { config } from './config'
import { getApiKey } from './api-keys-client'

// Configurazione di default per OpenAI
const OPENAI_API_URL = 'https://api.openai.com/v1'
const DEFAULT_MODEL = 'gpt-4'
const DEFAULT_MAX_TOKENS = 1000

// Errore specifico per le API OpenAI
class OpenAIError extends Error {
  status: number
  
  constructor(message: string, status: number = 500) {
    super(message)
    this.name = 'OpenAIError'
    this.status = status
  }
}

/**
 * Interfaccia per la generazione di testo con OpenAI
 */
interface CompletionRequest {
  prompt: string
  model?: string
  maxTokens?: number
  temperature?: number
}

/**
 * Interfaccia per la risposta di completamento
 */
interface CompletionResponse {
  text: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Genera testo utilizzando OpenAI
 * @param options - Opzioni per la generazione di testo
 * @returns Il testo generato e le informazioni di utilizzo
 */
export async function generateText({
  prompt,
  model = DEFAULT_MODEL,
  maxTokens = DEFAULT_MAX_TOKENS,
  temperature = 0.7
}: CompletionRequest): Promise<CompletionResponse> {
  // Se le API sono disabilitate, lancia un errore
  if (!config.enableOpenAI) {
    throw new OpenAIError('Le API OpenAI sono disabilitate', 403)
  }
  
  try {
    // Ottieni la chiave API OpenAI dal sistema centralizzato
    const apiKey = await getApiKey('openai')
    
    if (!apiKey) {
      throw new OpenAIError('OpenAI API key non disponibile', 401)
    }
    
    // Prepara la richiesta per l'API di chat completions
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature
      })
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error?.message || `Error ${response.status}`
      throw new OpenAIError(errorMessage, response.status)
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    
    // Verifica che la risposta contenga i dati attesi
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new OpenAIError('Risposta non valida da OpenAI')
    }
    
    // Restituisci il testo generato e le informazioni di utilizzo
    return {
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    }
  } catch (error) {
    // Trasforma l'errore in un OpenAIError se non lo è già
    if (error instanceof OpenAIError) {
      throw error
    } else {
      console.error('Error calling OpenAI API:', error)
      throw new OpenAIError(
        error instanceof Error ? error.message : 'Errore sconosciuto'
      )
    }
  }
}

/**
 * Genera un'immagine utilizzando DALL-E
 * @param prompt - La descrizione dell'immagine da generare
 * @param size - La dimensione dell'immagine (default: 1024x1024)
 * @returns URL dell'immagine generata
 */
export async function generateImage(
  prompt: string, 
  size: '256x256' | '512x512' | '1024x1024' = '1024x1024'
): Promise<string> {
  // Se le API sono disabilitate, lancia un errore
  if (!config.enableOpenAI) {
    throw new OpenAIError('Le API OpenAI sono disabilitate', 403)
  }
  
  try {
    // Ottieni la chiave API OpenAI dal sistema centralizzato
    const apiKey = await getApiKey('openai')
    
    if (!apiKey) {
      throw new OpenAIError('OpenAI API key non disponibile', 401)
    }
    
    // Richiesta all'API di generazione immagini
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size
      })
    })
    
    // Verifica se la risposta è ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error?.message || `Error ${response.status}`
      throw new OpenAIError(errorMessage, response.status)
    }
    
    // Estrai i dati dalla risposta
    const data = await response.json()
    
    // Verifica che la risposta contenga i dati attesi
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new OpenAIError('Risposta non valida da OpenAI')
    }
    
    // Restituisci l'URL dell'immagine generata
    return data.data[0].url
  } catch (error) {
    // Trasforma l'errore in un OpenAIError se non lo è già
    if (error instanceof OpenAIError) {
      throw error
    } else {
      console.error('Error calling OpenAI API:', error)
      throw new OpenAIError(
        error instanceof Error ? error.message : 'Errore sconosciuto'
      )
    }
  }
}