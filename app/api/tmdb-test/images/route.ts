import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 3600; // Riconvalida ogni ora

/**
 * API route per ottenere le immagini da TMDB
 * Risponde sempre con un oggetto JSON contenente un array di backdrops
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'movie';
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID mancante',
        backdrops: [] 
      }, { status: 400 });
    }

    // Connessione a TMDB per immagini
    try {
      const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!tmdbApiKey) {
        throw new Error('API key di TMDB mancante');
      }

      const url = `https://api.themoviedb.org/3/${type}/${id}/images?api_key=${tmdbApiKey}&language=it-IT,null`;
      const response = await fetch(url, { next: { revalidate: 3600 } });
      
      if (!response.ok) {
        throw new Error(`Errore API TMDB: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Restituisce le immagini come JSON
      return NextResponse.json({
        success: true,
        backdrops: data.backdrops || []
      });
    } catch (tmdbError) {
      console.error('Errore TMDB:', tmdbError);
      return NextResponse.json({ 
        success: false,
        error: tmdbError instanceof Error ? tmdbError.message : 'Errore TMDB sconosciuto',
        backdrops: [] 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Errore nella route images TMDB:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Errore interno del server',
      backdrops: [] 
    }, { status: 500 });
  }
} 