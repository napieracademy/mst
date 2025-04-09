# Integrazione dei Premi Dettagliati

Questo documento descrive l'implementazione dell'integrazione per la visualizzazione dettagliata dei premi cinematografici nel sito Mastroianni.

## Panoramica

Il sistema recupera e visualizza informazioni dettagliate sui premi cinematografici utilizzando due fonti:

1. **OMDB API** - Fornisce informazioni di base sui premi in formato testo
2. **RapidAPI IMDb API** - Fornisce dati più strutturati e dettagliati sui singoli premi e nomination

## Componenti Principali

### 1. API Endpoint: `/api/detailed-awards`

Questo endpoint combina i dati di entrambe le API:

```typescript
// Chiamata: GET /api/detailed-awards?imdbId=tt0111161
```

**Parametri:**
- `imdbId`: L'ID IMDb del film o serie TV (es. tt0111161)

**Risposta:**
```json
{
  "imdbId": "tt0111161",
  "basicInfo": {
    "title": "The Shawshank Redemption",
    "year": "1994",
    "type": "movie",
    "awards": "Nominated for 7 Oscars. Another 21 wins & 35 nominations.",
    "boxOffice": "$28,767,189",
    "awardsAnalysis": {
      "hasAwards": true,
      "oscars": 0,
      "nominations": 7,
      "wins": 21,
      "other": 0,
      "summary": "0 Oscar, 21 altri premi, 7 nomination"
    }
  },
  "detailedAwards": {...},
  "categorizedAwards": {
    "oscars": [...],
    "goldenGlobes": [...],
    "bafta": [...],
    "cannes": [...],
    "venice": [...],
    "berlin": [...],
    "other": [...]
  },
  "combinedAnalysis": {
    "totalAwards": 21,
    "totalNominations": 42,
    "oscarsWon": 0,
    "oscarNominations": 7,
    "goldenGlobesWon": 0,
    "goldenGlobeNominations": 2,
    "baftaWon": 0,
    "baftaNominations": 0,
    "majorFestivalAwards": 0
  }
}
```

### 2. Hook React: `useDetailedAwards`

Custom hook che gestisce il recupero e lo stato dei dati sui premi:

```typescript
const { data, loading, error } = useDetailedAwards(imdbId)
```

### 3. Componente React: `DetailedAwards`

Visualizza i dati sui premi in diversi formati:
- **Vista riassuntiva**: Mostra un riepilogo dei premi principali con badge
- **Vista completa**: Mostra tutti i premi organizzati in categorie (Oscar, Golden Globe, ecc.)

### 4. Componente Legacy: `AwardsAndBoxOfficeInfo` 

Aggiornato per supportare entrambe le modalità:
- **Modalità base**: Mantiene il funzionamento precedente con testo semplice
- **Modalità dettagliata**: Utilizza il nuovo componente `DetailedAwards`

## Utilizzo

### 1. Nelle pagine di film e serie TV

```tsx
<AwardsAndBoxOfficeInfo imdbId={movie.external_ids.imdb_id} useDetailedView={true} />
```

### 2. Direttamente per casi speciali

```tsx
<DetailedAwards imdbId="tt0111161" showInitialSummary={true} />
```

## Test dell'API

È disponibile una pagina di test dedicata per visualizzare le informazioni sui premi:

```
/test-detailed-awards
```

## Categorizzazione dei Premi

I premi vengono organizzati nelle seguenti categorie:

1. **Oscar (Academy Awards)**
2. **Golden Globes**
3. **BAFTA**
4. **Festival di Cannes**
5. **Festival di Venezia**
6. **Festival di Berlino**
7. **Altri premi**

## Esempi di Display

### 1. Vista Riassuntiva

Mostra solo le informazioni essenziali:

```
Oscar: 7 vinti, 2 nomination
Golden Globe: 2 vinti, 3 nomination
BAFTA: 1 vinto, 0 nomination
```

### 2. Vista Dettagliata

Organizza i premi in accordion espandibili, con dettagli su ogni premio:

- **Categoria**: es. "Miglior Film", "Miglior Attore"
- **Anno**: es. "1994"
- **Stato**: Vinto/Nomination
- **Dettagli**: Informazioni aggiuntive sul premio

## Note Implementative

- L'integrazione è resiliente agli errori: se una fonte fallisce, utilizzerà i dati disponibili dall'altra
- La cache viene gestita a livello di frontend per migliorare le performance
- L'UI è responsive e si adatta a tutte le dimensioni dello schermo