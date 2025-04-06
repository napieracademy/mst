import { NextRequest, NextResponse } from 'next/server';
import { createApiSupabaseClient } from '@/lib/supabase-server';

// Disabilitiamo la generazione statica di questa route
export const dynamic = 'force-dynamic';

/**
 * API per recuperare le statistiche della sitemap
 * Questo endpoint restituisce:
 * - Conteggio totale record nel DB
 * - Statistiche della sitemap dal record sitemap_stats
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createApiSupabaseClient();
    
    // Controlla se Supabase è configurato
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Configurazione Supabase mancante',
        totalCount: 0,
        sitemapCount: 0
      }, { status: 200 });
    }
    
    // 1. Recupera conteggio totale dei record
    const { count: totalCount, error: countError } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Errore nel conteggio dei record:', countError);
      return NextResponse.json({ 
        success: false, 
        error: countError.message 
      }, { status: 500 });
    }
    
    // 2. Recupera statistiche della sitemap dalla tabella sitemap_stats
    const { data: sitemapStats, error: statsError } = await supabase
      .from('sitemap_stats')
      .select('*')
      .eq('id', 1)
      .single();
    
    let sitemapCount = 0;
    let lastGeneration = null;
    let filmCount = 0;
    let serieCount = 0;
    let isError = false;
    let errorMessage = null;
    
    if (statsError) {
      // Se non c'è ancora il record sitemap_stats, leggi i conteggi dalla sitemap XML
      console.log('Record sitemap_stats non trovato, recupero informazioni dalla sitemap');
      
      try {
        // Fallback: estrai le informazioni dall'intestazione della sitemap
        const sitemapResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app'}/sitemap.xml`, {
          cache: 'no-store',
          headers: {
            'Range': 'bytes=0-500' // Solo i primi bytes per leggere l'intestazione
          }
        });
        
        if (sitemapResponse.ok) {
          const sitemapText = await sitemapResponse.text();
          const countMatch = sitemapText.match(/con (\d+) URL/);
          const dateMatch = sitemapText.match(/Generata il: ([^<]+)/);
          
          if (countMatch && countMatch[1]) {
            sitemapCount = parseInt(countMatch[1], 10);
          }
          
          if (dateMatch && dateMatch[1]) {
            lastGeneration = dateMatch[1];
          }
        } else {
          errorMessage = `Impossibile leggere la sitemap: ${sitemapResponse.status}`;
          isError = true;
        }
      } catch (fetchError) {
        console.error('Errore nel recupero della sitemap:', fetchError);
        errorMessage = 'Errore nel recupero della sitemap';
        isError = true;
      }
    } else if (sitemapStats) {
      // Usa i dati dalla tabella sitemap_stats
      sitemapCount = sitemapStats.urls_count;
      lastGeneration = sitemapStats.last_generation;
      filmCount = sitemapStats.film_count;
      serieCount = sitemapStats.serie_count;
      isError = sitemapStats.is_error;
      errorMessage = sitemapStats.error_message;
    }
    
    return NextResponse.json({
      success: true,
      totalCount,
      sitemapCount,
      lastGeneration,
      filmCount,
      serieCount,
      isError,
      errorMessage
    });
    
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}