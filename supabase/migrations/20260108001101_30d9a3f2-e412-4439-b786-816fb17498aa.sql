-- Create enum for severity levels
CREATE TYPE public.severity_level AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- Create enum for scan status
CREATE TYPE public.scan_status AS ENUM ('pending', 'scanning', 'completed', 'failed');

-- Create enum for risk grade
CREATE TYPE public.risk_grade AS ENUM ('A', 'B', 'C', 'D', 'F');

-- Create scans table to store scan results
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    status scan_status NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0,
    total_packages INTEGER NOT NULL DEFAULT 0,
    scanned_packages INTEGER NOT NULL DEFAULT 0,
    package_json TEXT NOT NULL,
    lockfile_content TEXT,
    
    total_dependencies INTEGER NOT NULL DEFAULT 0,
    direct_dependencies INTEGER NOT NULL DEFAULT 0,
    transitive_dependencies INTEGER NOT NULL DEFAULT 0,
    critical_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    high_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    medium_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    low_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    weak_link_signals INTEGER NOT NULL DEFAULT 0,
    overall_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    overall_risk_grade risk_grade NOT NULL DEFAULT 'A',
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dependencies table
CREATE TABLE public.dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    license TEXT,
    repository TEXT,
    homepage TEXT,
    last_published TIMESTAMP WITH TIME ZONE,
    weekly_downloads INTEGER DEFAULT 0,
    has_install_scripts BOOLEAN DEFAULT false,
    deprecated TEXT,
    dependency_count INTEGER DEFAULT 0,
    dev_dependency_count INTEGER DEFAULT 0,
    
    is_dev_dependency BOOLEAN DEFAULT false,
    is_direct_dependency BOOLEAN DEFAULT true,
    depth INTEGER DEFAULT 0,
    dependency_path TEXT[] DEFAULT '{}',
    risk_score DECIMAL(5,2) DEFAULT 0,
    risk_level severity_level DEFAULT 'info',
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(scan_id, name, version)
);

-- Create maintainers table
CREATE TABLE public.maintainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dependency_id UUID REFERENCES public.dependencies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vulnerabilities table
CREATE TABLE public.vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dependency_id UUID REFERENCES public.dependencies(id) ON DELETE CASCADE NOT NULL,
    
    source_id TEXT NOT NULL,
    source TEXT NOT NULL,
    severity severity_level NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    affected_versions TEXT,
    patched_versions TEXT,
    cwe_ids TEXT[] DEFAULT '{}',
    cvss_score DECIMAL(3,1),
    reference_urls TEXT[] DEFAULT '{}',
    published_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(dependency_id, source_id)
);

-- Create weak_links table
CREATE TABLE public.weak_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dependency_id UUID REFERENCES public.dependencies(id) ON DELETE CASCADE NOT NULL,
    
    signal_type TEXT NOT NULL,
    severity severity_level NOT NULL,
    message TEXT NOT NULL,
    details TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_links ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Public read access for scans" ON public.scans FOR SELECT USING (true);
CREATE POLICY "Public insert access for scans" ON public.scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for scans" ON public.scans FOR UPDATE USING (true);

CREATE POLICY "Public read access for dependencies" ON public.dependencies FOR SELECT USING (true);
CREATE POLICY "Public insert access for dependencies" ON public.dependencies FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access for maintainers" ON public.maintainers FOR SELECT USING (true);
CREATE POLICY "Public insert access for maintainers" ON public.maintainers FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access for vulnerabilities" ON public.vulnerabilities FOR SELECT USING (true);
CREATE POLICY "Public insert access for vulnerabilities" ON public.vulnerabilities FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access for weak_links" ON public.weak_links FOR SELECT USING (true);
CREATE POLICY "Public insert access for weak_links" ON public.weak_links FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_dependencies_scan_id ON public.dependencies(scan_id);
CREATE INDEX idx_dependencies_name ON public.dependencies(name);
CREATE INDEX idx_vulnerabilities_dependency_id ON public.vulnerabilities(dependency_id);
CREATE INDEX idx_vulnerabilities_severity ON public.vulnerabilities(severity);
CREATE INDEX idx_weak_links_dependency_id ON public.weak_links(dependency_id);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER update_scans_updated_at
BEFORE UPDATE ON public.scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();