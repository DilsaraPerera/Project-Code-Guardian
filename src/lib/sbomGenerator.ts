import type { ScanSummary } from '@/hooks/useScans';

interface DependencyData {
  name: string;
  version: string;
  description?: string;
  license?: string;
  repository?: string;
  homepage?: string;
  is_direct_dependency?: boolean;
  is_dev_dependency?: boolean;
  vulnerabilities?: Array<{
    source_id: string;
    severity: string;
    title: string;
    cvss_score?: number;
    description?: string;
    patched_versions?: string;
    reference_urls?: string[];
  }>;
  weak_links?: Array<{
    signal_type: string;
    severity: string;
    message: string;
  }>;
}

export function generateCycloneDX(scan: any, dependencies: DependencyData[]) {
  const bom = {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    serialNumber: `urn:uuid:${scan.id}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{ vendor: "SupplyShield", name: "SupplyShield Scanner", version: "1.0.0" }],
      component: {
        type: "application",
        name: scan.project_name,
        version: "1.0.0",
      },
    },
    components: dependencies.map((dep) => ({
      type: "library",
      name: dep.name,
      version: dep.version,
      description: dep.description || undefined,
      licenses: dep.license ? [{ license: { id: dep.license } }] : undefined,
      externalReferences: [
        dep.homepage ? { type: "website", url: dep.homepage } : null,
        dep.repository ? { type: "vcs", url: dep.repository } : null,
      ].filter(Boolean),
      purl: `pkg:npm/${dep.name}@${dep.version}`,
      scope: dep.is_dev_dependency ? "optional" : "required",
    })),
    vulnerabilities: dependencies.flatMap((dep) =>
      (dep.vulnerabilities || []).map((v) => ({
        id: v.source_id,
        source: { name: "OSV", url: "https://osv.dev" },
        ratings: v.cvss_score
          ? [{ score: v.cvss_score, severity: v.severity, method: "CVSSv3" }]
          : undefined,
        description: v.title,
        recommendation: v.patched_versions ? `Update to ${v.patched_versions}` : "No patch available",
        affects: [{ ref: `pkg:npm/${dep.name}@${dep.version}` }],
      }))
    ),
  };
  return JSON.stringify(bom, null, 2);
}

export function generateSPDX(scan: any, dependencies: DependencyData[]) {
  const spdx = {
    spdxVersion: "SPDX-2.3",
    dataLicense: "CC0-1.0",
    SPDXID: "SPDXRef-DOCUMENT",
    name: `${scan.project_name}-sbom`,
    documentNamespace: `https://supplyshield.app/spdx/${scan.id}`,
    creationInfo: {
      created: new Date().toISOString(),
      creators: ["Tool: SupplyShield-1.0.0"],
    },
    packages: dependencies.map((dep, i) => ({
      SPDXID: `SPDXRef-Package-${i}`,
      name: dep.name,
      versionInfo: dep.version,
      downloadLocation: `https://registry.npmjs.org/${dep.name}/-/${dep.name}-${dep.version}.tgz`,
      filesAnalyzed: false,
      licenseConcluded: dep.license || "NOASSERTION",
      licenseDeclared: dep.license || "NOASSERTION",
      copyrightText: "NOASSERTION",
      externalRefs: [
        {
          referenceCategory: "PACKAGE-MANAGER",
          referenceType: "purl",
          referenceLocator: `pkg:npm/${dep.name}@${dep.version}`,
        },
      ],
    })),
    relationships: dependencies.map((_, i) => ({
      spdxElementId: "SPDXRef-DOCUMENT",
      relationshipType: "DESCRIBES",
      relatedSpdxElement: `SPDXRef-Package-${i}`,
    })),
  };
  return JSON.stringify(spdx, null, 2);
}

export function generateJSONExport(scan: any, dependencies: DependencyData[]) {
  return JSON.stringify(
    {
      scan: {
        id: scan.id,
        projectName: scan.project_name,
        createdAt: scan.created_at,
        riskGrade: scan.overall_risk_grade,
        riskScore: scan.overall_risk_score,
        totalDependencies: scan.total_dependencies,
        criticalVulnerabilities: scan.critical_vulnerabilities,
        highVulnerabilities: scan.high_vulnerabilities,
        mediumVulnerabilities: scan.medium_vulnerabilities,
        lowVulnerabilities: scan.low_vulnerabilities,
        weakLinkSignals: scan.weak_link_signals,
      },
      dependencies: dependencies.map((dep) => ({
        name: dep.name,
        version: dep.version,
        license: dep.license,
        isDirect: dep.is_direct_dependency,
        isDev: dep.is_dev_dependency,
        vulnerabilities: dep.vulnerabilities || [],
        weakLinks: dep.weak_links || [],
      })),
    },
    null,
    2
  );
}

export function generateSecurityReportHTML(scan: any, dependencies: DependencyData[], type: 'executive' | 'full' | 'remediation') {
  const totalVulns = scan.critical_vulnerabilities + scan.high_vulnerabilities + scan.medium_vulnerabilities + scan.low_vulnerabilities;
  const gradeColor: Record<string, string> = { A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', F: '#ef4444' };
  const color = gradeColor[scan.overall_risk_grade] || '#888';
  const date = new Date(scan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
      h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
      h2 { color: #334155; margin-top: 32px; }
      .grade { display: inline-block; font-size: 48px; font-weight: bold; color: ${color}; border: 3px solid ${color}; border-radius: 12px; padding: 8px 20px; }
      .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0; }
      .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
      .stat-value { font-size: 24px; font-weight: bold; }
      .critical { color: #dc2626; } .high { color: #f97316; } .medium { color: #eab308; } .low { color: #3b82f6; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th, td { padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
      th { background: #f1f5f9; font-weight: 600; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
      .badge-critical { background: #fee2e2; color: #dc2626; } .badge-high { background: #ffedd5; color: #f97316; }
      .badge-medium { background: #fef9c3; color: #ca8a04; } .badge-low { background: #dbeafe; color: #3b82f6; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    </style>`;

  if (type === 'executive') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Executive Summary - ${scan.project_name}</title>${styles}</head><body>
      <h1>🛡️ SupplyShield Executive Summary</h1>
      <p><strong>Project:</strong> ${scan.project_name} &nbsp;|&nbsp; <strong>Date:</strong> ${date}</p>
      <div class="grade">Grade ${scan.overall_risk_grade}</div>
      <p>Risk Score: ${Number(scan.overall_risk_score).toFixed(1)} / 100</p>
      <div class="stat-grid">
        <div class="stat"><div class="stat-value">${scan.total_dependencies}</div>Dependencies</div>
        <div class="stat"><div class="stat-value critical">${scan.critical_vulnerabilities}</div>Critical</div>
        <div class="stat"><div class="stat-value high">${scan.high_vulnerabilities}</div>High</div>
        <div class="stat"><div class="stat-value medium">${scan.medium_vulnerabilities + scan.low_vulnerabilities}</div>Med/Low</div>
      </div>
      <h2>Key Findings</h2>
      <ul>
        <li>${totalVulns} total vulnerabilities found across ${scan.total_dependencies} dependencies</li>
        <li>${scan.weak_link_signals} weak-link supply chain signals detected</li>
        <li>${scan.critical_vulnerabilities + scan.high_vulnerabilities} critical/high issues require immediate attention</li>
      </ul>
      <div class="footer">Generated by SupplyShield • ${new Date().toISOString()}</div></body></html>`;
  }

  const vulnRows = dependencies.flatMap(dep =>
    (dep.vulnerabilities || []).map(v => `<tr>
      <td><span class="badge badge-${v.severity}">${v.severity}</span></td>
      <td>${v.source_id}</td><td>${dep.name}@${dep.version}</td>
      <td>${v.title}</td><td>${v.cvss_score ?? 'N/A'}</td>
      <td>${v.patched_versions || 'None'}</td></tr>`)
  ).join('');

  if (type === 'full') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Full Security Report - ${scan.project_name}</title>${styles}</head><body>
      <h1>🛡️ SupplyShield Full Security Report</h1>
      <p><strong>Project:</strong> ${scan.project_name} &nbsp;|&nbsp; <strong>Date:</strong> ${date} &nbsp;|&nbsp; <strong>Grade:</strong> <span style="color:${color};font-weight:bold">${scan.overall_risk_grade}</span></p>
      <div class="stat-grid">
        <div class="stat"><div class="stat-value">${scan.total_dependencies}</div>Total Deps</div>
        <div class="stat"><div class="stat-value critical">${scan.critical_vulnerabilities}</div>Critical</div>
        <div class="stat"><div class="stat-value high">${scan.high_vulnerabilities}</div>High</div>
        <div class="stat"><div class="stat-value">${scan.weak_link_signals}</div>Weak Links</div>
      </div>
      <h2>All Vulnerabilities</h2>
      <table><thead><tr><th>Severity</th><th>ID</th><th>Package</th><th>Title</th><th>CVSS</th><th>Fix</th></tr></thead>
      <tbody>${vulnRows || '<tr><td colspan="6">No vulnerabilities found</td></tr>'}</tbody></table>
      <div class="footer">Generated by SupplyShield • ${new Date().toISOString()}</div></body></html>`;
  }

  // Remediation
  const remediationRows = dependencies.flatMap(dep =>
    (dep.vulnerabilities || []).filter(v => v.patched_versions).map(v =>
      `<tr><td>${dep.name}</td><td>${dep.version}</td><td>${v.patched_versions}</td>
       <td><span class="badge badge-${v.severity}">${v.severity}</span></td>
       <td>${v.source_id}: ${v.title}</td></tr>`)
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Remediation Guide - ${scan.project_name}</title>${styles}</head><body>
    <h1>🛡️ SupplyShield Remediation Guide</h1>
    <p><strong>Project:</strong> ${scan.project_name} &nbsp;|&nbsp; <strong>Date:</strong> ${date}</p>
    <h2>Packages to Update</h2>
    <table><thead><tr><th>Package</th><th>Current</th><th>Fix Version</th><th>Severity</th><th>Issue</th></tr></thead>
    <tbody>${remediationRows || '<tr><td colspan="5">No actionable remediations</td></tr>'}</tbody></table>
    <h2>General Recommendations</h2>
    <ul>
      <li>Run <code>npm audit fix</code> to auto-fix compatible updates</li>
      <li>Review and update packages with critical/high vulnerabilities first</li>
      <li>Remove unused dependencies to reduce attack surface</li>
      <li>Enable automated dependency updates (e.g., Dependabot, Renovate)</li>
    </ul>
    <div class="footer">Generated by SupplyShield • ${new Date().toISOString()}</div></body></html>`;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadHTMLAsPrintable(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      win.print();
    };
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
