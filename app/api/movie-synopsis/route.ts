import { createApiSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Funzione per creare una risposta di errore standardizzata
function createErrorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get('tmdb_id');

    // Verifica che il parametro tmdb_id sia fornito
    if (!tmdb_id) {
      console.error('[API] Manca il parametro tmdb_id nella query');
      return NextResponse.json(
        { error: 'È richiesto il parametro tmdb_id' },
        { status: 400 }
      );
    }

    // Validazione del tmdb_id
    const numericTmdbId = parseInt(tmdb_id);
    if (isNaN(numericTmdbId)) {
      return NextResponse.json({ error: 'ID TMDB non valido' }, { status: 400 });
    }

    // Creazione del client Supabase
    const supabaseAdmin = createApiSupabaseClient({ adminAccess: true });
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Errore nella creazione del client Supabase' }, { status: 500 });
    }
    
    // Cerca per tmdb_id esatto
    const { data: movie, error: movieError } = await supabaseAdmin
      .from('movies')
      .select('id, tmdb_id, custom_overview')
      .eq('tmdb_id', numericTmdbId)
      .maybeSingle();

    if (movieError) {
      console.error('[API] Errore query Supabase:', movieError);
      return NextResponse.json(
        { error: 'Errore nel database', details: movieError.message }, 
        { status: 500 }
      );
    }

    // Se esiste il record e contiene custom_overview, restituisci quello
    if (movie && movie.custom_overview) {
      return NextResponse.json({
        tmdb_id: movie.tmdb_id,
        overview: movie.custom_overview,
        has_custom_overview: true
      });
    }

    // Recupera l'overview dalle API di TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB_API_KEY non definita' }, { status: 500 });
    }

    // Prova prima in italiano (it-IT)
    try {
      let tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/${numericTmdbId}?api_key=${TMDB_API_KEY}&language=it-IT`,
        { next: { revalidate: 3600 } } // Cache per 1 ora
      );
      
      if (!tmdbRes.ok) {
        // Se fallisce, prova in inglese (en-US)
        tmdbRes = await fetch(
          `https://api.themoviedb.org/3/movie/${numericTmdbId}?api_key=${TMDB_API_KEY}&language=en-US`,
          { next: { revalidate: 3600 } }
        );
        
        if (!tmdbRes.ok) {
          const errText = await tmdbRes.text();
          console.error(`[API] Errore TMDB API (${tmdbRes.status}):`, errText);
          return NextResponse.json(
            { error: 'Film non trovato su TMDB', details: errText }, 
            { status: 404 }
          );
        }
      }
      
      const tmdbData = await tmdbRes.json();
      
      return NextResponse.json({
        tmdb_id: numericTmdbId,
        overview: tmdbData.overview || 'Sinossi non disponibile',
        has_custom_overview: false
      });
    } catch (fetchError: unknown) {
      console.error("[API] Errore fetch TMDB:", fetchError);
      return NextResponse.json(
        { error: 'Errore nel recupero dei dati TMDB', details: fetchError instanceof Error ? fetchError.message : 'Errore sconosciuto' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Errore generico GET:", error);
    return NextResponse.json(
      { error: 'Errore interno del server', details: error instanceof Error ? error.message : 'Errore sconosciuto' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tmdb_id, overview } = body;
    
    console.log("[API] Ricevuta richiesta POST per movie-synopsis");
    console.log("[API] Body ricevuto:", JSON.stringify(body));
    
    console.log("[DEBUG] API ricevuta richiesta con:", {
      tmdb_id,
      tmdb_id_type: typeof tmdb_id,
      synopsis_preview: overview ? overview.substring(0, 25) + '...' : undefined,
      imdb_id: body.imdb_id
    });

    if (!tmdb_id) {
      return createErrorResponse("tmdb_id obbligatorio", 400);
    }
    
    // Verifica che l'ID TMDB sia valido
    const numericTmdbId = typeof tmdb_id === 'number' ? tmdb_id : parseInt(tmdb_id);
    console.log("[DEBUG] ID TMDB convertito:", numericTmdbId);
    
    if (isNaN(numericTmdbId)) {
      return createErrorResponse("ID TMDB non valido o non numerico", 400);
    }

    const supabase = createApiSupabaseClient({ adminAccess: true });
    
    if (!supabase) {
      return createErrorResponse("Errore nella creazione del client Supabase", 500);
    }
    
    console.log("[DEBUG] Cerco il film nella tabella movies con tmdb_id:", numericTmdbId);
    
    // Semplifichiamo la query per evitare di accedere a campi che potrebbero non esistere
    const { data: existingMovie, error: checkError } = await supabase
      .from("movies")
      .select("id, title, original_title")
      .eq("tmdb_id", numericTmdbId)
      .maybeSingle();
    
    let movieId;
    
    if (checkError) {
      console.error("[ERROR] Errore verifica film:", checkError);
      return createErrorResponse("Errore verifica film nel database", 500);
    }
    
    if (!existingMovie) {
      console.log("[DEBUG] Film non trovato, creazione nuovo record");
      
      // Recupera le informazioni del film da TMDB API
      const TMDB_API_KEY = process.env.TMDB_API_KEY;
      
      if (!TMDB_API_KEY) {
        return createErrorResponse("TMDB_API_KEY non definita", 500);
      }
      
      let title = '';
      let original_title = '';
      
      try {
        // Prova prima in italiano (it-IT)
        let tmdbRes = await fetch(
          `https://api.themoviedb.org/3/movie/${numericTmdbId}?api_key=${TMDB_API_KEY}&language=it-IT`,
          { next: { revalidate: 3600 } } // Cache per 1 ora
        );
        
        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          title = tmdbData.title || `Film ${numericTmdbId}`;
          original_title = tmdbData.original_title || '';
        } else {
          // Se fallisce, prova in inglese (en-US)
          tmdbRes = await fetch(
            `https://api.themoviedb.org/3/movie/${numericTmdbId}?api_key=${TMDB_API_KEY}&language=en-US`,
            { next: { revalidate: 3600 } }
          );
          
          if (tmdbRes.ok) {
            const tmdbData = await tmdbRes.json();
            title = tmdbData.title || `Film ${numericTmdbId}`;
            original_title = tmdbData.original_title || '';
          } else {
            console.warn(`[WARN] Film ${numericTmdbId} non trovato su TMDB, utilizzo valori predefiniti`);
            title = `Film ${numericTmdbId}`;
            original_title = `Film ${numericTmdbId}`;
          }
        }
      } catch (fetchError) {
        console.error("[ERROR] Errore fetch TMDB:", fetchError);
        // Continua con valori predefiniti
        title = `Film ${numericTmdbId}`;
        original_title = `Film ${numericTmdbId}`;
      }
      
      const movieInsert = await supabase
        .from("movies")
        .insert({ 
          tmdb_id: numericTmdbId,
          title: title,
          original_title: original_title,
          custom_overview: overview 
        })
        .select("id")
        .single();
      
      if (movieInsert.error) {
        console.error("[ERROR] Errore inserimento film:", movieInsert.error);
        return createErrorResponse("Errore inserimento film", 500);
      }
      
      movieId = movieInsert.data.id;
      
      // Siamo già inserito la sinossi nel record iniziale
      return Response.json({ success: true });
    } else {
      movieId = existingMovie.id;
      
      // Aggiorna la sinossi
      const { error } = await supabase
        .from("movies")
        .update({ custom_overview: overview })
        .eq("id", movieId);
      
      if (error) {
        console.error("[ERROR] Errore aggiornamento sinossi:", error);
        return createErrorResponse("Errore aggiornamento sinossi", 500);
      }
      
      return Response.json({ success: true });
    }
  } catch (error) {
    console.error("[ERROR] Errore generico:", error);
    return createErrorResponse("Errore elaborazione richiesta", 500);
  }
}