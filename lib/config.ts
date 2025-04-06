// Configurazione dell'applicazione
export const config = {
  // Impostare a false per disabilitare tutte le chiamate API a TMDB
  enableTMDBApi: true,
  
  // Impostare a false per disabilitare tutte le chiamate API a OpenAI
  enableOpenAI: true,
  
  // Configurazione del servizio centralizzato delle chiavi API
  apiKeys: {
    // Abilitare/disabilitare l'utilizzo del servizio centralizzato
    useApiKeysService: true,
    
    // Tempo di cache in secondi (0 = nessuna cache)
    cacheTime: 3600, // 1 ora
    
    // Strategia di fallback in caso di errore
    // "env": usa le variabili d'ambiente locali
    // "error": lancia un errore
    // "null": restituisce null
    fallbackStrategy: "env",
  },
  
  // Configurazione di OpenAI
  openai: {
    // Modello di default
    defaultModel: "gpt-3.5-turbo",
    
    // Token massimi di default
    defaultMaxTokens: 1000,
    
    // Temperatura di default
    defaultTemperature: 0.7
  }
}

