-- Nome della migrazione: spirits
-- Descrizione: Tabella per gestire i liquori e distillati
-- Data: 30/03/2025

-- Rollback
DROP TABLE IF EXISTS spirits;

-- Migrazione
CREATE TABLE IF NOT EXISTS spirits (
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

CREATE TRIGGER update_spirits_updated_at
    BEFORE UPDATE ON spirits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indici
-- CREATE INDEX idx_spirits_[campo] ON spirits([campo]);

-- Dati di esempio
-- INSERT INTO spirits (campo1, campo2) VALUES
--     ('valore1', 'valore2')
-- ON CONFLICT DO NOTHING; 