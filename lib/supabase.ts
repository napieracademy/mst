import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Assicuriamoci che le variabili siano stringhe valide prima di usarle
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Mancano le variabili d\'ambiente di Supabase. Definiscile in .env.local')
    // Restituisci un client con URL vuoto che verrà gestito più tardi
    // invece di lanciare subito un errore
    return null;
  }

  // Verifica che l'URL sia valido (inizia con https://)
  if (!supabaseUrl.startsWith('https://')) {
    console.error('L\'URL Supabase non è valido:', supabaseUrl);
    return null;
  }

  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey);

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true }
    });
  } catch (error) {
    console.error('Errore nella creazione del client Supabase:', error);
    return null;
  }
} 