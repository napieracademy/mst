// Edge Function per configurare le policy RLS per il bucket site-assets
// Da eseguire con: supabase functions deploy configure-storage-policies

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Policy {
  name: string;
  table: string;
  operation: string;
  definition: string;
  roles?: string[];
}

serve(async (req) => {
  // Gestione delle richieste OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Avvio configurazione policy RLS per storage...')
    
    // Recupera le informazioni di ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieW5oZmlxbGFjbWx3cGpjeG1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE5Mjc3NywiZXhwIjoyMDU1NzY4Nzc3fQ.Er_q8ibhbppmgHFe1UzSziQ_dN1t__1P1RBnuCudT8s'
    
    if (!supabaseUrl) {
      throw new Error('Manca la variabile ambiente SUPABASE_URL')
    }
    
    console.log('Creazione client Supabase con service role key...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verifica se il bucket esiste già
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketsError) {
      throw new Error(`Errore nel recupero dei bucket: ${bucketsError.message}`)
    }
    
    const bucketName = 'site-assets'
    const bucketExists = buckets.some(b => b.name === bucketName)
    
    if (!bucketExists) {
      console.log(`Creazione bucket ${bucketName}...`)
      const { error: createBucketError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true
        })
        
      if (createBucketError) {
        throw new Error(`Errore nella creazione del bucket: ${createBucketError.message}`)
      }
      
      console.log(`Bucket ${bucketName} creato con successo!`)
    } else {
      console.log(`Bucket ${bucketName} già esistente`)
    }
    
    // Configurazione delle policy RLS tramite SQL
    console.log('Configurazione policy RLS...')
    
    // Definiamo le policy da applicare (policy più generiche per tutti i file nel bucket)
    const policies: Policy[] = [
      {
        name: 'Accesso pubblico completo al bucket site-assets',
        table: 'storage.objects',
        operation: 'ALL',
        definition: `bucket_id = '${bucketName}'`
      }
    ]
    
    // Applica ogni policy
    for (const policy of policies) {
      try {
        // Verifica se la policy esiste già
        const { data: existingPolicies, error: policiesError } = await supabase
          .rpc('get_policies', { table_name: 'objects', schema_name: 'storage' })
          
        if (policiesError) {
          console.warn(`Errore nel recupero delle policy esistenti: ${policiesError.message}`)
          console.warn('Continuo con la creazione della policy assumendo che non esista...')
        }
        
        const policyExists = existingPolicies && existingPolicies.some(
          (p: any) => p.policyname === policy.name
        )
        
        if (policyExists) {
          console.log(`Policy "${policy.name}" esiste già, la salto`)
          continue
        }
        
        // Costruisci la query SQL
        let sqlQuery = `
          CREATE POLICY "${policy.name}"
          ON ${policy.table}
          FOR ${policy.operation}
        `
        
        if (policy.roles && policy.roles.length > 0) {
          sqlQuery += `TO ${policy.roles.join(', ')}\n`
        }
        
        sqlQuery += `USING (${policy.definition});`
        
        // Esegui la query per creare la policy
        console.log(`Creazione policy "${policy.name}"...`)
        const { error: policyError } = await supabase.rpc('exec_sql', {
          query: sqlQuery
        })
        
        if (policyError) {
          console.error(`Errore nella creazione della policy "${policy.name}": ${policyError.message}`)
          
          // Se c'è un errore, prova un approccio alternativo con query SQL diretta
          console.log('Tentativo alternativo di creazione policy...')
          const { error: sqlError } = await supabase.rpc('exec_sql', {
            query: `
              -- Elimina eventuali policy esistenti per questo bucket
              DROP POLICY IF EXISTS "Accesso pubblico completo al bucket site-assets" ON storage.objects;
              
              -- Crea nuova policy generica
              CREATE POLICY "Accesso pubblico completo al bucket site-assets"
              ON storage.objects
              FOR ALL
              USING (bucket_id = '${bucketName}');
            `
          })
          
          if (sqlError) {
            console.error(`Anche il metodo alternativo ha fallito: ${sqlError.message}`)
          } else {
            console.log('Policy creata con successo tramite approccio alternativo!')
          }
          
          continue
        }
        
        console.log(`Policy "${policy.name}" creata con successo!`)
      } catch (policyError) {
        console.error(`Errore nella gestione della policy "${policy.name}":`, policyError)
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configurazione policy RLS completata con successo',
        bucketName,
        policies: policies.map(p => p.name)
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