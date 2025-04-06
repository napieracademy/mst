-- Migrazione per creare la tabella sitemap_stats
-- La tabella contiene informazioni sulle generazioni della sitemap

-- Creazione tabella sitemap_stats
CREATE TABLE IF NOT EXISTS sitemap_stats (
  id BIGINT PRIMARY KEY,
  last_generation TIMESTAMP WITH TIME ZONE DEFAULT now(),
  urls_count INTEGER DEFAULT 0,
  film_count INTEGER DEFAULT 0,
  serie_count INTEGER DEFAULT 0,
  is_error BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Commento alla tabella
COMMENT ON TABLE sitemap_stats IS 'Memorizza statistiche e metadati sulla generazione della sitemap';

-- Commenti alle colonne
COMMENT ON COLUMN sitemap_stats.id IS 'ID della riga (1 è il record principale)';
COMMENT ON COLUMN sitemap_stats.last_generation IS 'Data e ora dell''ultima generazione della sitemap';
COMMENT ON COLUMN sitemap_stats.urls_count IS 'Numero totale di URL nella sitemap';
COMMENT ON COLUMN sitemap_stats.film_count IS 'Numero di film nella sitemap';
COMMENT ON COLUMN sitemap_stats.serie_count IS 'Numero di serie nella sitemap';
COMMENT ON COLUMN sitemap_stats.is_error IS 'Flag che indica se si è verificato un errore durante la generazione';
COMMENT ON COLUMN sitemap_stats.error_message IS 'Messaggio di errore (se presente)';
COMMENT ON COLUMN sitemap_stats.created_at IS 'Data e ora di creazione del record';
COMMENT ON COLUMN sitemap_stats.updated_at IS 'Data e ora dell''ultimo aggiornamento del record';

-- Trigger per aggiornare il timestamp updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON sitemap_stats
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Inserimento del record principale
INSERT INTO sitemap_stats (id, last_generation, urls_count, film_count, serie_count, is_error)
VALUES (1, now(), 0, 0, 0, false)
ON CONFLICT (id) DO NOTHING;

-- Creazione del bucket di storage per il file della sitemap
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Crea policy per accesso pubblico alle sitemap
CREATE POLICY "Sitemap files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'public' AND (storage.extension(name) = 'xml'));

-- Crea policy per consentire alla funzione edge di scrivere nel bucket
CREATE POLICY "Service role can update sitemap files"
ON storage.objects FOR INSERT
TO service_role
USING (bucket_id = 'public' AND (storage.extension(name) = 'xml'));

CREATE POLICY "Service role can update sitemap files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'public' AND (storage.extension(name) = 'xml'));