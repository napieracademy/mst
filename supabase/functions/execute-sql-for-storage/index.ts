// Edge Function per eseguire SQL diretto per configurare il bucket site-assets
// Da eseguire con: supabase functions deploy execute-sql-for-storage

/* eslint-disable */
// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Dichiarazione di tipi per Deno
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// Tipo per la richiesta
interface RequestEvent {
  method: string;
  url: string;
  headers: Headers;
  json(): Promise<any>;
  text(): Promise<string>;
  formData(): Promise<FormData>;
}

// Tipi per le risposte Supabase
interface SupabaseResponse<T = any> {
  data: T | null;
  error: {
    message: string;
  } | null;
}

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
    console.log('Avvio configurazione SQL diretta per il bucket site-assets...')
    
    // Token di servizio
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieW5oZmlxbGFjbWx3cGpjeG1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE5Mjc3NywiZXhwIjoyMDU1NzY4Nzc3fQ.Er_q8ibhbppmgHFe1UzSziQ_dN1t__1P1RBnuCudT8s'
    
    if (!supabaseUrl) {
      throw new Error('Manca la variabile ambiente SUPABASE_URL')
    }
    
    console.log('Creazione client Supabase con service role key...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Query SQL diretta per creare il bucket e configurare le policy RLS
    console.log('Esecuzione query SQL...')
    
    const sqlQueries = [
      // Crea bucket (se non esiste)
      `
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('site-assets', 'site-assets', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
      `,
      
      // Elimina eventuali policy esistenti per evitare conflitti
      `
      DROP POLICY IF EXISTS "Accesso pubblico completo al bucket site-assets" ON storage.objects;
      DROP POLICY IF EXISTS "Accesso pubblico in lettura per i file XML" ON storage.objects;
      DROP POLICY IF EXISTS "Utenti anonimi possono inserire file XML" ON storage.objects;
      DROP POLICY IF EXISTS "Service role può inserire file XML" ON storage.objects;
      DROP POLICY IF EXISTS "Service role può aggiornare file XML" ON storage.objects;
      DROP POLICY IF EXISTS "Service role può eliminare file XML" ON storage.objects;
      `,
      
      // Crea policy generica per tutte le operazioni
      `
      CREATE POLICY "Accesso pubblico completo al bucket site-assets"
      ON storage.objects
      FOR ALL
      USING (bucket_id = 'site-assets');
      `
    ]
    
    // Esecuzione di ciascuna query
    for (const query of sqlQueries) {
      try {
        console.log(`Esecuzione query: ${query.trim().substring(0, 50)}...`)
        
        const { error } = await supabase.rpc('exec_sql', { query })
        
        if (error) {
          console.error(`Errore nell'esecuzione della query: ${error.message}`)
        } else {
          console.log('Query eseguita con successo!')
        }
      } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error)
      }
    }
    
    // Crea policy speciale con SQL PREPARE per casi problematici
    try {
      console.log('Tentativo diretto con PREPARE TRANSACTION...')
      
      await supabase.rpc('exec_sql', {
        query: `
        DO $$
        BEGIN
          BEGIN
            EXECUTE 'DROP POLICY IF EXISTS "Accesso pubblico completo al bucket site-assets" ON storage.objects';
            EXCEPTION WHEN OTHERS THEN
              RAISE NOTICE 'Errore nell\'eliminazione della policy: %', SQLERRM;
          END;
          
          BEGIN
            EXECUTE 'CREATE POLICY "Accesso pubblico completo al bucket site-assets" ON storage.objects FOR ALL USING (bucket_id = ''site-assets'')';
            EXCEPTION WHEN OTHERS THEN
              RAISE NOTICE 'Errore nella creazione della policy: %', SQLERRM;
          END;
        END $$;
        `
      })
      
      console.log('SQL con DO block eseguito con successo')
    } catch (error) {
      console.error('Errore durante l\'esecuzione del blocco DO:', error)
    }
    
    // Verifica il risultato
    try {
      console.log('Verifica delle policy...')
      
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies', { table_name: 'objects', schema_name: 'storage' })
        
      if (policiesError) {
        console.error(`Errore nel recupero delle policy: ${policiesError.message}`)
      } else {
        console.log('Policy RLS configurate:', policies)
      }
    } catch (error) {
      console.error('Errore durante la verifica delle policy:', error)
    }
    
    // Ora proviamo a fare un upload di test
    try {
      console.log('Test di caricamento di un file...')
      
      const testContent = 'Questo è un file di test per verificare le policy RLS'
      const testFilePath = 'test-policy-file.txt'
      
      const { error: uploadError } = await supabase
        .storage
        .from('site-assets')
        .upload(testFilePath, new Blob([testContent]), {
          contentType: 'text/plain',
          upsert: true
        })
        
      if (uploadError) {
        console.error(`Errore nel caricamento del file di test: ${uploadError.message}`)
      } else {
        console.log('File di test caricato con successo!')
        
        // Ottieni URL pubblico
        const { data: publicUrl } = supabase
          .storage
          .from('site-assets')
          .getPublicUrl(testFilePath)
          
        console.log(`File disponibile pubblicamente a: ${publicUrl.publicUrl}`)
      }
    } catch (uploadError) {
      console.error('Errore durante il test di caricamento:', uploadError)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configurazione SQL diretta completata',
        note: 'Controlla i log per i dettagli specifici'
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
    console.error('Errore generale:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Errore generale: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
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