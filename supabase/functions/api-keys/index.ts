// Supabase Edge Function per fornire chiavi API centralizzate
// Implementa un vault sicuro per l'accesso alle chiavi da diverse piattaforme

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Intestazioni CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

// Tipi delle chiavi supportate
type ApiKeyType = 
  'tmdb' | 
  'netlify' | 
  'supabase_service_role' | 
  'openai' | 
  'google_ai' |
  'perplexity' |
  'tinymce' |
  'other'

// Interfaccia per la richiesta in body
interface KeyRequest {
  // Identificatore della piattaforma richiedente (es. "netlify", "vercel", "replit")
  platform: string
  // Tipo di chiave richiesta
  keyType: ApiKeyType
  // Chiave di autorizzazione (opzionale, per autorizzazioni più complesse)
  authKey?: string
}

/**
 * Edge Function che serve come vault centralizzato per le chiavi API
 * Utilizza il JWT di Supabase per l'autorizzazione
 */
serve(async (req) => {
  // Gestione OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verifica che sia una richiesta POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Metodo non supportato, usa POST' }), 
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Accedi all'autorizzazione dalla richiesta
    const authorization = req.headers.get('Authorization')

    // Verifica che l'autorizzazione sia presente
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Autorizzazione mancante' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Estrai il token JWT
    const jwt = authorization.replace('Bearer ', '')
    
    // Crea client Supabase utilizzando i parametri di ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Configurazione server mancante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Verifica il token JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token JWT non valido o scaduto' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Estrai i dati dalla richiesta
    let requestData: KeyRequest
    try {
      requestData = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'JSON malformato nella richiesta' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verifica che i dati richiesti siano presenti
    if (!requestData.platform || !requestData.keyType) {
      return new Response(
        JSON.stringify({ error: 'Parametri mancanti. Richiesti: platform, keyType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Registra l'accesso alla chiave (audit trail)
    try {
      await supabase.from('api_key_access_logs').insert({
        user_id: user.id,
        platform: requestData.platform,
        key_type: requestData.keyType,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })
    } catch (logError) {
      // Solo log, non blocchiamo l'operazione se fallisce
      console.error('Errore nel logging accesso chiave:', logError)
    }

    // Recupera la chiave richiesta in base al tipo
    const key = getApiKey(requestData.keyType)
    
    if (!key) {
      return new Response(
        JSON.stringify({ error: `Chiave di tipo ${requestData.keyType} non trovata` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Restituisci la chiave richiesta
    return new Response(
      JSON.stringify({ 
        success: true,
        keyType: requestData.keyType,
        key,
        expiresIn: 3600, // Validità della chiave in secondi (1 ora)
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        } 
      }
    )
  } catch (error) {
    console.error('Errore generale:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Errore interno del server',
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Recupera una chiave API in base al tipo
 * Utilizza le variabili d'ambiente impostate nella configurazione della funzione
 */
function getApiKey(keyType: ApiKeyType): string | null {
  switch (keyType) {
    case 'tmdb':
      return Deno.env.get('TMDB_API_KEY') || null
    case 'netlify': 
      // Nota: questa chiave non è attualmente configurata
      return null
    case 'supabase_service_role':
      return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || null
    case 'openai':
      return Deno.env.get('OPENAI_API_KEY') || null
    case 'google_ai':  // Aggiungiamo Google AI, che è disponibile
      return Deno.env.get('GOOGLE_AI_API_KEY') || null
    case 'perplexity': // Aggiungiamo Perplexity, che è disponibile
      return Deno.env.get('PERPLEXITY_API_KEY') || null
    case 'tinymce':    // Aggiungiamo TinyMCE, che è disponibile
      return Deno.env.get('TINYMCE_API_KEY') || null
    case 'other':
      // Fallback per altri tipi di chiavi
      return null
    default:
      return null
  }
}