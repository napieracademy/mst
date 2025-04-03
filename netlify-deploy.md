# Deploy su Netlify

Questa guida contiene le istruzioni per il deploy dell'applicazione su Netlify.

## Prerequisiti

- Account Netlify
- Repository Git (GitHub, GitLab, Bitbucket)
- Chiave API TMDB

## Passaggi per il deploy

### 1. Crea un nuovo sito su Netlify

1. Accedi a [Netlify](https://app.netlify.com/)
2. Vai alla dashboard e clicca su "Add new site" > "Import an existing project"
3. Seleziona il tuo repository Git

### 2. Configura le impostazioni di build

Le impostazioni di build sono già configurate nel file `netlify.toml`, ma puoi verificarle:

- **Build command**: `npm run build`  
- **Publish directory**: `.next`  

### 3. Configura le variabili d'ambiente

Aggiungi le seguenti variabili d'ambiente nelle impostazioni del sito su Netlify:

1. Vai a Site settings > Build & deploy > Environment
2. Clicca su "Edit variables" e aggiungi:

| Chiave | Valore | Descrizione |
|--------|--------|-------------|
| `NEXT_PUBLIC_TMDB_API_KEY` | `tua-chiave-api` | Chiave API di TMDB |
| `NODE_VERSION` | `20.10.0` | Versione di Node.js |
| `NPM_VERSION` | `10.2.3` | Versione di npm |

### 4. Deploy

Dopo aver configurato le variabili d'ambiente, Netlify avvierà automaticamente il processo di build e deploy.

## Verifica del deploy

Una volta completato il deploy, puoi verificare il corretto funzionamento del sito:

1. Controlla che la homepage carichi correttamente
2. Verifica che le pagine dei film e delle serie TV funzionino
3. Controlla la pagina di debug `/admin/pagine-prerenderizzate` per verificare quali pagine sono state prerenderizzate

## Troubleshooting

### Problemi con le immagini TMDB

Se le immagini non vengono visualizzate correttamente, verifica che la configurazione per le immagini remote in `netlify.toml` sia corretta:

```toml
[images]
  remote_images = ["^(?:http(?:s)?:\\/\\/image\\.tmdb\\.org(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)|$))$"]
```

### Problemi con il rendering delle pagine

Se alcune pagine non vengono renderizzate correttamente:

1. Verifica che la chiave API TMDB sia corretta
2. Controlla i log di build su Netlify
3. Se necessario, incrementa il numero di pagine prerenderizzate modificando le funzioni `generateStaticParams` in `app/film/[slug]/page.tsx` e `app/serie/[slug]/page.tsx` 

Puoi visualizzare i dettagli di questo deploy direttamente nel pannello di controllo di Netlify o con il comando:

```
npx netlify-cli sites:deploys --site mastroianni.app
``` 