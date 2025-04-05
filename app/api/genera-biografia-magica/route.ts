import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createApiSupabaseClient } from '@/lib/supabase-server';
import { generateSlug } from '@/lib/utils';

// Inizializza il client OpenAI con la chiave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Estrai tutti i metadati disponibili
    const { 
      name,                   // Nome dell'attore/regista/film/serie
      id,                     // ID TMDB
      contentType,            // "actor", "director", "movie", "serie"
      slug,                   // Slug della pagina, se disponibile
      
      // Metadati comuni
      currentContent,         // Biografia o trama attuale (se presente)
      
      // Metadati per attori
      birthDate,              // Data di nascita dell'attore
      birthPlace,             // Luogo di nascita
      deathDate,              // Data di morte (se applicabile)
      popularity,             // Popolarità su TMDB
      gender,                 // Genere (1=Donna, 2=Uomo)
      department,             // Dipartimento principale (Acting, Directing, etc)
      imdbId,                 // ID IMDB per riferimenti esterni
      profilePath,            // Path immagine profilo
      
      // Metadati per attori e registi
      knownFor,               // Film/serie per cui è conosciuto (array o stringa)
      
      // Metadati per film e serie
      releaseDate,            // Data di uscita del film o prima messa in onda
      directors,              // Registi del film/serie
      cast,                   // Cast principale
      genres,                 // Generi
      runtime,                // Durata
      voteAverage,            // Voto medio
      
      // Metadati specifici per serie
      numberOfSeasons,        // Numero di stagioni
      numberOfEpisodes,       // Numero di episodi
      networks,               // Reti/piattaforme di distribuzione
      creators                // Creatori della serie
    } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Nome richiesto' }, { status: 400 });
    }
    
    if (!contentType || !['actor', 'director', 'movie', 'serie'].includes(contentType)) {
      return NextResponse.json({ error: 'Tipo di contenuto non valido o mancante' }, { status: 400 });
    }
    
    console.log(`Generazione ${contentType === 'actor' ? 'biografia attore' : contentType === 'director' ? 'biografia regista' : 'trama'} magica per:`, name, '(ID:', id, ')');
    
    // Formatta array o stringhe in formato leggibile
    const formatList = (list: any): string => {
      if (Array.isArray(list) && list.length > 0) {
        return list.join(', ');
      } else if (typeof list === 'string' && list) {
        return list;
      }
      return '';
    };
    
    // Crea prompt in base al tipo di contenuto
    let prompt = '';
    let systemPrompt = '';
    
    if (contentType === 'actor') {
      // Prompt per attori
      systemPrompt = "Sei un esperto di cinema che scrive biografie concise e accurate in italiano di attori e attrici.";
      prompt = `Genera una breve biografia in italiano dell'attore/attrice ${name}${birthDate ? `, nato/a il ${birthDate}` : ''}${birthPlace ? ` a ${birthPlace}` : ''}${deathDate ? `, morto/a il ${deathDate}` : ''}.

INFORMAZIONI AGGIUNTIVE SULL'ATTORE:
${id ? `- ID TMDB: ${id}` : ''}
${imdbId ? `- ID IMDB: ${imdbId}` : ''}
${department ? `- Dipartimento principale: ${department}` : ''}
${gender ? `- Genere: ${gender === 1 ? 'Donna' : gender === 2 ? 'Uomo' : 'Non specificato'}` : ''}
${formatList(knownFor) ? `- Conosciuto/a per: ${formatList(knownFor)}` : ''}
${popularity ? `- Indice di popolarità: ${popularity}` : ''}

La biografia deve essere concisa (massimo 3-4 frasi) e includere:
- I film o serie TV più importanti della carriera
- Eventuali premi vinti o nomination importanti
- Curiosità o fatti interessanti sulla carriera dell'attore/attrice

Scrivi in uno stile professionale ma coinvolgente. Non inventare informazioni se non sei sicuro.

${currentContent ? 'BIOGRAFIA ATTUALE (da migliorare):\n' + currentContent : ''}`;
    } 
    else if (contentType === 'director') {
      // Prompt per registi
      systemPrompt = "Sei un esperto di cinema che scrive biografie concise e accurate in italiano di registi.";
      prompt = `Genera una breve biografia in italiano del regista ${name}${birthDate ? `, nato il ${birthDate}` : ''}${birthPlace ? ` a ${birthPlace}` : ''}${deathDate ? `, morto il ${deathDate}` : ''}.

INFORMAZIONI AGGIUNTIVE SUL REGISTA:
${id ? `- ID TMDB: ${id}` : ''}
${imdbId ? `- ID IMDB: ${imdbId}` : ''}
${formatList(knownFor) ? `- Film noti diretti: ${formatList(knownFor)}` : ''}
${popularity ? `- Indice di popolarità: ${popularity}` : ''}

La biografia deve essere concisa (massimo 3-4 frasi) e includere:
- I film più significativi della sua carriera
- Premi o riconoscimenti importanti
- Lo stile distintivo di regia o temi ricorrenti
- Collaborazioni notevoli con attori/sceneggiatori

Scrivi in uno stile professionale ma coinvolgente. Non inventare informazioni se non sei sicuro.

${currentContent ? 'BIOGRAFIA ATTUALE (da migliorare):\n' + currentContent : ''}`;
    } 
    else if (contentType === 'movie') {
      // Prompt per film
      systemPrompt = "Sei un esperto di cinema che scrive trame concise e accattivanti di film in italiano.";
      prompt = `Genera una sinossi concisa in italiano del film "${name}"${releaseDate ? ` (${releaseDate.substring(0, 4)})` : ''}.

INFORMAZIONI AGGIUNTIVE SUL FILM:
${id ? `- ID TMDB: ${id}` : ''}
${formatList(directors) ? `- Regista/i: ${formatList(directors)}` : ''}
${formatList(cast) ? `- Cast principale: ${formatList(cast)}` : ''}
${formatList(genres) ? `- Generi: ${formatList(genres)}` : ''}
${runtime ? `- Durata: ${runtime} minuti` : ''}
${voteAverage ? `- Valutazione media: ${voteAverage}/10` : ''}

La sinossi deve:
- Descrivere la trama principale in modo conciso (3-5 frasi)
- Evitare spoiler importanti
- Catturare l'atmosfera e i temi principali del film
- Non rivelare il finale

Scrivi in uno stile accattivante che invogli a vedere il film.

${currentContent ? 'TRAMA ATTUALE (da migliorare):\n' + currentContent : ''}`;
    } 
    else if (contentType === 'serie') {
      // Prompt per serie TV
      systemPrompt = "Sei un esperto di televisione che scrive trame concise e accattivanti di serie TV in italiano.";
      prompt = `Genera una sinossi concisa in italiano della serie TV "${name}"${releaseDate ? ` (${releaseDate.substring(0, 4)})` : ''}.

INFORMAZIONI AGGIUNTIVE SULLA SERIE:
${id ? `- ID TMDB: ${id}` : ''}
${formatList(creators) ? `- Creatore/i: ${formatList(creators)}` : ''}
${formatList(cast) ? `- Cast principale: ${formatList(cast)}` : ''}
${formatList(genres) ? `- Generi: ${formatList(genres)}` : ''}
${numberOfSeasons ? `- Stagioni: ${numberOfSeasons}` : ''}
${numberOfEpisodes ? `- Episodi totali: ${numberOfEpisodes}` : ''}
${formatList(networks) ? `- Network/Piattaforme: ${formatList(networks)}` : ''}
${voteAverage ? `- Valutazione media: ${voteAverage}/10` : ''}

La sinossi deve:
- Descrivere la premessa principale della serie in modo conciso (3-5 frasi)
- Menzionare i personaggi principali e le loro dinamiche
- Catturare l'atmosfera e i temi principali
- Non rivelare colpi di scena importanti

Scrivi in uno stile accattivante che invogli a guardare la serie.

${currentContent ? 'TRAMA ATTUALE (da migliorare):\n' + currentContent : ''}`;
    }
    
    // Chiamata a OpenAI per generare il contenuto
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });
    
    // Estrai il testo generato
    const generatedContent = completion.choices[0].message.content;
    
    console.log('Contenuto magico generato con successo');
    
    // Crea un excerpt (testo breve) dal contenuto generato
    const excerpt = generatedContent && generatedContent.length > 160 
      ? generatedContent.substring(0, 160) + '...' 
      : generatedContent;
    
    // Inizializza il client Supabase
    const supabase = createApiSupabaseClient();
    if (!supabase) {
      throw new Error('Impossibile inizializzare il client Supabase');
    }

    // Genera lo slug se non fornito
    const pageSlug = slug || (id && name ? generateSlug(name, releaseDate, id.toString()) : null);
    let savedInDatabase = false;
    
    if (!pageSlug) {
      console.warn('Slug non disponibile, il contenuto non verrà salvato nel database');
    } else {
      try {
        console.log(`Salvataggio contenuto nel database per: ${name} (slug: ${pageSlug})`);
        
        // Salva il contenuto nel database in base al tipo
        if (contentType === 'actor' || contentType === 'director') {
          // Persona (attore o regista)
          const personType = contentType === 'actor' ? 'actor' : 'director';
          
          try {
            // 1. Prima inserisci o aggiorna l'entità principale
            const { data: entityData, error: entityError } = await supabase
              .from('entities')
              .upsert({
                tmdb_id: id || 0,
                entity_type: 'person',
                slug: pageSlug,
                title: name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_visited_at: new Date().toISOString(),
                visit_count: 1
              }, { 
                onConflict: 'slug',
                ignoreDuplicates: false
              })
              .select('id')
              .single();
              
            if (entityError) {
              console.error("Errore nel salvataggio dell'entità:", entityError);
              throw entityError;
            }
            
            if (!entityData || !entityData.id) {
              throw new Error("Nessun ID entità restituito dopo l'inserimento");
            }
            
            // 2. Ora inserisci o aggiorna i dettagli della persona
            const birthDateObj = birthDate ? new Date(birthDate) : null;
            
            const { error: detailsError } = await supabase
              .from('person_details')
              .upsert({
                entity_id: entityData.id,
                person_type: personType,
                biography: generatedContent,
                excerpt: excerpt,
                birth_date: birthDateObj ? birthDateObj.toISOString() : null,
                birth_place: birthPlace || null,
                profile_path: profilePath || null
              }, {
                onConflict: 'entity_id',
                ignoreDuplicates: false
              });
            
            if (detailsError) {
              console.error("Errore nel salvataggio dei dettagli:", detailsError);
              throw detailsError;
            }
            
            console.log('Biografia salvata con successo:', { id: entityData.id, slug: pageSlug });
            savedInDatabase = true;
            
          } catch (error) {
            console.error("Errore durante l'upsert:", error);
            // Continuiamo l'esecuzione anche se il salvataggio fallisce
          }
        } else {
          // Media (film o serie)
          const mediaType = contentType === 'movie' ? 'movie' : 'tv';
          const entityType = contentType === 'movie' ? 'film' : 'serie';
          
          try {
            // 1. Prima inserisci o aggiorna l'entità principale
            const { data: entityData, error: entityError } = await supabase
              .from('entities')
              .upsert({
                tmdb_id: id || 0,
                entity_type: entityType,
                slug: pageSlug,
                title: name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_visited_at: new Date().toISOString(),
                visit_count: 1
              }, { 
                onConflict: 'slug',
                ignoreDuplicates: false
              })
              .select('id')
              .single();
              
            if (entityError) {
              console.error("Errore nel salvataggio dell'entità:", entityError);
              throw entityError;
            }
            
            if (!entityData || !entityData.id) {
              throw new Error("Nessun ID entità restituito dopo l'inserimento");
            }
            
            // 2. Ora inserisci o aggiorna i dettagli del media
            const releaseDateObj = releaseDate ? new Date(releaseDate) : null;
            const genresArray = formatList(genres).split(',').map(g => g.trim()).filter(Boolean);
            const genresJson = genresArray.length > 0 ? JSON.stringify(genresArray) : null;
            
            const { error: detailsError } = await supabase
              .from('media_details')
              .upsert({
                entity_id: entityData.id,
                media_type: mediaType,
                overview: generatedContent,
                release_date: releaseDateObj ? releaseDateObj.toISOString() : null,
                poster_path: profilePath || null,
                backdrop_path: null,
                runtime: runtime || null,
                genres: genresJson
              }, {
                onConflict: 'entity_id',
                ignoreDuplicates: false
              });
            
            if (detailsError) {
              console.error("Errore nel salvataggio dei dettagli:", detailsError);
              throw detailsError;
            }
            
            console.log('Trama salvata con successo:', { id: entityData.id, slug: pageSlug });
            savedInDatabase = true;
            
          } catch (error) {
            console.error("Errore durante l'upsert:", error);
            // Continuiamo l'esecuzione anche se il salvataggio fallisce
          }
        }
      } catch (dbError) {
        console.error('Errore durante l\'interazione con il database:', dbError);
        // Continuiamo l'esecuzione anche se il salvataggio fallisce
      }
    }
    
    // Restituisci il contenuto generato con nome della proprietà appropriato
    const responseKey = contentType === 'actor' || contentType === 'director' ? 'biography' : 'plot';
    
    return NextResponse.json({
      [responseKey]: generatedContent,
      excerpt: excerpt,
      saved: savedInDatabase,
      success: true
    });
  } catch (error: any) {
    console.error('Errore nella generazione del contenuto magico:', error);
    return NextResponse.json({ 
      error: 'Errore nella generazione del contenuto',
      details: error.message 
    }, { status: 500 });
  }
} 