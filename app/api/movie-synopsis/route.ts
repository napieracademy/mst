import { createApiSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdb_id = searchParams.get('tmdb_id');

    if (!tmdb_id) {
      return NextResponse.json(
        { error: 'È richiesto il parametro tmdb_id' },
        { status: 400 }
      );
    }

    const numericTmdbId = parseInt(tmdb_id);
    if (isNaN(numericTmdbId)) {
      return NextResponse.json({ error: 'ID TMDB non valido' }, { status: 400 });
    }

    const supabaseAdmin = createApiSupabaseClient({ adminAccess: true });
    const { data, error } = await supabaseAdmin
      .from('movies')
      .select('tmdb_id, custom_overview')
      .eq('tmdb_id', numericTmdbId)
      .single();

    // Se esiste il record e contiene custom_overview, restituisci quello
    if (data && data.custom_overview) {
      return NextResponse.json({
        tmdb_id: data.tmdb_id,
        overview: data.custom_overview
      });
    }

    // Altrimenti, recupera l'overview dalle API di TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB_API_KEY non definita' }, { status: 500 });
    }

    // Prova prima in italiano (it-IT)
    let tmdbRes = await fetch(
      `https://api.themoviedb.org/3/movie/${numericTmdbId}?api_key=${TMDB_API_KEY}&language=it-IT`
    );
    if (!tmdbRes.ok) {
      // Se fallisce, prova in inglese (en-US)
      tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/${numericTmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
      );
      if (!tmdbRes.ok) {
        const errText = await tmdbRes.text();
        return NextResponse.json({ error: 'Errore nel recupero dei dati TMDB', details: errText }, { status: 500 });
      }
    }
    const tmdbData = await tmdbRes.json();
    // Assumiamo che l'overview venga restituita nel campo "overview" dell'API TMDB
    return NextResponse.json({
      tmdb_id: numericTmdbId,
      overview: tmdbData.overview
    });

  } catch (error) {
    console.error("Errore generico GET:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Estrai i dati dalla richiesta
    const { tmdb_id, synopsis } = await request.json();

    if (!tmdb_id) {
      return NextResponse.json(
        { error: 'È richiesto il parametro tmdb_id' },
        { status: 400 }
      );
    }

    if (!synopsis) {
      return NextResponse.json(
        { error: 'La sinossi non può essere vuota' },
        { status: 400 }
      );
    }

    // Converte a numero se necessario
    const numericTmdbId = typeof tmdb_id === 'string' ? parseInt(tmdb_id) : tmdb_id;
    
    if (isNaN(numericTmdbId)) {
      return NextResponse.json({ error: 'ID TMDB non valido' }, { status: 400 });
    }

    const supabaseAdmin = createApiSupabaseClient({ adminAccess: true });
    
    // Verifica se il record esiste
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('movies')
      .select('tmdb_id')
      .eq('tmdb_id', numericTmdbId)
      .maybeSingle();

    if (checkError) {
      console.error('Errore nella verifica del record:', checkError);
      return NextResponse.json(
        { error: 'Errore nella verifica del record', details: checkError.message },
        { status: 500 }
      );
    }

    let updateResult;

    if (existingData) {
      // Aggiorna il record esistente
      updateResult = await supabaseAdmin
        .from('movies')
        .update({ custom_overview: synopsis })
        .eq('tmdb_id', numericTmdbId)
        .select('tmdb_id, custom_overview');
    } else {
      // Crea un nuovo record
      updateResult = await supabaseAdmin
        .from('movies')
        .insert({ 
          tmdb_id: numericTmdbId, 
          title: `Film ID ${numericTmdbId}`,  // Titolo temporaneo
          custom_overview: synopsis,
          slug: `film-${numericTmdbId}`  // Slug temporaneo
        })
        .select('tmdb_id, custom_overview');
    }

    const { data: updatedData, error: updateError } = updateResult;

    if (updateError) {
      console.error('Errore nell\'aggiornamento della sinossi:', updateError);
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento della sinossi', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sinossi aggiornata con successo',
      data: updatedData
    });

  } catch (error) {
    console.error("Errore generico POST:", error);
    return NextResponse.json({ 
      error: 'Errore interno del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}