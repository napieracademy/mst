/**
 * Gestisce la configurazione specifica per ambiente
 * Questo modulo fornisce funzioni per rilevare e gestire diversi ambienti di esecuzione
 */

import { headers } from 'next/headers';

/**
 * Rileva l'ambiente di esecuzione corrente
 */
export function detectEnvironment() {
  // Rileva se siamo in ambiente Replit
  const isReplit = typeof process !== 'undefined' && 
                  process.env.REPL_ID !== undefined && 
                  process.env.REPL_OWNER !== undefined;
  
  // Rileva se siamo in fase di build
  const isBuildPhase = process.env.NEXT_PHASE === 'build';
  
  // Rileva ambiente di sviluppo locale
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Vercel
  const isVercel = Boolean(process.env.VERCEL);
  
  // Railway
  const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);
  
  // Rileva ambiente di produzione (non build, non Replit)
  const isProduction = process.env.NODE_ENV === 'production' && !isBuildPhase && !isReplit;
  
  // Restituisce le informazioni sull'ambiente
  return {
    isReplit,
    isBuildPhase,
    isDevelopment,
    isProduction,
    isVercel,
    isRailway,
    // Nome dell'ambiente per il logging
    name: determineEnvironmentName({isReplit, isDevelopment, isProduction, isVercel, isRailway, isBuildPhase}),
    // Flag per funzionalità specifiche
    features: {
      // Il servizio centralizzato API keys dovrebbe essere usato solo in produzione
      useApiKeysService: isProduction && !isReplit,
      // Disattiva funzionalità rischiose in Replit
      disableRiskyFeatures: isReplit || process.env.DISABLE_RISKY_FEATURES === 'true',
      // Disattiva funzionalità di debug in produzione
      disableDebug: isProduction && !isReplit && process.env.ENABLE_DEBUG !== 'true',
      // Abilitare logging avanzato
      enableAdvancedLogging: isDevelopment || process.env.DEBUG_LEVEL === 'debug',
    }
  };
}

/**
 * Determina un nome leggibile per l'ambiente corrente
 */
function determineEnvironmentName(env: any): string {
  if (env.isBuildPhase) return 'build';
  if (env.isReplit) return 'replit';
  if (env.isDevelopment) return 'development';
  if (env.isVercel) return 'vercel';
  if (env.isRailway) return 'railway';
  if (env.isProduction) return 'production';
  return 'unknown';
}

/**
 * Ottiene informazioni leggibili sull'ambiente corrente
 */
export function getEnvironmentInfo() {
  const env = detectEnvironment();
  
  return {
    name: env.name,
    isProduction: env.isProduction,
    isDevelopment: env.isDevelopment,
    isBuildPhase: env.isBuildPhase,
    platform: env.isReplit ? 'replit' : 
              env.isVercel ? 'vercel' : 
              env.isRailway ? 'railway' : 'standard',
    features: Object.entries(env.features)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name)
  };
}

// Esporta una singola istanza dell'ambiente rilevato
export const environment = detectEnvironment();