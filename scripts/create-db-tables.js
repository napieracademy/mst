const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://gbynhfiqlacmlwpjcxmp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieW5oZmlxbGFjbWx3cGpjeG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTI3NzcsImV4cCI6MjA1NTc2ODc3N30.gFiM3yc82ID61fVPAt6fpFvOoHheAS7zS5Ns3iMsQ7I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function per verificare se un errore riguarda una condizione specifica
function errorIncludes(error, text) {
  return error && error.message && error.message.includes(text);
}

async function createTables() {
  console.log('🔧 Inizializzazione tabelle del database per Mastroianni...');

  try {
    // Tentativi di creazione delle tabelle
    console.log('Creazione delle tabelle...');
    
    // Creo tabella 'movies'
    console.log('\nCreazione tabella movies...');
    try {
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .insert({
          tmdb_id: 1,
          slug: 'initial-movie-record',
          title: 'Inizializzazione Movie'
        })
        .select();
        
      if (moviesError) {
        if (moviesError.code === '23505') { // Codice per "duplicate key value"
          console.log('✅ Tabella movies già esistente');
        } else {
          console.log('⚠️ Problemi con tabella movies:', moviesError.message);
        }
      } else {
        console.log('✅ Tabella movies creata con successo');
      }
    } catch (movieError) {
      console.log('❌ Errore creazione tabella movies:', movieError.message);
    }
    
    // Creo tabella 'tv_shows'
    console.log('\nCreazione tabella tv_shows...');
    try {
      const { data: tvShowsData, error: tvShowsError } = await supabase
        .from('tv_shows')
        .insert({
          tmdb_id: 1,
          slug: 'initial-tv-record',
          name: 'Inizializzazione TV Show'
        })
        .select();
        
      if (tvShowsError) {
        if (tvShowsError.code === '23505') {
          console.log('✅ Tabella tv_shows già esistente');
        } else {
          console.log('⚠️ Problemi con tabella tv_shows:', tvShowsError.message);
        }
      } else {
        console.log('✅ Tabella tv_shows creata con successo');
      }
    } catch (tvError) {
      console.log('❌ Errore creazione tabella tv_shows:', tvError.message);
    }
    
    // Creo tabella 'persons'
    console.log('\nCreazione tabella persons...');
    try {
      const { data: personsData, error: personsError } = await supabase
        .from('persons')
        .insert({
          tmdb_id: 1,
          slug: 'initial-person-record',
          name: 'Inizializzazione Person',
          person_type: 'both'
        })
        .select();
        
      if (personsError) {
        if (personsError.code === '23505') {
          console.log('✅ Tabella persons già esistente');
        } else {
          console.log('⚠️ Problemi con tabella persons:', personsError.message);
        }
      } else {
        console.log('✅ Tabella persons creata con successo');
      }
    } catch (personError) {
      console.log('❌ Errore creazione tabella persons:', personError.message);
    }
    
    // Verifica struttura tabelle
    console.log('\n🔍 Verifica struttura tabelle...');
    
    // Verifico struttura 'movies'
    console.log('\nVerifica struttura movies...');
    const { data: moviesColumns, error: moviesColumnsError } = await supabase
      .from('movies')
      .select()
      .limit(1);
    
    if (!moviesColumnsError) {
      console.log('✅ Tabella movies accessibile');
      
      // Verifica campi della tabella movies
      const { error: moviesUpdateError } = await supabase
        .from('movies')
        .update({
          title: 'Record Iniziale',
          original_title: '',
          poster_path: '',
          backdrop_path: '',
          release_date: null,
          custom_overview: '',
          tmdb_overview: '',
          popularity: 0,
          access_count: 0
        })
        .eq('tmdb_id', 1);
        
      if (!moviesUpdateError) {
        console.log('✅ Struttura tabella movies verificata');
      } else {
        console.log('⚠️ Alcuni campi potrebbero mancare nella tabella movies');
      }
    } else {
      console.log('❌ Impossibile accedere alla tabella movies');
    }
    
    // Verifico struttura 'tv_shows'
    console.log('\nVerifica struttura tv_shows...');
    const { data: tvShowsColumns, error: tvShowsColumnsError } = await supabase
      .from('tv_shows')
      .select()
      .limit(1);
      
    if (!tvShowsColumnsError) {
      console.log('✅ Tabella tv_shows accessibile');
      
      // Verifica campi della tabella tv_shows
      const { error: tvShowsUpdateError } = await supabase
        .from('tv_shows')
        .update({
          name: 'Record Iniziale',
          original_name: '',
          poster_path: '',
          backdrop_path: '',
          first_air_date: null,
          custom_overview: '',
          tmdb_overview: '',
          number_of_seasons: 0,
          popularity: 0,
          access_count: 0
        })
        .eq('tmdb_id', 1);
        
      if (!tvShowsUpdateError) {
        console.log('✅ Struttura tabella tv_shows verificata');
      } else {
        console.log('⚠️ Alcuni campi potrebbero mancare nella tabella tv_shows');
      }
    } else {
      console.log('❌ Impossibile accedere alla tabella tv_shows');
    }
    
    // Verifico struttura 'persons'
    console.log('\nVerifica struttura persons...');
    const { data: personsColumns, error: personsColumnsError } = await supabase
      .from('persons')
      .select()
      .limit(1);
      
    if (!personsColumnsError) {
      console.log('✅ Tabella persons accessibile');
      
      // Verifica campi della tabella persons
      const { error: personsUpdateError } = await supabase
        .from('persons')
        .update({
          name: 'Record Iniziale',
          profile_path: '',
          person_type: 'both',
          custom_biography: '',
          tmdb_biography: '',
          birthday: null,
          place_of_birth: '',
          known_for_department: '',
          popularity: 0,
          access_count: 0
        })
        .eq('tmdb_id', 1);
        
      if (!personsUpdateError) {
        console.log('✅ Struttura tabella persons verificata');
      } else {
        console.log('⚠️ Alcuni campi potrebbero mancare nella tabella persons');
      }
    } else {
      console.log('❌ Impossibile accedere alla tabella persons');
    }
    
    // Riassunto finale
    console.log('\n📊 Riepilogo tabelle:');
    console.log(`- movies: ${!moviesColumnsError ? 'operativa ✅' : 'non operativa ❌'}`);
    console.log(`- tv_shows: ${!tvShowsColumnsError ? 'operativa ✅' : 'non operativa ❌'}`);
    console.log(`- persons: ${!personsColumnsError ? 'operativa ✅' : 'non operativa ❌'}`);
    
    if (!moviesColumnsError && !tvShowsColumnsError && !personsColumnsError) {
      console.log('\n🎉 Tutte le tabelle sono operative!');
    } else {
      console.log('\n⚠️ Alcune tabelle potrebbero non essere completamente operative');
    }
    
  } catch (error) {
    console.error('\n❌ Errore durante la creazione delle tabelle:', error.message);
  }
}

// Esegui la funzione
createTables()
  .then(() => {
    console.log('\nOperazione completata.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nErrore fatale:', error);
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://gbynhfiqlacmlwpjcxmp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieW5oZmlxbGFjbWx3cGpjeG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTI3NzcsImV4cCI6MjA1NTc2ODc3N30.gFiM3yc82ID61fVPAt6fpFvOoHheAS7zS5Ns3iMsQ7I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function per verificare se un errore riguarda una condizione specifica
function errorIncludes(error, text) {
  return error && error.message && error.message.includes(text);
}

async function createTables() {
  console.log('🔧 Inizializzazione tabelle del database per Mastroianni...');

  try {
    // Creo tabella 'movies'
    console.log('Creazione tabella movies...');
    
    // Prima proviamo a creare la tabella con SQL (incluso UUID)
    const { error: createMoviesError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS movies (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tmdb_id INTEGER UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          original_title TEXT,
          poster_path TEXT,
          backdrop_path TEXT,
          release_date DATE,
          custom_overview TEXT,
          tmdb_overview TEXT,
          popularity REAL DEFAULT 0,
          access_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Crea indici per ottimizzare le ricerche
        CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
        CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies(slug);
      `
    });
    
    if (createMoviesError) {
      // Se exec_sql non funziona, proviamo con l'approccio precedente
      console.log('Tentativo di creazione tabella movies tramite API...');
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .insert([{ 
          tmdb_id: 1, 
          slug: 'initial-record',
          title: 'Inizializzazione'
        }])
        .select();

      if (moviesError && !errorIncludes(moviesError, 'already exists')) {
        console.warn('⚠️ Avviso durante la creazione della tabella movies:', moviesError.message);
      } else {
        console.log('✅ Tabella movies creata con successo o già esistente');
        
        // Aggiorno i campi della tabella
        const { error: moviesSchemaError } = await supabase
          .from('movies')
          .update({
            original_title: '',
            poster_path: '',
            backdrop_path: '',
            release_date: null,
            custom_overview: '',
            tmdb_overview: '',
            popularity: 0,
            access_count: 0
          })
          .eq('tmdb_id', 1);
          
        if (moviesSchemaError && 
            !errorIncludes(moviesSchemaError, 'column') && 
            !errorIncludes(moviesSchemaError, 'does not exist')) {
          console.warn('⚠️ Avviso durante l\'aggiornamento dello schema movies:', moviesSchemaError.message);
        }
      }
    } else {
      console.log('✅ Tabella movies creata con successo tramite SQL');
    }
    
    // Creo tabella 'tv_shows'
    console.log('Creazione tabella tv_shows...');
    
    // Prima proviamo a creare la tabella con SQL (incluso UUID)
    const { error: createTvShowsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS tv_shows (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tmdb_id INTEGER UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          original_name TEXT,
          poster_path TEXT,
          backdrop_path TEXT,
          first_air_date DATE,
          custom_overview TEXT,
          tmdb_overview TEXT,
          number_of_seasons INTEGER DEFAULT 0,
          popularity REAL DEFAULT 0,
          access_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Crea indici per ottimizzare le ricerche
        CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_id ON tv_shows(tmdb_id);
        CREATE INDEX IF NOT EXISTS idx_tv_shows_slug ON tv_shows(slug);
      `
    });
    
    if (createTvShowsError) {
      // Se exec_sql non funziona, proviamo con l'approccio precedente
      console.log('Tentativo di creazione tabella tv_shows tramite API...');
      const { data: tvShowsData, error: tvShowsError } = await supabase
        .from('tv_shows')
        .insert([{ 
          tmdb_id: 1, 
          slug: 'initial-record',
          name: 'Inizializzazione'
        }])
        .select();
        
      if (tvShowsError && !errorIncludes(tvShowsError, 'already exists')) {
        console.warn('⚠️ Avviso durante la creazione della tabella tv_shows:', tvShowsError.message);
      } else {
        console.log('✅ Tabella tv_shows creata con successo o già esistente');
        
        // Aggiorno i campi della tabella
        const { error: tvShowsSchemaError } = await supabase
          .from('tv_shows')
          .update({
            original_name: '',
            poster_path: '',
            backdrop_path: '',
            first_air_date: null,
            custom_overview: '',
            tmdb_overview: '',
            number_of_seasons: 0,
            popularity: 0,
            access_count: 0
          })
          .eq('tmdb_id', 1);
          
        if (tvShowsSchemaError && 
            !errorIncludes(tvShowsSchemaError, 'column') && 
            !errorIncludes(tvShowsSchemaError, 'does not exist')) {
          console.warn('⚠️ Avviso durante l\'aggiornamento dello schema tv_shows:', tvShowsSchemaError.message);
        }
      }
    } else {
      console.log('✅ Tabella tv_shows creata con successo tramite SQL');
    }
    
    // Creo tabella 'persons'
    console.log('Creazione tabella persons...');
    
    // Prima proviamo a creare la tabella con SQL (incluso UUID)
    const { error: createPersonsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS persons (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tmdb_id INTEGER UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          person_type TEXT CHECK (person_type IN ('actor', 'director', 'both')),
          profile_path TEXT,
          custom_biography TEXT,
          tmdb_biography TEXT,
          birthday DATE,
          place_of_birth TEXT,
          known_for_department TEXT,
          popularity REAL DEFAULT 0,
          access_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Crea indici per ottimizzare le ricerche
        CREATE INDEX IF NOT EXISTS idx_persons_tmdb_id ON persons(tmdb_id);
        CREATE INDEX IF NOT EXISTS idx_persons_slug ON persons(slug);
      `
    });
    
    if (createPersonsError) {
      // Se exec_sql non funziona, proviamo con l'approccio precedente
      console.log('Tentativo di creazione tabella persons tramite API...');
      const { data: personsData, error: personsError } = await supabase
        .from('persons')
        .insert([{ 
          tmdb_id: 1, 
          slug: 'initial-record',
          name: 'Inizializzazione',
          person_type: 'both'
        }])
        .select();
        
      if (personsError && !errorIncludes(personsError, 'already exists')) {
        console.warn('⚠️ Avviso durante la creazione della tabella persons:', personsError.message);
      } else {
        console.log('✅ Tabella persons creata con successo o già esistente');
        
        // Aggiorno i campi della tabella
        const { error: personsSchemaError } = await supabase
          .from('persons')
          .update({
            profile_path: '',
            custom_biography: '',
            tmdb_biography: '',
            birthday: null,
            place_of_birth: '',
            known_for_department: '',
            popularity: 0,
            access_count: 0
          })
          .eq('tmdb_id', 1);
          
        if (personsSchemaError && 
            !errorIncludes(personsSchemaError, 'column') && 
            !errorIncludes(personsSchemaError, 'does not exist')) {
          console.warn('⚠️ Avviso durante l\'aggiornamento dello schema persons:', personsSchemaError.message);
        }
      }
    } else {
      console.log('✅ Tabella persons creata con successo tramite SQL');
    }

    console.log('🎉 Tutte le tabelle sono state create con successo!');
    
    // Verifica che il database sia pronto
    console.log('Verifica dello stato delle tabelle...');
    
    // Verifica movies
    const { data: moviesCheck, error: moviesCheckError } = await supabase
      .from('movies')
      .select('count')
      .limit(1);
    
    // Verifica tv_shows
    const { data: tvShowsCheck, error: tvShowsCheckError } = await supabase
      .from('tv_shows')
      .select('count')
      .limit(1);
    
    // Verifica persons
    const { data: personsCheck, error: personsCheckError } = await supabase
      .from('persons')
      .select('count')
      .limit(1);
      
    console.log('📊 Stato delle tabelle:');
    console.log(`- movies: ${!moviesCheckError ? 'creata ✅' : 'non creata ❌'}`);
    console.log(`- tv_shows: ${!tvShowsCheckError ? 'creata ✅' : 'non creata ❌'}`);
    console.log(`- persons: ${!personsCheckError ? 'creata ✅' : 'non creata ❌'}`);
    
  } catch (error) {
    console.error('❌ Errore durante la creazione delle tabelle:', error.message);
  }
}

// Esegui la funzione
createTables()
  .then(() => {
    console.log('Operazione completata.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Errore fatale:', error);
    process.exit(1);
  }); 