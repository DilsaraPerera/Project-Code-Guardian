
-- Drop overly permissive INSERT policies
DROP POLICY IF EXISTS "Public insert access for dependencies" ON public.dependencies;
DROP POLICY IF EXISTS "Public insert access for maintainers" ON public.maintainers;
DROP POLICY IF EXISTS "Public insert access for vulnerabilities" ON public.vulnerabilities;
DROP POLICY IF EXISTS "Public insert access for weak_links" ON public.weak_links;
DROP POLICY IF EXISTS "Public insert access for scans" ON public.scans;
DROP POLICY IF EXISTS "Public update access for scans" ON public.scans;

-- Re-create INSERT policies restricted to service_role only
CREATE POLICY "Service role insert for scans" ON public.scans FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role update for scans" ON public.scans FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service role insert for dependencies" ON public.dependencies FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert for maintainers" ON public.maintainers FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert for vulnerabilities" ON public.vulnerabilities FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role insert for weak_links" ON public.weak_links FOR INSERT TO service_role WITH CHECK (true);

-- Allow public to insert scans (needed for client-side scan creation) but only specific fields
CREATE POLICY "Public insert for scans" ON public.scans FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow public to delete scans (for scan deletion feature)
CREATE POLICY "Public delete for scans" ON public.scans FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Service role delete for dependencies" ON public.dependencies FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role delete for maintainers" ON public.maintainers FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role delete for vulnerabilities" ON public.vulnerabilities FOR DELETE TO service_role USING (true);
CREATE POLICY "Service role delete for weak_links" ON public.weak_links FOR DELETE TO service_role USING (true);

-- Add foreign key constraints with CASCADE if not already present
-- First drop existing constraints and re-add with CASCADE
ALTER TABLE public.dependencies DROP CONSTRAINT IF EXISTS dependencies_scan_id_fkey;
ALTER TABLE public.dependencies ADD CONSTRAINT dependencies_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scans(id) ON DELETE CASCADE;

ALTER TABLE public.maintainers DROP CONSTRAINT IF EXISTS maintainers_dependency_id_fkey;
ALTER TABLE public.maintainers ADD CONSTRAINT maintainers_dependency_id_fkey FOREIGN KEY (dependency_id) REFERENCES public.dependencies(id) ON DELETE CASCADE;

ALTER TABLE public.vulnerabilities DROP CONSTRAINT IF EXISTS vulnerabilities_dependency_id_fkey;
ALTER TABLE public.vulnerabilities ADD CONSTRAINT vulnerabilities_dependency_id_fkey FOREIGN KEY (dependency_id) REFERENCES public.dependencies(id) ON DELETE CASCADE;

ALTER TABLE public.weak_links DROP CONSTRAINT IF EXISTS weak_links_dependency_id_fkey;
ALTER TABLE public.weak_links ADD CONSTRAINT weak_links_dependency_id_fkey FOREIGN KEY (dependency_id) REFERENCES public.dependencies(id) ON DELETE CASCADE;
