# Gestione centralizzata delle chiavi API

Questo documento descrive come funziona il sistema di gestione centralizzata delle chiavi API implementato per il progetto.

## Architettura

Il sistema è composto da tre componenti principali:

1. **Supabase Edge Function** (`/supabase/functions/api-keys/index.ts`): Fornisce l'accesso sicuro alle chiavi API, richiedendo autenticazione. Serve come vault centralizzato per tutte le chiavi API del progetto.

2. **Client API** (`/lib/api-keys-client.ts`): Modulo lato client e server che gestisce la comunicazione con l'Edge Function, implementando cache locale e strategie di fallback.

3. **Configurazione** (`/lib/config.ts`): Configurazione centralizzata che determina il comportamento del sistema.

## Funzionamento durante build e runtime

Il sistema è progettato per funzionare in modo diverso tra la fase di build e l'ambiente di produzione:

### Fase di build

Durante la build di Next.js (quando `process.env.NEXT_PHASE === 'build'`):
- Il sistema utilizza **SEMPRE** le variabili d'ambiente locali specificate nel progetto
- Il servizio centralizzato è disabilitato automaticamente
- Viene utilizzato il fallback alle variabili d'ambiente (TMDB_API_KEY, ecc.)

Questo è necessario perché:
1. Durante la build non è disponibile una sessione utente autenticata
2. Le Edge Functions non possono essere chiamate durante la fase di build statica
3. È più efficiente utilizzare direttamente le variabili d'ambiente in questa fase

### Ambiente di produzione

In ambiente di produzione (runtime):
- Il sistema utilizza il servizio centralizzato Supabase Edge Function
- Le chiavi vengono recuperate tramite autenticazione JWT
- I log di accesso vengono registrati nella tabella `api_key_access_logs`
- Le chiavi vengono memorizzate in cache per ottimizzare le prestazioni
- In caso di errori, viene applicata la strategia di fallback configurata

## Configurazione

Il comportamento del sistema è controllato nel file `lib/config.ts`:

```typescript
apiKeys: {
  // Determina automaticamente se usare il servizio centralizzato
  // Il servizio è disabilitato durante la fase di build, ma abilitato in produzione
  useApiKeysService: process.env.NEXT_PHASE !== 'build' && process.env.NODE_ENV !== 'development',
  
  // Tempo di cache in secondi (0 = nessuna cache)
  cacheTime: 3600, // 1 ora
  
  // Strategia di fallback in caso di errore
  // "env": usa le variabili d'ambiente locali
  // "error": lancia un errore
  // "null": restituisce null
  fallbackStrategy: "env",
}
```

## Tipi di chiavi supportate

Il sistema supporta i seguenti tipi di chiavi API:
- `tmdb`: The Movie Database API
- `netlify`: Netlify API
- `supabase_service_role`: Supabase Service Role
- `openai`: OpenAI API
- `google_ai`: Google AI API
- `perplexity`: Perplexity API
- `tinymce`: TinyMCE API
- `other`: Altri tipi di chiavi

## Sicurezza e audit

- Tutte le richieste di chiavi richiedono autenticazione JWT
- Ogni accesso è registrato nella tabella `api_key_access_logs`
- È disponibile una funzione SQL `get_api_key_usage_stats()` per monitorare l'utilizzo

## Come utilizzare il sistema

Per utilizzare una chiave API nel codice:

```typescript
import { getApiKey } from './lib/api-keys-client';

async function myFunction() {
  // Recupera la chiave TMDB
  const tmdbKey = await getApiKey('tmdb');
  
  // Usa la chiave per le chiamate API
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}`;
  const response = await fetch(url);
  // ...
}
```

## Troubleshooting

Se hai problemi con il recupero delle chiavi API:

1. Verifica che le chiavi siano impostate come variabili d'ambiente in Supabase
2. Controlla che l'utente sia correttamente autenticato 
3. Verifica i log dell'Edge Function in Supabase
4. Controlla la tabella `api_key_access_logs` per possibili errori di accesso