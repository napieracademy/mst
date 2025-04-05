
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Recupera le variabili d'ambiente direttamente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Log per debug
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey);

  // Se siamo nel browser, controlla se possiamo ottenere le variabili dal window
  if (typeof window !== 'undefined' && (!supabaseUrl || supabaseUrl === 'your_supabase_url')) {
    // Fallback: cerca le variabili direttamente nell'oggetto window
    // @ts-ignore
    const envFromWindow = window.__ENV__ || {};
    if (envFromWindow.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('Usando variabili da window.__ENV__');
    }
  }

  // Usa i valori dal .env.local
  const finalSupabaseUrl = 'https://gbynhfiqlacmlwpjcxmp.supabase.co';
  const finalSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieW5oZmlxbGFjbWx3cGpjeG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTI3NzcsImV4cCI6MjA1NTc2ODc3N30.gFiM3yc82ID61fVPAt6fpFvOoHheAS7zS5Ns3iMsQ7I';

  try {
    return createBrowserClient(finalSupabaseUrl, finalSupabaseAnonKey, {
      auth: { persistSession: true }
    });
  } catch (error) {
    console.error('Errore nella creazione del client Supabase:', error);
    return null;
  }
}
