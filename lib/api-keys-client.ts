/**
 * Client per il recupero centralizzato delle chiavi API
 * Questo modulo gestisce l'accesso alle chiavi API tramite la Supabase Edge Function
 */

import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Tipi chiavi supportate
export type ApiKeyType = 
  'tmdb' | 
  'netlify' | 
  'supabase_service_role' | 
  'openai' | 
  'google_ai' |
  'perplexity' |
  'tinymce' |
  'other'

// Interfaccia della risposta
interface ApiKeyResponse {
  success: boolean
  keyType: ApiKeyType
  key: string
  expiresIn: number
  timestamp: string
}

// Cache locale delle chiavi
interface CachedKey {
  key: string
  expiresAt: number
}

// Cache in-memory delle chiavi (lato client)
const keyCache = new Map<ApiKeyType, CachedKey>()

/**
 * Recupera una chiave API dal servizio centralizzato
 * Implementa caching locale e retry automatico
 * 
 * @param keyType - Tipo di chiave da recuperare
 * @param forceRefresh - Se true, ignora la cache e forza un refresh della chiave
 * @returns La chiave API richiesta o null se non disponibile
 */
export async function getApiKey(
  keyType: ApiKeyType, 
  forceRefresh = false
): Promise<string | null> {
  // Verifica se il servizio centralizzato è disabilitato
  // Le ragioni possono essere: fase di build, ambiente di sviluppo, Replit, o configurazione esplicita
  if (!config.apiKeys.useApiKeysService) {
    // Log diversi in base all'ambiente
    if (config.env.isBuildPhase) {
      console.log(`[BUILD] Usando variabili d'ambiente per chiave ${keyType} (fase di build)`);
    } else if (config.env.isReplit) {
      console.log(`[REPLIT] Usando variabili d'ambiente per chiave ${keyType} (ambiente Replit)`);
    }
    return getKeyFromEnvironment(keyType);
  }
  
  // Verifica se c'è una cache valida (non scaduta e non forzata a refreshare)
  const now = Date.now()
  const cached = keyCache.get(keyType)
  
  if (!forceRefresh && cached && cached.expiresAt > now) {
    console.log(`Usando chiave ${keyType} dalla cache locale`)
    return cached.key
  }
  
  try {
    // Se siamo in ambiente browser, usa le variabili d'ambiente prima
    if (typeof window !== 'undefined') {
      const envKey = getKeyFromEnvironment(keyType)
      if (envKey) return envKey
    }
    
    // Recupera le informazioni Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Configurazione Supabase mancante')
      
      // Gestisci il fallback in base alla strategia configurata
      switch (config.apiKeys.fallbackStrategy) {
        case 'env':
          return getKeyFromEnvironment(keyType)
        case 'null':
          return null
        case 'error':
          throw new Error('Configurazione Supabase mancante')
        default:
          return getKeyFromEnvironment(keyType)
      }
    }
    
    // Crea un client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Ottieni la sessione corrente
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('Sessione non disponibile:', sessionError?.message)
      return getKeyFromEnvironment(keyType) // Fallback a variabili d'ambiente se non c'è sessione
    }
    
    // Ottieni il token di accesso
    const accessToken = session.access_token
    
    // Interroga la Edge Function per ottenere la chiave
    const apiUrl = `${supabaseUrl}/functions/v1/api-keys`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        platform: typeof window !== 'undefined' ? 'browser' : 'server',
        keyType
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API key service error (${response.status}): ${errorText}`)
    }
    
    const result = await response.json() as ApiKeyResponse
    
    if (!result.success || !result.key) {
      throw new Error('Risposta non valida dal servizio chiavi')
    }
    
    // Aggiorna la cache con il tempo configurato
    const cacheTime = config.apiKeys.cacheTime || 3600
    keyCache.set(keyType, {
      key: result.key,
      expiresAt: now + (cacheTime * 1000) // Tempo di cache configurato
    })
    
    return result.key
  } catch (error) {
    console.error(`Errore nel recupero della chiave ${keyType}:`, error)
    
    // Usa la cache se disponibile anche se scaduta (fallback)
    if (cached) {
      console.warn(`Usando chiave ${keyType} scaduta dalla cache come fallback`)
      return cached.key
    }
    
    // Altrimenti gestisci il fallback in base alla strategia configurata
    switch (config.apiKeys.fallbackStrategy) {
      case 'env':
        return getKeyFromEnvironment(keyType)
      case 'null':
        return null
      case 'error':
        throw new Error(`Impossibile recuperare la chiave ${keyType}`)
      default:
        return getKeyFromEnvironment(keyType)
    }
  }
}

/**
 * Tenta di recuperare una chiave API dalle variabili d'ambiente locali
 * Usato come fallback se il servizio centralizzato non è disponibile
 */
function getKeyFromEnvironment(keyType: ApiKeyType): string | null {
  switch (keyType) {
    case 'tmdb':
      return process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || null
    case 'netlify':
      return process.env.NETLIFY_AUTH_TOKEN || null
    case 'supabase_service_role':
      // Non dovrebbe mai essere disponibile in client
      return process.env.SUPABASE_SERVICE_ROLE_KEY || null
    case 'openai':
      return process.env.OPENAI_API_KEY || null
    case 'google_ai':
      return process.env.GOOGLE_AI_API_KEY || null
    case 'perplexity':
      return process.env.PERPLEXITY_API_KEY || null
    case 'tinymce':
      return process.env.TINYMCE_API_KEY || null
    case 'other':
      return process.env.OTHER_API_KEY || null
    default:
      return null
  }
}

/**
 * Forza l'aggiornamento di tutte le chiavi in cache
 * Utile dopo un login o cambio di sessione
 */
export function clearApiKeyCache(): void {
  keyCache.clear()
}