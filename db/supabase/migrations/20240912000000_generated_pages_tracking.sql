-- Crea la tabella per il tracciamento delle pagine generate
CREATE TABLE IF NOT EXISTS public.generated_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    page_type TEXT NOT NULL,
    first_generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_count INTEGER NOT NULL DEFAULT 1,
    
    -- Indici per migliorare le performance delle query più frequenti
    CONSTRAINT unique_slug_page_type UNIQUE (slug, page_type)
);

-- Crea indici per ordinamento e ricerca
CREATE INDEX IF NOT EXISTS idx_generated_pages_visit_count ON public.generated_pages (visit_count DESC);
CREATE INDEX IF NOT EXISTS idx_generated_pages_first_generated ON public.generated_pages (first_generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_pages_last_visited ON public.generated_pages (last_visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_pages_page_type ON public.generated_pages (page_type);

-- Crea il ruolo anon con diritti di accesso alla tabella
ALTER TABLE public.generated_pages ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.generated_pages TO anon;
GRANT INSERT, UPDATE ON public.generated_pages TO anon;

-- Funzione per tracciare una pagina generata (inserimento o aggiornamento)
CREATE OR REPLACE FUNCTION public.track_generated_page(
    p_slug TEXT,
    p_page_type TEXT,
    p_is_first_generation BOOLEAN
) RETURNS public.generated_pages AS $$
DECLARE
    v_result public.generated_pages;
BEGIN
    -- Prova ad inserire un nuovo record
    INSERT INTO public.generated_pages (slug, page_type)
    VALUES (p_slug, p_page_type)
    ON CONFLICT (slug, page_type) DO UPDATE SET
        -- Se è una prima generazione, aggiorna solo il timestamp, altrimenti incrementa le visite
        last_visited_at = NOW(),
        visit_count = CASE 
                        WHEN p_is_first_generation THEN generated_pages.visit_count 
                        ELSE generated_pages.visit_count + 1 
                      END
    RETURNING * INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per incrementare il contatore visite di una pagina
CREATE OR REPLACE FUNCTION public.increment_page_visit(
    p_slug TEXT,
    p_page_type TEXT
) RETURNS public.generated_pages AS $$
DECLARE
    v_result public.generated_pages;
BEGIN
    -- Aggiorna la pagina esistente o ne crea una nuova
    INSERT INTO public.generated_pages (slug, page_type)
    VALUES (p_slug, p_page_type)
    ON CONFLICT (slug, page_type) DO UPDATE SET
        last_visited_at = NOW(),
        visit_count = generated_pages.visit_count + 1
    RETURNING * INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere le statistiche aggregate delle pagine
CREATE OR REPLACE FUNCTION public.get_page_stats()
RETURNS TABLE (
    total_pages BIGINT,
    total_film BIGINT,
    total_serie BIGINT,
    total_visits BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_pages,
        COUNT(*) FILTER (WHERE page_type = 'film')::BIGINT as total_film,
        COUNT(*) FILTER (WHERE page_type = 'serie')::BIGINT as total_serie,
        SUM(visit_count)::BIGINT as total_visits
    FROM public.generated_pages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 