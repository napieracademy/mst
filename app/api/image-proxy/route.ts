import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  
  if (!url) {
    return new NextResponse("URL mancante", { status: 400 });
  }
  
  try {
    // Verifica che l'URL sia di TMDB
    if (!url.startsWith("https://image.tmdb.org/")) {
      return new NextResponse("URL non consentito", { status: 403 });
    }
    
    console.log(`Image proxy: Fetching image from ${url}`);
    
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache per 24 ore
    });
    
    if (!response.ok) {
      console.error(`Image proxy error: ${response.status} for ${url}`);
      return new NextResponse("Immagine non trovata", { status: response.status });
    }

    // Ottieni il tipo di contenuto e i dati binari
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const data = await response.arrayBuffer();
    
    // Restituisci l'immagine con gli header appropriati
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Errore nel proxy immagine:", error);
    return new NextResponse("Errore nel recupero dell'immagine", { status: 500 });
  }
}
