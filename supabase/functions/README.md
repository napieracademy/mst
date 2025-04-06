# Supabase Edge Functions per MST

Questo pacchetto contiene le Edge Functions di Supabase che sostituiscono la funzionalità del middleware di Next.js rimosso da Netlify e aggiunge funzionalità di elaborazione pianificata.

## Funzioni disponibili

1. **redirects** - Gestisce i reindirizzamenti SEO-friendly da vecchi URL ai nuovi con slug
2. **auth-check** - Verifica lo stato di autenticazione dell'utente
3. **generate-sitemap** - Genera la sitemap del sito e la salva nel bucket pubblico

## Prerequisiti

- Supabase CLI installato: `npm install -g supabase`
- Login eseguito: `supabase login`
- Progetto Supabase inizializzato: `supabase init`

## Configurazione locale per lo sviluppo

```bash
# Avvia Supabase in locale
supabase start

# Esegui le migrazioni del database
supabase db push

# Avvia le funzioni Edge in modalità sviluppo
supabase functions serve --no-verify-jwt
```

## Deployment

```bash
# Deploy della funzione redirects
supabase functions deploy redirects --project-ref YOUR_PROJECT_REF

# Deploy della funzione auth-check
supabase functions deploy auth-check --project-ref YOUR_PROJECT_REF

# Deploy della funzione generate-sitemap
supabase functions deploy generate-sitemap --project-ref YOUR_PROJECT_REF
```

## Utilizzo

Le funzioni sono integrate nell'applicazione attraverso i seguenti file:

- `lib/supabase-edge.ts` - Funzioni client per interagire con le Edge Functions
- `lib/edge-middleware-client.ts` - Hook React per implementare la logica del middleware
- `app/layout.tsx` - Integrazione del middleware nel layout principale

## Funzionalità implementate

### Reindirizzamenti SEO-friendly

Reindirizza automaticamente i vecchi URL a quelli nuovi con slug:
- `/movie/:id` → `/film/:slug`
- `/tv/:id` → `/serie/:slug`
- `/person/:id` → `/attore/:slug`

### Protezione rotte autenticate

Protegge le seguenti rotte, richiedendo l'autenticazione:
- `/wines/*`
- `/beers/*`
- `/spirits/*`

### Reindirizzamenti di autenticazione

- Reindirizza gli utenti non autenticati che tentano di accedere a rotte protette a `/login`
- Reindirizza gli utenti autenticati che tentano di accedere a `/login` o `/register` a `/wines`

### Caching TMDB 

Implementa un sistema di caching avanzato per le chiamate API TMDB:
- Memorizzazione in database Supabase
- TTL configurabile per tipo di contenuto
- Refresh automatico dei dati scaduti

### Generazione Sitemap

La funzione generate-sitemap può essere eseguita manualmente o pianificata:
- Genera un file sitemap.xml con tutti gli URL del sito
- Salva il file nel bucket pubblico di storage
- Mantiene un backup delle versioni precedenti
- Traccia statistiche e metadati della generazione
- Può essere invocata tramite Supabase Schedule Functions