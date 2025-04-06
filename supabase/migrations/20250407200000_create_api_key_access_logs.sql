-- Creazione della tabella di log per gli accessi alle chiavi API
CREATE TABLE IF NOT EXISTS api_key_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  key_type TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indice per ricerche rapide
CREATE INDEX IF NOT EXISTS api_key_access_logs_user_id_idx ON api_key_access_logs (user_id);
CREATE INDEX IF NOT EXISTS api_key_access_logs_key_type_idx ON api_key_access_logs (key_type);
CREATE INDEX IF NOT EXISTS api_key_access_logs_created_at_idx ON api_key_access_logs (created_at);

-- Permessi RLS
ALTER TABLE api_key_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy per scrittura da edge functions
CREATE POLICY api_key_access_logs_insert_policy
  ON api_key_access_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy per lettura solo da admin
CREATE POLICY api_key_access_logs_read_policy
  ON api_key_access_logs
  FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Funzione per ottenere statistiche di utilizzo delle chiavi API
CREATE OR REPLACE FUNCTION get_api_key_usage_stats(
  days_param INTEGER DEFAULT 7, 
  key_type_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  day DATE,
  key_type TEXT,
  platform TEXT,
  count BIGINT
) 
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) AS day,
    logs.key_type,
    logs.platform,
    COUNT(*) AS count
  FROM 
    api_key_access_logs logs
  WHERE 
    created_at >= now() - (days_param * interval '1 day')
    AND (key_type_param IS NULL OR logs.key_type = key_type_param)
  GROUP BY 
    DATE(created_at), logs.key_type, logs.platform
  ORDER BY 
    day DESC, logs.key_type, count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;