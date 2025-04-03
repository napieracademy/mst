# Mastroianni - App per film e serie TV

## Setup corretto

- Progetto basato su Next.js 15 + App Router
- Si usa SOLO npm, niente pnpm
- Installa sempre così:

```bash
npm install --legacy-peer-deps
```

## Build manuale:

```bash
npm install --legacy-peer-deps
npm run build
npm run start
```

## Build Netlify:
Il comando è già configurato in `netlify.toml`

---

## Extra:
- `tsconfig.json` già pronto per TypeScript
- `eslint.config.js` pronto per Next.js + TypeScript + Core Web Vitals
- Lint attivo nel build

## API TMDB
- L'API key TMDB è configurata sia nel file `.env.production` che nel `netlify.toml`
- Chiave: `c1fccb37538d185ce09b51ea97fe1da3`

## Caratteristiche

- URL SEO-friendly per film, serie TV, attori e registi
- Sistema di prerenderizzazione statica per le pagine più popolari
- Generazione di pagine on-demand con ISR (Incremental Static Regeneration)
- Interfaccia moderna e responsive con Tailwind CSS
- Integrazione con TMDB API

## Prerenderizzazione

Il sistema utilizza due approcci di rendering:

1. **Prerenderizzazione statica** - Le pagine più popolari vengono generate durante il build
2. **Generazione on-demand** - Le pagine meno popolari vengono generate alla prima richiesta e poi memorizzate nella cache

### Indicatore di prerenderizzazione

Ogni pagina di film/serie include un indicatore che mostra se la pagina è stata prerenderizzata durante il build (indicatore verde) o generata on-demand (indicatore giallo).

## Deploy su Netlify

### Configurazione automatica

Il progetto include un file `netlify.toml` pronto per il deploy:

1. Collegare il repository GitHub a Netlify
2. Netlify rileverà automaticamente la configurazione Next.js
3. Impostare le variabili d'ambiente:
   - `NEXT_PUBLIC_TMDB_API_KEY` - Chiave API TMDB

### Configurazione manuale

Se preferisci configurare manualmente il deploy:

```
Build command: npm run build
Publish directory: .next
```

### Variabili d'ambiente

Le seguenti variabili d'ambiente devono essere impostate in Netlify:

- `NEXT_PUBLIC_TMDB_API_KEY` - Chiave API TMDB
- `NODE_VERSION` - 20.10.0 (o superiore)

## Sviluppo locale

```
npm install
npm run dev
```

Per verificare le pagine prerenderizzate:

```
npm run build
npm start
```

Poi visita la pagina di debug: `/admin/pagine-prerenderizzate`

## Tecnologie

- Next.js 15
- React 19
- Tailwind CSS
- TypeScript
- TMDB API 