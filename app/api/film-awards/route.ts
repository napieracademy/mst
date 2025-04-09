import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Endpoint per recuperare i dettagli dei premi per un film specifico tramite RapidAPI
export async function GET(request: NextRequest) {
  try {
    // Ottieni l'ID IMDb dalla query
    const imdbId = request.nextUrl.searchParams.get('imdbId');
    
    if (!imdbId) {
      return NextResponse.json({ 
        success: false,
        error: 'Parametro imdbId obbligatorio' 
      }, { status: 400 });
    }
    
    // Richiesta esatta a RapidAPI come nel curl di esempio
    const apiUrl = `https://imdb8.p.rapidapi.com/title/v2/get-awards?tconst=${imdbId}&first=20&country=US&language=en-US`;
    
    console.log(`Recuperando premi per il film: ${imdbId}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '93ba2d0ef4msh63a61e6cc307208p151d14jsnacb83f03f7ff'
      }
    });
    
    if (!response.ok) {
      console.error(`Errore RapidAPI: ${response.status}`);
      return NextResponse.json({ 
        success: false,
        error: `Errore API: ${response.status}` 
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Otteniamo anche i dettagli di base del film da TMDB tramite IMDb ID
    const tmdbFindResponse = await fetch(
      `https://api.themoviedb.org/3/find/${imdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || '2ab3798eb2ba0974e1ccc92c7a27e633'}&external_source=imdb_id`
    );
    
    const tmdbData = tmdbFindResponse.ok ? await tmdbFindResponse.json() : null;
    const movieData = tmdbData?.movie_results?.[0] || tmdbData?.tv_results?.[0] || {};
    
    // Costruisci una risposta che combina dati IMDb e TMDB
    return NextResponse.json({
      success: true,
      imdbId,
      tmdbId: movieData.id,
      title: movieData.title || movieData.name,
      releaseDate: movieData.release_date || movieData.first_air_date,
      posterPath: movieData.poster_path,
      // Dati dei premi da RapidAPI
      awards: data
    });
  } catch (error) {
    console.error('Errore nel recupero premi:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}