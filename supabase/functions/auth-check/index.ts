// Supabase Edge Function per verificare l'autenticazione
// Da eseguire con: supabase functions deploy auth-check

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestione delle richieste OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Estrai il token di autorizzazione dall'header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          authenticated: false,
          error: 'Token di autenticazione mancante o non valido'
        }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Crea il client Supabase usando le variabili d'ambiente
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Verifica se l'utente è autenticato
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)
    
    if (error || !user) {
      console.error('Errore di autenticazione:', error)
      return new Response(
        JSON.stringify({ 
          authenticated: false,
          error: error?.message || 'Utente non autenticato'
        }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    // Ottieni eventuali metadati o ruoli dell'utente
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return new Response(
      JSON.stringify({ 
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          profile: profileError ? null : profile
        }
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Errore nel servizio di autenticazione:', error)
    
    return new Response(
      JSON.stringify({ 
        authenticated: false,
        error: 'Errore interno del server' 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})