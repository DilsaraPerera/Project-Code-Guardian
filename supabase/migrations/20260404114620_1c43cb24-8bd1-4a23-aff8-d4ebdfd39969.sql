
-- 1. Remove dangerous public DELETE and INSERT policies on scans
DROP POLICY IF EXISTS "Public delete for scans" ON public.scans;
DROP POLICY IF EXISTS "Public insert for scans" ON public.scans;

-- Add service-role-only DELETE for scans
CREATE POLICY "Service role delete for scans"
ON public.scans
FOR DELETE
TO service_role
USING (true);

-- 2. Fix maintainers: replace public read with service-role-only read
-- The email column contains sensitive PII (package maintainer emails)
DROP POLICY IF EXISTS "Public read access for maintainers" ON public.maintainers;

-- Create a view that excludes email for public access
CREATE OR REPLACE VIEW public.maintainers_public AS
SELECT id, dependency_id, name, created_at
FROM public.maintainers;

-- Allow service_role full read (edge functions need emails for scanning)
CREATE POLICY "Service role read for maintainers"
ON public.maintainers
FOR SELECT
TO service_role
USING (true);

-- Allow authenticated/anon to read only via the view (no email)
-- Grant access to the view
GRANT SELECT ON public.maintainers_public TO anon, authenticated;
