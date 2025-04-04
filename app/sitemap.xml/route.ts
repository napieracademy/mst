import { NextResponse } from 'next/server';
import { getPopularMovies, getPopularTVShows } from '../../lib/tmdb';
import { slugify } from '../../lib/utils';
import { createApiSupabaseClient } from '../../lib/supabase-server';

/**
 * Versione semplificata e più robusta per recuperare TUTTI gli slug dal database,
 * garantendo che non ci siano limitazioni o problemi di paginazione
 */
export async function getAllDatabaseRecords() {
  try {
    console.log('SITEMAP DIRECT: Recupero tutti i record dal database in modo diretto...');
    const supabase = createApiSupabaseClient();
    
    // Ottieni il conteggio totale per debug
    const { count: totalCount, error: countError } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('SITEMAP DIRECT: Errore nel conteggio record:', countError);
      return { filmRecords: [], serieRecords: [], totalCount: 0 };
    }
    
    // Se totalCount è zero, esci subito per evitare query inutili
    if (!totalCount || totalCount === 0) {
      console.warn('SITEMAP DIRECT: Nessun record trovato nel database, usa fallback TMDB');
      return { filmRecords: [], serieRecords: [], totalCount: 0 };
    }
    
    console.log(`SITEMAP DIRECT: Trovati ${totalCount} record totali nel database`);
    
    // Recupera tutti i record con paginazione manuale per evitare limitazioni
    let allRecords: Array<{
      slug: string;
      page_type: string;
      is_known_for?: boolean;
      [key: string]: any; // Per gestire altre proprietà non specificate
    }> = [];
    const batchSize = 1000;
    const pages = Math.ceil((totalCount || 0) / batchSize);
    
    console.log(`SITEMAP DIRECT: Iniziando recupero in ${pages} pagine (${batchSize} record per pagina)`);
    
    for (let page = 0; page < pages; page++) {
      const from = page * batchSize;
      const to = from + batchSize - 1;
      
      console.log(`SITEMAP DIRECT: Recupero pagina ${page + 1}/${pages} (record ${from} - ${to})`);
      
      try {
        const { data, error } = await supabase
          .from('generated_pages')
          .select('*')
          .range(from, to);
        
        if (error) {
          console.error(`SITEMAP DIRECT: Errore nel recupero batch ${page + 1}:`, error);
          continue;
        }
        
        if (!data || data.length === 0) {
          console.warn(`SITEMAP DIRECT: Nessun dato nel batch ${page + 1}`);
          continue;
        }
        
        console.log(`SITEMAP DIRECT: Recuperati ${data.length} record nella pagina ${page + 1}`);
        allRecords = [...allRecords, ...data];
      } catch (batchError) {
        console.error(`SITEMAP DIRECT: Errore critico nel recupero batch ${page + 1}:`, batchError);
        continue; // Continua con il batch successivo anche in caso di errore
      }
    }
    
    console.log(`SITEMAP DIRECT: Totale record recuperati: ${allRecords.length} di ${totalCount} attesi`);
    
    // Dividi i record per tipo
    const filmRecords = allRecords.filter(record => record.page_type === 'film');
    const serieRecords = allRecords.filter(record => record.page_type === 'serie');
    
    console.log(`SITEMAP DIRECT: Record film: ${filmRecords.length}, serie: ${serieRecords.length}`);
    
    return {
      filmRecords,
      serieRecords,
      totalCount
    };
  } catch (error) {
    console.error('SITEMAP DIRECT: Errore critico nel recupero dati:', error);
    return { filmRecords: [], serieRecords: [], totalCount: 0 };
  }
}

/**
 * NOTA: Questa versione dinamica della sitemap è stata sostituita da una versione statica.
 * Il file sitemap.xml viene ora generato dallo script scripts/generate-static-sitemap.js
 * ed è salvato nella cartella public/sitemap.xml.
 * 
 * Questo route handler ora reindirizza alla versione statica. 
 * Per rigenerare la sitemap statica, eseguire:
 * - npm run generate-static-sitemap
 */
export async function GET() {
  // Reindirizza alla versione statica della sitemap
  return NextResponse.redirect(new URL('/sitemap.xml', process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app'));
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 