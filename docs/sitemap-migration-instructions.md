# Istruzioni per l'aggiornamento della Sitemap

Questo documento descrive le modifiche apportate al sistema di generazione della sitemap e le istruzioni per applicarle.

## Problema risolto

1. **Conteggi errati**: Il sistema precedente conteggiava in modo errato gli URL nella sitemap, soprattutto per persone (attori, registi) che apparivano in diverse categorie.
2. **Schema tabella incompleto**: La tabella `sitemap_stats` non conteneva colonne per `attori_count` e `registi_count`.
3. **Vincolo limitato**: La tabella `generated_pages` accettava solo i tipi 'film' e 'serie'.

## Soluzioni implementate

1. **Deduplicazione delle persone**: Aggiunto un sistema per evitare che la stessa persona venga contata più volte se appare in diverse categorie.
2. **Schema tabella aggiornato**: Aggiunte colonne `attori_count` e `registi_count` alla tabella `sitemap_stats`.
3. **Vincolo ampliato**: Aggiornato il vincolo `valid_page_type` per accettare tutti i tipi di pagina.
4. **Funzione SQL aggiunta**: Implementata la funzione `get_page_type_counts()` per supportare il conteggio per tipo di pagina.

## Applicazione delle modifiche

Per applicare queste modifiche, segui questi passaggi:

1. **Esegui la nuova migrazione SQL**:
   ```bash
   cd /path/to/project
   supabase db reset
   ```
   Oppure, se preferisci applicare solo la nuova migrazione senza resettare tutto il database:
   ```bash
   supabase db push
   ```

2. **Fai il deploy della funzione Edge aggiornata**:
   ```bash
   supabase functions deploy generate-sitemap
   ```

3. **Rigenera la sitemap**:
   Accedi alla console di amministrazione e utilizza il pulsante "Genera sitemap" nella dashboard, oppure:
   ```bash
   curl -X POST -H "Authorization: Bearer {SUPABASE_ANON_KEY}" "https://{PROJECT_REF}.supabase.co/functions/v1/generate-sitemap"
   ```

## Verifica delle modifiche

Dopo aver applicato le modifiche e rigenerato la sitemap:

1. Verifica i conteggi nella dashboard della sitemap
2. Controlla che la sitemap.xml includa correttamente tutti i tipi di URL
3. Verifica che il conteggio degli URL totali corrisponda alla somma dei conteggi per tipo

## Struttura degli URL nella sitemap

Gli URL nella sitemap seguono questi formati:

1. **Film**: `https://mastroianni.app/film/titolo-anno-id`
   Esempio: `https://mastroianni.app/film/oppenheimer-2023-872585`

2. **Serie**: `https://mastroianni.app/serie/titolo-anno-id`
   Esempio: `https://mastroianni.app/serie/stranger-things-2016-66732`

3. **Attori**: `https://mastroianni.app/attore/nome-anno-id`
   Esempio: `https://mastroianni.app/attore/leonardo-dicaprio-1974-6193`

4. **Registi**: `https://mastroianni.app/regista/nome-anno-id`
   Esempio: `https://mastroianni.app/regista/christopher-nolan-1970-525`