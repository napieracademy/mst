import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Endpoint per recuperare i vincitori dell'Oscar come miglior film tramite RapidAPI
export async function GET(request: NextRequest) {
  try {
    // Parametri dalla query
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const startYear = request.nextUrl.searchParams.get('startYear') || '2015';
    const endYear = request.nextUrl.searchParams.get('endYear') || '2025';
    
    // Costruisci il payload per la richiesta POST a RapidAPI
    const payload = {
      "first": limit,
      "after": "",
      "includeReleaseDates": true,
      "sort": {
        "sortBy": "RELEASE_DATE",
        "sortOrder": "DESC"
      },
      "allEventNominations": [
        {
          "eventId": "ev0000003",  // ID per gli Academy Awards (Oscar)
          "searchAwardCategoryId": "bestPicture",
          "winnerFilter": "WINNER_ONLY"
        }
      ],
      "releaseDateRange": {
        "start": `${startYear}-01-01`,
        "end": `${endYear}-12-31`
      },
      "anyTitleTypeIds": [
        "movie"
      ],
      "aggregateRatingRange": {
        "min": 0
      },
      "ratingsCountRange": {
        "min": 0
      }
    };
    
    // URL e headers per la richiesta a RapidAPI
    const apiUrl = 'https://imdb8.p.rapidapi.com/v2/search-advance?country=US&language=en-US';
    
    console.log(`Chiamata a RapidAPI per Oscar miglior film dal ${startYear} al ${endYear}, limite: ${limit}`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '93ba2d0ef4msh63a61e6cc307208p151d14jsnacb83f03f7ff'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Errore RapidAPI: ${response.status}`);
      return NextResponse.json({ 
        success: false,
        error: `Errore API: ${response.status}` 
      }, { status: response.status });
    }
    
    // Elabora la risposta
    const data = await response.json();
    
    // Estrai gli ID IMDb dalla risposta (formato diverso rispetto all'endpoint precedente)
    const imdbInfos = (data.results || []).map((item: any) => {
      const node = item.node || {};
      return {
        imdbId: node.id,  // ID IMDb diretto, non nel formato "/title/tt..."
        title: node.primaryTitle || node.secondaryTitle || 'Titolo sconosciuto',
        year: node.releaseDate?.year
      };
    });
    
    // Ottieni dettagli completi per ogni film tramite TMDB
    const moviesWithDetails = await Promise.all(
      imdbInfos.map(async (info: any, index: number) => {
        try {
          // Cerca il film su TMDB usando l'ID IMDb
          const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/find/${info.imdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || '2ab3798eb2ba0974e1ccc92c7a27e633'}&external_source=imdb_id`
          );
          
          if (!tmdbResponse.ok) {
            throw new Error(`TMDB API error: ${tmdbResponse.status}`);
          }
          
          const tmdbData = await tmdbResponse.json();
          const movieData = tmdbData.movie_results?.[0] || {};
          
          // Se abbiamo l'ID TMDB, ottieni dettagli completi
          if (movieData.id) {
            const detailsResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movieData.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || '2ab3798eb2ba0974e1ccc92c7a27e633'}&language=it-IT&append_to_response=credits`
            );
            
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              
              // Estrai anno di uscita
              const releaseYear = detailsData.release_date ? 
                parseInt(detailsData.release_date.split('-')[0]) : info.year;
                
              // Calcola anno della cerimonia (in genere l'anno dopo l'uscita)
              const ceremonyYear = releaseYear ? releaseYear + 1 : null;
              
              // Trova il regista
              const director = detailsData.credits?.crew?.find((person: any) => 
                person.job === 'Director'
              );
              
              return {
                imdbId: info.imdbId,
                tmdbId: detailsData.id,
                title: detailsData.title || info.title,
                originalTitle: detailsData.original_title,
                releaseDate: detailsData.release_date,
                releaseYear,
                ceremonyYear,
                posterPath: detailsData.poster_path,
                backdropPath: detailsData.backdrop_path,
                overview: detailsData.overview,
                director: director ? {
                  id: director.id,
                  name: director.name,
                  profilePath: director.profile_path
                } : null,
                oscarData: {
                  bestPicture: true,
                  totalWins: 1,
                  totalNominations: 1
                }
              };
            }
          }
          
          // Fallback con i dati minimi disponibili
          return {
            imdbId: info.imdbId,
            tmdbId: movieData.id,
            title: movieData.title || info.title,
            releaseDate: movieData.release_date,
            releaseYear: info.year,
            ceremonyYear: info.year ? info.year + 1 : null,
            posterPath: movieData.poster_path,
            oscarData: {
              bestPicture: true,
              totalWins: 1,
              totalNominations: 1
            }
          };
        } catch (error) {
          console.error(`Errore nel recupero dettagli per ${info.imdbId}:`, error);
          return { 
            imdbId: info.imdbId, 
            title: info.title,
            releaseYear: info.year,
            error: true 
          };
        }
      })
    );
    
    // Filtra film con errori
    const validMovies = moviesWithDetails.filter(movie => !movie.error);
    
    return NextResponse.json({
      success: true,
      source: 'rapidapi-v2',
      count: validMovies.length,
      winners: validMovies
    });
  } catch (error) {
    console.error('Errore nel recupero dei vincitori Oscar come miglior film:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}