import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  
  if (!url || !url.startsWith("https://image.tmdb.org/")) {
    return new NextResponse("URL non valido", { status: 400 });
  }
  
  try {
    console.log(`Image proxy: Fetching image from ${url}`);
    
    // Usa fetch con l'opzione force-cache per ottimizzare il caching
    const response = await fetch(url, { 
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      console.error(`Image proxy error: ${response.status} for ${url}`);
      return new NextResponse("Immagine non trovata", { status: response.status });
    }

    // Invece di usare arrayBuffer() che carica l'intera immagine in memoria,
    // effettuiamo lo streaming diretto della risposta
    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Errore nel proxy immagine:", error);
    return new NextResponse("Errore nel recupero dell'immagine", { status: 500 });
  }
}
