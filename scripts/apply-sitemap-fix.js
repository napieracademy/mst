#!/usr/bin/env node

/**
 * Script per applicare direttamente le correzioni per la sitemap
 * Esegue le stesse modifiche contenute nella migrazione SQL
 * 
 * Uso: node scripts/apply-sitemap-fix.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Recupera le credenziali dalle variabili d'ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Errore: variabili d\'ambiente mancanti. Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel tuo .env.local');
  process.exit(1);
}

// Crea client Supabase con service role key (per avere più permessi)
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyFixes() {
  console.log('🔧 Inizio applicazione correzioni per la sitemap...');

  try {
    // 1. Aggiorna il vincolo nella tabella generated_pages
    console.log('1️⃣ Aggiornamento vincolo valid_page_type...');
    
    // Aggiorna il vincolo (questo richiede diritti di amministratore)
    // Prima lo eliminiamo se esiste
    await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE public.generated_pages
        DROP CONSTRAINT IF EXISTS valid_page_type;
      `
    });
    
    // Poi creiamo il nuovo vincolo con tutti i tipi
    await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE public.generated_pages
        ADD CONSTRAINT valid_page_type CHECK (page_type IN ('film', 'serie', 'attore', 'regista', 'cast', 'crew', 'person'));
      `
    });
    
    console.log('✅ Vincolo aggiornato con successo');
    
    // 2. Aggiungi colonne per conteggi attori e registi
    console.log('2️⃣ Aggiunta colonne attori_count e registi_count...');
    
    await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE sitemap_stats
        ADD COLUMN IF NOT EXISTS attori_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS registi_count INTEGER DEFAULT 0;
      `
    });
    
    console.log('✅ Colonne aggiunte con successo');
    
    // 3. Crea la funzione get_page_type_counts
    console.log('3️⃣ Creazione funzione get_page_type_counts...');
    
    await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION get_page_type_counts()
        RETURNS TABLE (
          page_type TEXT,
          count BIGINT
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT
            gp.page_type,
            COUNT(*)::BIGINT
          FROM 
            public.generated_pages gp
          GROUP BY 
            gp.page_type;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Permessi per chiamare la funzione
        GRANT EXECUTE ON FUNCTION get_page_type_counts TO anon, authenticated, service_role;
      `
    });
    
    console.log('✅ Funzione creata con successo');
    
    // 4. Aggiorna i commenti
    console.log('4️⃣ Aggiornamento commenti nella tabella...');
    
    await supabase.rpc('execute_sql', {
      sql_query: `
        COMMENT ON COLUMN public.generated_pages.page_type IS 'Tipo di pagina: film, serie, attore, regista, cast, crew, person';
        COMMENT ON FUNCTION get_page_type_counts IS 'Ritorna conteggi aggregati per ogni tipo di pagina';
        COMMENT ON COLUMN sitemap_stats.attori_count IS 'Numero di attori nella sitemap';
        COMMENT ON COLUMN sitemap_stats.registi_count IS 'Numero di registi nella sitemap';
      `
    });
    
    console.log('✅ Commenti aggiornati con successo');
    
    // 5. Triggera la rigenerazione della sitemap
    console.log('5️⃣ Triggering rigenerazione sitemap...');
    
    const { data, error } = await supabase.functions.invoke('generate-sitemap', {
      method: 'POST'
    });
    
    if (error) {
      console.error('❌ Errore durante la rigenerazione della sitemap:', error);
    } else {
      console.log('✅ Sitemap rigenerata con successo!');
      console.log('📊 Statistiche sitemap:');
      console.log(` - Totale URL: ${data.urlCount}`);
      console.log(` - Film: ${data.filmCount}`);
      console.log(` - Serie: ${data.serieCount}`);
      console.log(` - Persone: ${data.personCount}`);
      if (data.attoriCount !== undefined) {
        console.log(` - Attori: ${data.attoriCount}`);
      }
      if (data.registiCount !== undefined) {
        console.log(` - Registi: ${data.registiCount}`);
      }
      console.log(`\nPublic URL: ${data.publicUrl}`);
    }
    
    console.log('\n✨ Correzioni applicate con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante l\'applicazione delle correzioni:', error);
    process.exit(1);
  }
}

// Esegui lo script
applyFixes();