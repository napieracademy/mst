-- Migrazione per configurare il bucket site-assets con permessi completi
-- Data: 07/04/2025

-- Assicurati che il bucket esista
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Elimina eventuali policy esistenti per evitare conflitti
DROP POLICY IF EXISTS "Accesso pubblico completo al bucket site-assets" ON storage.objects;

-- Crea una policy generica che consente tutte le operazioni su tutti i file nel bucket
CREATE POLICY "Accesso pubblico completo al bucket site-assets"
ON storage.objects
FOR ALL
USING (bucket_id = 'site-assets'); 