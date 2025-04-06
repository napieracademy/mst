import { NextRequest, NextResponse } from 'next/server';
import { createApiSupabaseClient } from '@/lib/supabase-server';

/**
 * API per triggerare manualmente la generazione della sitemap tramite
 * la edge function di Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica che la richiesta provenga da un utente autenticato
    const supabase = createApiSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Accesso non autorizzato' 
      }, { status: 401 });
    }
    
    // URL della funzione edge di Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !anon_key) {
      return NextResponse.json({
        success: false,
        error: 'Configurazione Supabase mancante'
      }, { status: 500 });
    }
    
    // Chiama la Edge Function di Supabase
    const functionUrl = `${supabaseUrl}/functions/v1/generate-sitemap`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore dalla funzione edge: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap generata con successo',
      data: result
    });
    
  } catch (error) {
    console.error('Errore durante la generazione della sitemap:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}