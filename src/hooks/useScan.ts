import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parsePackageJson, extractDependencies, parseLockfile, flattenDependencies, detectProjectName } from '@/lib/packageParser';
import type { ScanResult } from '@/types/security';

interface ScanProgress {
  status: 'idle' | 'parsing' | 'scanning' | 'completed' | 'failed';
  progress: number;
  message: string;
  scanId?: string;
}

export function useScan() {
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  
  const startScan = async (packageJsonContent: string, lockfileContent?: string): Promise<ScanResult | null> => {
    try {
      setScanProgress({ status: 'parsing', progress: 5, message: 'Parsing package.json...' });
      
      // Parse package.json
      const parsed = parsePackageJson(packageJsonContent);
      const directDeps = extractDependencies(parsed);
      
      setScanProgress({ status: 'parsing', progress: 10, message: 'Extracting dependencies...' });
      
      // Parse lockfile if provided
      let allPackages: Array<{
        name: string;
        version: string;
        isDevDependency: boolean;
        isDirectDependency: boolean;
        depth: number;
        dependencyPath: string[];
      }>;
      
      if (lockfileContent) {
        const lockfileData = parseLockfile(lockfileContent);
        allPackages = flattenDependencies(lockfileData, directDeps);
      } else {
        // Without lockfile, we only have direct dependencies
        allPackages = directDeps.map(d => ({
          name: d.name,
          version: d.version,
          isDevDependency: d.isDevDependency,
          isDirectDependency: true,
          depth: 0,
          dependencyPath: [d.name],
        }));
      }
      
      setScanProgress({ status: 'scanning', progress: 15, message: `Found ${allPackages.length} packages to scan...` });
      
      setScanProgress({ 
        status: 'scanning', 
        progress: 20, 
        message: 'Starting vulnerability scan...',
      });
      
      // Call the edge function to create the scan record AND scan packages
      const { data: scanResult, error: edgeError } = await supabase.functions.invoke(
        'scan-vulnerabilities',
        {
          body: {
            packages: allPackages,
            createScan: {
              project_name: detectProjectName(parsed),
              package_json: packageJsonContent,
              lockfile_content: lockfileContent || null,
              total_dependencies: allPackages.length,
              direct_dependencies: allPackages.filter(p => p.isDirectDependency).length,
              transitive_dependencies: allPackages.filter(p => !p.isDirectDependency).length,
            },
          },
        }
      );
      
      if (edgeError) {
        throw new Error(`Scan failed: ${edgeError.message}`);
      }
      
      const returnedScanId = scanResult?.scanId;
      
      setScanProgress({ 
        status: 'completed', 
        progress: 100, 
        message: 'Scan completed!', 
        scanId: returnedScanId,
      });
      
      // Fetch the completed scan
      const { data: completedScan } = await supabase
        .from('scans')
        .select('*')
        .eq('id', returnedScanId)
        .single();
      
      if (completedScan) {
        return {
          id: completedScan.id,
          projectName: completedScan.project_name,
          timestamp: completedScan.created_at,
          status: completedScan.status as 'pending' | 'scanning' | 'completed' | 'failed',
          progress: completedScan.progress,
          totalPackages: completedScan.total_packages,
          scannedPackages: completedScan.scanned_packages,
          summary: {
            totalDependencies: completedScan.total_dependencies,
            directDependencies: completedScan.direct_dependencies,
            transitiveDependencies: completedScan.transitive_dependencies,
            criticalVulnerabilities: completedScan.critical_vulnerabilities,
            highVulnerabilities: completedScan.high_vulnerabilities,
            mediumVulnerabilities: completedScan.medium_vulnerabilities,
            lowVulnerabilities: completedScan.low_vulnerabilities,
            weakLinkSignals: completedScan.weak_link_signals,
            overallRiskScore: Number(completedScan.overall_risk_score),
            overallRiskGrade: completedScan.overall_risk_grade as 'A' | 'B' | 'C' | 'D' | 'F',
          },
          dependencies: [],
          packageJson: completedScan.package_json,
          lockfileContent: completedScan.lockfile_content || undefined,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Scan error:', error);
      setScanProgress({ 
        status: 'failed', 
        progress: 0, 
        message: error instanceof Error ? error.message : 'Scan failed' 
      });
      return null;
    }
  };
  
  const resetScan = () => {
    setScanProgress({ status: 'idle', progress: 0, message: '' });
  };
  
  return {
    scanProgress,
    startScan,
    resetScan,
  };
}