-- Nome della migrazione: rls_policies
-- Descrizione: Applica le RLS alle tabelle wines, beers e spirits
-- Data: 30/03/2025

-- Rollback
DROP TABLE IF EXISTS rls_policies;

-- Migrazione
CREATE TABLE IF NOT EXISTS rls_policies (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    -- Aggiungi qui i campi della tabella
);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rls_policies_updated_at
    BEFORE UPDATE ON rls_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indici
-- CREATE INDEX idx_rls_policies_[campo] ON rls_policies([campo]);

-- Dati di esempio
-- INSERT INTO rls_policies (campo1, campo2) VALUES
--     ('valore1', 'valore2')
-- ON CONFLICT DO NOTHING; 