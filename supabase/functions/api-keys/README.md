# API Keys - Servizio Centralizzato per le Chiavi API

Questa Edge Function implementa un servizio centralizzato per la gestione delle chiavi API, permettendo di:

1. Centralizzare tutte le chiavi in un unico posto
2. Tracciare l'utilizzo delle chiavi con un sistema di audit
3. Evitare di dover configurare le stesse chiavi su diversi servizi (Netlify, Vercel, ecc.)
4. Ruotare le chiavi più facilmente quando necessario

## Configurazione della funzione

Prima di deployare questa funzione, devi configurare le variabili d'ambiente nella funzione Supabase:

```bash
# Imposta le variabili d'ambiente necessarie
supabase secrets set TMDB_API_KEY=your_tmdb_api_key
supabase secrets set NETLIFY_AUTH_TOKEN=your_netlify_token
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

## Deploy della funzione

```bash
# Deploying function
supabase functions deploy api-keys --no-verify-jwt
```

Se vuoi attivare la verifica JWT (consigliato per produzione):

```bash
supabase functions deploy api-keys
```

## Utilizzo

L'API richiede un token JWT di Supabase valido per l'autenticazione:

```javascript
// Esempio di utilizzo del servizio
const getApiKeyFromService = async (keyType) => {
  const supabase = createClient(...);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Non autenticato');
  }
  
  const response = await fetch('https://your-project.supabase.co/functions/v1/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      platform: 'web', // o 'server', 'netlify', ecc.
      keyType: keyType // 'tmdb', 'netlify', ecc.
    })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Errore sconosciuto');
  }
  
  return data.key;
};
```