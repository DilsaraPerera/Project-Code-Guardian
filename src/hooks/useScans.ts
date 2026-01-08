import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ScanSummary {
  id: string;
  projectName: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  createdAt: string;
  totalDependencies: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  weakLinkSignals: number;
  overallRiskScore: number;
  overallRiskGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export function useScans(limit?: number) {
  return useQuery({
    queryKey: ['scans', limit],
    queryFn: async (): Promise<ScanSummary[]> => {
      let query = supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return (data || []).map(scan => ({
        id: scan.id,
        projectName: scan.project_name,
        status: scan.status as 'pending' | 'scanning' | 'completed' | 'failed',
        createdAt: scan.created_at,
        totalDependencies: scan.total_dependencies,
        criticalVulnerabilities: scan.critical_vulnerabilities,
        highVulnerabilities: scan.high_vulnerabilities,
        mediumVulnerabilities: scan.medium_vulnerabilities,
        lowVulnerabilities: scan.low_vulnerabilities,
        weakLinkSignals: scan.weak_link_signals,
        overallRiskScore: Number(scan.overall_risk_score),
        overallRiskGrade: scan.overall_risk_grade as 'A' | 'B' | 'C' | 'D' | 'F',
      }));
    },
  });
}

export function useScanDetails(scanId: string | undefined) {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: async () => {
      if (!scanId) return null;
      
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();
      
      if (scanError) throw scanError;
      
      const { data: dependencies, error: depsError } = await supabase
        .from('dependencies')
        .select(`
          *,
          vulnerabilities (*),
          weak_links (*),
          maintainers (*)
        `)
        .eq('scan_id', scanId)
        .order('risk_score', { ascending: false });
      
      if (depsError) throw depsError;
      
      return {
        scan,
        dependencies: dependencies || [],
      };
    },
    enabled: !!scanId,
  });
}