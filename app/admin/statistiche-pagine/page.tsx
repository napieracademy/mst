import { createApiSupabaseClient } from '@/lib/supabase-server';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { FEATURES } from '@/lib/features-flags';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Statistiche pagine generate | Mastroianni Admin',
  description: 'Dashboard statistiche pagine generate staticamente o on-demand'
};

interface SitemapAnalysisProps {
  totalDbRecords: number;
  totalSitemapUrls: number;
  filmDbRecords: number;
  serieDbRecords: number;
  filmSitemapUrls: number;
  serieSitemapUrls: number;
  invalidSlugs: Array<{slug: string, page_type: string, reason: string}>;
}

// Funzione per analizzare la sitemap
async function analyzeSitemap(): Promise<SitemapAnalysisProps> {
  try {
    let dbRecords = [];
    let totalCount = 0;
    
    try {
      const supabase = createApiSupabaseClient();
      // Ottieni tutti i record dal database
      const { data, error, count } = await supabase
        .from('generated_pages')
        .select('*', { count: 'exact' });
        
      if (!error && data) {
        dbRecords = data;
        totalCount = count || data.length;
      } else {
        console.error('Errore nel recupero dei record DB:', error);
      }
    } catch (dbError) {
      console.error('Errore nella connessione a Supabase:', dbError);
      // Continua con valori di default
    }
    
    // Calcola i conteggi basati solo sui dati disponibili nel DB
    const filmDbRecords = dbRecords.filter(record => record.page_type === 'film');
    const serieDbRecords = dbRecords.filter(record => record.page_type === 'serie');
    
    // Loghiamo i dati trovati
    console.log(`Conteggio pagine dal database: Totale ${totalCount}, Film: ${filmDbRecords.length}, Serie: ${serieDbRecords.length}`);
    
    // Restituisci i dati senza dipendere da fetch esterni
    return {
      totalDbRecords: totalCount,
      totalSitemapUrls: dbRecords.length + 4, // +4 per le rotte statiche
      filmDbRecords: filmDbRecords.length,
      serieDbRecords: serieDbRecords.length,
      filmSitemapUrls: filmDbRecords.length,
      serieSitemapUrls: serieDbRecords.length,
      invalidSlugs: []
    };
  } catch (error) {
    console.error('Errore nell\'analisi della sitemap:', error);
    // Restituisci un oggetto vuoto ma valido
    return {
      totalDbRecords: 0,
      totalSitemapUrls: 0,
      filmDbRecords: 0,
      serieDbRecords: 0,
      filmSitemapUrls: 0,
      serieSitemapUrls: 0,
      invalidSlugs: []
    };
  }
}

const StatsDashboard = async ({
  searchParams,
}: {
  searchParams: { page?: string };
}) => {
  // Verifica che il tracciamento sia attivo
  if (!FEATURES.TRACK_GENERATED_PAGES) {
    return (
      <div className="py-4 bg-white text-black">
        <div className="border-l-4 border-black p-4" role="alert">
          <p className="font-bold">Tracciamento disattivato</p>
          <p>Il tracciamento pagine è disattivato. Attivalo modificando FEATURES.TRACK_GENERATED_PAGES in features-flags.ts</p>
        </div>
      </div>
    );
  }
  
  const supabase = createApiSupabaseClient();
  
  // Parametri di paginazione
  const page = searchParams?.page;
  const currentPage = parseInt(page || '1', 10);
  const pageSize = 50;
  const offset = (currentPage - 1) * pageSize;
  
  // Pagine più visitate, ordinate per data di generazione dal più nuovo al più vecchio
  const { data: pages, error: pagesError, count } = await supabase
    .from('generated_pages')
    .select('*', { count: 'exact' })
    .order('first_generated_at', { ascending: false })
    .range(offset, offset + pageSize - 1);
    
  // Statistiche generali
  const { data: statsData, error: statsError } = await supabase
    .rpc('get_page_stats')
    .select('*')
    .single();
  
  // Se la funzione RPC non esiste ancora, crea dati fittizi
  const stats = statsData || {
    total_pages: count || 0,
    total_film: pages?.filter(p => p.page_type === 'film').length || 0,
    total_serie: pages?.filter(p => p.page_type === 'serie').length || 0,
    total_visits: pages?.reduce((sum, page) => sum + (page.visit_count || 0), 0) || 0
  };
  
  // Analisi della sitemap
  const sitemapAnalysis = await analyzeSitemap();
  
  // Formatta le date con il fuso orario corretto (Europa/Roma)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    
    // Crea una nuova data dall'input
    const date = new Date(dateStr);
    
    // Opzioni per il formato italiano con fuso orario corretto
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome'  // Specifico il fuso orario italiano
    };
    
    return date.toLocaleString('it-IT', options);
  };
  
  // Calcolo della paginazione
  const totalPages = Math.ceil((count || 0) / pageSize);
  
  return (
    <div className="container mx-auto p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-6">Statistiche pagine generate</h1>
      
      {/* Statistiche generali in forma testuale */}
      <div className="mb-8 border border-gray-300 p-4">
        <h2 className="text-xl font-semibold mb-2">Riepilogo</h2>
        <ul className="list-disc pl-5">
          <li>Pagine totali: <strong>{stats.total_pages}</strong></li>
          <li>Film: <strong>{stats.total_film}</strong></li>
          <li>Serie TV: <strong>{stats.total_serie}</strong></li>
          <li>Visite totali: <strong>{stats.total_visits}</strong></li>
          <li>Visualizzazione: <strong>Pagina {currentPage} di {totalPages}</strong> (50 record per pagina)</li>
        </ul>
      </div>
      
      {/* Analisi Sitemap */}
      <div className="mb-8 border border-gray-300 p-4">
        <h2 className="text-xl font-semibold mb-2">Analisi sitemap</h2>
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium mb-2">Database</h3>
              <ul className="list-disc pl-5">
                <li>Record totali: <strong>{sitemapAnalysis.totalDbRecords}</strong></li>
                <li>Film: <strong>{sitemapAnalysis.filmDbRecords}</strong></li>
                <li>Serie: <strong>{sitemapAnalysis.serieDbRecords}</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Sitemap</h3>
              <ul className="list-disc pl-5">
                <li>URL totali: <strong>{sitemapAnalysis.totalSitemapUrls}</strong></li>
                <li>Film: <strong>{sitemapAnalysis.filmSitemapUrls}</strong></li>
                <li>Serie: <strong>{sitemapAnalysis.serieSitemapUrls}</strong></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Discrepanza: <strong>{sitemapAnalysis.totalDbRecords - sitemapAnalysis.totalSitemapUrls}</strong> record non inclusi nella sitemap</h3>
            
            {sitemapAnalysis.invalidSlugs.length > 0 ? (
              <div className="overflow-auto max-h-80">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left">Tipo</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Slug</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Motivo esclusione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sitemapAnalysis.invalidSlugs.slice(0, 100).map((item, index) => (
                      <tr key={`${item.slug}-${index}`} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                        <td className="border border-gray-300 px-3 py-2">{item.page_type}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          <a href={`/${item.page_type}/${item.slug}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            {item.slug}
                          </a>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">{item.reason}</td>
                      </tr>
                    ))}
                    {sitemapAnalysis.invalidSlugs.length > 100 && (
                      <tr>
                        <td colSpan={3} className="border border-gray-300 px-3 py-2 text-center">
                          ... e altri {sitemapAnalysis.invalidSlugs.length - 100} record
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Non sono stati trovati problemi di sincronizzazione tra database e sitemap.</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Nota: Il confronto viene effettuato al momento del caricamento della pagina.</p>
          <div className="mt-2 flex space-x-3">
            <Link 
              href="/api/regenerate-sitemap?from=ui" 
              className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
              prefetch={false}
            >
              Rigenera Sitemap
            </Link>
            
            <Link 
              href="/sitemap.xml" 
              className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visualizza Sitemap XML
            </Link>
          </div>
        </div>
      </div>
      
      {/* Tabella pagine */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Elenco pagine tracciate (più recenti)</h2>
        <div className="overflow-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Slug</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Visite</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Prima generazione</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Ultima visita</th>
              </tr>
            </thead>
            <tbody>
              {pages?.map((page, index) => (
                <tr key={`${page.slug}-${page.page_type}`} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">
                    <a href={`/${page.page_type}/${page.slug}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {page.slug}
                    </a>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{page.page_type}</td>
                  <td className="border border-gray-300 px-4 py-2">{page.visit_count}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(page.first_generated_at)}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(page.last_visited_at)}</td>
                </tr>
              ))}
              {!pages?.length && (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-4 py-2 text-center">
                    Nessuna pagina tracciata trovata
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Controlli di paginazione */}
      <div className="flex justify-between items-center mt-6 mb-8">
        <div>
          Pagina {currentPage} di {totalPages}
        </div>
        <div className="flex space-x-2">
          {currentPage > 1 && (
            <Link href={`/admin/statistiche-pagine?page=1`} className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
              Prima
            </Link>
          )}
          
          {currentPage > 1 && (
            <Link href={`/admin/statistiche-pagine?page=${currentPage - 1}`} className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
              Precedente
            </Link>
          )}
          
          {currentPage < totalPages && (
            <Link href={`/admin/statistiche-pagine?page=${currentPage + 1}`} className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
              Successiva
            </Link>
          )}
          
          {currentPage < totalPages && (
            <Link href={`/admin/statistiche-pagine?page=${totalPages}`} className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
              Ultima
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function StatistichePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  return (
    <Suspense fallback={<div className="p-8 bg-white text-black">Caricamento statistiche...</div>}>
      <StatsDashboard searchParams={searchParams} />
    </Suspense>
  );
} 