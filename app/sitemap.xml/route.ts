import { NextResponse } from 'next/server';
import { getPopularMovies, getPopularTVShows } from '../../lib/tmdb';
import { slugify } from '../../lib/utils';
import { createApiSupabaseClient } from '../../lib/supabase-server';

/**
 * Ottiene gli slug delle pagine tracciate dal database Supabase
 * utilizzando la paginazione per superare il limite di 1000 record
 * @param onlyKnownFor Se true, include solo le pagine relative ai "known_for"
 */
export async function getTrackedPageSlugs(onlyKnownFor = false) {
  try {
    console.log('Recupero pagine tracciate da Supabase per la sitemap...');
    console.log(`Filtro pagine: ${onlyKnownFor ? 'solo known_for' : 'tutte'}`);
    const supabase = createApiSupabaseClient();
    
    // Utilizzando direttamente RPC per ottenere il conteggio totale
    const { data: countData } = await supabase
      .rpc('get_page_stats')
      .select('*')
      .single();
      
    console.log('Statistiche pagine recuperate:', countData);
    console.log(`SITEMAP LOG: Totale pagine nel database: ${countData?.total_pages || 'N/A'}`);
    
    // IMPLEMENTAZIONE PAGINAZIONE
    // Recupera i record in batch di 1000 alla volta
    const batchSize = 1000;
    const totalPages = Math.ceil((countData?.total_pages || 0) / batchSize);
    console.log(`SITEMAP LOG: Necessarie ${totalPages} pagine di query per recuperare tutti i dati`);
    
    let allRecords: { slug: string; page_type: string; is_known_for?: boolean }[] = [];
    
    // Recupera i record in batch successivi
    for (let page = 0; page < totalPages; page++) {
      console.log(`SITEMAP LOG: Recupero batch ${page + 1} di ${totalPages}`);
      const offset = page * batchSize;
      
      const { data: batchData, error } = await supabase
        .from('generated_pages')
        .select('slug, page_type, is_known_for')
        .order('first_generated_at', { ascending: false })
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error(`Errore nel recupero del batch ${page + 1}:`, error);
        continue;
      }
      
      console.log(`SITEMAP LOG: Recuperati ${batchData?.length || 0} record nel batch ${page + 1}`);
      
      if (batchData && batchData.length > 0) {
        // Se dobbiamo filtrare per known_for, include solo quelli marcati
        if (onlyKnownFor) {
          const filteredBatch = batchData.filter(record => record.is_known_for === true);
          allRecords = [...allRecords, ...filteredBatch];
          console.log(`SITEMAP LOG: Filtrati ${filteredBatch.length} record 'known_for' dal batch ${page + 1}`);
        } else {
          allRecords = [...allRecords, ...batchData];
        }
      } else {
        // Se non ci sono più dati, interrompi il ciclo
        break;
      }
    }
    
    console.log(`SITEMAP LOG: Totale record recuperati dopo paginazione: ${allRecords.length}`);
    if (onlyKnownFor) {
      console.log(`SITEMAP LOG: Di cui record 'known_for': ${allRecords.filter(r => r.is_known_for === true).length}`);
    }
    
    // Verifica della validità degli slug
    const invalidSlugs = allRecords.filter(page => {
      // Controlla slug nulli o vuoti
      if (!page.slug) {
        console.log(`SITEMAP DEBUG: Trovato slug nullo o vuoto per tipo: ${page.page_type}`);
        return true;
      }
      
      // Controlla caratteri non validi (controllare caratteri non alfanumerici escluso trattino)
      if (/[^\w\-]/g.test(page.slug)) {
        console.log(`SITEMAP DEBUG: Slug con caratteri non validi: ${page.slug} (tipo: ${page.page_type})`);
        return true;
      }
      
      // Controlla lunghezza eccessiva
      if (page.slug.length > 200) {
        console.log(`SITEMAP DEBUG: Slug troppo lungo (${page.slug.length} caratteri): ${page.slug.substring(0, 50)}... (tipo: ${page.page_type})`);
        return true;
      }
      
      // Controlla slug che iniziano con trattino
      if (page.slug.startsWith('-')) {
        console.log(`SITEMAP DEBUG: Slug inizia con trattino: ${page.slug} (tipo: ${page.page_type})`);
        return true;
      }
      
      return false;
    }) || [];
    
    console.log(`SITEMAP DEBUG: Trovati ${invalidSlugs.length} slug potenzialmente problematici`);
    
    // Separa gli slug per tipo (film e serie)
    const filmSlugs = allRecords
      .filter((page) => page.page_type === 'film')
      .map((page) => page.slug);
    
    const serieSlugs = allRecords
      .filter((page) => page.page_type === 'serie')
      .map((page) => page.slug);
    
    console.log(`Recuperate pagine tracciate: ${filmSlugs.length} film, ${serieSlugs.length} serie`);
    
    return { filmSlugs, serieSlugs };
  } catch (error) {
    console.error('Errore critico nel recupero delle pagine tracciate:', error);
    return { filmSlugs: [], serieSlugs: [] };
  }
}

// Funzione per ottenere tutti gli slug dei film disponibili
export async function getFilmSlugs() {
  try {
    console.log('Recupero film popolari da TMDB per la sitemap...');
    const movies = await getPopularMovies();
    const slugs = movies.map((movie: any) => {
      const title = movie.title || 'Film';
      const year = movie.release_date ? movie.release_date.split('-')[0] : '';
      const id = movie.id?.toString() || '';
      return `${slugify(title)}-${year}-${id}`;
    });
    console.log(`Recuperati ${slugs.length} film da TMDB`);
    return slugs;
  } catch (error) {
    console.error('Errore nel recupero degli slug dei film:', error);
    return [];
  }
}

// Funzione per ottenere tutti gli slug delle serie TV disponibili
export async function getSerieSlugs() {
  try {
    console.log('Recupero serie TV popolari da TMDB per la sitemap...');
    const tvShows = await getPopularTVShows();
    const slugs = tvShows.map((show: any) => {
      const title = show.name || 'Serie';
      const year = show.first_air_date ? show.first_air_date.split('-')[0] : '';
      const id = show.id?.toString() || '';
      return `${slugify(title)}-${year}-${id}`;
    });
    console.log(`Recuperate ${slugs.length} serie da TMDB`);
    return slugs;
  } catch (error) {
    console.error('Errore nel recupero degli slug delle serie:', error);
    return [];
  }
}

// Opzione per disabilitare la cache
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Rigenerazione ogni 60 secondi per test

export async function GET() {
  console.log('Generazione sitemap.xml in corso...');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
  
  // Ottieni gli slug da TMDB
  const tmdbFilmSlugs = await getFilmSlugs();
  console.log(`Recuperati ${tmdbFilmSlugs.length} film da TMDB`);
  
  const tmdbSerieSlugs = await getSerieSlugs();
  console.log(`Recuperate ${tmdbSerieSlugs.length} serie da TMDB`);
  
  // Ottieni gli slug dalle pagine tracciate
  const { filmSlugs: trackedFilmSlugs, serieSlugs: trackedSerieSlugs } = await getTrackedPageSlugs();
  console.log(`Recuperati ${trackedFilmSlugs.length} film tracciati da Supabase`);
  console.log(`Recuperate ${trackedSerieSlugs.length} serie tracciate da Supabase`);
  
  // Logging di alcuni esempi di slug problematici
  if (trackedFilmSlugs.length > 0) {
    const sampleFilms = trackedFilmSlugs.slice(0, 5);
    console.log('SITEMAP DEBUG: Esempi di slug film recuperati:', sampleFilms);
    
    // Verifica se ci sono slug con caratteri problematici in XML
    const problematicSlugs = sampleFilms.filter(slug => /[<>&'"]/g.test(slug));
    if (problematicSlugs.length > 0) {
      console.log('SITEMAP DEBUG: Trovati slug film con caratteri problematici XML:', problematicSlugs);
    }
  }
  
  // Unisci gli slug (rimuovendo i duplicati)
  const filmSlugs = [...new Set([...tmdbFilmSlugs, ...trackedFilmSlugs])];
  const serieSlugs = [...new Set([...tmdbSerieSlugs, ...trackedSerieSlugs])];
  
  console.log(`Totale film nella sitemap: ${filmSlugs.length}`);
  console.log(`Totale serie nella sitemap: ${serieSlugs.length}`);
  
  const staticRoutes = [
    '',
    '/search',
    '/login',
    '/about'
  ];

  console.log(`Rotte statiche nella sitemap: ${staticRoutes.length}`);
  console.log(`Conteggio totale URL nella sitemap: ${staticRoutes.length + filmSlugs.length + serieSlugs.length}`);

  // Calcola la dimensione approssimativa dell'XML prima di generarlo
  const estimatedXmlSize = 
    (staticRoutes.length * 150) + 
    (filmSlugs.length * 150) + 
    (serieSlugs.length * 150) + 
    1000; // overhead per header XML ecc.
    
  console.log(`SITEMAP DEBUG: Dimensione stimata dell'XML: ${Math.round(estimatedXmlSize/1024)} KB`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

  // Conteggio finale delle URL
  const urlCount = (xml.match(/<url>/g) || []).length;
  console.log(`SITEMAP DEBUG: Numero effettivo di URL trovati nell'XML: ${urlCount}`);
  console.log('Generazione sitemap.xml completata');
  console.log(`SITEMAP DEBUG: Dimensione effettiva XML: ${Math.round(xml.length/1024)} KB`);
  
  return new NextResponse(xml, { 
    headers: { 
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    } 
  });
} 