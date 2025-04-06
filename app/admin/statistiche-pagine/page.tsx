import { createApiSupabaseClient } from '@/lib/supabase-server';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { FEATURES } from '@/lib/features-flags';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Carica il componente SitemapStats in modo dinamico solo lato client
const SitemapStats = dynamic(() => import('@/components/sitemap-stats'), { ssr: false });

export const metadata: Metadata = {
  title: 'Statistiche pagine generate | Mastroianni Admin',
  description: 'Dashboard statistiche pagine generate staticamente o on-demand'
};

// Forza il rendering dinamico della pagina ad ogni richiesta
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const supabase = createApiSupabaseClient();
    
    // Ottieni tutti i record dal database
    const { data: dbRecords, error: dbError, count: totalCount } = await supabase
      .from('generated_pages')
      .select('*', { count: 'exact' });
    
    if (dbError) throw dbError;
    
    console.log(`SITEMAP ANALYZER: Recuperati ${dbRecords?.length || 0} record dal database`);
    
    // In ambiente di sviluppo, utilizziamo i dati dal database direttamente
    // invece di analizzare la sitemap XML
    if (process.env.NODE_ENV === 'development') {
      console.log(`SITEMAP ANALYZER: Utilizzo conteggio diretto dal database in ambiente di sviluppo`);
      
      if (dbRecords) {
        const filmDbRecords = dbRecords.filter(record => record.page_type === 'film');
        const serieDbRecords = dbRecords.filter(record => record.page_type === 'serie');
        
        console.log(`SITEMAP ANALYZER: Record film nel DB: ${filmDbRecords.length}`);
        console.log(`SITEMAP ANALYZER: Record serie nel DB: ${serieDbRecords.length}`);
        
        // Calcola gli slug invalidi (es: slug duplicati)
        const allSlugs = dbRecords.map(r => `${r.page_type}:${r.slug}`);
        const uniqueSlugs = new Set(allSlugs);
        const duplicates = allSlugs.length - uniqueSlugs.size;
        console.log(`SITEMAP ANALYZER: Trovati ${duplicates} slug duplicati`);
        
        // Per ora consideriamo gli stessi valori per sitemap e DB
        // Questo è solo per l'ambiente di sviluppo
        return {
          totalDbRecords: totalCount || dbRecords.length,
          totalSitemapUrls: dbRecords.length + 4, // + 4 per le rotte statiche
          filmDbRecords: filmDbRecords.length,
          serieDbRecords: serieDbRecords.length,
          filmSitemapUrls: filmDbRecords.length,
          serieSitemapUrls: serieDbRecords.length,
          invalidSlugs: []
        };
      }
    }
    
    // In produzione o se non ci sono dati nel DB, continua con l'analisi della sitemap
    // Recupera la sitemap
    const sitemapUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : sitemapUrl;
    
    console.log(`SITEMAP ANALYZER: Ricerca sitemap statica su ${baseUrl}/sitemap.xml`);
    
    // Configura la richiesta con un timeout più lungo (30 secondi)
    const fetchOptions = { 
      cache: 'no-store' as RequestCache,
      // @ts-ignore - l'opzione next esiste ma TypeScript potrebbe non riconoscerla
      next: { revalidate: 0 }, // Disabilita la cache di Next.js
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      signal: AbortSignal.timeout(30000) // 30 secondi di timeout
    };
    
    // Esegui la richiesta HTTP per ottenere la sitemap (file statico)
    const response = await fetch(`${baseUrl}/sitemap.xml`, fetchOptions);
    if (!response.ok) {
      console.error(`SITEMAP ANALYZER: Errore nel recupero della sitemap statica: ${response.status} ${response.statusText}`);
      throw new Error(`Errore nel recupero della sitemap: ${response.status}`);
    }
    
    // Ottieni il contenuto completo della sitemap
    const sitemapXml = await response.text();
    
    // Log per verifica della versione della sitemap
    const generationInfo = sitemapXml.match(/<!-- Generata il: (.*?) con (\d+) URL -->/);
    if (generationInfo) {
      console.log(`SITEMAP ANALYZER: Sitemap generata il ${generationInfo[1]} con ${generationInfo[2]} URL`);
    }
    
    console.log(`SITEMAP ANALYZER: Dimensione sitemap recuperata: ${Math.round(sitemapXml.length/1024)} KB`);
    console.log('SITEMAP ANALYZER: Prime 200 caratteri:', sitemapXml.substring(0, 200));
    
    // Conta gli URL nella sitemap con regex più affidabili
    const urlPattern = /<url>\s*<loc>([^<]+)<\/loc>/g;
    const filmUrlPattern = /<url>\s*<loc>([^<]+\/film\/[^<]+)<\/loc>/g;
    const serieUrlPattern = /<url>\s*<loc>([^<]+\/serie\/[^<]+)<\/loc>/g;
    
    // Estrai tutti gli URL dalla sitemap
    let allUrls = [];
    let match;
    while (match = urlPattern.exec(sitemapXml)) {
      allUrls.push(match[1]);
    }
    
    // Estrai URL film e serie
    let filmUrls = [];
    while (match = filmUrlPattern.exec(sitemapXml)) {
      filmUrls.push(match[1]);
    }
    
    let serieUrls = [];
    while (match = serieUrlPattern.exec(sitemapXml)) {
      serieUrls.push(match[1]);
    }
    
    console.log(`SITEMAP ANALYZER: Totale URL trovati: ${allUrls.length}`);
    console.log(`SITEMAP ANALYZER: URL film trovati: ${filmUrls.length}`);
    console.log(`SITEMAP ANALYZER: URL serie trovati: ${serieUrls.length}`);
    console.log(`SITEMAP ANALYZER: URL altri (non film/serie): ${allUrls.length - filmUrls.length - serieUrls.length}`);
    
    if (allUrls.length > 0) {
      console.log('SITEMAP ANALYZER: Primi 5 URL:', allUrls.slice(0, 5));
    }
    
    if (filmUrls.length > 0) {
      console.log('SITEMAP ANALYZER: Primi 3 URL film:', filmUrls.slice(0, 3));
    }
    
    if (serieUrls.length > 0) {
      console.log('SITEMAP ANALYZER: Primi 3 URL serie:', serieUrls.slice(0, 3));
    }
    
    // Estrai gli slug dalla sitemap
    const filmSlugs = filmUrls.map(url => {
      const matches = url.match(/\/film\/([^/]+)(?:\/)?$/);
      return matches ? matches[1] : '';
    }).filter(Boolean);
    
    const serieSlugs = serieUrls.map(url => {
      const matches = url.match(/\/serie\/([^/]+)(?:\/)?$/);
      return matches ? matches[1] : '';
    }).filter(Boolean);
    
    console.log(`SITEMAP ANALYZER: Estratti ${filmSlugs.length} slug film dalla sitemap`);
    console.log(`SITEMAP ANALYZER: Estratti ${serieSlugs.length} slug serie dalla sitemap`);
    
    // Identifica i record del DB che non sono nella sitemap
    const invalidSlugs = [];
    
    if (dbRecords) {
      const filmDbRecords = dbRecords.filter(record => record.page_type === 'film');
      const serieDbRecords = dbRecords.filter(record => record.page_type === 'serie');
      
      console.log(`SITEMAP ANALYZER: Record film nel DB: ${filmDbRecords.length}`);
      console.log(`SITEMAP ANALYZER: Record serie nel DB: ${serieDbRecords.length}`);
      
      // Controlla i film mancanti
      let slugSpecialCharsCount = 0;
      let slugEmptyCount = 0;
      let slugLongCount = 0;
      let slugStartsWithDashCount = 0;
      let slugXmlInvalidCount = 0;
      let slugUnknownCount = 0;
      
      for (const record of filmDbRecords) {
        if (!filmSlugs.includes(record.slug)) {
          // Analizza il motivo
          let reason = 'Sconosciuto';
          
          // Verifica le caratteristiche dello slug che potrebbero causare problemi
          if (!record.slug || record.slug.trim() === '') {
            reason = 'Slug vuoto o nullo';
            slugEmptyCount++;
          } 
          // Controlla se è uno slug duplicato nel DB
          else if (dbRecords.filter(r => r.slug === record.slug && r.page_type === record.page_type).length > 1) {
            reason = 'Duplicato nel database';
          } 
          // Controlla se lo slug ha caratteri non validi
          else if (/[^\w\-]/g.test(record.slug)) {
            reason = 'Caratteri non validi nello slug';
            slugSpecialCharsCount++;
          }
          // Controlla se lo slug ha caratteri problematici per XML
          else if (/[<>&'"]/g.test(record.slug)) {
            reason = 'Caratteri non validi per XML';
            slugXmlInvalidCount++;
          }
          // Controlla se è troppo lungo
          else if (record.slug.length > 200) {
            reason = 'Slug troppo lungo';
            slugLongCount++;
          }
          // Controlla se inizia con un trattino
          else if (record.slug.startsWith('-')) {
            reason = 'Slug inizia con trattino';
            slugStartsWithDashCount++;
          }
          else {
            slugUnknownCount++;
          }
          
          invalidSlugs.push({
            slug: record.slug,
            page_type: record.page_type,
            reason
          });
        }
      }
      
      console.log(`SITEMAP ANALYZER: Motivi esclusione film - Caratteri speciali: ${slugSpecialCharsCount}, Vuoti: ${slugEmptyCount}, Troppo lunghi: ${slugLongCount}, Iniziano con trattino: ${slugStartsWithDashCount}, XML invalidi: ${slugXmlInvalidCount}, Sconosciuti: ${slugUnknownCount}`);
      
      // Reset contatori per le serie
      slugSpecialCharsCount = 0;
      slugEmptyCount = 0;
      slugLongCount = 0;
      slugStartsWithDashCount = 0;
      slugXmlInvalidCount = 0;
      slugUnknownCount = 0;
      
      // Controlla le serie mancanti
      for (const record of serieDbRecords) {
        if (!serieSlugs.includes(record.slug)) {
          // Analizza il motivo
          let reason = 'Sconosciuto';
          
          // Verifica le caratteristiche dello slug che potrebbero causare problemi
          if (!record.slug || record.slug.trim() === '') {
            reason = 'Slug vuoto o nullo';
            slugEmptyCount++;
          } 
          // Controlla se è uno slug duplicato nel DB
          else if (dbRecords.filter(r => r.slug === record.slug && r.page_type === record.page_type).length > 1) {
            reason = 'Duplicato nel database';
          } 
          // Controlla se lo slug ha caratteri non validi
          else if (/[^\w\-]/g.test(record.slug)) {
            reason = 'Caratteri non validi nello slug';
            slugSpecialCharsCount++;
          }
          // Controlla se lo slug ha caratteri problematici per XML
          else if (/[<>&'"]/g.test(record.slug)) {
            reason = 'Caratteri non validi per XML';
            slugXmlInvalidCount++;
          }
          // Controlla se è troppo lungo
          else if (record.slug.length > 200) {
            reason = 'Slug troppo lungo';
            slugLongCount++;
          }
          // Controlla se inizia con un trattino
          else if (record.slug.startsWith('-')) {
            reason = 'Slug inizia con trattino';
            slugStartsWithDashCount++;
          }
          else {
            slugUnknownCount++;
          }
          
          invalidSlugs.push({
            slug: record.slug,
            page_type: record.page_type,
            reason
          });
        }
      }
      
      console.log(`SITEMAP ANALYZER: Motivi esclusione serie - Caratteri speciali: ${slugSpecialCharsCount}, Vuoti: ${slugEmptyCount}, Troppo lunghi: ${slugLongCount}, Iniziano con trattino: ${slugStartsWithDashCount}, XML invalidi: ${slugXmlInvalidCount}, Sconosciuti: ${slugUnknownCount}`);
      console.log(`SITEMAP ANALYZER: Totale record non inclusi nella sitemap: ${invalidSlugs.length}`);
      
      if (invalidSlugs.length > 0) {
        // Mostra alcuni esempi di slug "Sconosciuto"
        const unknownSlugs = invalidSlugs
          .filter(item => item.reason === 'Sconosciuto')
          .slice(0, 10)
          .map(item => item.slug);
          
        if (unknownSlugs.length > 0) {
          console.log('SITEMAP ANALYZER: Esempi di slug con esclusione "Sconosciuto":', unknownSlugs);
        }
      }
      
      return {
        totalDbRecords: totalCount || dbRecords.length,
        totalSitemapUrls: allUrls.length, // Utilizziamo il conteggio esatto di tutti gli URL
        filmDbRecords: filmDbRecords.length,
        serieDbRecords: serieDbRecords.length,
        filmSitemapUrls: filmSlugs.length,
        serieSitemapUrls: serieSlugs.length,
        invalidSlugs
      };
    }
    
    return {
      totalDbRecords: 0,
      totalSitemapUrls: allUrls.length,
      filmDbRecords: 0,
      serieDbRecords: 0,
      filmSitemapUrls: filmSlugs.length,
      serieSitemapUrls: serieSlugs.length,
      invalidSlugs: []
    };
    
  } catch (error) {
    console.error('Errore nell\'analisi della sitemap:', error);
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
  const currentPage = parseInt(searchParams.page || '1', 10);
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
      
      {/* Analisi Sitemap con componente SitemapStats */}
      <div className="mb-8 border border-gray-300 p-4">
        <h2 className="text-xl font-semibold mb-2">Gestione Sitemap</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Colonna 1: Componente SitemapStats */}
          <div>
            <h3 className="font-medium mb-2">Stato Sitemap</h3>
            <SitemapStats />
          </div>
          
          {/* Colonna 2: Analisi tradizionale */}
          <div>
            <h3 className="font-medium mb-2">Analisi sitemap</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium mb-2">Database</h4>
                <ul className="list-disc pl-5">
                  <li>Record totali: <strong>{sitemapAnalysis.totalDbRecords}</strong></li>
                  <li>Film: <strong>{sitemapAnalysis.filmDbRecords}</strong></li>
                  <li>Serie: <strong>{sitemapAnalysis.serieDbRecords}</strong></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Sitemap</h4>
                <ul className="list-disc pl-5">
                  <li>URL totali: <strong>{sitemapAnalysis.totalSitemapUrls}</strong></li>
                  <li>Film: <strong>{sitemapAnalysis.filmSitemapUrls}</strong></li>
                  <li>Serie: <strong>{sitemapAnalysis.serieSitemapUrls}</strong></li>
                </ul>
              </div>
            </div>
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
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Nota: Il confronto viene effettuato al momento del caricamento della pagina.</p>
          <div className="mt-2 flex space-x-3">
            <Link 
              href="/sitemap.xml" 
              className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visualizza Sitemap XML
            </Link>
            
            <Link 
              href="/admin/statistiche-pagine" 
              className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
              prefetch={false}
            >
              Aggiorna statistiche
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