
-- Add RUT column to certificates
ALTER TABLE public.certificates ADD COLUMN rut text;

-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a function to normalize text for fuzzy matching (remove spaces, hyphens, lowercase)
CREATE OR REPLACE FUNCTION public.normalize_text(input text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(input, '[\s\-\.\,]+', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Create the public search function that only returns certification status
CREATE OR REPLACE FUNCTION public.search_certified_companies(search_term text)
RETURNS TABLE(company_name text, is_certified boolean) AS $$
DECLARE
  normalized_search text;
BEGIN
  normalized_search := public.normalize_text(search_term);
  
  RETURN QUERY
  SELECT DISTINCT
    c.company_name,
    true AS is_certified
  FROM public.certificates c
  WHERE c.status = 'active'
    AND c.expires_at > now()
    AND c.revoked_at IS NULL
    AND (
      -- Exact normalized match
      public.normalize_text(c.company_name) = normalized_search
      OR
      -- Trigram similarity > 0.3
      similarity(public.normalize_text(c.company_name), normalized_search) > 0.3
      OR
      -- Normalized ILIKE
      public.normalize_text(c.company_name) ILIKE '%' || normalized_search || '%'
      OR
      -- RUT exact match (normalized)
      (c.rut IS NOT NULL AND public.normalize_text(c.rut) = normalized_search)
    )
  ORDER BY similarity(public.normalize_text(c.company_name), normalized_search) DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to anon for public access
GRANT EXECUTE ON FUNCTION public.search_certified_companies(text) TO anon;
GRANT EXECUTE ON FUNCTION public.normalize_text(text) TO anon;
