-- Migrazione per aggiornare il vincolo sulla tabella generated_pages
-- Aggiunge supporto per attori, registi e persone

-- Aggiorna il vincolo per accettare più tipi di pagina
ALTER TABLE public.generated_pages
DROP CONSTRAINT IF EXISTS valid_page_type;

ALTER TABLE public.generated_pages
ADD CONSTRAINT valid_page_type CHECK (page_type IN ('film', 'serie', 'attore', 'regista', 'cast', 'crew', 'person'));

-- Aggiorna il commento della colonna
COMMENT ON COLUMN public.generated_pages.page_type IS 'Tipo di pagina: film, serie, attore, regista, cast, crew, person';

-- Aggiungi la funzione get_page_type_counts se non esiste
CREATE OR REPLACE FUNCTION get_page_type_counts()
RETURNS TABLE (
  page_type TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gp.page_type,
    COUNT(*)::BIGINT
  FROM 
    public.generated_pages gp
  GROUP BY 
    gp.page_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permessi per chiamare la funzione
GRANT EXECUTE ON FUNCTION get_page_type_counts TO anon, authenticated, service_role;

-- Commento per documentazione
COMMENT ON FUNCTION get_page_type_counts IS 'Ritorna conteggi aggregati per ogni tipo di pagina';

-- Aggiorna la tabella sitemap_stats se necessario
ALTER TABLE sitemap_stats
ADD COLUMN IF NOT EXISTS attori_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS registi_count INTEGER DEFAULT 0;

-- Aggiorna i commenti
COMMENT ON COLUMN sitemap_stats.attori_count IS 'Numero di attori nella sitemap';
COMMENT ON COLUMN sitemap_stats.registi_count IS 'Numero di registi nella sitemap';