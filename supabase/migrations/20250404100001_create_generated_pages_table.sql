-- Creazione della tabella per tracciare le pagine generate
CREATE TABLE IF NOT EXISTS public.generated_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  page_type TEXT NOT NULL, -- 'film' o 'serie'
  first_generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT valid_page_type CHECK (page_type IN ('film', 'serie'))
);

-- Indice per ricerche rapide per slug
CREATE INDEX IF NOT EXISTS generated_pages_slug_idx ON public.generated_pages (slug);

-- Indice per ricerche per tipo di pagina
CREATE INDEX IF NOT EXISTS generated_pages_type_idx ON public.generated_pages (page_type);

-- Indice per ordinamento per conteggio visite (utile per statistiche)
CREATE INDEX IF NOT EXISTS generated_pages_visits_idx ON public.generated_pages (visit_count DESC);

-- Permessi pubblici minimi: solo SELECT per utenti anonimi
GRANT SELECT ON public.generated_pages TO anon;

-- Commenti per documentazione
COMMENT ON TABLE public.generated_pages IS 'Traccia le pagine film e serie generate, sia staticamente che on-demand';
COMMENT ON COLUMN public.generated_pages.slug IS 'Lo slug completo della pagina, es: titolo-anno-id';
COMMENT ON COLUMN public.generated_pages.page_type IS 'Tipo di pagina: film o serie';
COMMENT ON COLUMN public.generated_pages.first_generated_at IS 'Timestamp della prima generazione della pagina';
COMMENT ON COLUMN public.generated_pages.last_visited_at IS 'Timestamp dell''ultima visita alla pagina';
COMMENT ON COLUMN public.generated_pages.visit_count IS 'Numero totale di visite alla pagina'; 