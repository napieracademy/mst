-- Funzione per ottenere il conteggio visite corrente e incrementarlo di 1
CREATE OR REPLACE FUNCTION get_visit_count(p_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Ottiene il valore corrente o restituisce 0 se NULL
  SELECT COALESCE(visit_count, 0) INTO current_count 
  FROM generated_pages 
  WHERE slug = p_slug;
  
  -- Incrementa di 1 o restituisce 1 se non trovato
  RETURN COALESCE(current_count, 0) + 1;
END;
$$ LANGUAGE plpgsql; 