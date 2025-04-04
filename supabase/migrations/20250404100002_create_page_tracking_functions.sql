-- Funzione per incrementare il contatore visite di una pagina
-- Ritornerà il nuovo contatore visite
CREATE OR REPLACE FUNCTION increment_page_visit(
  p_slug TEXT, 
  p_page_type TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_visit_count INTEGER;
BEGIN
  -- Aggiorna il contatore e il timestamp ultima visita
  UPDATE public.generated_pages
  SET 
    visit_count = visit_count + 1,
    last_visited_at = NOW()
  WHERE 
    slug = p_slug 
    -- Se il p_page_type è specificato, verifica che corrisponda
    AND (p_page_type IS NULL OR page_type = p_page_type)
  RETURNING visit_count INTO v_visit_count;
  
  -- Se non ha trovato nessuna riga, ritorna 0
  RETURN COALESCE(v_visit_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per inserire o aggiornare una pagina generata
CREATE OR REPLACE FUNCTION track_generated_page(
  p_slug TEXT,
  p_page_type TEXT,
  p_is_first_generation BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Verifica validità tipo pagina
  IF p_page_type NOT IN ('film', 'serie') THEN
    RAISE EXCEPTION 'Tipo pagina non valido. Consentiti: film, serie';
  END IF;

  -- Se è la prima generazione, inseriamo un nuovo record
  -- Altrimenti incrementiamo il contatore visite
  IF p_is_first_generation THEN
    -- Tenta di inserire una nuova pagina
    INSERT INTO public.generated_pages (
      slug, 
      page_type, 
      first_generated_at,
      last_visited_at,
      visit_count
    )
    VALUES (
      p_slug,
      p_page_type,
      NOW(),
      NOW(),
      1
    )
    -- In caso di chiave duplicata, aggiorna solo il timestamp visita
    ON CONFLICT (slug) 
    DO UPDATE SET
      last_visited_at = NOW(),
      visit_count = public.generated_pages.visit_count + 1
    RETURNING 
      id,
      slug,
      page_type,
      first_generated_at,
      last_visited_at,
      visit_count
    INTO v_result;
  ELSE
    -- È una visita successiva, incrementa contatore
    UPDATE public.generated_pages
    SET 
      visit_count = visit_count + 1,
      last_visited_at = NOW()
    WHERE 
      slug = p_slug
    RETURNING 
      id,
      slug,
      page_type,
      first_generated_at,
      last_visited_at,
      visit_count
    INTO v_result;
    
    -- Se non esiste ancora (raro ma possibile), creala
    IF v_result IS NULL THEN
      INSERT INTO public.generated_pages (
        slug, 
        page_type, 
        first_generated_at,
        last_visited_at,
        visit_count
      )
      VALUES (
        p_slug,
        p_page_type,
        NOW(),
        NOW(),
        1
      )
      RETURNING 
        id,
        slug,
        page_type,
        first_generated_at,
        last_visited_at,
        visit_count
      INTO v_result;
    END IF;
  END IF;
  
  -- Converti in JSONB e ritorna
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permessi per chiamare le funzioni
GRANT EXECUTE ON FUNCTION increment_page_visit TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION track_generated_page TO anon, authenticated, service_role;

-- Commenti per documentazione
COMMENT ON FUNCTION increment_page_visit IS 'Incrementa il contatore visite per una pagina esistente';
COMMENT ON FUNCTION track_generated_page IS 'Traccia la generazione o visita di una pagina film/serie'; 