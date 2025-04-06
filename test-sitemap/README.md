# Test Generazione Sitemap

Questo è un ambiente di test per la generazione della sitemap.

## Setup

1. Installare le dipendenze:
```
npm install
```

2. Controlla il file `.env` per le variabili d'ambiente:
```
SUPABASE_URL=...
SUPABASE_KEY=...
NEXT_PUBLIC_SITE_URL=...
```

3. Esegui il test:
```
npm test
```

## Cosa fa

Lo script si connette a Supabase, recupera i film e le serie TV, e genera una sitemap XML. 