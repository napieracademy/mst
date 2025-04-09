import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cache dei risultati - chiave: startDate_endDate_limit, valore: risultato della risposta
const responseCache: Record<string, {
  data: any,
  timestamp: number
}> = {};

// Durata della cache in millisecondi (30 minuti)
const CACHE_TTL = 30 * 60 * 1000;

// Array per memorizzare i log per la risposta
const requestLogs: string[] = [];

// Funzione di utilità per il logging dettagliato
function logDetails(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [OSCAR-API] ${message}`;
  console.log(logMessage);
  requestLogs.push(logMessage);
  
  if (data) {
    try {
      // Limita la dimensione dei dati nei log per evitare log troppo grandi
      const dataStr = typeof data === 'string' 
        ? data.substring(0, 500) 
        : JSON.stringify(data, null, 2).substring(0, 500);
      const dataLog = `[${timestamp}] [OSCAR-API-DATA] ${dataStr}${dataStr.length >= 500 ? '...' : ''}`;
      console.log(dataLog);
      requestLogs.push(dataLog);
    } catch (err) {
      const errorLog = `[${timestamp}] [OSCAR-API-ERROR] Impossibile loggare i dati: ${err}`;
      console.log(errorLog);
      requestLogs.push(errorLog);
    }
  }
}

// Endpoint per recuperare i film vincitori di Oscar per il carousel
export async function GET(request: NextRequest) {
  // Resetta i log per questa richiesta
  requestLogs.length = 0;
  
  try {
    // Parametri per la richiesta
    const startDate = request.nextUrl.searchParams.get('startDate') || '2015-01-01';
    const endDate = request.nextUrl.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const debug = request.nextUrl.searchParams.get('debug') === 'true';
    const noCache = request.nextUrl.searchParams.get('noCache') === 'true';
    
    // Genera la chiave di cache
    const cacheKey = `${startDate}_${endDate}_${limit}`;
    
    // Controlla se i risultati sono in cache e se la cache è ancora valida
    if (!noCache && responseCache[cacheKey] && 
        (Date.now() - responseCache[cacheKey].timestamp) < CACHE_TTL) {
        
      logDetails(`Usando risultati in cache per ${cacheKey} [età: ${
        Math.round((Date.now() - responseCache[cacheKey].timestamp) / 1000)
      } secondi]`);
      
      return NextResponse.json({
        success: true,
        cached: true,
        total: responseCache[cacheKey].data.total,
        movies: responseCache[cacheKey].data.movies,
        logs: debug ? requestLogs : undefined
      });
    }
    
    logDetails(`Recuperando vincitori Oscar dal ${startDate} al ${endDate}, limite: ${limit}`);
    
    // Richiesta POST esatta a RapidAPI come nel curl di esempio
    const apiUrl = 'https://imdb8.p.rapidapi.com/v2/search-advance';
    
    const requestBody = {
      first: limit,
      after: "",
      includeReleaseDates: true,
      sort: {
        sortBy: "RELEASE_DATE",
        sortOrder: "DESC"
      },
      allEventNominations: [
        {
          eventId: "ev0000003", // Oscar / Academy Awards
          searchAwardCategoryId: "bestPicture",
          winnerFilter: "WINNER_ONLY"
        }
      ],
      releaseDateRange: {
        start: startDate,
        end: endDate
      },
      anyTitleTypeIds: ["movie"],
      aggregateRatingRange: { min: 0 },
      ratingsCountRange: { min: 0 }
    };
    
    logDetails('Invio richiesta a RapidAPI', {
      url: `${apiUrl}?country=US&language=en-US`,
      method: 'POST',
      body: requestBody
    });
    
    const rapidApiKey = process.env.RAPIDAPI_KEY || '93ba2d0ef4msh63a61e6cc307208p151d14jsnacb83f03f7ff';
    
    // Assicuriamoci che la chiave API sia presente
    if (!rapidApiKey) {
      logDetails('ERRORE: Chiave RapidAPI mancante');
      return NextResponse.json({
        success: false,
        error: 'Configurazione API mancante',
        logs: debug ? requestLogs : undefined
      }, { status: 500 });
    }
    
    const response = await fetch(`${apiUrl}?country=US&language=en-US`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logDetails(`Errore RapidAPI: ${response.status}`, errorText);
      return NextResponse.json({ 
        success: false,
        error: `Errore API: ${response.status}`,
        details: errorText,
        logs: debug ? requestLogs : undefined
      }, { status: response.status });
    }
    
    const data = await response.json();
    logDetails('Risposta da RapidAPI ricevuta', data);
    
    // Estrai gli ID IMDb dalla risposta usando il nuovo formato
    const imdbIds = [];
    
    // Gestisco il nuovo formato della risposta che è nestato in data.data.advancedTitleSearch.edges
    if (data?.data?.advancedTitleSearch?.edges) {
      for (const edge of data.data.advancedTitleSearch.edges) {
        if (edge?.node?.title?.id) {
          const imdbId = edge.node.title.id;
          logDetails(`ID IMDB estratto: ${imdbId}`);
          imdbIds.push(imdbId);
        }
      }
    } else {
      logDetails('AVVISO: Formato risposta non valido o nessun risultato trovato', data);
      
      // Analizziamo la struttura della risposta per debug
      logDetails('Struttura dati risposta RapidAPI:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        nestedDataKeys: data?.data ? Object.keys(data.data) : [],
        advancedSearch: !!data?.data?.advancedTitleSearch,
        advancedSearchKeys: data?.data?.advancedTitleSearch ? Object.keys(data.data.advancedTitleSearch) : []
      });
    }
    
    logDetails(`Estratti ${imdbIds.length} ID IMDB`, imdbIds);
    
    if (imdbIds.length === 0) {
      return NextResponse.json({
        success: true,
        movies: [],
        logs: debug ? requestLogs : undefined
      });
    }
    
    // Per ogni IMDb ID, recupera le informazioni da TMDB
    const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '2ab3798eb2ba0974e1ccc92c7a27e633';
    
    // Assicuriamoci che la chiave TMDB API sia presente
    if (!tmdbApiKey) {
      logDetails('ERRORE: Chiave TMDB API mancante');
      return NextResponse.json({
        success: false,
        error: 'Configurazione TMDB API mancante',
        logs: debug ? requestLogs : undefined
      }, { status: 500 });
    }
    
    const tmdbMoviesPromises = imdbIds.map(async (imdbId: string) => {
      try {
        const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbApiKey}&external_source=imdb_id`;
        
        logDetails(`Richiesta TMDB per ${imdbId}`);
        
        const tmdbFindResponse = await fetch(tmdbUrl);
        
        if (!tmdbFindResponse.ok) {
          const errorText = await tmdbFindResponse.text();
          logDetails(`Errore TMDB API per ${imdbId}: ${tmdbFindResponse.status}`, errorText);
          return null;
        }
        
        const tmdbData = await tmdbFindResponse.json();
        logDetails(`Risposta TMDB per ${imdbId} ricevuta`, tmdbData);
        
        const movieData = tmdbData?.movie_results?.[0];
        
        if (!movieData) {
          logDetails(`Nessun risultato TMDB trovato per IMDB ID ${imdbId}`);
          return null;
        }
        
        return {
          imdbId,
          tmdbId: movieData.id,
          title: movieData.title,
          releaseDate: movieData.release_date,
          posterPath: movieData.poster_path,
          backdropPath: movieData.backdrop_path,
          overview: movieData.overview,
          voteAverage: movieData.vote_average
        };
      } catch (error) {
        logDetails(`Errore nel recupero dati TMDB per ${imdbId}`, error);
        return null;
      }
    });
    
    const tmdbMovies = await Promise.all(tmdbMoviesPromises);
    
    // Filtra i risultati nulli e restituisci i dati
    const validMovies = tmdbMovies.filter(movie => movie !== null);
    logDetails(`Film validi trovati: ${validMovies.length}`);
    
    // Memorizza il risultato in cache
    responseCache[cacheKey] = {
      data: {
        total: validMovies.length,
        movies: validMovies
      },
      timestamp: Date.now()
    };
    
    logDetails(`Risultati salvati in cache con chiave: ${cacheKey}`);
    
    return NextResponse.json({
      success: true,
      cached: false,
      total: validMovies.length,
      movies: validMovies,
      logs: debug ? requestLogs : undefined
    });
  } catch (error) {
    logDetails('Errore critico nel recupero film vincitori Oscar', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      logs: requestLogs // Includi sempre i log in caso di errore
    }, { status: 500 });
  }
}