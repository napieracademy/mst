import { NextResponse } from 'next/server';
import { getPopularMovies, getPopularTVShows } from '../../lib/tmdb';
import { slugify } from '../../lib/utils';
import { createApiSupabaseClient } from '../../lib/supabase-server';

/**
 * Ottiene gli slug delle pagine tracciate dal database Supabase
 */
export async function getTrackedPageSlugs() {
  try {
    console.log('Recupero pagine tracciate da Supabase per la sitemap...');
    const supabase = createApiSupabaseClient();
    
    // Utilizzando direttamente RPC per ottenere il conteggio
    const { data: countData } = await supabase
      .rpc('get_page_stats')
      .select('*')
      .single();
      
    console.log('Statistiche pagine recuperate:', countData);
      
    const { data, error } = await supabase
      .from('generated_pages')
      .select('slug, page_type')
      .order('visit_count', { ascending: false });
    
    if (error) {
      console.error('Errore nel recupero delle pagine tracciate:', error);
      return { filmSlugs: [], serieSlugs: [] };
    }
    
    // Separa gli slug per tipo (film e serie)
    const filmSlugs = data
      .filter((page: { page_type: string }) => page.page_type === 'film')
      .map((page: { slug: string }) => page.slug);
    
    const serieSlugs = data
      .filter((page: { page_type: string }) => page.page_type === 'serie')
      .map((page: { slug: string }) => page.slug);
    
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

  console.log('Generazione sitemap.xml completata');
  
  return new NextResponse(xml, { 
    headers: { 
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    } 
  });
} 