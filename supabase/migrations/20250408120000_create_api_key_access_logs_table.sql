-- Migrazione: Crea tabella per tracciare l'accesso alle chiavi API
-- Questo permette di monitorare chi sta accedendo alle chiavi, quando e da dove

-- 1. Crea un tipo enum per i tipi di chiavi supportati
CREATE TYPE api_key_type AS ENUM (
  'tmdb',
  'netlify',
  'supabase_service_role',
  'openai',
  'google_ai',
  'perplexity',
  'tinymce',
  'other'
);

-- 2. Crea la tabella per il logging degli accessi
CREATE TABLE IF NOT EXISTS api_key_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  key_type api_key_type NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Metadati aggiuntivi (opzionali)
  user_agent TEXT,
  request_id TEXT,
  success BOOLEAN DEFAULT TRUE
);

-- 3. Crea indici per le query comuni
CREATE INDEX IF NOT EXISTS api_key_access_logs_user_id_idx ON api_key_access_logs(user_id);
CREATE INDEX IF NOT EXISTS api_key_access_logs_platform_idx ON api_key_access_logs(platform);
CREATE INDEX IF NOT EXISTS api_key_access_logs_created_at_idx ON api_key_access_logs(created_at);

-- 4. Imposta RLS (Row Level Security) con policy generose per admin
ALTER TABLE api_key_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: gli admin possono vedere tutti i log
CREATE POLICY "Admin can view all logs" 
  ON api_key_access_logs
  FOR SELECT 
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (
    SELECT id FROM auth.users WHERE email LIKE '%@mastroianni.app'
  ));

-- Policy: utenti autenticati possono vedere solo i propri log
CREATE POLICY "Users can view only their logs" 
  ON api_key_access_logs
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Commento per la tabella
COMMENT ON TABLE api_key_access_logs IS 'Registro degli accessi alle chiavi API centralizzate';