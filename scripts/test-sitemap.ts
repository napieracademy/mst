/**
 * Script per testare la generazione della sitemap
 * Esegue una chiamata diretta al generatore della sitemap e confronta gli slug da TMDB con quelli da Supabase
 */

import { getTrackedPageSlugs, getFilmSlugs, getSerieSlugs } from '../app/sitemap.xml/route';

async function testSitemap() {
  console.log('Avvio test sitemap...');
  
  // Ottieni gli slug da TMDB
  console.log('Recupero slug da TMDB...');
  const tmdbFilmSlugs = await getFilmSlugs();
  const tmdbSerieSlugs = await getSerieSlugs();
  
  // Ottieni gli slug dalle pagine tracciate
  console.log('Recupero slug da Supabase...');
  const { filmSlugs: trackedFilmSlugs, serieSlugs: trackedSerieSlugs } = await getTrackedPageSlugs();
  
  // Unisci gli slug (rimuovendo i duplicati)
  const totalFilmSlugs = [...new Set([...tmdbFilmSlugs, ...trackedFilmSlugs])];
  const totalSerieSlugs = [...new Set([...tmdbSerieSlugs, ...trackedSerieSlugs])];
  
  // Statistiche
  console.log('\n=== STATISTICHE SITEMAP ===');
  console.log(`Film da TMDB: ${tmdbFilmSlugs.length}`);
  console.log(`Film tracciati in Supabase: ${trackedFilmSlugs.length}`);
  console.log(`Film unici totali nella sitemap: ${totalFilmSlugs.length}`);
  console.log(`Serie da TMDB: ${tmdbSerieSlugs.length}`);
  console.log(`Serie tracciate in Supabase: ${trackedSerieSlugs.length}`);
  console.log(`Serie uniche totali nella sitemap: ${totalSerieSlugs.length}`);
  console.log(`Totale URL nella sitemap: ${4 + totalFilmSlugs.length + totalSerieSlugs.length}`); // 4 = rotte statiche
  
  // Esempi film
  if (trackedFilmSlugs.length > 0) {
    console.log('\n=== ESEMPI FILM TRACCIATI IN SUPABASE ===');
    trackedFilmSlugs.slice(0, 5).forEach((slug: string) => console.log(`- ${slug}`));
  }
  
  // Esempi serie
  if (trackedSerieSlugs.length > 0) {
    console.log('\n=== ESEMPI SERIE TRACCIATE IN SUPABASE ===');
    trackedSerieSlugs.slice(0, 5).forEach((slug: string) => console.log(`- ${slug}`));
  }
  
  console.log('\nTest sitemap completato!');
}

// Esegui il test
testSitemap().catch(console.error); 