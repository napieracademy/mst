const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Netlify Function per generare la sitemap ogni ora
 * Viene eseguita automaticamente dal trigger cron configurato nel netlify.toml
 */
exports.handler = async function(event, context) {
  console.log('🔄 Avvio generazione sitemap automatica...');
  
  try {
    // Percorso della sitemap
    const FUNCTION_DIR = path.dirname(require.main.filename);
    const PROJECT_ROOT = path.resolve(FUNCTION_DIR, '../..');
    const SITEMAP_PATH = path.join(PROJECT_ROOT, 'public', 'sitemap.xml');
    
    console.log(`📂 Percorso progetto: ${PROJECT_ROOT}`);
    
    // Esegui il processo di generazione sitemap
    const result = spawnSync('node', ['scripts/generate-static-sitemap.js'], {
      cwd: PROJECT_ROOT,
      env: process.env,
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    // Verifica l'output e gli errori
    const stdout = result.stdout;
    const stderr = result.stderr;
    
    if (result.status !== 0) {
      console.error('❌ Errore durante la generazione della sitemap:');
      console.error(stderr);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: stderr })
      };
    }
    
    console.log('✅ Output della generazione:');
    console.log(stdout);
    
    // Verifica che il file sia stato creato
    const sitemapExists = fs.existsSync(SITEMAP_PATH);
    const sitemapSize = sitemapExists ? fs.statSync(SITEMAP_PATH).size : 0;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        sitemapExists,
        sitemapSize: `${Math.round(sitemapSize / 1024)} KB`,
        message: 'Sitemap generata con successo'
      })
    };
  } catch (error) {
    console.error('❌ Errore imprevisto:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};