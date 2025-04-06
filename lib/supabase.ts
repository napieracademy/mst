import { createBrowserClient } from '@supabase/ssr'

// Singleton instance per il client browser
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  // Se esiste già un'istanza, restituiscila
  if (typeof window !== 'undefined' && browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Mancano le variabili d\'ambiente di Supabase. Definiscile in .env.local')
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true }
  });

  // Salva l'istanza solo se siamo nel browser
  if (typeof window !== 'undefined') {
    browserClient = client;
  }

  return client;
} 