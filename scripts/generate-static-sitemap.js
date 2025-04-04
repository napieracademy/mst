// Script per generare una sitemap.xml statica
// Nota: Per eliminare l'avviso [MODULE_TYPELESS_PACKAGE_JSON], aggiungere "type": "module" in package.json
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Funzione per normalizzare un testo in uno slug (copiata da lib/utils.ts)
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD') // rimuove accenti
    .replace(/[\u0300-\u036f]/g, '') // rimuove accenti (parte 2)
    .replace(/[^a-z0-9\s-]/g, '') // elimina simboli
    .replace(/\s+/g, '-') // spazi → trattini
    .replace(/-+/g, '-') // doppio trattino
    .trim();
}

// Crea client Supabase (copiato da lib/supabase-server.ts)
function createApiSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Recupera tutti i record dal database, adattato per Node.js
async function getAllDatabaseRecords() {
  try {
    console.log('SITEMAP STATIC: Recupero tutti i record dal database...');
    const supabase = createApiSupabaseClient();
    
    const { count: totalCount, error: countError } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('SITEMAP STATIC: Errore nel conteggio record:', countError);
      return { filmRecords: [], serieRecords: [], totalCount: 0 };
    }
    
    if (!totalCount || totalCount === 0) {
      console.warn('SITEMAP STATIC: Nessun record trovato nel database');
      return { filmRecords: [], serieRecords: [], totalCount: 0 };
    }
    
    console.log(`SITEMAP STATIC: Trovati ${totalCount} record totali nel database`);
    
    let allRecords = [];
    const batchSize = 1000;
    const pages = Math.ceil((totalCount || 0) / batchSize);
    
    console.log(`SITEMAP STATIC: Iniziando recupero in ${pages} pagine (${batchSize} record per pagina)`);
    
    for (let page = 0; page < pages; page++) {
      const from = page * batchSize;
      const to = from + batchSize - 1;
      
      console.log(`SITEMAP STATIC: Recupero pagina ${page + 1}/${pages} (record ${from} - ${to})`);
      
      try {
        const { data, error } = await supabase
          .from('generated_pages')
          .select('*')
          .range(from, to);
        
        if (error) {
          console.error(`SITEMAP STATIC: Errore nel recupero batch ${page + 1}:`, error);
          continue;
        }
        
        if (!data || data.length === 0) {
          console.warn(`SITEMAP STATIC: Nessun dato nel batch ${page + 1}`);
          continue;
        }
        
        console.log(`SITEMAP STATIC: Recuperati ${data.length} record nella pagina ${page + 1}`);
        allRecords = [...allRecords, ...data];
      } catch (batchError) {
        console.error(`SITEMAP STATIC: Errore critico nel recupero batch ${page + 1}:`, batchError);
        continue;
      }
    }
    
    console.log(`SITEMAP STATIC: Totale record recuperati: ${allRecords.length} di ${totalCount} attesi`);
    
    const filmRecords = allRecords.filter(record => record.page_type === 'film');
    const serieRecords = allRecords.filter(record => record.page_type === 'serie');
    
    console.log(`SITEMAP STATIC: Record film: ${filmRecords.length}, serie: ${serieRecords.length}`);
    
    return {
      filmRecords,
      serieRecords,
      totalCount
    };
  } catch (error) {
    console.error('SITEMAP STATIC: Errore critico nel recupero dati:', error);
    return { filmRecords: [], serieRecords: [], totalCount: 0 };
  }
}

// Generazione della sitemap statica
async function generateStaticSitemap() {
  try {
    console.log('Generazione sitemap.xml statica in corso...');
    const startTime = Date.now();
    
    // 1. Recupera tutti i film e serie direttamente dal database
    const { filmRecords, serieRecords, totalCount } = await getAllDatabaseRecords();
    console.log(`SITEMAP STATIC: Recuperati dal database ${filmRecords.length} film e ${serieRecords.length} serie (totale DB: ${totalCount})`);
    
    // 2. Estrai gli slug dai record
    const filmSlugs = filmRecords.map(record => record.slug).filter(slug => slug && slug.trim() !== '');
    const serieSlugs = serieRecords.map(record => record.slug).filter(slug => slug && slug.trim() !== '');
    
    console.log(`SITEMAP STATIC: Slug validi - ${filmSlugs.length} film e ${serieSlugs.length} serie`);
    
    // 3. Definisci l'URL base e le rotte statiche
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
    const staticRoutes = ['', '/search', '/login', '/about'];
    
    console.log(`SITEMAP STATIC: Rotte statiche ${staticRoutes.length}`);
    console.log(`SITEMAP STATIC: Conteggio totale URL nella sitemap: ${staticRoutes.length + filmSlugs.length + serieSlugs.length}`);
    
    // 4. Genera il file XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <!-- Generata il: ${new Date().toISOString()} con ${staticRoutes.length + filmSlugs.length + serieSlugs.length} URL -->
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" count="${staticRoutes.length + filmSlugs.length + serieSlugs.length}">
      ${staticRoutes.map(route => `
        <url>
          <loc>${baseUrl}${route}</loc>
          <changefreq>weekly</changefreq>
          <priority>${route === '' ? '1.0' : '0.8'}</priority>
        </url>
      `).join('')}
      
      ${filmSlugs.map(slug => `
        <url>
          <loc>${baseUrl}/film/${slug}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
      
      ${serieSlugs.map(slug => `
        <url>
          <loc>${baseUrl}/serie/${slug}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
    </urlset>`;
    
    // 5. Scrivi il file nella cartella public (accessibile direttamente)
    const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(filePath, xml);
    
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    // Verifica finale sulla dimensione del file
    const fileSize = fs.statSync(filePath).size;
    const fileSizeKB = Math.round(fileSize / 1024);
    
    console.log(`SITEMAP STATIC: File sitemap.xml generato e salvato in ${filePath}`);
    console.log(`SITEMAP STATIC: Dimensione file: ${fileSizeKB} KB`);
    console.log(`SITEMAP STATIC: Tempo di elaborazione: ${processingTime} secondi`);
    console.log(`SITEMAP STATIC: Generazione completata con successo`);
    
    return {
      success: true,
      filePath,
      urlCount: staticRoutes.length + filmSlugs.length + serieSlugs.length,
      fileSize: fileSizeKB
    };
  } catch (error) {
    console.error('SITEMAP STATIC: Errore durante la generazione:', error);
    return { success: false, error: error.message };
  }
}

// Esegui la generazione
generateStaticSitemap()
  .then(result => {
    if (result.success) {
      console.log('✅ Generazione sitemap statica completata');
      process.exit(0);
    } else {
      console.error('❌ Errore durante la generazione sitemap statica:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Errore non gestito:', error);
    process.exit(1);
  }); 