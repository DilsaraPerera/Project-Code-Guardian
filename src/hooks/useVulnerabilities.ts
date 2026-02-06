import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VulnerabilityDetail {
  id: string;
  sourceId: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string | null;
  affectedVersions: string | null;
  patchedVersions: string | null;
  cvssScore: number | null;
  cweIds: string[];
  publishedDate: string | null;
  referenceUrls: string[];
  // Joined from dependencies
  packageName: string;
  packageVersion: string;
  dependencyPath: string[];
  isDirectDependency: boolean;
}

export function useVulnerabilities(scanId: string | undefined) {
  return useQuery({
    queryKey: ['vulnerabilities', scanId],
    queryFn: async (): Promise<VulnerabilityDetail[]> => {
      if (!scanId) return [];

      const { data, error } = await supabase
        .from('vulnerabilities')
        .select(`
          id, source_id, source, severity, title, description,
          affected_versions, patched_versions, cvss_score,
          cwe_ids, published_date, reference_urls,
          dependencies!inner (
            name, version, dependency_path, is_direct_dependency, scan_id
          )
        `)
        .eq('dependencies.scan_id', scanId)
        .order('cvss_score', { ascending: false, nullsFirst: false });

      if (error) throw error;

      return (data || []).map((v: any) => ({
        id: v.id,
        sourceId: v.source_id,
        source: v.source,
        severity: v.severity as VulnerabilityDetail['severity'],
        title: v.title,
        description: v.description,
        affectedVersions: v.affected_versions,
        patchedVersions: v.patched_versions,
        cvssScore: v.cvss_score ? Number(v.cvss_score) : null,
        cweIds: v.cwe_ids || [],
        publishedDate: v.published_date,
        referenceUrls: v.reference_urls || [],
        packageName: v.dependencies?.name || 'unknown',
        packageVersion: v.dependencies?.version || '',
        dependencyPath: v.dependencies?.dependency_path || [],
        isDirectDependency: v.dependencies?.is_direct_dependency ?? true,
      }));
    },
    enabled: !!scanId,
  });
}
