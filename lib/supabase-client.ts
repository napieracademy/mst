import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Credenziali Supabase mancanti nel client', { 
      urlDefined: !!supabaseUrl, 
      keyDefined: !!supabaseKey 
    });
    throw new Error('Credenziali Supabase mancanti');
  }
  
  console.log('Inizializzazione client Supabase con URL:', supabaseUrl);
  
  try {
    // Crea client con timeout più lungo (30 secondi)
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            // Aumenta il timeout
            signal: AbortSignal.timeout(30000) // 30 secondi
          });
        }
      }
    });
  } catch (error) {
    console.error('Errore nella creazione del client Supabase:', error);
    throw error;
  }
}; 