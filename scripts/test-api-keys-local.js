// Script di test locale per il sistema centralizzato delle chiavi API
// Questo script testa il client senza richiamare direttamente la Edge Function

require('dotenv').config(); // Carica le variabili d'ambiente da .env se disponibili

/**
 * Simulazione semplificata del client getApiKey
 */
function getKeyFromEnvironment(keyType) {
  switch (keyType) {
    case 'tmdb':
      return process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || null;
    case 'openai':
      return process.env.OPENAI_API_KEY || null;
    case 'google_ai':
      return process.env.GOOGLE_AI_API_KEY || null;
    case 'perplexity':
      return process.env.PERPLEXITY_API_KEY || null;
    case 'tinymce':
      return process.env.TINYMCE_API_KEY || null;
    case 'other':
      return null;
    default:
      return null;
  }
}

/**
 * Test delle chiavi API
 */
async function testApiKeys() {
  console.log('🔑 Test locale del client API keys');
  console.log('==============================');
  
  // Elenco delle chiavi da testare
  const keyTypes = ['tmdb', 'openai', 'google_ai', 'perplexity', 'tinymce'];
  
  for (const keyType of keyTypes) {
    const key = getKeyFromEnvironment(keyType);
    
    console.log(`\n📝 Chiave: ${keyType}`);
    
    if (key) {
      // Mascherare la chiave per sicurezza
      const maskedKey = `${key.substring(0, 3)}${'*'.repeat(Math.max(0, key.length - 6))}${key.substring(Math.max(0, key.length - 3))}`;
      console.log(`✅ Disponibile: ${maskedKey}`);
    } else {
      console.log(`❌ Non disponibile`);
    }
  }
  
  console.log('\n✨ Test completato!');
}

// Esecuzione del test
testApiKeys();