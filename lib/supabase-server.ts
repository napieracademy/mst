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

export const createApiSupabaseClient = () => {
  // Per i client API possiamo usare un singleton
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