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
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Configurazione Supabase mancante'
      });
    }

    // Get counts from generated_pages using raw query
    const { data: pageCounts, error: pageError } = await supabase
      .rpc('get_page_type_counts');

    if (pageError) {
      return NextResponse.json({ 
        success: false, 
        error: pageError.message 
      });
    }

    // Get sitemap stats
    const { data: stats, error: statsError } = await supabase
      .from('sitemap_stats')
      .select('*')
      .order('last_generation', { ascending: false })
      .limit(1)
      .single();

    if (statsError) {
      return NextResponse.json({ 
        success: false, 
        error: statsError.message 
      });
    }

    interface PageCount {
      page_type: string;
      count: number;
    }

    const filmCount = (pageCounts as PageCount[] | null)?.find(p => p.page_type === 'film')?.count || 0;
    const serieCount = (pageCounts as PageCount[] | null)?.find(p => p.page_type === 'serie')?.count || 0;
    const attoriCount = (pageCounts as PageCount[] | null)?.find(p => p.page_type === 'attore')?.count || 0;
    const registiCount = (pageCounts as PageCount[] | null)?.find(p => p.page_type === 'regista')?.count || 0;

    return NextResponse.json({
      totalCount: stats.total_count,
      sitemapCount: stats.sitemap_count,
      lastGeneration: stats.last_generation,
      filmCount,
      serieCount,
      attoriCount,
      registiCount,
      isError: false,
      errorMessage: null
    });
    
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
}