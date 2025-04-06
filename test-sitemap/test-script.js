const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Funzione principale per generare la sitemap
async function generateSitemap() {
  try {
    // Parametri di base - imposta qui i tuoi valori o usa le variabili d'ambiente
    const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    console.log(`🌐 URL base: ${baseUrl}`);
    console.log(`📄 Percorso sitemap: ${SITEMAP_PATH}`);
    
    // Verifica variabili Supabase
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Mancano le variabili Supabase URL o KEY');
    }
    
    // Inizializza client Supabase
    console.log('🔄 Inizializzazione client Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Client Supabase inizializzato con successo');
    
    // Recupera conteggio totale
    console.log('🔄 Recupero conteggio totale...');
    const { count: totalCount, error: countError } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Errore conteggio: ${countError.message}`);
    }
    
    console.log(`🔢 Totale record nel DB: ${totalCount || 0}`);
    
    // Funzione per recuperare tutti i record con paginazione
    async function fetchAllByType(type) {
      console.log(`🔄 Recupero completo di tutti i record di tipo '${type}'...`);
      const batchSize = 1000;
      let allRecords = [];
      let startIndex = 0;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`  ⏳ Batch ${startIndex}-${startIndex + batchSize - 1}...`);
        const { data, error } = await supabase
          .from('generated_pages')
          .select('slug')
          .eq('page_type', type)
          .range(startIndex, startIndex + batchSize - 1);
          
        if (error) {
          console.log(`  ⚠️ Errore recupero batch: ${error.message}`);
          break;
        }
        
        const batchCount = data?.length || 0;
        allRecords = allRecords.concat(data || []);
        
        console.log(`  ✅ Recuperati ${batchCount} record`);
        
        if (batchCount < batchSize) {
          hasMore = false;
        } else {
          startIndex += batchSize;
        }
      }
      
      console.log(`✅ Recupero completato: ${allRecords.length} record totali di tipo '${type}'`);
      return allRecords;
    }
    
    // Recupera film con paginazione
    console.log('🔄 Recupero film...');
    const filmPages = await fetchAllByType('film');
    
    // Recupera serie con paginazione
    console.log('🔄 Recupero serie...');
    const seriePages = await fetchAllByType('serie');
    
    // Recupera attori e registi
    console.log('🔄 Recupero attori e crew...');
    const { data: crewPages, error: crewError } = await supabase
      .from('generated_pages')
      .select('slug, page_type')
      .not('page_type', 'in', '("film","serie")');
    
    if (crewError) {
      throw new Error(`Errore query persone: ${crewError.message}`);
    }
    
    // Analisi dei record filtrati
    console.log('🔄 Analisi record scartati...');
    
    // Analizza film scartati
    const filmSlugsValid = (filmPages || [])
      .map(page => page.slug)
      .filter(slug => slug && slug.trim() !== '');
    
    const filmScartati = (filmPages || [])
      .filter(page => !page.slug || page.slug.trim() === '')
      .map(page => ({ slug: page.slug, motivo: !page.slug ? 'slug nullo' : 'slug vuoto' }));
      
    console.log(`🔍 Film scartati: ${filmScartati.length} su ${filmPages?.length || 0} (${((filmScartati.length / (filmPages?.length || 1)) * 100).toFixed(2)}%)`);
    
    // Analizza serie scartate
    const serieSlugsValid = (seriePages || [])
      .map(page => page.slug)
      .filter(slug => slug && slug.trim() !== '');
      
    const serieScartate = (seriePages || [])
      .filter(page => !page.slug || page.slug.trim() === '')
      .map(page => ({ slug: page.slug, motivo: !page.slug ? 'slug nullo' : 'slug vuoto' }));
      
    console.log(`🔍 Serie scartate: ${serieScartate.length} su ${seriePages?.length || 0} (${((serieScartate.length / (seriePages?.length || 1)) * 100).toFixed(2)}%)`);
    
    // Recupera i page_type diversi da film e serie
    console.log('🔄 Recupero altri tipi di contenuto...');
    const { data: altriTipi, error: altriError } = await supabase
      .from('generated_pages')
      .select('page_type')
      .not('page_type', 'in', '("film","serie")');
      
    if (altriError) {
      console.log(`⚠️ Errore recupero altri tipi: ${altriError.message}`);
    } else {
      // Conteggio manuale per tipo
      const tipiCount = {};
      (altriTipi || []).forEach(item => {
        const tipo = item.page_type || 'sconosciuto';
        tipiCount[tipo] = (tipiCount[tipo] || 0) + 1;
      });
      
      // Formatta il risultato
      const altriTipiRiepilogo = Object.entries(tipiCount).map(([tipo, count]) => ({ page_type: tipo, count }));
      console.log(`🔍 Altri tipi di contenuto trovati: ${JSON.stringify(altriTipiRiepilogo || [])}`);
      console.log(`🔍 Totale record di altro tipo: ${altriTipi?.length || 0}`);
    }
    
    // Verifica se esistono record con page_type nullo
    console.log('🔄 Controllo record con page_type nullo...');
    const { data: nullTypePages, error: nullTypeError } = await supabase
      .from('generated_pages')
      .select('slug')
      .is('page_type', null)
      .limit(5);
      
    if (nullTypeError) {
      console.log(`⚠️ Errore recupero record con page_type nullo: ${nullTypeError.message}`);
    } else {
      console.log(`🔍 Record con page_type nullo trovati: ${nullTypePages?.length || 0} (mostrando primi 5)`);
      if (nullTypePages && nullTypePages.length > 0) {
        nullTypePages.forEach(page => {
          console.log(`    - Slug: "${page.slug}"`);
        });
      }
      
      // Conteggia il totale di record con page_type nullo
      const { count: nullCount, error: nullCountError } = await supabase
        .from('generated_pages')
        .select('*', { count: 'exact', head: true })
        .is('page_type', null);
        
      if (nullCountError) {
        console.log(`⚠️ Errore conteggio record nulli: ${nullCountError.message}`);
      } else {
        console.log(`🔍 Totale record con page_type nullo: ${nullCount || 0}`);
      }
    }
    
    // Verifica record potenzialmente persone (attori, registi)
    console.log('🔄 Controllo record potenzialmente di persone...');
    const { data: personPages, error: personError } = await supabase
      .from('generated_pages')
      .select('slug, page_type')
      .or('page_type.eq.person,page_type.eq.actor,page_type.eq.director,page_type.eq.cast')
      .limit(5);
      
    if (personError) {
      console.log(`⚠️ Errore recupero record di persone: ${personError.message}`);
    } else {
      console.log(`🔍 Record di potenziali persone trovati: ${personPages?.length || 0} (mostrando primi 5)`);
      if (personPages && personPages.length > 0) {
        personPages.forEach(page => {
          console.log(`    - Tipo: "${page.page_type}", Slug: "${page.slug}"`);
        });
      }
    }
    
    // Stampa primi 5 record scartati per debug
    if (filmScartati.length > 0 || serieScartate.length > 0) {
      console.log('⚠️ Esempi di record scartati:');
      
      if (filmScartati.length > 0) {
        console.log('  Film:');
        filmScartati.slice(0, 3).forEach(item => console.log(`    - Slug: "${item.slug}", Motivo: ${item.motivo}`));
        if (filmScartati.length > 3) console.log(`    ... e altri ${filmScartati.length - 3}`);
      }
      
      if (serieScartate.length > 0) {
        console.log('  Serie:');
        serieScartate.slice(0, 3).forEach(item => console.log(`    - Slug: "${item.slug}", Motivo: ${item.motivo}`));
        if (serieScartate.length > 3) console.log(`    ... e altri ${serieScartate.length - 3}`);
      }
    }
    
    // Recupera statistiche per ogni page_type
    console.log('🔄 Analisi di tutti i tipi di pagina nel database...');
    const { data: pageTypeStats, error: statsError } = await supabase
      .from('generated_pages')
      .select('page_type');
    
    if (statsError) {
      console.log(`⚠️ Errore recupero statistiche page_type: ${statsError.message}`);
    } else {
      // Conteggio manuale per ogni tipo
      const pageTypeCount = {};
      (pageTypeStats || []).forEach(item => {
        const tipo = item.page_type || 'null';
        pageTypeCount[tipo] = (pageTypeCount[tipo] || 0) + 1;
      });
      
      // Formatta e mostra i risultati
      console.log('📊 Distribuzione dei record per page_type:');
      Object.entries(pageTypeCount)
        .sort((a, b) => b[1] - a[1])  // Ordina per conteggio decrescente
        .forEach(([tipo, count]) => {
          console.log(`    - ${tipo}: ${count} record (${((count / (pageTypeStats?.length || 1)) * 100).toFixed(2)}%)`);
        });
        
      // Calcola il totale per verificare
      const totalFound = Object.values(pageTypeCount).reduce((sum, count) => sum + count, 0);
      console.log(`📊 Totale record analizzati: ${totalFound} / ${totalCount}`);
      
      if (totalFound !== totalCount) {
        console.log(`⚠️ ATTENZIONE: ${totalCount - totalFound} record non considerati nell'analisi`);
      }
    }
    
    // Verifico se ci sono tracce di contenuti per adulti
    console.log('🔄 Verifica possibili contenuti per adulti rimossi...');
    
    // Check per tipo 'adult'
    const { count: adultTypeCount, error: adultTypeError } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact', head: true })
      .eq('page_type', 'adult');
    
    if (adultTypeError) {
      console.log(`⚠️ Errore verifica contenuti adult (type): ${adultTypeError.message}`);
    } else {
      console.log(`🔍 Record con page_type 'adult': ${adultTypeCount || 0}`);
    }
    
    // Check per page_type contenente adult o porno
    const { data: adultPatternPages, error: adultPatternError } = await supabase
      .from('generated_pages')
      .select('page_type')
      .or('page_type.ilike.%adult%,page_type.ilike.%porn%,page_type.ilike.%xxx%,page_type.ilike.%sex%')
      .limit(10);
    
    if (adultPatternError) {
      console.log(`⚠️ Errore verifica contenuti adult (pattern): ${adultPatternError.message}`);
    } else {
      console.log(`🔍 Record con page_type contenente pattern adult: ${adultPatternPages?.length || 0}`);
      if (adultPatternPages && adultPatternPages.length > 0) {
        const tipiAdult = {};
        adultPatternPages.forEach(page => {
          tipiAdult[page.page_type] = (tipiAdult[page.page_type] || 0) + 1;
        });
        console.log(`    Tipi trovati: ${JSON.stringify(tipiAdult)}`);
      }
    }
    
    // Check per slug contenente pattern tipici
    const { data: adultSlugPages, error: adultSlugError } = await supabase
      .from('generated_pages')
      .select('slug')
      .or('slug.ilike.%adult%,slug.ilike.%porn%,slug.ilike.%xxx%,slug.ilike.%sex%')
      .limit(10);
    
    if (adultSlugError) {
      console.log(`⚠️ Errore verifica slug adult: ${adultSlugError.message}`);
    } else {
      console.log(`🔍 Record con slug contenente pattern adult: ${adultSlugPages?.length || 0}`);
      if (adultSlugPages && adultSlugPages.length > 0) {
        console.log('    Esempi di slug:');
        adultSlugPages.slice(0, 5).forEach(page => {
          console.log(`    - ${page.slug}`);
        });
      }
    }
    
    // Verifica campi eliminati (tombstone)
    const { count: deletedCount, error: deletedError } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', true);
    
    if (deletedError) {
      console.log(`⚠️ Errore verifica record eliminati: ${deletedError.message}`);
    } else {
      console.log(`🔍 Record marcati come eliminati: ${deletedCount || 0}`);
    }
    
    // Verifica record con "removed" nello slug o altri pattern di rimozione
    const { data: removedPages, error: removedError } = await supabase
      .from('generated_pages')
      .select('slug')
      .or('slug.ilike.%removed%,slug.ilike.%deleted%,slug.ilike.%censored%')
      .limit(10);
    
    if (removedError) {
      console.log(`⚠️ Errore verifica contenuti rimossi: ${removedError.message}`);
    } else {
      console.log(`🔍 Record con slug indicante rimozione: ${removedPages?.length || 0}`);
      if (removedPages && removedPages.length > 0) {
        console.log('    Esempi di slug:');
        removedPages.slice(0, 5).forEach(page => {
          console.log(`    - ${page.slug}`);
        });
      }
    }
    
    // Verifica sull'impatto dei limiti di query
    console.log('🔄 Verifica limiti di query Supabase...');
    
    // Usa range e count per capire se ci sono limiti
    const batchSize = 1000;
    let totalProcessed = 0;
    let records = [];
    
    try {
      let hasMore = true;
      let startIndex = 0;
      
      while (hasMore) {
        const { data, error, count } = await supabase
          .from('generated_pages')
          .select('page_type', { count: 'exact' })
          .range(startIndex, startIndex + batchSize - 1);
          
        if (error) {
          console.log(`⚠️ Errore durante il recupero del batch ${startIndex}-${startIndex + batchSize - 1}: ${error.message}`);
          break;
        }
        
        const batchCount = data?.length || 0;
        totalProcessed += batchCount;
        records = records.concat(data || []);
        
        console.log(`📊 Batch ${startIndex}-${startIndex + batchSize - 1}: ${batchCount} record`);
        
        if (batchCount < batchSize) {
          hasMore = false;
        } else {
          startIndex += batchSize;
        }
        
        // Massimo 3 batch per evitare troppe chiamate
        if (startIndex >= batchSize * 3) {
          console.log(`⚠️ Limite di sicurezza raggiunto dopo 3 batch. Interrompo ulteriori query.`);
          break;
        }
      }
      
      console.log(`📊 Totale record recuperati in batch: ${totalProcessed}`);
      console.log(`📊 Distribuzione per type (dai batch):`);
      
      const typeCount = {};
      records.forEach(r => {
        const type = r.page_type || 'null';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)  // Mostra solo i primi 10 tipi per brevità
        .forEach(([type, count]) => {
          console.log(`    - ${type}: ${count} record`);
        });
        
    } catch (e) {
      console.log(`❌ Errore durante l'analisi dei batch: ${e.message}`);
    }
    
    // Per calcolo URL totali usare i valid slugs
    const filmSlugs = filmSlugsValid;
    const serieSlugs = serieSlugsValid;
    
    // Filtra e raggruppa le persone per tipo
    const personSlugs = {};
    (crewPages || []).forEach(page => {
      if (page.slug && page.slug.trim() !== '') {
        const tipo = page.page_type || 'person';
        if (!personSlugs[tipo]) personSlugs[tipo] = [];
        personSlugs[tipo].push(page.slug);
      }
    });
    
    // Calcola conteggio totale di persone
    const totalPersons = Object.values(personSlugs).reduce((sum, slugs) => sum + slugs.length, 0);
    
    console.log(`🎬 Film validi: ${filmSlugs.length}, 📺 Serie valide: ${serieSlugs.length}, 👨‍👩‍👧‍👦 Persone valide: ${totalPersons}`);
    
    // Log dettagliato persone per tipo
    Object.entries(personSlugs).forEach(([tipo, slugs]) => {
      console.log(`    - ${tipo}: ${slugs.length} pagine`);
    });
    
    // Rotte statiche
    const staticRoutes = ['', '/search', '/login', '/about'];
    const totalUrls = staticRoutes.length + filmSlugs.length + serieSlugs.length + totalPersons;
    
    console.log(`📊 Totale URL sitemap: ${totalUrls}`);
    
    // Funzione per determinare il percorso corretto per ogni tipo di persona
    const getPersonPath = (tipo, slug) => {
      switch (tipo.toLowerCase()) {
        case 'actor':
        case 'attore':
          return `/attore/${slug}`;
        case 'director':
        case 'regista':
          return `/regista/${slug}`;
        case 'cast':
          return `/cast/${slug}`;
        case 'crew':
          return `/crew/${slug}`;
        case 'person':
        default:
          return `/person/${slug}`;
      }
    };
    
    // Genera sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generata il: ${new Date().toISOString()} con ${totalUrls} URL -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" count="${totalUrls}">
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
  
  ${Object.entries(personSlugs).flatMap(([tipo, slugs]) => 
    slugs.map(slug => `
    <url>
      <loc>${baseUrl}${getPersonPath(tipo, slug)}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>
  `)).join('')}
</urlset>`;
    
    // Salva sitemap
    fs.writeFileSync(SITEMAP_PATH, xml);
    console.log(`✅ Sitemap generata con successo in ${SITEMAP_PATH}`);
    
    // Aggiorna statistiche
    try {
      const { error: statsError } = await supabase
        .from('sitemap_stats')
        .upsert([{
          id: 1,
          last_generation: new Date().toISOString(),
          urls_count: totalUrls,
          film_count: filmSlugs.length,
          serie_count: serieSlugs.length,
          is_error: false,
          error_message: null
        }]);
      
      if (statsError) {
        console.log(`⚠️ Errore aggiornamento statistiche: ${statsError.message}`);
      } else {
        console.log('📊 Statistiche aggiornate con successo');
      }
    } catch (statsError) {
      console.log(`⚠️ Errore durante aggiornamento statistiche: ${statsError.message}`);
    }
    
    return {
      success: true,
      message: `Sitemap generata con successo (${totalUrls} URL)`,
      timestamp: new Date().toISOString(),
      urlCount: totalUrls,
      filmCount: filmSlugs.length,
      serieCount: serieSlugs.length
    };
  } catch (error) {
    console.error(`❌ ERRORE: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Funzione di avvio
async function run() {
  console.log('🚀 Avvio test generazione sitemap...');
  const result = await generateSitemap();
  console.log('📋 Risultato:', JSON.stringify(result, null, 2));
  
  if (!result.success) {
    process.exit(1);
  }
}

// Esegui se avviato direttamente
if (require.main === module) {
  run();
}

// Esporta per test
module.exports = { generateSitemap };
