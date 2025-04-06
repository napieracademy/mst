-- Migrazione per configurare il bucket site-assets e le sue policy RLS
-- Data: 07/04/2025

-- Assicurati che il bucket esista
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Aggiungi commento al bucket
COMMENT ON TABLE storage.buckets IS 'Bucket di storage per file pubblici del sito, inclusa la sitemap.xml';

-- Policy per consentire a tutti di leggere i file XML nel bucket site-assets
CREATE POLICY "Accesso pubblico in lettura per i file XML"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets' AND (storage.extension(name) = 'xml'));

-- Policy per consentire alle Edge Functions (service_role) di inserire file XML nel bucket site-assets
CREATE POLICY "Service role può inserire file XML"
ON storage.objects FOR INSERT
TO service_role
USING (bucket_id = 'site-assets' AND (storage.extension(name) = 'xml'));

-- Policy per consentire alle Edge Functions (service_role) di aggiornare file XML nel bucket site-assets
CREATE POLICY "Service role può aggiornare file XML"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'site-assets' AND (storage.extension(name) = 'xml'));

-- Policy per consentire alle Edge Functions (service_role) di eliminare file XML nel bucket site-assets
CREATE POLICY "Service role può eliminare file XML"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'site-assets' AND (storage.extension(name) = 'xml'));

-- Gestione rollback
-- Se vogliamo rollback di questa migrazione, dobbiamo eliminare le policy e potenzialmente il bucket
-- DROP POLICY "Accesso pubblico in lettura per i file XML" ON storage.objects;
-- DROP POLICY "Service role può inserire file XML" ON storage.objects;
-- DROP POLICY "Service role può aggiornare file XML" ON storage.objects;
-- DROP POLICY "Service role può eliminare file XML" ON storage.objects;
-- DROP BUCKET IF EXISTS site-assets; 