import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    // Otteniamo la chiave del video di YouTube
    const { key } = params;
    
    if (!key) {
      return new NextResponse("Chiave video mancante", { status: 400 });
    }

    // Semplice reindirizzamento a YouTube
    return NextResponse.redirect(`https://www.youtube.com/watch?v=${key}`);
  } catch (error) {
    console.error("Errore nel proxy del trailer:", error);
    return new NextResponse("Errore interno del server", { status: 500 });
  }
} 