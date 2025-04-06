// Supabase Edge Function per gestire i reindirizzamenti
// Da eseguire con: supabase functions deploy redirects

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
    const url = new URL(req.url)
    const path = url.pathname
    
    // Crea il client Supabase usando le variabili d'ambiente di Supabase
    const supabaseClient = createClient(
      // Le env vars sono inserite automaticamente da Supabase quando la funzione è deployata
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Controlla se c'è un reindirizzamento per questo percorso
    const { data, error } = await supabaseClient.rpc('check_redirect', { path })
    
    if (error) {
      console.error('Errore nella query di reindirizzamento:', error)
      return new Response(
        JSON.stringify({ error: 'Errore interno del server' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      )
    }

    // Se c'è un reindirizzamento, ritorna il nuovo percorso
    if (data && data.length > 0) {
      const { new_path, status_code } = data[0]
      
      // Aggiungi query params se presenti nell'URL originale
      const redirectUrl = new URL(url.origin)
      redirectUrl.pathname = new_path
      redirectUrl.search = url.search
      
      return new Response(
        JSON.stringify({ 
          redirect: true, 
          location: redirectUrl.toString(),
          status_code: status_code 
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    // Nessun reindirizzamento trovato
    return new Response(
      JSON.stringify({ redirect: false }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Errore nel servizio di reindirizzamento:', error)
    
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
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