import { NextResponse } from 'next/server';
import { getPopularMovies, getPopularTVShows } from '@/lib/tmdb';
import { slugify } from '@/lib/utils';

// Funzione per ottenere tutti gli slug dei film disponibili
async function getFilmSlugs() {
  try {
    const movies = await getPopularMovies();
    return movies.map(movie => {
      const title = movie.title || 'Film';
      const year = movie.release_date ? movie.release_date.split('-')[0] : '';
      const id = movie.id?.toString() || '';
      return `${slugify(title)}-${year}-${id}`;
    });
  } catch (error) {
    console.error('Errore nel recupero degli slug dei film:', error);
    return [];
  }
}

// Funzione per ottenere tutti gli slug delle serie TV disponibili
async function getSerieSlugs() {
  try {
    const tvShows = await getPopularTVShows();
    return tvShows.map(show => {
      const title = show.name || 'Serie';
      const year = show.first_air_date ? show.first_air_date.split('-')[0] : '';
      const id = show.id?.toString() || '';
      return `${slugify(title)}-${year}-${id}`;
    });
  } catch (error) {
    console.error('Errore nel recupero degli slug delle serie:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
  const filmSlugs = await getFilmSlugs();
  const serieSlugs = await getSerieSlugs();
  
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

  return new NextResponse(xml, { 
    headers: { 
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    } 
  });
}

// Configura la revalidazione della sitemap ogni ora
export const revalidate = 3600; 