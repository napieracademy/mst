import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  if (!apiKey) {
    console.error("TMDB API key is missing")
    return NextResponse.json({ error: "API key is missing" }, { status: 500 })
  }

  try {
    // Richiesta per film
    const movieUrl = new URL("https://api.themoviedb.org/3/search/movie")
    movieUrl.searchParams.append("api_key", apiKey)
    movieUrl.searchParams.append("query", query)
    movieUrl.searchParams.append("language", "it-IT")
    movieUrl.searchParams.append("include_adult", "false")
    movieUrl.searchParams.append("page", "1")
    movieUrl.searchParams.append("sort_by", "popularity.desc") // Ordina per popolarità

    // Richiesta per serie TV
    const tvUrl = new URL("https://api.themoviedb.org/3/search/tv")
    tvUrl.searchParams.append("api_key", apiKey)
    tvUrl.searchParams.append("query", query)
    tvUrl.searchParams.append("language", "it-IT")
    tvUrl.searchParams.append("include_adult", "false")
    tvUrl.searchParams.append("page", "1")
    tvUrl.searchParams.append("sort_by", "popularity.desc") // Ordina per popolarità

    // Esegui le richieste in parallelo
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(movieUrl.toString()), 
      fetch(tvUrl.toString())
    ])
    
    // Per ora, inizializziamo un array vuoto di risultati Trakt
    const traktResults = [];

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Failed to fetch search results")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    // Combina e formatta i risultati con popolarità
    const movieResults = (movieData.results || []).slice(0, 5).map((item: any) => ({
      id: item.id,
      title: item.title,
      poster_path: item.poster_path,
      media_type: "movie",
      year: item.release_date ? item.release_date.split("-")[0] : null,
      popularity: item.popularity || 0,
      vote_average: item.vote_average || 0,
      vote_count: item.vote_count || 0,
    }));

    const tvResults = (tvData.results || []).slice(0, 5).map((item: any) => ({
      id: item.id,
      title: item.name,
      poster_path: item.poster_path,
      media_type: "tv",
      year: item.first_air_date ? item.first_air_date.split("-")[0] : null,
      popularity: item.popularity || 0,
      vote_average: item.vote_average || 0,
      vote_count: item.vote_count || 0,
    }));

    // Arricchisci con dati Trakt se disponibili
    if (traktResults.length > 0) {
      // Aggiungi info Trakt ai risultati dei film
      for (const movie of movieResults) {
        const traktMatch = traktResults.find(t => 
          t.tmdb_id === movie.id || 
          (t.title.toLowerCase() === movie.title.toLowerCase() && t.year?.toString() === movie.year)
        );
        if (traktMatch) {
          movie.traktWatchers = traktMatch.watchers || 0;
          movie.traktPlays = traktMatch.plays || 0;
          movie.imdb_id = traktMatch.imdb_id;
        }
      }

      // Aggiungi info Trakt ai risultati delle serie
      for (const tv of tvResults) {
        const traktMatch = traktResults.find(t => 
          t.tmdb_id === tv.id || 
          (t.title.toLowerCase() === tv.title.toLowerCase() && t.year?.toString() === tv.year)
        );
        if (traktMatch) {
          tv.traktWatchers = traktMatch.watchers || 0;
          tv.traktPlays = traktMatch.plays || 0;
          tv.imdb_id = traktMatch.imdb_id;
        }
      }
    }

    // Ottieni informazioni sui registi per i film
    const movieResultsWithDirectors = await Promise.all(
      movieResults.map(async (movie) => {
        try {
          // Ottiene i crediti del film per trovare il regista
          const creditsUrl = new URL(`https://api.themoviedb.org/3/movie/${movie.id}/credits`);
          creditsUrl.searchParams.append("api_key", apiKey);
          creditsUrl.searchParams.append("language", "it-IT");
          
          const creditsResponse = await fetch(creditsUrl.toString());
          const creditsData = await creditsResponse.json();
          
          // Trova il regista tra i membri della crew
          const director = creditsData.crew?.find((person: any) => person.job === "Director");
          
          return {
            ...movie,
            director: director ? director.name : undefined
          };
        } catch (error) {
          console.error(`Error fetching director for movie ${movie.id}:`, error);
          return movie; // Restituisce il film senza il regista in caso di errore
        }
      })
    );

    // Per ora usiamo i risultati con registi direttamente, senza calcolo dello score ibrido
    const enhancedMovies = movieResultsWithDirectors;
    const enhancedTVShows = tvResults;

    // Combina e ordina per popolarità standard
    const combinedResults = [...enhancedMovies, ...enhancedTVShows]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 7);

    return NextResponse.json({ results: combinedResults })
  } catch (error) {
    console.error("Error fetching search autocomplete:", error)
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 })
  }
}