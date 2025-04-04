-- Funzione per ottenere statistiche aggregate delle pagine
CREATE OR REPLACE FUNCTION get_page_stats()
RETURNS TABLE (
  total_pages BIGINT,
  total_film BIGINT,
  total_serie BIGINT,
  total_visits BIGINT,
  avg_visits_per_page NUMERIC,
  most_recent_generation TIMESTAMPTZ,
  most_recent_visit TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_pages,
    COUNT(*) FILTER (WHERE page_type = 'film')::BIGINT AS total_film,
    COUNT(*) FILTER (WHERE page_type = 'serie')::BIGINT AS total_serie,
    COALESCE(SUM(visit_count), 0)::BIGINT AS total_visits,
    CASE 
      WHEN COUNT(*) > 0 THEN ROUND((COALESCE(SUM(visit_count), 0)::NUMERIC / COUNT(*)::NUMERIC), 2)
      ELSE 0
    END AS avg_visits_per_page,
    MAX(first_generated_at) AS most_recent_generation,
    MAX(last_visited_at) AS most_recent_visit
  FROM 
    public.generated_pages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permessi per chiamare la funzione
GRANT EXECUTE ON FUNCTION get_page_stats TO anon, authenticated, service_role;

-- Commento per documentazione
COMMENT ON FUNCTION get_page_stats IS 'Ritorna statistiche aggregate sulle pagine generate e le visite'; 