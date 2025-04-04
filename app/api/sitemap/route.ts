import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Definizione dei tipi per migliorare la type safety
interface PageData {
  slug: string;
  [key: string]: any; // Per supportare qualsiasi altra colonna
}

interface MappedPage {
  slug: string;
  updatedAt: string;
}

// Funzione per ottenere gli URL da Supabase
async function getAllPages(): Promise<MappedPage[]> {
  try {
    // Utilizza Supabase per recuperare le pagine generate
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Credenziali Supabase mancanti');
      return []; // Restituisci un array vuoto invece di dati fake
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Prima interroghiamo la struttura della tabella per scoprire quali colonne sono disponibili
    // Prendiamo solo una riga per verificare la struttura
    const { data: sampleData, error: sampleError } = await supabase
      .from('generated_pages')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Errore nel verificare la struttura della tabella:', sampleError);
      return []; // Restituisci un array vuoto invece di dati fake
    }
    
    // Se non ci sono dati, usa il fallback
    if (!sampleData || sampleData.length === 0) {
      console.warn('Nessun dato trovato nella tabella generated_pages');
      return []; // Restituisci un array vuoto invece di dati fake
    }
    
    // Estrai le colonne disponibili dal campione
    const availableColumns = Object.keys(sampleData[0]);
    console.log('Colonne disponibili nella tabella:', availableColumns);
    
    // Verifica quali colonne possiamo utilizzare
    const hasSlug = availableColumns.includes('slug');
    const timestampColumn = findTimestampColumn(availableColumns);
    
    if (!hasSlug) {
      console.error('La colonna "slug" non esiste nella tabella generated_pages');
      return []; // Restituisci un array vuoto invece di dati fake
    }
    
    // Costruisci la query in base alle colonne disponibili
    let query = supabase.from('generated_pages').select('slug');
    
    // Se esiste una colonna timestamp, la includiamo nella query e ordiniamo per essa
    if (timestampColumn) {
      query = supabase.from('generated_pages').select(`slug, ${timestampColumn}`);
      query = query.order(timestampColumn, { ascending: false });
    }
    
    // Esegui la query
    const { data, error } = await query;
    
    if (error) {
      console.error('Errore nel recupero pagine da Supabase:', error);
      return []; // Restituisci un array vuoto invece di dati fake
    }
    
    // Mappa i risultati nel formato richiesto
    return data.map((page: PageData) => ({
      slug: page.slug,
      updatedAt: (timestampColumn && page[timestampColumn]) 
        ? page[timestampColumn] 
        : new Date().toISOString()
    }));
  } catch (error) {
    console.error('Errore nel recupero delle pagine:', error);
    return []; // Restituisci un array vuoto invece di dati fake
  }
}

// Funzione per trovare una possibile colonna timestamp
function findTimestampColumn(columns: string[]): string | null {
  // Cerca colonne comuni per timestamp
  const timestampColumns = ['updated_at', 'created_at', 'timestamp', 'modified_at', 'date', 'last_updated', 'first_generated_at', 'last_visited_at'];
  
  for (const col of timestampColumns) {
    if (columns.includes(col)) {
      console.log(`Trovata colonna timestamp: ${col}`);
      return col;
    }
  }
  
  return null;
}

export async function GET() {
  try {
    const dynamicPages = await getAllPages();
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
    
    // Aggiungi le pagine statiche
    const staticPages = [
      { path: '', priority: '1.0' },
      { path: 'search', priority: '0.8' },
      { path: 'login', priority: '0.7' },
      { path: 'about', priority: '0.7' }
    ];
    
    // Crea la sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}/${page.path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  
  ${dynamicPages.map(page => `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;
    
    // Configura la cache per revalidare la sitemap periodicamente (ogni 24 ore)
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error('Errore nella generazione della sitemap:', error);
    return new NextResponse('Errore nella generazione della sitemap', { status: 500 });
  }
}

// Assicurati che questa route sia dinamica 
export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalida ogni 24 ore 