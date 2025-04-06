# Sistema Centralizzato delle Chiavi API

Questo progetto utilizza un sistema centralizzato per la gestione delle chiavi API attraverso Supabase Edge Functions.

## Struttura del Sistema

Il sistema è composto da tre componenti principali:

1. **Edge Function Supabase (`api-keys`)**:
   - Fornisce un endpoint sicuro per ottenere chiavi API
   - Richiede autenticazione JWT di Supabase
   - Registra tutti gli accessi alle chiavi per audit
   - Supporta diverse chiavi API (TMDB, Netlify, OpenAI, ecc.)

2. **Client TypeScript (`api-keys-client.ts`)**:
   - Gestisce le richieste al servizio centralizzato
   - Implementa caching locale per ridurre le chiamate
   - Fornisce fallback alle variabili d'ambiente locali
   - Gestisce retry automatici in caso di errori

3. **Tabella di Audit (`api_key_access_logs`)**:
   - Registra ogni accesso alle chiavi API
   - Traccia la piattaforma richiedente, l'utente e l'IP
   - Implementa politiche RLS per la sicurezza

## Vantaggi

Questo approccio offre numerosi vantaggi rispetto alla gestione tradizionale delle variabili d'ambiente:

- **Centralizzazione**: Tutte le chiavi sono gestite in un unico luogo, eliminando la necessità di configurarle su ogni piattaforma
- **Sicurezza**: Le chiavi non sono esposte nel codice o nei file di configurazione
- **Audit**: Ogni accesso alle chiavi è registrato per monitoraggio di sicurezza
- **Manutenibilità**: Il rinnovo delle chiavi richiede la modifica in un solo punto
- **Fallback**: In caso di irraggiungibilità del servizio, il sistema utilizza variabili d'ambiente locali

## Come Configurare

1. **Deploying Edge Function**:
   ```bash
   supabase functions deploy api-keys
   ```

2. **Configurare le Variabili d'Ambiente**:
   ```bash
   supabase secrets set TMDB_API_KEY=your_key
   supabase secrets set NETLIFY_AUTH_TOKEN=your_token
   # Altre chiavi necessarie...
   ```

3. **Creare la Tabella di Audit**:
   Eseguire la migrazione in `migrations/20250408120000_create_api_key_access_logs_table.sql`

## Come Utilizzare

Il sistema è utilizzato automaticamente in molti moduli dell'applicazione, come `lib/tmdb.ts`:

```typescript
// Esempio di utilizzo in tmdb.ts
import { getApiKey } from "./api-keys-client"

// Funzione di utilità per le chiamate API
async function fetchFromTMDB(endpoint: string, params = {}) {
  // Ottieni la chiave API TMDB dal centralizzatore
  const apiKey = await getApiKey('tmdb');
  
  // Usa la chiave per la chiamata API
  // ...
}
```

## Troubleshooting

Se riscontri problemi con il servizio delle chiavi API:

1. **Verifica Connettività**:
   Controlla che la Edge Function sia raggiungibile

2. **Controlla Autenticazione**:
   Assicurati di avere una sessione Supabase valida

3. **Fallback**:
   Il sistema utilizza automaticamente le variabili d'ambiente locali in caso di problemi
   
4. **Controlla i Log**:
   Verifica la tabella `api_key_access_logs` per errori