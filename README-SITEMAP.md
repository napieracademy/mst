# Generazione Sitemap con Supabase Edge Functions

## Descrizione

Il progetto utilizza una Supabase Edge Function per generare automaticamente la sitemap del sito, sostituendo il precedente approccio basato su Netlify Functions che presentava problemi di aggiornamento.

## Vantaggi di Supabase Edge Functions

- **Runtime Deno**: Ambiente di esecuzione sicuro e performante
- **Funzionamento garantito**: Non dipende dalle limitazioni di Netlify Functions
- **Pianificazione integrata**: Supporto nativo per job pianificati
- **Accesso diretto al database**: Connessione diretta a Supabase
- **Storage integrato**: Salvataggio del file direttamente nello storage Supabase
- **Monitoraggio**: Tracciamento delle statistiche di generazione

## Struttura del sistema

Il sistema di generazione sitemap è composto da:

1. **Edge Function `generate-sitemap`**: Genera la sitemap XML e la salva nello storage
2. **Tabella `sitemap_stats`**: Memorizza le statistiche di generazione
3. **Componente React `SitemapStats`**: Visualizza lo stato e consente la generazione manuale
4. **API endpoint `/api/generate-sitemap`**: Trigger per la generazione manuale della sitemap

## Come funziona

1. La Edge Function viene eseguita tramite il pianificatore integrato di Supabase
2. Recupera tutti i contenuti dal database (film, serie)
3. Genera un file XML conforme alle specifiche sitemap
4. Salva il file nel bucket di storage `public` di Supabase
5. Aggiorna le statistiche nella tabella `sitemap_stats`
6. Il file sitemap è accessibile pubblicamente all'URL dello storage Supabase

## Pianificazione

La funzione è configurata per eseguirsi automaticamente:

```json
{
  "name": "generate-sitemap-daily",
  "schedule": "0 2 * * *",
  "description": "Genera la sitemap ogni giorno alle 2:00"
}
```

## Deploy della funzione

```bash
# Deploy della funzione generate-sitemap
supabase functions deploy generate-sitemap --project-ref YOUR_PROJECT_REF
```

## Integrazione Frontend

Il componente `SitemapStats` nella pagina di amministrazione mostra:

- Data/ora dell'ultima generazione
- Numero totale di URL nella sitemap
- Conteggio di film e serie
- Stato dell'ultima generazione (successo/errore)
- Pulsante per la generazione manuale

## Sviluppi futuri

- Generazione incrementale per siti molto grandi
- Supporto per multiple sitemap con index
- Notifiche di errore via email
- Integrazione con Google Search Console API
- Supporto per tag video nella sitemap