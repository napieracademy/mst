-- Nome della migrazione: [nome_tabella]
-- Descrizione: [descrizione della tabella]
-- Data: [data]

-- Rollback
DROP TABLE IF EXISTS [nome_tabella];

-- Migrazione
CREATE TABLE IF NOT EXISTS [nome_tabella] (
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

CREATE TRIGGER update_[nome_tabella]_updated_at
    BEFORE UPDATE ON [nome_tabella]
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indici
-- CREATE INDEX idx_[nome_tabella]_[campo] ON [nome_tabella]([campo]);

-- Dati di esempio
-- INSERT INTO [nome_tabella] (campo1, campo2) VALUES
--     ('valore1', 'valore2')
-- ON CONFLICT DO NOTHING; 