import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ID IMDb dei film vincitori dell'Oscar come miglior film dal 2015 al 2025
const OSCAR_WINNERS_BY_YEAR = {
  // Più recenti in cima
  '2025': '',             // Non assegnato (futuro)
  '2024': 'tt13238346',   // Oppenheimer
  '2023': 'tt1477834',    // Everything Everywhere All at Once
  '2022': 'tt10366460',   // CODA
  '2021': 'tt10272386',   // Nomadland
  '2020': 'tt6751668',    // Parasite
  '2019': 'tt6966692',    // Green Book
  '2018': 'tt5580390',    // The Shape of Water
  '2017': 'tt4975722',    // Moonlight
  '2016': 'tt1895587',    // Spotlight
  '2015': 'tt2562232',    // Birdman
};

// Endpoint per recuperare i vincitori dell'Oscar usando solo TMDB
export async function GET(request: NextRequest) {
  try {
    const startYear = parseInt(request.nextUrl.searchParams.get('startYear') || '2015');
    const endYear = parseInt(request.nextUrl.searchParams.get('endYear') || '2024'); // Impostiamo 2024 come anno massimo predefinito
    
    // Verifica validità dell'intervallo di anni
    if (startYear > endYear) {
      return NextResponse.json({ 
        error: 'L\'anno di inizio deve essere minore o uguale all\'anno di fine' 
      }, { status: 400 });
    }
    
    // Filtra i vincitori per l'intervallo di anni richiesto e rimuovi quelli senza ID
    const winners = Object.entries(OSCAR_WINNERS_BY_YEAR)
      .filter(([year, id]) => {
        const yearNum = parseInt(year);
        return yearNum >= startYear && yearNum <= endYear && id !== '';
      })
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0])); // Ordina per anno decrescente (più recenti prima)
    
    // Recupera i dettagli da TMDB per ogni vincitore
    const winnersWithDetails = await Promise.all(
      winners.map(async ([year, imdbId]) => {
        try {
          // Ottieni i dettagli di base del film da TMDB
          const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/find/${imdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || '2ab3798eb2ba0974e1ccc92c7a27e633'}&external_source=imdb_id`
          );
          
          if (!tmdbResponse.ok) {
            throw new Error(`TMDB API error: ${tmdbResponse.status}`);
          }
          
          const tmdbData = await tmdbResponse.json();
          const movieData = tmdbData.movie_results?.[0] || {};
          
          // Se non ci sono risultati, lancia un errore
          if (!movieData || !movieData.id) {
            throw new Error('Film non trovato su TMDB');
          }
          
          // Estrai i dettagli completi da TMDB
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movieData.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || '2ab3798eb2ba0974e1ccc92c7a27e633'}&language=it-IT&append_to_response=credits`
          );
          
          if (!detailsResponse.ok) {
            throw new Error(`TMDB Details API error: ${detailsResponse.status}`);
          }
          
          const detailsData = await detailsResponse.json();
          
          // Trova il regista tra i credits
          const director = detailsData.credits?.crew?.find((person: any) => person.job === 'Director');
          
          return {
            year,
            imdbId,
            title: detailsData.title || movieData.title || '',
            originalTitle: detailsData.original_title || movieData.original_title || '',
            overview: detailsData.overview || movieData.overview || '',
            posterPath: detailsData.poster_path || movieData.poster_path || null,
            backdropPath: detailsData.backdrop_path || null,
            releaseDate: detailsData.release_date || movieData.release_date || '',
            voteAverage: detailsData.vote_average || movieData.vote_average || 0,
            tmdbId: detailsData.id || movieData.id,
            director: director ? {
              id: director.id,
              name: director.name,
              profilePath: director.profile_path
            } : null,
            oscarData: {
              bestPicture: true,
              year: parseInt(year)
            }
          };
        } catch (error) {
          console.error(`Error getting details for ${imdbId} (${year}):`, error);
          // Restituisci un oggetto con dati minimi in caso di errore
          return {
            year,
            imdbId,
            error: error instanceof Error ? error.message : 'Unknown error',
            title: `Oscar ${year}`,
            oscarData: { 
              bestPicture: true,
              year: parseInt(year)
            }
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      startYear,
      endYear,
      count: winnersWithDetails.length,
      winners: winnersWithDetails
    });
  } catch (error) {
    console.error('Error fetching Oscar winners:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}