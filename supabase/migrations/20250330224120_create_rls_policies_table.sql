-- Nome della migrazione: rls_policies
-- Descrizione: Applica le RLS alle tabelle wines, beers e spirits
-- Data: 30/03/2025

-- Rollback
DROP POLICY IF EXISTS "Enable read access for all users" ON wines;
DROP POLICY IF EXISTS "Enable read access for all users" ON beers;
DROP POLICY IF EXISTS "Enable read access for all users" ON spirits;

-- Abilita RLS su tutte le tabelle
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE beers ENABLE ROW LEVEL SECURITY;
ALTER TABLE spirits ENABLE ROW LEVEL SECURITY;

-- Crea policy di sola lettura per utenti anonimi
CREATE POLICY "Enable read access for all users"
ON wines
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for all users"
ON beers
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for all users"
ON spirits
FOR SELECT
TO anon
USING (true); 