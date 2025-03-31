import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Mancano le variabili d\'ambiente di Supabase. Definiscile in .env.local')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true }
  })
} 