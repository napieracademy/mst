// Script di test per il servizio centralizzato di chiavi API
const { createClient } = require('@supabase/supabase-js');

// Configurazione
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Errore: Variabili d\'ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY richieste');
  process.exit(1);
}

async function testApiKeysService() {
  console.log('🔑 Test del servizio centralizzato di chiavi API');
  console.log('===============================================');

  try {
    // 1. Login a Supabase
    console.log('📝 Effettuando login a Supabase...');
    
    // Crea il client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Email e password devono essere forniti come variabili d'ambiente o argomenti
    const email = process.env.SUPABASE_TEST_EMAIL;
    const password = process.env.SUPABASE_TEST_PASSWORD;
    
    if (!email || !password) {
      console.error('❌ Errore: Variabili d\'ambiente SUPABASE_TEST_EMAIL e SUPABASE_TEST_PASSWORD richieste');
      process.exit(1);
    }
    
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (loginError) {
      throw new Error(`Login fallito: ${loginError.message}`);
    }
    
    console.log('✅ Login effettuato con successo');
    console.log(`👤 Utente: ${session.user.email}`);
    
    // 2. Recupera una chiave TMDB
    console.log('\n📡 Recupero chiave TMDB dal servizio centralizzato...');
    
    const apiUrl = `${SUPABASE_URL}/functions/v1/api-keys`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        platform: 'test-script',
        keyType: 'tmdb'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Errore API (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Risposta di errore: ${result.error || 'Errore sconosciuto'}`);
    }
    
    // Stampa le prime e ultime 3 lettere della chiave per verifica, mascherando il resto
    const key = result.key;
    const maskedKey = `${key.substring(0, 3)}${'*'.repeat(key.length - 6)}${key.substring(key.length - 3)}`;
    
    console.log('✅ Chiave TMDB ottenuta con successo');
    console.log(`🔑 Chiave (mascherata): ${maskedKey}`);
    console.log(`⏱️ Scade tra: ${result.expiresIn} secondi`);
    console.log(`🕒 Timestamp: ${result.timestamp}`);
    
    // 3. Test con chiave API non esistente
    console.log('\n📡 Test con chiave API non esistente...');
    
    const badResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        platform: 'test-script',
        keyType: 'non_existent_key'
      })
    });
    
    const badResult = await badResponse.json();
    
    console.log(`🔍 Stato risposta: ${badResponse.status}`);
    console.log(`📝 Contenuto risposta: ${JSON.stringify(badResult, null, 2)}`);
    
    // 4. Logout
    console.log('\n📝 Effettuando logout...');
    await supabase.auth.signOut();
    console.log('✅ Logout effettuato con successo');
    
    console.log('\n✨ Test completato con successo!');
  } catch (error) {
    console.error(`❌ Errore: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Esegui il test
testApiKeysService();