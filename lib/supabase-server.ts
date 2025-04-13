import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
// Importiamo cookies in modo condizionale per evitare problemi durante il build
// Questo import è richiesto solo quando viene eseguito lato server

// Cache per il client API (non dipendente dai cookie)
let apiClient: ReturnType<typeof createClient> | null = null;

export const createServerSupabaseClient = async () => {
  // Importa cookies dinamicamente solo quando la funzione viene chiamata
  // Questo evita problemi durante il build
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Check your environment variables.')
    return null
  }

  // Per il client server non possiamo usare un singleton
  // poiché dipende dai cookie che cambiano per ogni richiesta
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignora errori di cookie in ambiente server
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignora errori di cookie in ambiente server
          }
        },
      },
    }
  )
}

export const createApiSupabaseClient = (options?: { adminAccess?: boolean }) => {
  // Se richiediamo accesso admin, non utilizziamo la cache
  if (options?.adminAccess) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Se la service role key è disponibile, usala
    if (supabaseUrl && supabaseServiceKey) {
      console.log('[DEBUG] Creando client Supabase con privilegio di service role');
      return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    
    // FALLBACK: Se non è disponibile, usa la anon key con un warning
    console.warn('[DEBUG] Service role key non disponibile! Uso anon key come fallback (potrebbero esserci problemi di permessi)');
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Anon Key is missing. Check your environment variables.');
      throw new Error('API keys non disponibili');
    }
    
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  // Per i client API standard possiamo usare un singleton
  if (apiClient) {
    return apiClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Check your environment variables.');
    return null;
  }

  apiClient = createClient(supabaseUrl, supabaseKey);
  return apiClient;
} 