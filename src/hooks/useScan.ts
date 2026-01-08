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
      
      // Create scan record
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .insert({
          project_name: detectProjectName(parsed),
          status: 'scanning',
          progress: 15,
          total_packages: allPackages.length,
          scanned_packages: 0,
          package_json: packageJsonContent,
          lockfile_content: lockfileContent || null,
          total_dependencies: allPackages.length,
          direct_dependencies: allPackages.filter(p => p.isDirectDependency).length,
          transitive_dependencies: allPackages.filter(p => !p.isDirectDependency).length,
        })
        .select()
        .single();
      
      if (scanError || !scanData) {
        throw new Error('Failed to create scan record');
      }
      
      setScanProgress({ 
        status: 'scanning', 
        progress: 20, 
        message: 'Starting vulnerability scan...', 
        scanId: scanData.id 
      });
      
      // Call the edge function to scan
      const { data: scanResult, error: edgeError } = await supabase.functions.invoke(
        'scan-vulnerabilities',
        {
          body: {
            scanId: scanData.id,
            packages: allPackages,
          },
        }
      );
      
      if (edgeError) {
        throw new Error(`Scan failed: ${edgeError.message}`);
      }
      
      setScanProgress({ 
        status: 'completed', 
        progress: 100, 
        message: 'Scan completed!', 
        scanId: scanData.id 
      });
      
      // Fetch the completed scan
      const { data: completedScan } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanData.id)
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