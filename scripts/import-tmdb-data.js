const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Carica variabili d'ambiente
dotenv.config();

// Debug dell'API key
console.log('TMDB API Key configurata:', process.env.TMDB_API_KEY ? 'Sì ✓' : 'No ✗');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbynhfiqlacmlwpjcxmp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieW5oZmlxbGFjbWx3cGpjeG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTI3NzcsImV4cCI6MjA1NTc2ODc3N30.gFiM3yc82ID61fVPAt6fpFvOoHheAS7zS5Ns3iMsQ7I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurazione TMDB API
const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.error('❌ ERRORE: API Key TMDB non trovata. Assicurati che il file .env contenga TMDB_API_KEY.');
  process.exit(1);
}

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Funzione helper per generare slug
function generateSlug(title, year, id) {
  // Rimuovi caratteri speciali, converti in minuscolo
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Rimuovi accenti
    .replace(/[^\w\s-]/g, '') // Rimuovi caratteri speciali
    .replace(/\s+/g, '-') // Sostituisci spazi con trattini
    .replace(/-+/g, '-') // Rimuovi trattini multipli
    .trim();
    
  // Aggiungi anno e ID TMDB
  return `${slug}-${year}-${id}`;
}

// Ottieni data in formato YYYY
function getYear(dateString) {
  if (!dateString) return 'unknown';
  return new Date(dateString).getFullYear();
}

// Recupera film popolari da TMDB
async function fetchPopularMovies(page = 1, limit = 10) {
  console.log(`Recupero film popolari (pagina ${page})...`);
  
  try {
    const response = await fetch(
      `${TMDB_API_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=it-IT&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Errore API TMDB: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.slice(0, limit);
  } catch (error) {
    console.error(`Errore nel recupero dei film popolari:`, error.message);
    return [];
  }
}

// Recupera serie TV popolari da TMDB
async function fetchPopularTVShows(page = 1, limit = 10) {
  console.log(`Recupero serie TV popolari (pagina ${page})...`);
  
  try {
    const response = await fetch(
      `${TMDB_API_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=it-IT&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Errore API TMDB: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.slice(0, limit);
  } catch (error) {
    console.error(`Errore nel recupero delle serie TV popolari:`, error.message);
    return [];
  }
}

// Recupera dettagli di un film
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(
      `${TMDB_API_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=it-IT&append_to_response=credits`
    );
    
    if (!response.ok) {
      throw new Error(`Errore API TMDB: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Errore nel recupero dei dettagli del film ${movieId}:`, error.message);
    return null;
  }
}

// Recupera dettagli di una serie TV
async function fetchTVShowDetails(tvId) {
  try {
    const response = await fetch(
      `${TMDB_API_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=it-IT&append_to_response=credits`
    );
    
    if (!response.ok) {
      throw new Error(`Errore API TMDB: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Errore nel recupero dei dettagli della serie TV ${tvId}:`, error.message);
    return null;
  }
}

// Recupera dettagli di una persona
async function fetchPersonDetails(personId) {
  try {
    const response = await fetch(
      `${TMDB_API_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=it-IT`
    );
    
    if (!response.ok) {
      throw new Error(`Errore API TMDB: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Errore nel recupero dei dettagli della persona ${personId}:`, error.message);
    return null;
  }
}

// Inserisci film nel database
async function insertMovies(movies) {
  console.log(`Inserimento di ${movies.length} film nel database...`);
  
  for (const movie of movies) {
    try {
      // Ottieni dettagli completi del film
      const details = await fetchMovieDetails(movie.id);
      if (!details) continue;
      
      const year = getYear(details.release_date);
      const slug = generateSlug(details.title || details.original_title, year, details.id);
      
      const { data, error } = await supabase
        .from('movies')
        .upsert({
          tmdb_id: details.id,
          slug: slug,
          title: details.title || details.original_title,
          original_title: details.original_title,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          release_date: details.release_date,
          tmdb_overview: details.overview,
          custom_overview: '',
          popularity: details.popularity
        }, { onConflict: 'tmdb_id' })
        .select();
      
      if (error) {
        console.error(`Errore nell'inserimento del film ${details.title}:`, error.message);
      } else {
        console.log(`✅ Film inserito: ${details.title}`);
        
        // Inserisci anche le persone associate (registi e attori principali)
        if (details.credits && details.credits.crew) {
          const directors = details.credits.crew.filter(person => person.job === 'Director');
          await insertPersons(directors, 'director');
        }
        
        if (details.credits && details.credits.cast) {
          const mainCast = details.credits.cast.slice(0, 5); // Primi 5 attori
          await insertPersons(mainCast, 'actor');
        }
      }
      
      // Piccola pausa tra le richieste
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Errore nell'elaborazione del film:`, error.message);
    }
  }
}

// Inserisci serie TV nel database
async function insertTVShows(tvShows) {
  console.log(`Inserimento di ${tvShows.length} serie TV nel database...`);
  
  for (const tvShow of tvShows) {
    try {
      // Ottieni dettagli completi della serie TV
      const details = await fetchTVShowDetails(tvShow.id);
      if (!details) continue;
      
      const year = getYear(details.first_air_date);
      const slug = generateSlug(details.name || details.original_name, year, details.id);
      
      const { data, error } = await supabase
        .from('tv_shows')
        .upsert({
          tmdb_id: details.id,
          slug: slug,
          name: details.name || details.original_name,
          original_name: details.original_name,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          first_air_date: details.first_air_date,
          tmdb_overview: details.overview,
          custom_overview: '',
          number_of_seasons: details.number_of_seasons || 0,
          popularity: details.popularity
        }, { onConflict: 'tmdb_id' })
        .select();
      
      if (error) {
        console.error(`Errore nell'inserimento della serie TV ${details.name}:`, error.message);
      } else {
        console.log(`✅ Serie TV inserita: ${details.name}`);
        
        // Inserisci anche le persone associate (creatori e attori principali)
        if (details.created_by && details.created_by.length > 0) {
          await insertPersons(details.created_by, 'director');
        }
        
        if (details.credits && details.credits.cast) {
          const mainCast = details.credits.cast.slice(0, 5); // Primi 5 attori
          await insertPersons(mainCast, 'actor');
        }
      }
      
      // Piccola pausa tra le richieste
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Errore nell'elaborazione della serie TV:`, error.message);
    }
  }
}

// Inserisci persone nel database
async function insertPersons(persons, type = 'both') {
  for (const person of persons) {
    try {
      // Verifica se la persona esiste già
      const { data: existingPerson } = await supabase
        .from('persons')
        .select('*')
        .eq('tmdb_id', person.id)
        .maybeSingle();
      
      let personType = type;
      
      // Se la persona esiste già, aggiorna solo il tipo se necessario
      if (existingPerson) {
        if (existingPerson.person_type !== 'both') {
          if (existingPerson.person_type !== type) {
            personType = 'both'; // Se era 'actor' e ora è 'director' o viceversa, diventa 'both'
            
            await supabase
              .from('persons')
              .update({ person_type: personType })
              .eq('tmdb_id', person.id);
          }
        }
        continue; // Salta il resto del processo di inserimento
      }
      
      // Se la persona non esiste, ottieni i dettagli completi
      const details = await fetchPersonDetails(person.id);
      if (!details) continue;
      
      const slug = generateSlug(details.name, '', details.id);
      
      const { error } = await supabase
        .from('persons')
        .insert({
          tmdb_id: details.id,
          slug: slug,
          name: details.name,
          person_type: personType,
          profile_path: details.profile_path,
          tmdb_biography: details.biography,
          custom_biography: '',
          birthday: details.birthday,
          place_of_birth: details.place_of_birth,
          known_for_department: details.known_for_department,
          popularity: details.popularity
        });
      
      if (error) {
        console.error(`Errore nell'inserimento della persona ${details.name}:`, error.message);
      } else {
        console.log(`✅ Persona inserita: ${details.name} (${personType})`);
      }
      
      // Piccola pausa tra le richieste
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Errore nell'elaborazione della persona:`, error.message);
    }
  }
}

// Funzione principale
async function importTMDBData() {
  console.log('🔍 Inizializzazione importazione dati TMDB...');
  
  try {
    // Recupera e inserisci film popolari
    const popularMovies = await fetchPopularMovies(1, 15);
    if (popularMovies.length > 0) {
      await insertMovies(popularMovies);
    }
    
    // Recupera e inserisci serie TV popolari
    const popularTVShows = await fetchPopularTVShows(1, 15);
    if (popularTVShows.length > 0) {
      await insertTVShows(popularTVShows);
    }
    
    console.log('🎉 Importazione dati TMDB completata con successo!');
    
    // Verifica dati importati
    const { data: moviesCount } = await supabase
      .from('movies')
      .select('count');
      
    const { data: tvShowsCount } = await supabase
      .from('tv_shows')
      .select('count');
      
    const { data: personsCount } = await supabase
      .from('persons')
      .select('count');
      
    console.log('📊 Statistiche database:');
    console.log(`- Film: ${moviesCount ? moviesCount[0].count : 0}`);
    console.log(`- Serie TV: ${tvShowsCount ? tvShowsCount[0].count : 0}`);
    console.log(`- Persone: ${personsCount ? personsCount[0].count : 0}`);
    
  } catch (error) {
    console.error('❌ Errore durante l\'importazione dei dati TMDB:', error.message);
  }
}

// Esegui la funzione
importTMDBData()
  .then(() => {
    console.log('Importazione completata.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Errore fatale:', error);
    process.exit(1);
  }); 