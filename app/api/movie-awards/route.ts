import { createApiSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { fetchImdbAwards } from '@/utils/imdb-api';

/**
 * Endpoint GET per recuperare i premi di un film dal database
 * Se i premi non sono presenti, li recupera da IMDb e li salva
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get('tmdb_id');
    const imdb_id = searchParams.get('imdb_id');

    if (!tmdb_id) {
      return NextResponse.json({ error: 'È richiesto il parametro tmdb_id' }, { status: 400 });
    }

    const numericTmdbId = parseInt(tmdb_id);
    if (isNaN(numericTmdbId)) {
      return NextResponse.json({ error: 'ID TMDB non valido' }, { status: 400 });
    }

    // Crea client Supabase
    const supabaseAdmin = createApiSupabaseClient({ adminAccess: true });
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Errore nella creazione del client Supabase' }, { status: 500 });
    }

    // Cerca il film nel database
    const { data: movieData, error: queryError } = await supabaseAdmin
      .from('movies')
      .select('id, tmdb_id, awards')
      .eq('tmdb_id', numericTmdbId)
      .maybeSingle();

    if (queryError) {
      console.error('[API] Errore query Supabase:', queryError);
      // Non bloccare l'esecuzione, continua cercando i dati da TMDB
      console.log('[API] Continuando con il recupero da TMDB nonostante l\'errore database...');
    }

    // Se il film ha già awards e non è una richiesta di aggiornamento forzato, li restituiamo
    const forceUpdate = searchParams.get('force') === 'true';
    if (movieData?.awards && !forceUpdate) {
      console.log('[API] Premi già presenti nel database, li restituisco');
      return NextResponse.json({ 
        awards: movieData.awards,
        source: 'database'
      });
    }

    // Utilizza l'imdb_id fornito o recuperalo da TMDB
    const imdbIdToUse = imdb_id || await getImdbIdFromTmdb(numericTmdbId);
    
    if (!imdbIdToUse) {
      return NextResponse.json({ 
        error: 'IMDb ID non disponibile',
        message: 'Impossibile recuperare IMDb ID'
      }, { status: 404 });
    }

    // Recupera i premi da IMDb
    const awardsData = await fetchImdbAwards(imdbIdToUse);
    if (!awardsData) {
      return NextResponse.json({ 
        error: 'Nessun premio trovato',
        message: 'IMDb non ha restituito dati sui premi'
      }, { status: 404 });
    }

    // Prepara i dati dei premi per il salvataggio
    const awards = {
      awardsData,
      imdb_id: imdbIdToUse,
      retrieved_at: new Date().toISOString()
    };

    // Se il film esiste nel database e non c'è stato errore nella query, aggiorniamo i suoi premi
    if (movieData && !queryError) {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('movies')
          .update({ 
            awards,
            updated_at: new Date().toISOString()
          })
          .eq('id', movieData.id);

        if (updateError) {
          console.error('[API] Errore aggiornamento premi:', updateError);
          // Restituisci comunque i premi anche se il salvataggio fallisce
          return NextResponse.json({ 
            awards,
            source: 'imdb',
            saveStatus: 'error',
            error: updateError.message
          });
        }

        return NextResponse.json({ 
          awards,
          source: 'imdb',
          saveStatus: 'success'
        });
      } catch (updateCatchError) {
        console.error('[API] Errore try/catch durante aggiornamento:', updateCatchError);
        return NextResponse.json({ 
          awards,
          source: 'imdb',
          saveStatus: 'error',
          error: updateCatchError instanceof Error ? updateCatchError.message : 'Errore sconosciuto'
        });
      }
    } 
    // Se il film non esiste, restituiamo solo i premi senza salvarli
    else {
      return NextResponse.json({ 
        awards,
        source: 'imdb',
        saveStatus: 'not_saved',
        message: 'Film non trovato nel database o errore nel recupero, premi non salvati'
      });
    }
  } catch (error) {
    console.error('[API] Errore generico:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

// Funzione helper per recuperare l'IMDb ID da TMDB
async function getImdbIdFromTmdb(tmdbId: number): Promise<string | null> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    console.error('[API] TMDB_API_KEY non definita');
    return null;
  }

  try {
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`,
      { next: { revalidate: 3600 } } // Cache per 1 ora
    );

    if (!tmdbResponse.ok) {
      throw new Error(`Errore TMDB: ${tmdbResponse.status}`);
    }

    const tmdbData = await tmdbResponse.json();
    return tmdbData.external_ids?.imdb_id || null;
  } catch (error) {
    console.error('[API] Errore recupero IMDb ID da TMDB:', error);
    return null;
  }
} 