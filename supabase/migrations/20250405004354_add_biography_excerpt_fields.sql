-- Aggiungi biografia e excerpt come campi di testo alla tabella generated_pages
ALTER TABLE generated_pages 
ADD COLUMN IF NOT EXISTS biography TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT;
