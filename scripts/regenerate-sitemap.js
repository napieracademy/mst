#!/usr/bin/env node

/**
 * Script per forzare la rigenerazione della sitemap
 * Utilizzo: node scripts/regenerate-sitemap.js [localhost|production]
 */

const https = require('https');
const http = require('http');

// Token di sicurezza (deve corrispondere a quello usato nel server)
const TOKEN = process.env.REGENERATE_TOKEN || 'sitemap-secret-token';

// Determina l'ambiente (localhost o production)
const environment = process.argv[2] || 'localhost';
const isProduction = environment === 'production';

// Configurazione della richiesta
const hostname = isProduction ? 'mastroianni.app' : 'localhost';
const port = isProduction ? 443 : 3000;
const path = '/api/regenerate-sitemap';
const protocol = isProduction ? https : http;

const options = {
  hostname,
  port,
  path,
  method: 'GET',
  headers: {
    'x-regenerate-token': TOKEN,
  },
};

console.log(`🔄 Rigenerazione sitemap in ${isProduction ? 'produzione' : 'sviluppo'}...`);

const req = protocol.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 && response.success) {
        console.log(`✅ Sitemap rigenerata con successo!`);
        console.log(`⏰ Timestamp: ${response.timestamp}`);
      } else {
        console.error(`❌ Errore: ${response.message || 'Risposta non valida'}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Errore nel parsing della risposta:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`❌ Errore nella richiesta: ${error.message}`);
  if (!isProduction && error.code === 'ECONNREFUSED') {
    console.error(`   Assicurati che il server Next.js sia in esecuzione sulla porta ${port}`);
  }
  process.exit(1);
});

req.end(); 