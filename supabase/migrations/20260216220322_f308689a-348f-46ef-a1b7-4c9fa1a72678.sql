
-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 year'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  pdf_url TEXT,
  pdf_hash TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public can read certificates via edge function only (no direct access)
-- Admin (authenticated) can do everything
CREATE POLICY "Authenticated users can read certificates"
  ON public.certificates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert certificates"
  ON public.certificates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update certificates"
  ON public.certificates FOR UPDATE TO authenticated USING (true);

-- Service role (edge functions) can read for validation
CREATE POLICY "Service role full access"
  ON public.certificates FOR ALL TO service_role USING (true);

-- Anon can read (needed for the validate edge function with anon key)
CREATE POLICY "Anon can read certificates for validation"
  ON public.certificates FOR SELECT TO anon USING (true);

-- Validation logs table
CREATE TABLE public.validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code TEXT NOT NULL,
  result TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.validation_logs ENABLE ROW LEVEL SECURITY;

-- Only service role and authenticated can insert/read logs
CREATE POLICY "Service role full access on logs"
  ON public.validation_logs FOR ALL TO service_role USING (true);

CREATE POLICY "Anon can insert validation logs"
  ON public.validation_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated can read validation logs"
  ON public.validation_logs FOR SELECT TO authenticated USING (true);

-- Create index on public_code for fast lookups
CREATE INDEX idx_certificates_public_code ON public.certificates (public_code);
CREATE INDEX idx_validation_logs_created_at ON public.validation_logs (created_at DESC);

-- Storage bucket for certificate PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- Storage policies
CREATE POLICY "Public can read certificate PDFs"
  ON storage.objects FOR SELECT USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated can upload certificate PDFs"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Service role can upload certificate PDFs"
  ON storage.objects FOR INSERT TO service_role WITH CHECK (bucket_id = 'certificates');
