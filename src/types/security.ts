// Core types for the security scanner

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Dependency {
  name: string;
  version: string;
  isDevDependency: boolean;
  directDependency: boolean;
  dependencies?: Record<string, string>;
}

export interface ParsedPackageJson {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts?: Record<string, string>;
}

export interface Vulnerability {
  id: string;
  source: 'osv' | 'github' | 'npm' | 'snyk';
  severity: SeverityLevel;
  title: string;
  description: string;
  affectedVersions: string;
  patchedVersions?: string;
  cweIds?: string[];
  cvssScore?: number;
  references: string[];
  publishedDate: string;
}

export interface WeakLinkSignal {
  type: 'install-script' | 'maintainer-inactive' | 'deprecated' | 'typosquatting' | 'high-depth' | 'suspicious-domain' | 'low-downloads' | 'single-maintainer';
  severity: SeverityLevel;
  message: string;
  details?: string;
}

export interface PackageMetadata {
  name: string;
  version: string;
  description?: string;
  license?: string;
  repository?: string;
  homepage?: string;
  maintainers: {
    name: string;
    email?: string;
  }[];
  lastPublished: string;
  weeklyDownloads: number;
  hasInstallScripts: boolean;
  deprecated?: string;
  dependencies: number;
  devDependencies: number;
}

export interface DependencyAnalysis {
  package: PackageMetadata;
  vulnerabilities: Vulnerability[];
  weakLinks: WeakLinkSignal[];
  riskScore: number;
  riskLevel: SeverityLevel;
  depth: number;
  dependencyPath: string[];
}

export interface ScanResult {
  id: string;
  projectName: string;
  timestamp: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  progress: number;
  totalPackages: number;
  scannedPackages: number;
  
  // Summary stats
  summary: {
    totalDependencies: number;
    directDependencies: number;
    transitiveDependencies: number;
    
    // Vulnerability counts
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    
    // Weak link counts
    weakLinkSignals: number;
    
    // Overall risk
    overallRiskScore: number;
    overallRiskGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  
  // Detailed analysis per package
  dependencies: DependencyAnalysis[];
  
  // The original package.json content
  packageJson: string;
  lockfileContent?: string;
}

export interface SBOMEntry {
  bomRef: string;
  type: 'library';
  name: string;
  version: string;
  purl: string;
  licenses?: string[];
  hashes?: {
    alg: string;
    content: string;
  }[];
  externalReferences?: {
    type: string;
    url: string;
  }[];
}

export interface SBOM {
  bomFormat: 'CycloneDX' | 'SPDX';
  specVersion: string;
  version: number;
  metadata: {
    timestamp: string;
    tools: {
      vendor: string;
      name: string;
      version: string;
    }[];
    component: {
      name: string;
      version: string;
      type: string;
    };
  };
  components: SBOMEntry[];
}
