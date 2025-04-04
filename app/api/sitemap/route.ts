import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Funzione per ottenere gli URL da Supabase
async function getAllPages() {
  try {
    // Utilizza Supabase per recuperare le pagine generate
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Credenziali Supabase mancanti, utilizzo pagine di esempio');
      // Restituisci alcune pagine di esempio in caso di mancanza di credenziali
      return [
        { slug: 'film/dune-2021-438631', updatedAt: new Date().toISOString() },
        { slug: 'film/oppenheimer-2023-872585', updatedAt: new Date().toISOString() },
        { slug: 'film/barbie-2023-346698', updatedAt: new Date().toISOString() },
        { slug: 'serie/breaking-bad-2008-1396', updatedAt: new Date().toISOString() },
        { slug: 'serie/stranger-things-2016-66732', updatedAt: new Date().toISOString() }
      ];
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Recupera tutti i record dalla tabella generatedpages
    const { data, error } = await supabase
      .from('generated_pages')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Errore nel recupero pagine da Supabase:', error);
      throw error;
    }
    
    // Mappa i risultati nel formato richiesto
    return data.map(page => ({
      slug: page.slug,
      updatedAt: page.updated_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Errore nel recupero delle pagine:', error);
    // In caso di errore, restituisci le pagine di esempio
    return [
      { slug: 'film/dune-2021-438631', updatedAt: new Date().toISOString() },
      { slug: 'film/oppenheimer-2023-872585', updatedAt: new Date().toISOString() },
      { slug: 'film/barbie-2023-346698', updatedAt: new Date().toISOString() },
      { slug: 'serie/breaking-bad-2008-1396', updatedAt: new Date().toISOString() },
      { slug: 'serie/stranger-things-2016-66732', updatedAt: new Date().toISOString() }
    ];
  }
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