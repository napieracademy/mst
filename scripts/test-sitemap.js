/**
 * Script per testare la sitemap contando gli URL
 */

const https = require('https');
const http = require('http');

async function fetchSitemap(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function countUrls(xml) {
  const urlCount = (xml.match(/<url>/g) || []).length;
  const filmUrls = (xml.match(/<loc>https:\/\/mastroianni\.app\/film\//g) || []).length;
  const serieUrls = (xml.match(/<loc>https:\/\/mastroianni\.app\/serie\//g) || []).length;
  const staticUrls = urlCount - filmUrls - serieUrls;
  
  return {
    total: urlCount,
    film: filmUrls,
    serie: serieUrls,
    static: staticUrls
  };
}

async function testSitemap() {
  try {
    console.log('Recupero sitemap da localhost...');
    const xml = await fetchSitemap('http://localhost:3000/sitemap.xml');
    console.log('Sitemap recuperata, dimensione:', (xml.length / 1024).toFixed(2), 'KB');
    
    const counts = await countUrls(xml);
    console.log('\n=== STATISTICHE SITEMAP ===');
    console.log(`URL totali: ${counts.total}`);
    console.log(`URL film: ${counts.film}`);
    console.log(`URL serie: ${counts.serie}`);
    console.log(`URL statiche: ${counts.static}`);
    
    // Confronto con il numero atteso di record
    console.log('\nConfrontando con i dati del database:');
    console.log('I record nella tabella generated_pages sono ~1007');
    console.log(`La sitemap contiene in totale ${counts.film + counts.serie} URL di film e serie`);
    
    if (counts.film + counts.serie >= 1000) {
      console.log('\n✅ La sitemap sembra includere le pagine dal database!');
    } else {
      console.log('\n❌ La sitemap non sembra includere tutte le pagine dal database');
    }
    
  } catch (error) {
    console.error('Errore durante il test:', error);
  }
}

// Esegui il test
testSitemap(); 