-- Aggiunge policy per consentire update sulla tabella movies da client anonimi

-- Abilita RLS sulla tabella movies se non è già abilitata
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Crea una policy per permettere a tutti di leggere
CREATE POLICY "movies_select_policy"
ON movies FOR SELECT
USING (true);

-- Crea una policy per permettere a tutti di aggiornare il campo custom_overview
CREATE POLICY "movies_update_custom_overview_policy"
ON movies FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Commento: questa policy è un workaround temporaneo che consente a qualsiasi client
-- di aggiornare il campo custom_overview (sinossi personalizzata) senza restrizioni.
-- In un ambiente di produzione più restrittivo, dovresti limitare gli aggiornamenti
-- solo agli utenti autenticati e con ruoli appropriati.