import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Verifica se l'utente è amministratore
 * @returns Promise<boolean> True se l'utente è admin, false altrimenti
 */
async function isUserAdmin() {
  // BYPASS TEMPORANEO: Restituisce sempre true per i test
  // TODO: Rimuovere questo bypass e ripristinare la verifica dell'autenticazione
  return true;
}

// API per aggiornare la sinossi personalizzata di un film
export async function POST(request: Request) {
  try {
    // Verifica se l'utente è admin
    const isAdmin = await isUserAdmin();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Autorizzazione negata: solo gli admin possono modificare le sinossi' },
        { status: 403 }
      );
    }
    
    const supabase = createClient();
    const { tmdb_id, synopsis, imdb_id } = await request.json();

    console.log("[DEBUG] API ricevuta richiesta con:", { 
      tmdb_id, 
      tmdb_id_type: typeof tmdb_id,
      synopsis_preview: synopsis?.slice(0, 30) + "...", 
      imdb_id 
    });

    // Verifica i parametri richiesti
    if (!tmdb_id || !synopsis) {
      return NextResponse.json(
        { error: 'Sono richiesti sia tmdb_id che synopsis' },
        { status: 400 }
      );
    }

    // Prima, verifica se il film esiste già nella tabella 'movies'
    let numericTmdbId;
    if (typeof tmdb_id === 'string') {
      numericTmdbId = parseInt(tmdb_id);
      if (isNaN(numericTmdbId)) {
        return NextResponse.json({ 
          error: 'ID TMDB non valido',
          detail: `L'ID ${tmdb_id} non è un numero valido`
        }, { status: 400 });
      }
    } else if (typeof tmdb_id === 'number') {
      numericTmdbId = tmdb_id;
    } else {
      return NextResponse.json({ 
        error: 'ID TMDB non valido',
        detail: `L'ID deve essere un numero o una stringa numerica`
      }, { status: 400 });
    }

    // Cerca il film usando l'ID numerico
    const { data: existingMovies, error: searchError } = await supabase
      .from('movies')
      .select('id, tmdb_id, title, tmdb_overview, custom_overview')
      .eq('tmdb_id', numericTmdbId);

    if (searchError) {
      console.error('Errore nella ricerca del film:', searchError);
      return NextResponse.json({ error: 'Errore nella ricerca del film' }, { status: 500 });
    }

    // Se il film non esiste, lo creiamo (modalità upsert)
    if (!existingMovies || existingMovies.length === 0) {
      console.log("[DEBUG] Film non trovato nella tabella movies, creando un nuovo record:", numericTmdbId);
      
      // Inserisci un nuovo record con più campi per soddisfare i vincoli della tabella
      const { data: newMovie, error: insertError } = await supabase
        .from('movies')
        .insert({
          tmdb_id: numericTmdbId,
          title: "Film " + numericTmdbId, // Titolo temporaneo
          custom_overview: synopsis,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          slug: `film-${numericTmdbId}`,
          tmdb_overview: "",  // Campo vuoto per sinossi originale
          runtime: 0,         // Durata zero (verrà aggiornata in seguito)
          release_date: null, // Data di uscita null
          popularity: 0,      // Popolarità zero
          vote_average: 0,    // Voto medio zero
          vote_count: 0,      // Conteggio voti zero
          status: "Released", // Stato predefinito
          language: "it",     // Lingua predefinita
          is_video: false     // Flag video predefinito
        })
        .select();
      
      if (insertError) {
        console.error('Errore nella creazione del film:', {
          error: insertError,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        return NextResponse.json({ 
          error: 'Errore nella creazione del film',
          detail: insertError.message,
          code: insertError.code,
          hint: insertError.hint
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Nuovo film creato con sinossi personalizzata',
        data: newMovie 
      });
    }

    // Film trovato, aggiorna la sinossi personalizzata
    const movieToUpdate = existingMovies[0];
    console.log("[DEBUG] Film trovato nella tabella movies:", { 
      id: movieToUpdate.id, 
      tmdb_id: movieToUpdate.tmdb_id, 
      title: movieToUpdate.title 
    });

    // Aggiorna la sinossi personalizzata
    const { data: updatedMovie, error: updateError } = await supabase
      .from('movies')
      .update({
        custom_overview: synopsis,
        updated_at: new Date().toISOString()
      })
      .eq('id', movieToUpdate.id)
      .select('id, tmdb_id, title, custom_overview');

    if (updateError) {
      console.error('Errore nell\'aggiornamento della sinossi:', updateError);
      return NextResponse.json({ error: 'Errore nell\'aggiornamento della sinossi' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sinossi aggiornata con successo',
      data: updatedMovie 
    });
    
  } catch (error) {
    console.error('Errore generico:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// API per ottenere la sinossi di un film
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get('tmdb_id');
    const imdb_id = searchParams.get('imdb_id');

    if (!tmdb_id && !imdb_id) {
      return NextResponse.json(
        { error: 'È richiesto almeno uno tra tmdb_id e imdb_id' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    let query = supabase.from('movies').select('id, tmdb_id, title, tmdb_overview, custom_overview, external_ids');
    
    // Applica il filtro in base all'ID fornito
    if (tmdb_id) {
      // Prova a convertire in numero se è una stringa
      const numericId = typeof tmdb_id === 'string' ? parseInt(tmdb_id) : tmdb_id;
      if (!isNaN(numericId)) {
        query = query.eq('tmdb_id', numericId);
      } else {
        return NextResponse.json({ error: 'ID TMDB non valido' }, { status: 400 });
      }
    } else if (imdb_id) {
      // Cerca film con l'ID IMDb nei dati esterni
      query = query.filter('external_ids->imdb_id', 'eq', imdb_id);
    }
    
    // Esegue la query
    const { data, error } = await query.single();

    if (error) {
      console.error('Errore nella ricerca del film:', error);
      return NextResponse.json({ error: 'Film non trovato' }, { status: 404 });
    }

    // Estrae l'ID IMDb dai dati esterni
    let movieImdbId = null;
    if (data.external_ids && data.external_ids.imdb_id) {
      movieImdbId = data.external_ids.imdb_id;
    }

    // Restituisce la sinossi personalizzata se disponibile, altrimenti la sinossi TMDB
    return NextResponse.json({
      id: data.id,
      tmdb_id: data.tmdb_id,
      title: data.title,
      overview: data.custom_overview || data.tmdb_overview,
      imdb_id: movieImdbId,
      has_custom_overview: !!data.custom_overview,
      source: 'movies'
    });
    
  } catch (error) {
    console.error('Errore generico:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
} 