-- Aggiunge policy per consentire INSERT sulla tabella movies da client anonimi

-- Controlla se la policy già esiste prima di crearla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'movies' AND policyname = 'movies_insert_policy'
    ) THEN
        -- Crea una policy per permettere a tutti di inserire nuovi film
        CREATE POLICY "movies_insert_policy"
        ON movies FOR INSERT
        TO anon
        WITH CHECK (true);
        
        RAISE NOTICE 'Policy movies_insert_policy creata con successo';
    ELSE
        RAISE NOTICE 'Policy movies_insert_policy già esistente, nessuna modifica apportata';
    END IF;
END
$$;

-- Commento: questa policy è un workaround temporaneo che consente a qualsiasi client
-- di inserire nuovi film senza restrizioni.
-- In un ambiente di produzione più restrittivo, dovresti limitare gli inserimenti
-- solo agli utenti autenticati e con ruoli appropriati.

-- Assicuriamoci che RLS sia abilitato sulla tabella
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;