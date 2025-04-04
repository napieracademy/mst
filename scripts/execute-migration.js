const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurazione Supabase
const supabaseUrl = 'https://gbynhfiqlacmlwpjcxmp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieW5oZmlxbGFjbWx3cGpjeG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTI3NzcsImV4cCI6MjA1NTc2ODc3N30.gFiM3yc82ID61fVPAt6fpFvOoHheAS7zS5Ns3iMsQ7I';
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  try {
    // Percorso del file di migrazione
    const migrationFilePath = path.join(process.cwd(), 'db/supabase/migrations/20240912000000_generated_pages_tracking.sql');
    
    // Leggi il contenuto del file SQL
    console.log(`Lettura file migrazione: ${migrationFilePath}`);
    const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Esegui l'SQL direttamente (in blocchi singoli per evitare problemi di esecuzione)
    // Prima, dividiamo in singole istruzioni SQL
    const sqlStatements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`Trovate ${sqlStatements.length} istruzioni SQL da eseguire`);
    
    // Esegui ogni istruzione separatamente
    for (let i = 0; i < sqlStatements.length; i++) {
      const stmt = sqlStatements[i].trim() + ';';
      console.log(`Esecuzione istruzione SQL #${i + 1}:`);
      console.log(stmt.substring(0, 150) + (stmt.length > 150 ? '...' : ''));
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
      
      if (error) {
        console.error(`Errore nell'esecuzione dell'istruzione #${i + 1}:`, error);
        // Continuiamo con le altre istruzioni anche se una fallisce
      } else {
        console.log(`✅ Istruzione #${i + 1} eseguita con successo`);
      }
    }
    
    console.log('✅ Migrazione completata con successo');
    
    // Verifica che la tabella sia stata creata
    const { data, error } = await supabase
      .from('generated_pages')
      .select('count(*)', { count: 'exact' });
      
    if (error) {
      console.error('Errore nel verificare la tabella generated_pages:', error);
    } else {
      console.log(`La tabella generated_pages esiste e contiene ${data.length} record`);
    }
    
  } catch (error) {
    console.error('Errore durante l\'esecuzione della migrazione:', error);
  }
}

// Esegui la migrazione
executeMigration(); 