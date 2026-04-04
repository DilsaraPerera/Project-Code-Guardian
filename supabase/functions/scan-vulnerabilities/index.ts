import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OSVResponse {
  vulns?: Array<{
    id: string;
    summary?: string;
    details?: string;
    severity?: Array<{ type: string; score: string }>;
    affected?: Array<{
      package?: { name: string };
      ranges?: Array<{ events: Array<{ introduced?: string; fixed?: string }> }>;
    }>;
    references?: Array<{ type: string; url: string }>;
    published?: string;
    database_specific?: { cwe_ids?: string[] };
  }>;
}

interface NpmPackageInfo {
  name: string;
  version: string;
  description?: string;
  license?: string | { type?: string };
  repository?: { url?: string };
  homepage?: string;
  maintainers?: Array<{ name: string; email?: string }>;
  time?: Record<string, string>;
  deprecated?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// Query OSV Database for vulnerabilities
async function queryOSV(packageName: string, version: string): Promise<OSVResponse> {
  try {
    const response = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package: { name: packageName, ecosystem: 'npm' },
        version: version,
      }),
    });
    
    if (!response.ok) {
      console.error(`OSV API error for ${packageName}@${version}: ${response.status}`);
      return { vulns: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error(`OSV query failed for ${packageName}:`, error);
    return { vulns: [] };
  }
}

// Get package metadata from npm registry
async function getNpmPackageInfo(packageName: string, version: string): Promise<NpmPackageInfo | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/${version}`);
    if (!response.ok) {
      console.error(`npm registry error for ${packageName}@${version}: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`npm registry query failed for ${packageName}:`, error);
    return null;
  }
}

// Get download stats from npm
async function getNpmDownloads(packageName: string): Promise<number> {
  try {
    const response = await fetch(`https://api.npmjs.org/downloads/point/last-week/${packageName}`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.downloads || 0;
  } catch {
    return 0;
  }
}

// Map CVSS score to severity
function cvssToSeverity(score: number): string {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  if (score >= 0.1) return 'low';
  return 'info';
}

// Detect weak link signals
function detectWeakLinks(
  packageInfo: NpmPackageInfo | null,
  weeklyDownloads: number,
  depth: number
): Array<{ signal_type: string; severity: string; message: string; details?: string }> {
  const signals: Array<{ signal_type: string; severity: string; message: string; details?: string }> = [];
  
  if (!packageInfo) return signals;
  
  // Check for install scripts
  const dangerousScripts = ['preinstall', 'postinstall', 'install'];
  const scripts = packageInfo.scripts || {};
  for (const script of dangerousScripts) {
    if (scripts[script]) {
      signals.push({
        signal_type: 'install-script',
        severity: 'high',
        message: `Package has ${script} script that runs during installation`,
        details: `Script content: ${scripts[script]?.substring(0, 200)}...`,
      });
    }
  }
  
  // Check for deprecation
  if (packageInfo.deprecated) {
    signals.push({
      signal_type: 'deprecated',
      severity: 'medium',
      message: 'Package is deprecated',
      details: packageInfo.deprecated,
    });
  }
  
  // Check for low downloads (potential typosquatting indicator)
  if (weeklyDownloads < 100) {
    signals.push({
      signal_type: 'low-downloads',
      severity: 'medium',
      message: `Very low weekly downloads (${weeklyDownloads})`,
      details: 'Packages with very few downloads may be typosquatting attempts or unmaintained',
    });
  }
  
  // Check for high dependency depth
  if (depth > 5) {
    signals.push({
      signal_type: 'high-depth',
      severity: 'low',
      message: `Deep transitive dependency (depth: ${depth})`,
      details: 'Deep dependencies are harder to audit and update',
    });
  }
  
  // Check for single maintainer
  if (packageInfo.maintainers && packageInfo.maintainers.length === 1) {
    signals.push({
      signal_type: 'single-maintainer',
      severity: 'info',
      message: 'Package has only one maintainer',
      details: 'Single maintainer packages may have slower response to security issues',
    });
  }
  
  return signals;
}

// Calculate risk score
function calculateRiskScore(
  vulnerabilities: Array<{ severity: string; cvss_score?: number }>,
  weakLinks: Array<{ severity: string }>
): number {
  let score = 0;
  
  // Vulnerability scoring
  for (const vuln of vulnerabilities) {
    switch (vuln.severity) {
      case 'critical': score += 40; break;
      case 'high': score += 25; break;
      case 'medium': score += 10; break;
      case 'low': score += 3; break;
    }
  }
  
  // Weak link scoring
  for (const signal of weakLinks) {
    switch (signal.severity) {
      case 'critical': score += 20; break;
      case 'high': score += 12; break;
      case 'medium': score += 5; break;
      case 'low': score += 2; break;
    }
  }
  
  return Math.min(score, 100);
}

function getRiskLevel(score: number): string {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  if (score >= 10) return 'low';
  return 'info';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { scanId, packages, createScan } = await req.json();
    
    if (!packages || !Array.isArray(packages)) {
      return new Response(
        JSON.stringify({ error: 'Missing packages array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    let activeScanId = scanId;
    
    // If createScan payload is provided, create the scan record server-side
    if (createScan && !scanId) {
      const { data: newScan, error: createError } = await supabase
        .from('scans')
        .insert({
          project_name: createScan.project_name || 'Unknown Project',
          status: 'scanning',
          progress: 15,
          total_packages: packages.length,
          scanned_packages: 0,
          package_json: createScan.package_json,
          lockfile_content: createScan.lockfile_content || null,
          total_dependencies: createScan.total_dependencies || packages.length,
          direct_dependencies: createScan.direct_dependencies || 0,
          transitive_dependencies: createScan.transitive_dependencies || 0,
        })
        .select()
        .single();
      
      if (createError || !newScan) {
        return new Response(
          JSON.stringify({ error: 'Failed to create scan record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      activeScanId = newScan.id;
    }
    
    if (!activeScanId) {
      return new Response(
        JSON.stringify({ error: 'Missing scanId or createScan payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const results = [];
    let totalCritical = 0, totalHigh = 0, totalMedium = 0, totalLow = 0;
    let totalWeakLinks = 0;
    let totalRiskScore = 0;
    
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const { name, version, isDevDependency, isDirectDependency, depth, dependencyPath } = pkg;
      
      // Update progress
      await supabase
        .from('scans')
        .update({ 
          scanned_packages: i + 1,
          progress: Math.round(((i + 1) / packages.length) * 100)
        })
        .eq('id', scanId);
      
      // Query OSV for vulnerabilities
      const osvResponse = await queryOSV(name, version);
      
      // Get npm package info
      const npmInfo = await getNpmPackageInfo(name, version);
      const weeklyDownloads = await getNpmDownloads(name);
      
      // Detect weak links
      const weakLinks = detectWeakLinks(npmInfo, weeklyDownloads, depth || 0);
      
      // Parse vulnerabilities
      const vulnerabilities = (osvResponse.vulns || []).map(vuln => {
        const cvssScore = vuln.severity?.[0]?.score 
          ? parseFloat(vuln.severity[0].score) 
          : undefined;
        
        return {
          source_id: vuln.id,
          source: 'osv',
          severity: cvssScore ? cvssToSeverity(cvssScore) : 'medium',
          title: vuln.summary || vuln.id,
          description: vuln.details?.substring(0, 1000),
          affected_versions: vuln.affected?.[0]?.ranges?.[0]?.events
            ?.map(e => e.introduced ? `>=${e.introduced}` : e.fixed ? `<${e.fixed}` : '')
            .filter(Boolean)
            .join(' ') || null,
          patched_versions: vuln.affected?.[0]?.ranges?.[0]?.events
            ?.find(e => e.fixed)?.fixed || null,
          cwe_ids: vuln.database_specific?.cwe_ids || [],
          cvss_score: cvssScore,
          reference_urls: (vuln.references || []).map(r => r.url),
          published_date: vuln.published || null,
        };
      });
      
      // Count by severity
      for (const v of vulnerabilities) {
        switch (v.severity) {
          case 'critical': totalCritical++; break;
          case 'high': totalHigh++; break;
          case 'medium': totalMedium++; break;
          case 'low': totalLow++; break;
        }
      }
      totalWeakLinks += weakLinks.length;
      
      // Calculate risk score
      const riskScore = calculateRiskScore(vulnerabilities, weakLinks);
      totalRiskScore += riskScore;
      const riskLevel = getRiskLevel(riskScore);
      
      // Get license string
      let licenseStr: string | undefined;
      if (npmInfo?.license) {
        if (typeof npmInfo.license === 'string') {
          licenseStr = npmInfo.license;
        } else if (typeof npmInfo.license === 'object' && 'type' in npmInfo.license) {
          licenseStr = (npmInfo.license as { type?: string }).type;
        }
      }

      // Insert dependency
      const { data: depData, error: depError } = await supabase
        .from('dependencies')
        .insert({
          scan_id: scanId,
          name,
          version,
          description: npmInfo?.description,
          license: licenseStr,
          repository: npmInfo?.repository?.url,
          homepage: npmInfo?.homepage,
          last_published: npmInfo?.time?.[version] || null,
          weekly_downloads: weeklyDownloads,
          has_install_scripts: !!(npmInfo?.scripts?.preinstall || npmInfo?.scripts?.postinstall || npmInfo?.scripts?.install),
          deprecated: npmInfo?.deprecated,
          dependency_count: Object.keys(npmInfo?.dependencies || {}).length,
          dev_dependency_count: Object.keys(npmInfo?.devDependencies || {}).length,
          is_dev_dependency: isDevDependency || false,
          is_direct_dependency: isDirectDependency !== false,
          depth: depth || 0,
          dependency_path: dependencyPath || [],
          risk_score: riskScore,
          risk_level: riskLevel,
        })
        .select()
        .single();
      
      if (depError) {
        console.error(`Error inserting dependency ${name}:`, depError);
        continue;
      }
      
      // Insert maintainers
      if (npmInfo?.maintainers && depData) {
        for (const maintainer of npmInfo.maintainers) {
          await supabase.from('maintainers').insert({
            dependency_id: depData.id,
            name: maintainer.name,
            email: maintainer.email,
          });
        }
      }
      
      // Insert vulnerabilities
      if (depData) {
        for (const vuln of vulnerabilities) {
          await supabase.from('vulnerabilities').insert({
            dependency_id: depData.id,
            ...vuln,
          });
        }
      }
      
      // Insert weak links
      if (depData) {
        for (const signal of weakLinks) {
          await supabase.from('weak_links').insert({
            dependency_id: depData.id,
            ...signal,
          });
        }
      }
      
      results.push({
        name,
        version,
        vulnerabilities: vulnerabilities.length,
        weakLinks: weakLinks.length,
        riskScore,
        riskLevel,
      });
    }
    
    // Calculate overall risk grade
    const avgRisk = packages.length > 0 ? totalRiskScore / packages.length : 0;
    let overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (avgRisk < 10) overallGrade = 'A';
    else if (avgRisk < 25) overallGrade = 'B';
    else if (avgRisk < 50) overallGrade = 'C';
    else if (avgRisk < 70) overallGrade = 'D';
    else overallGrade = 'F';
    
    // Update scan with final results
    await supabase
      .from('scans')
      .update({
        status: 'completed',
        progress: 100,
        scanned_packages: packages.length,
        critical_vulnerabilities: totalCritical,
        high_vulnerabilities: totalHigh,
        medium_vulnerabilities: totalMedium,
        low_vulnerabilities: totalLow,
        weak_link_signals: totalWeakLinks,
        overall_risk_score: avgRisk,
        overall_risk_grade: overallGrade,
      })
      .eq('id', scanId);
    
    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        summary: {
          totalPackages: packages.length,
          criticalVulnerabilities: totalCritical,
          highVulnerabilities: totalHigh,
          mediumVulnerabilities: totalMedium,
          lowVulnerabilities: totalLow,
          weakLinkSignals: totalWeakLinks,
          overallRiskScore: avgRisk,
          overallRiskGrade: overallGrade,
        },
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Scan error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});