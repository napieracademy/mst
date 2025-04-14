-- Abilita RLS sulla tabella movie_synopses
ALTER TABLE movie_synopses ENABLE ROW LEVEL SECURITY;

-- Aggiungi la colonna imdb_id alla tabella movie_synopses
ALTER TABLE movie_synopses ADD COLUMN imdb_id TEXT;

-- Crea una policy per permettere a tutti di leggere
CREATE POLICY "movie_synopses_select_policy"
ON movie_synopses FOR SELECT
USING (true);

-- Crea una policy per permettere solo agli admin di inserire nuovi record
CREATE POLICY "movie_synopses_insert_policy"
ON movie_synopses FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Crea una policy per permettere solo agli admin di aggiornare
CREATE POLICY "movie_synopses_update_policy"
ON movie_synopses FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Crea una policy per permettere solo agli admin di eliminare
CREATE POLICY "movie_synopses_delete_policy"
ON movie_synopses FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin'); 