const { handler } = require('./generate-sitemap');

/**
 * Endpoint per testare la generazione della sitemap manualmente
 * Questo endpoint è protetto da un token di sicurezza
 */
exports.handler = async function(event, context) {
  // Verifica il token di sicurezza (da impostare nelle variabili d'ambiente di Netlify)
  const authHeader = event.headers.authorization || '';
  const secretToken = process.env.SITEMAP_SECRET_TOKEN || 'test-token';
  
  // Se il token non corrisponde, nega l'accesso
  if (!authHeader.includes(secretToken)) {
    console.log('⚠️ Tentativo di accesso non autorizzato');
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, message: 'Non autorizzato' })
    };
  }
  
  console.log('🧪 Test di generazione sitemap manuale avviato');
  
  // Chiama l'handler principale
  try {
    return await handler(event, context);
  } catch (error) {
    console.error('❌ Errore nel test:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
}; 