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
      console.warn('Credenziali Supabase mancanti, utilizzo pagine di esempio');
      return getFallbackPages();
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
      return getFallbackPages();
    }
    
    // Se non ci sono dati, usa il fallback
    if (!sampleData || sampleData.length === 0) {
      console.warn('Nessun dato trovato nella tabella generated_pages');
      return getFallbackPages();
    }
    
    // Estrai le colonne disponibili dal campione
    const availableColumns = Object.keys(sampleData[0]);
    console.log('Colonne disponibili nella tabella:', availableColumns);
    
    // Verifica quali colonne possiamo utilizzare
    const hasSlug = availableColumns.includes('slug');
    const timestampColumn = findTimestampColumn(availableColumns);
    
    if (!hasSlug) {
      console.error('La colonna "slug" non esiste nella tabella generated_pages');
      return getFallbackPages();
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
      return getFallbackPages();
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
    return getFallbackPages();
  }
}

// Funzione per trovare una possibile colonna timestamp
function findTimestampColumn(columns: string[]): string | null {
  // Cerca colonne comuni per timestamp
  const timestampColumns = ['updated_at', 'created_at', 'timestamp', 'modified_at', 'date', 'last_updated'];
  
  for (const col of timestampColumns) {
    if (columns.includes(col)) {
      console.log(`Trovata colonna timestamp: ${col}`);
      return col;
    }
  }
  
  return null;
}

// Funzione di fallback per ottenere pagine di esempio
function getFallbackPages(): MappedPage[] {
  console.log('Utilizzo pagine di fallback');
  return [
    { slug: 'film/dune-2021-438631', updatedAt: new Date().toISOString() },
    { slug: 'film/oppenheimer-2023-872585', updatedAt: new Date().toISOString() },
    { slug: 'film/barbie-2023-346698', updatedAt: new Date().toISOString() },
    { slug: 'serie/breaking-bad-2008-1396', updatedAt: new Date().toISOString() },
    { slug: 'serie/stranger-things-2016-66732', updatedAt: new Date().toISOString() }
  ];
}

export async function GET() {
  try {
    const pages = await getAllPages();
    
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
  
  ${pages.map(page => `
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