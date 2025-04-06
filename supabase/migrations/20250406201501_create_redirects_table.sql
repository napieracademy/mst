-- Crea tabella per i reindirizzamenti SEO friendly
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_path TEXT NOT NULL UNIQUE,
  new_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indice per ricerche rapide sul path originale
CREATE INDEX IF NOT EXISTS redirects_old_path_idx ON redirects (old_path);

-- Funzione per aggiornare il timestamp updated_at
CREATE OR REPLACE FUNCTION update_redirects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare automaticamente updated_at
CREATE TRIGGER set_redirects_updated_at
BEFORE UPDATE ON redirects
FOR EACH ROW
EXECUTE FUNCTION update_redirects_updated_at();

-- Permessi RLS
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica
CREATE POLICY redirects_read_policy
  ON redirects
  FOR SELECT
  USING (true);

-- Policy per modifica solo da parte di utenti autenticati con ruolo admin
CREATE POLICY redirects_write_policy
  ON redirects
  FOR ALL
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Funzione RPC per controllare i reindirizzamenti in modo efficiente
CREATE OR REPLACE FUNCTION check_redirect(path TEXT)
RETURNS TABLE (new_path TEXT, status_code INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT r.new_path, r.status_code FROM redirects r
  WHERE r.old_path = path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea tabella per il caching TMDB
CREATE TABLE IF NOT EXISTS tmdb_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  ttl INTEGER NOT NULL DEFAULT 3600, -- Default 1 ora
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indice per eliminazione automatica dati scaduti
CREATE INDEX IF NOT EXISTS tmdb_cache_created_at_idx ON tmdb_cache (created_at);

-- Permessi RLS per tmdb_cache
ALTER TABLE tmdb_cache ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica da tmdb_cache
CREATE POLICY tmdb_cache_read_policy
  ON tmdb_cache
  FOR SELECT
  USING (true);

-- Policy per scrittura da parte di servizi (edge functions o simili)
CREATE POLICY tmdb_cache_write_policy
  ON tmdb_cache
  FOR ALL
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Funzione per pulire automaticamente la cache scaduta
CREATE OR REPLACE FUNCTION clean_expired_tmdb_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM tmdb_cache
  WHERE created_at + (ttl * interval '1 second') < now()
  RETURNING count(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere dati dalla cache con verifica TTL
CREATE OR REPLACE FUNCTION get_tmdb_cache(cache_key TEXT)
RETURNS JSONB AS $$
DECLARE
  cache_data JSONB;
  cache_ttl INTEGER;
  cache_created_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT data, ttl, created_at INTO cache_data, cache_ttl, cache_created_at
  FROM tmdb_cache
  WHERE key = cache_key;
  
  IF cache_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Verifica se il dato è scaduto
  IF cache_created_at + (cache_ttl * interval '1 second') < now() THEN
    -- Dato scaduto, ma lo restituiamo comunque
    -- Il refresh dovrebbe essere gestito a livello applicativo
    RETURN jsonb_build_object('data', cache_data, 'is_expired', true);
  END IF;
  
  RETURN jsonb_build_object('data', cache_data, 'is_expired', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea una funzione per popolare automaticamente i reindirizzamenti da TMDB_ID
CREATE OR REPLACE FUNCTION populate_redirect_from_tmdb(
  id TEXT,
  title TEXT, 
  year TEXT,
  type TEXT -- 'movie', 'tv', o 'person'
) RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  old_path TEXT;
  new_path TEXT;
BEGIN
  -- Genera lo slug in base al tipo
  IF title IS NULL OR id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Sanitizza il titolo (semplificato)
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9]', '-', 'g'));
  
  -- Aggiungi l'anno se disponibile
  IF year IS NOT NULL AND year != '' THEN
    slug := slug || '-' || year;
  END IF;
  
  -- Aggiungi l'ID alla fine
  slug := slug || '-' || id;
  
  -- Determina i percorsi in base al tipo
  IF type = 'movie' THEN
    old_path := '/movie/' || id;
    new_path := '/film/' || slug;
  ELSIF type = 'tv' THEN
    old_path := '/tv/' || id;
    new_path := '/serie/' || slug;
  ELSIF type = 'person' THEN
    old_path := '/person/' || id;
    new_path := '/attore/' || slug;
  ELSE
    RETURN NULL;
  END IF;
  
  -- Inserisci il reindirizzamento
  INSERT INTO redirects (old_path, new_path, status_code)
  VALUES (old_path, new_path, 301)
  ON CONFLICT (old_path) DO UPDATE
  SET new_path = EXCLUDED.new_path;
  
  RETURN new_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;