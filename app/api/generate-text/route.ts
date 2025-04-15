import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/openai'

/**
 * API per generare testo utilizzando OpenAI
 * Utilizza il sistema centralizzato delle chiavi API
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Inizio richiesta /api/generate-text");
    
    // Estrai i parametri dalla richiesta
    const { prompt, model, maxTokens, temperature, tmdb_id } = await request.json()
    
    console.log("[DEBUG] Parametri richiesta:", { 
      promptLength: prompt?.length, 
      model, 
      maxTokens, 
      temperature, 
      tmdb_id 
    });
    
    // Se è fornito un tmdb_id, recupera i metadati da TMDB
    let finalPrompt = prompt;
    
    if (tmdb_id) {
      try {
        console.log("[DEBUG] Tentativo recupero metadati TMDB per ID:", tmdb_id);
        
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        if (!TMDB_API_KEY) {
          console.error("[ERROR] TMDB_API_KEY non configurata nell'ambiente");
          throw new Error('TMDB_API_KEY non configurata');
        }
        
        console.log("[DEBUG] Richiesta metadati in italiano per TMDB ID:", tmdb_id);
        
        // Prova a recuperare i metadati in italiano
        let tmdbRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=it-IT&append_to_response=credits`,
          { next: { revalidate: 3600 } }
        );
        
        if (!tmdbRes.ok) {
          console.log("[DEBUG] Fallito recupero in italiano, provo in inglese per TMDB ID:", tmdb_id);
          
          // Se fallisce, prova in inglese
          tmdbRes = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`,
            { next: { revalidate: 3600 } }
          );
          
          if (!tmdbRes.ok) {
            const responseText = await tmdbRes.text();
            console.error("[ERROR] Fallito recupero da TMDB:", tmdbRes.status, responseText);
            throw new Error(`Errore API TMDB: ${tmdbRes.status}`);
          }
        }
        
        const movieData = await tmdbRes.json();
        console.log("[DEBUG] Dati TMDB recuperati:", { 
          title: movieData.title, 
          release_date: movieData.release_date, 
          has_credits: !!movieData.credits 
        });
        
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
        
        console.log("[DEBUG] Prompt arricchito con dati TMDB:", { 
          title: movieData.title, 
          year: releaseYear, 
          director,
          promptLength: finalPrompt.length
        });
      } catch (tmdbError) {
        console.error('[ERROR] Errore recupero dati TMDB:', tmdbError);
        console.log("[DEBUG] Continuo con il prompt originale:", { promptLength: prompt?.length });
        // Continua con il prompt originale se c'è un errore
      }
    }
    
    // Verifica che il prompt sia presente
    if (!finalPrompt) {
      console.error("[ERROR] Prompt mancante nella richiesta");
      return NextResponse.json(
        { error: 'Il parametro prompt è obbligatorio' },
        { status: 400 }
      )
    }
    
    console.log("[DEBUG] Chiamata a generateText con prompt di lunghezza:", finalPrompt.length);
    
    // Utilizza il servizio OpenAI per generare il testo
    try {
      const result = await generateText({
        prompt: finalPrompt,
        model,
        maxTokens,
        temperature
      })
      
      console.log("[DEBUG] Generazione testo completata:", { 
        textLength: result.text.length,
        usage: result.usage
      });
      
      // Restituisci il risultato
      return NextResponse.json({
        text: result.text,
        usage: result.usage
      })
    } catch (openaiError) {
      console.error("[ERROR] Errore nella generazione OpenAI:", openaiError);
      throw openaiError; // Lo gestiamo nel catch esterno
    }
  } catch (error) {
    console.error('[ERROR] Errore generale nella generazione di testo:', error);
    
    // Elabora e restituisci l'errore
    const status = error instanceof Error && 'status' in error ? (error as any).status : 500
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    
    // Restituisci un messaggio di errore dettagliato
    return NextResponse.json(
      { 
        error: message,
        details: error instanceof Error ? {
          name: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } : 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      },
      { status }
    )
  }
}