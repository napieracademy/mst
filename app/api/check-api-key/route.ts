import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createApiSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const check = searchParams.get('check');
  
  // Gestione conteggio database
  if (check === 'db-count') {
    try {
      const supabase = createApiSupabaseClient();
      if (!supabase) {
        return NextResponse.json({ count: null, error: 'Supabase client non disponibile' });
      }
      
      const { count, error } = await supabase
        .from('generated_pages')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Errore nel conteggio dei record:', error);
        return NextResponse.json({ count: null, error: error.message });
      }
      
      return NextResponse.json({ count });
    } catch (dbError) {
      console.error('Errore nell\'accesso al database:', dbError);
      return NextResponse.json({ count: null, error: 'Errore database' });
    }
  }
  
  // Controllo API key (comportamento originale)
  const apiKey = process.env.TMDB_API_KEY

  // Non mostriamo la chiave completa, solo i primi e ultimi caratteri
  const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "non configurata"

  return NextResponse.json({
    configured: !!apiKey,
    keyPreview: maskedKey,
    environment: process.env.NODE_ENV,
  })
}

