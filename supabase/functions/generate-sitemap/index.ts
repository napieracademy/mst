// Supabase Edge Function per generare la sitemap
// Da eseguire con: supabase functions deploy generate-sitemap

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
    console.log('Avvio generazione sitemap da Supabase Edge Function...')
    
    // 1. Recupera le informazioni di ambiente
    const siteUrl = Deno.env.get('SITE_URL') || 'https://mastroianni.app'
    console.log(`URL base: ${siteUrl}`)
    
    // 2. Crea il client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Mancano le variabili ambiente SUPABASE_URL o SUPABASE_ANON_KEY')
    }
    
    console.log('Creazione client Supabase...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 3. Recupera il conteggio totale dei record
    const { count: totalCount, error: countError } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact', head: true })
      
    if (countError) {
      throw new Error(`Errore nel conteggio record: ${countError.message}`)
    }
    
    if (!totalCount) {
      throw new Error('Nessun record trovato nel database')
    }
    
    console.log(`Trovati ${totalCount} record totali nel database`)
    
    // 4. Recupera tutti i record con paginazione
    let allRecords = []
    const batchSize = 1000
    const pages = Math.ceil(totalCount / batchSize)
    
    console.log(`Iniziando recupero in ${pages} pagine (${batchSize} record per pagina)`)
    
    for (let page = 0; page < pages; page++) {
      const from = page * batchSize
      const to = from + batchSize - 1
      
      console.log(`Recupero pagina ${page + 1}/${pages} (record ${from} - ${to})`)
      
      try {
        const { data, error } = await supabase
          .from('generated_pages')
          .select('*')
          .range(from, to)
        
        if (error) {
          console.error(`Errore nel recupero batch ${page + 1}:`, error)
          continue
        }
        
        if (!data || data.length === 0) {
          console.warn(`Nessun dato nel batch ${page + 1}`)
          continue
        }
        
        console.log(`Recuperati ${data.length} record nella pagina ${page + 1}`)
        allRecords = [...allRecords, ...data]
      } catch (batchError) {
        console.error(`Errore critico nel recupero batch ${page + 1}:`, batchError)
      }
    }
    
    console.log(`Totale record recuperati: ${allRecords.length} di ${totalCount} attesi`)
    
    // 5. Dividi i record per tipo
    const filmRecords = allRecords.filter(record => record.page_type === 'film')
    const serieRecords = allRecords.filter(record => record.page_type === 'serie')
    
    console.log(`Record film: ${filmRecords.length}, serie: ${serieRecords.length}`)
    
    // 6. Estrai gli slug dai record (filtrando quelli non validi)
    const filmSlugs = filmRecords
      .map(record => record.slug)
      .filter(slug => slug && slug.trim() !== '')
    
    const serieSlugs = serieRecords
      .map(record => record.slug)
      .filter(slug => slug && slug.trim() !== '')
    
    console.log(`Slug validi - ${filmSlugs.length} film e ${serieSlugs.length} serie`)
    
    // 7. Definisci le rotte statiche
    const staticRoutes = ['', '/search', '/login', '/about']
    console.log(`Rotte statiche: ${staticRoutes.length}`)
    
    // 8. Genera il contenuto XML
    const urlCount = staticRoutes.length + filmSlugs.length + serieSlugs.length
    console.log(`Conteggio totale URL nella sitemap: ${urlCount}`)
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <!-- Generata il: ${new Date().toISOString()} con ${urlCount} URL -->
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" count="${urlCount}">
      ${staticRoutes.map(route => `
        <url>
          <loc>${siteUrl}${route}</loc>
          <changefreq>weekly</changefreq>
          <priority>${route === '' ? '1.0' : '0.8'}</priority>
        </url>
      `).join('')}
      
      ${filmSlugs.map(slug => `
        <url>
          <loc>${siteUrl}/film/${slug}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
      
      ${serieSlugs.map(slug => `
        <url>
          <loc>${siteUrl}/serie/${slug}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
    </urlset>`
    
    // 9. Salva la sitemap nel bucket di storage
    // Ottieni il timestamp corrente per il nome file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const sitemapKey = 'sitemap.xml'
    const backupKey = `sitemap-backup-${timestamp}.xml`
    
    // Bucket di storage
    const bucketName = 'public'
    
    // Carica la sitemap nel bucket di storage
    try {
      // Prima crea un backup della sitemap esistente
      const { data: existingSitemap } = await supabase
        .storage
        .from(bucketName)
        .download(sitemapKey)
        
      if (existingSitemap) {
        // Salva backup
        console.log(`Creazione backup della sitemap come ${backupKey}`)
        const { error: backupError } = await supabase
          .storage
          .from(bucketName)
          .upload(backupKey, existingSitemap, {
            contentType: 'application/xml',
            upsert: true
          })
          
        if (backupError) {
          console.warn(`Errore nel backup della sitemap: ${backupError.message}`)
        }
      }
      
      // Carica la nuova sitemap
      console.log(`Caricamento nuova sitemap nel bucket ${bucketName}`)
      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(sitemapKey, new Blob([xmlContent], { type: 'application/xml' }), {
          contentType: 'application/xml',
          upsert: true
        })
        
      if (uploadError) {
        throw new Error(`Errore nel caricamento della sitemap: ${uploadError.message}`)
      }
      
      // Verifica che la sitemap sia accessibile pubblicamente
      const { data: publicUrl } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(sitemapKey)
        
      console.log(`Sitemap disponibile pubblicamente a: ${publicUrl.publicUrl}`)
      
      // Aggiorna il record statistiche
      try {
        const { error: statError } = await supabase
          .from('sitemap_stats')
          .upsert([{
            id: 1,
            last_generation: new Date().toISOString(),
            urls_count: urlCount,
            film_count: filmSlugs.length,
            serie_count: serieSlugs.length,
            is_error: false,
            error_message: null
          }])
          
        if (statError) {
          console.warn(`Errore nell'aggiornamento delle statistiche: ${statError.message}`)
        }
      } catch (statError) {
        console.warn(`Errore nel tentativo di aggiornare le statistiche: ${statError}`)
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          recordCount: allRecords.length,
          urlCount,
          publicUrl: publicUrl.publicUrl,
          message: 'Sitemap generata con successo'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    } catch (storageError) {
      console.error('Errore di storage:', storageError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Errore di storage: ${storageError.message}`,
          partialContent: xmlContent.substring(0, 500) + '...'
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
  } catch (error) {
    console.error('Errore nella funzione generate-sitemap:', error)
    
    // Aggiorna il record statistiche con errore
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase
          .from('sitemap_stats')
          .upsert([{
            id: 1,
            last_generation: new Date().toISOString(),
            urls_count: 0,
            film_count: 0,
            serie_count: 0,
            is_error: true,
            error_message: error.message
          }])
      }
    } catch (statError) {
      console.warn('Errore nel salvataggio statistiche errore:', statError)
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
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