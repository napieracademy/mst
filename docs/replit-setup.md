# Configurazione dell'ambiente Replit

Questa guida spiega come configurare correttamente il progetto MST su Replit per evitare problemi e isolarlo dall'ambiente di produzione principale.

## Perché isolare l'ambiente Replit?

Replit è un ottimo strumento per lo sviluppo e il testing, ma presenta alcune peculiarità che potrebbero causare problemi se non gestite correttamente:

1. Limiti di risorse e timeout diversi
2. Configurazione di rete diversa
3. Problemi potenziali con chiavi API e permessi
4. Ambiente runtime potenzialmente diverso

## Configurazione iniziale

### 1. File .env per Replit

Crea un file `.env` nell'ambiente Replit utilizzando il template fornito:

```bash
# Copia il template
cp .env.replit.template .env

# Edita il file con le tue chiavi API
nano .env
```

### 2. Variabili d'ambiente importanti

Assicurati di impostare queste variabili nell'ambiente Replit:

```
SKIP_API_KEY_SERVICE=true
DISABLE_RISKY_FEATURES=true
DEBUG_LEVEL=info
```

Queste impostazioni assicurano che:
- Venga usato esclusivamente l'accesso locale alle chiavi API
- Le funzionalità potenzialmente problematiche siano disabilitate
- Il logging sia sufficientemente dettagliato

### 3. Configurazione Supabase

Usa le stesse credenziali Supabase del progetto principale ma considera queste impostazioni:

- Disabilita le Edge Functions quando possibile
- Usa la connessione diretta al database quando possibile
- Evita di modificare dati in produzione dal tuo ambiente Replit

## Come funziona l'isolamento

Il progetto MST utilizza un sistema di rilevamento dell'ambiente che:

1. Identifica automaticamente quando è in esecuzione su Replit
2. Applica configurazioni specifiche per questo ambiente
3. Disabilita il servizio centralizzato delle chiavi API
4. Aumenta il logging diagnostico

Per verificare che l'ambiente sia rilevato correttamente:

```bash
# Nel terminale Replit, esegui:
npm run dev
```

Dovresti vedere nei log iniziali:
```
[REPLIT] Ambiente Replit rilevato, applicando configurazioni specifiche
```

## Troubleshooting

### Problemi comuni e soluzioni

1. **Errori di API Key**
   - Verifica che le chiavi API siano correttamente impostate in `.env`
   - Controlla che `SKIP_API_KEY_SERVICE=true` sia impostato

2. **Timeout o errori di connessione**
   - Aumenta i timeout nelle richieste API
   - Usa `fetchWithRetry` per richieste importanti

3. **Problemi di build**
   - Disabilita ottimizzazioni pesanti
   - Imposta `NODE_ENV=development` se necessario

## Debug e logging

Per un logging più dettagliato, imposta:

```
DEBUG_LEVEL=debug
```

Questo aumenterà il livello di dettaglio nei log, facilitando l'identificazione dei problemi.

## Riassunto delle differenze con produzione

| Funzionalità | Produzione | Replit |
|--------------|------------|--------|
| API Keys     | Servizio centralizzato | Variabili d'ambiente locali |
| Ottimizzazioni | Tutte abilitate | Alcune disabilitate |
| Logging | Minimo | Dettagliato |
| Cache | Persistente | In-memory |