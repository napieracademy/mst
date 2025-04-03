import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Versione semplificata per il deploy su Netlify
// Risponde sempre con "prerenderizzato: true" per evitare errori durante il build
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const slug = searchParams.get('slug');
  
  // Esempio di risposta semplificata
  return NextResponse.json({
    isPrerenderizzato: true,
    tipo: tipo,
    slug: slug,
    fileSize: 10240, // Valore fittizio
    fileTrovati: 0,
    pagineStatiche: 12, // 10 film + 2 serie
    esempioFile: [],
    nota: "Questo è un risultato semplificato per Netlify"
  });
} 