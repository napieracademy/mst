// Script di test per verificare l'integrazione di TMDB con il sistema centralizzato delle chiavi API

// Importazioni
require('dotenv').config(); // Carica le variabili d'ambiente da .env se disponibili

// Simula l'ambiente di Next.js
process.env.NEXT_PUBLIC_TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Simulazione semplificata del client getApiKey
 */
async function getApiKey(keyType) {
  console.log(`🔑 Richiesta chiave: ${keyType}`);
  
  // Per test, utilizziamo direttamente le variabili d'ambiente
  switch (keyType) {
    case 'tmdb':
      return process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || null;
    default:
      return null;
  }
}

/**
 * Simulazione del modulo TMDB
 */
async function fetchFromTMDB(endpoint) {
  console.log(`📡 Chiamata TMDB: ${endpoint}`);
  
  // Ottieni la chiave API TMDB dal sistema centralizzato
  const apiKey = await getApiKey('tmdb');
  
  if (!apiKey) {
    throw new Error('TMDB API key is missing');
  }
  
  // Costruisci l'URL
  const url = `https://api.themoviedb.org/3${endpoint}?api_key=${apiKey}&language=it-IT`;
  
  // Effettua la richiesta
  console.log(`🌐 Esecuzione richiesta a TMDB (chiave: ${apiKey.substring(0, 3)}***)`);
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TMDB API error (${response.status}): ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Test dell'integrazione
 */
async function testTMDBIntegration() {
  console.log('🎬 Test integrazione TMDB con sistema chiavi centralizzato');
  console.log('====================================================');
  
  try {
    // Test con endpoint popolare
    console.log('\n📝 Test endpoint: /movie/popular');
    const popularMovies = await fetchFromTMDB('/movie/popular');
    
    console.log(`✅ Successo! Ricevuti ${popularMovies.results.length} film popolari`);
    console.log(`📊 Primo film: ${popularMovies.results[0].title}`);
    
    // Test con endpoint dettaglio film
    const movieId = popularMovies.results[0].id;
    console.log(`\n📝 Test endpoint: /movie/${movieId}`);
    const movieDetails = await fetchFromTMDB(`/movie/${movieId}`);
    
    console.log(`✅ Successo! Dettagli film: ${movieDetails.title} (${movieDetails.release_date})`);
    
    console.log('\n✨ Test completato con successo!');
  } catch (error) {
    console.error(`❌ Errore: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Esecuzione del test
testTMDBIntegration();