import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/openai'

/**
 * API per generare testo utilizzando OpenAI
 * Utilizza il sistema centralizzato delle chiavi API
 */
export async function POST(request: NextRequest) {
  try {
    // Estrai i parametri dalla richiesta
    const { prompt, model, maxTokens, temperature, tmdb_id } = await request.json()
    
    // Se è fornito un tmdb_id, recupera i metadati da TMDB
    let finalPrompt = prompt;
    
    if (tmdb_id) {
      try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        if (!TMDB_API_KEY) {
          throw new Error('TMDB_API_KEY non configurata');
        }
        
        // Prova a recuperare i metadati in italiano
        let tmdbRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=it-IT&append_to_response=credits`,
          { next: { revalidate: 3600 } }
        );
        
        if (!tmdbRes.ok) {
          // Se fallisce, prova in inglese
          tmdbRes = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`,
            { next: { revalidate: 3600 } }
          );
          
          if (!tmdbRes.ok) {
            throw new Error(`Errore API TMDB: ${tmdbRes.status}`);
          }
        }
        
        const movieData = await tmdbRes.json();
        
        // Trova il regista nei credits
        let director = "regista sconosciuto";
        if (movieData.credits && movieData.credits.crew) {
          const directorData = movieData.credits.crew.find(
            (person: any) => person.job === 'Director'
          );
          if (directorData) {
            director = directorData.name;
          }
        }
        
        // Estrai anno di uscita
        const releaseYear = movieData.release_date ? movieData.release_date.split('-')[0] : "anno sconosciuto";
        
        // Crea un prompt più informativo con i dati TMDB
        finalPrompt = `Scrivi una sinossi breve, precisa e oggettiva (max 3 frasi) per il film intitolato '${movieData.title}', uscito nel ${releaseYear}, diretto da ${director}. Se non hai informazioni certe su questo film, rispondi chiaramente che non hai dati e non inventare nulla.`;
        
        console.log("[API] Prompt arricchito con dati TMDB:", { 
          title: movieData.title, 
          year: releaseYear, 
          director 
        });
      } catch (tmdbError) {
        console.error('[API] Errore recupero dati TMDB:', tmdbError);
        // Continua con il prompt originale se c'è un errore
      }
    }
    
    // Verifica che il prompt sia presente
    if (!finalPrompt) {
      return NextResponse.json(
        { error: 'Il parametro prompt è obbligatorio' },
        { status: 400 }
      )
    }
    
    // Utilizza il servizio OpenAI per generare il testo
    const result = await generateText({
      prompt: finalPrompt,
      model,
      maxTokens,
      temperature
    })
    
    // Restituisci il risultato
    return NextResponse.json({
      text: result.text,
      usage: result.usage
    })
  } catch (error) {
    console.error('Errore nella generazione di testo:', error)
    
    // Elabora e restituisci l'errore
    const status = error instanceof Error && 'status' in error ? (error as any).status : 500
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}