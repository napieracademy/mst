import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // URL della sitemap su Supabase
    const supabaseSitemapUrl = 'https://gbynhfiqlacmlwpjcxmp.supabase.co/storage/v1/object/public/site-assets/sitemap.xml';
    
    // Recupera la sitemap da Supabase
    const response = await fetch(supabaseSitemapUrl, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Errore nel recupero della sitemap: ${response.status}`);
    }
    
    // Ottieni il contenuto della sitemap
    const sitemapContent = await response.text();
    
    // Restituisci la sitemap con l'header content-type appropriato
    return new NextResponse(sitemapContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache per 1 ora
      }
    });
  } catch (error) {
    console.error('Errore nel recupero della sitemap:', error);
    return new NextResponse('Errore nel recupero della sitemap', { status: 500 });
  }
} 