import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Download, FileJson, FileCode, Loader2
} from "lucide-react";
import { useScans } from "@/hooks/useScans";
import { useScanDetails } from "@/hooks/useScans";
import { useToast } from "@/hooks/use-toast";
import {
  generateCycloneDX,
  generateSPDX,
  generateJSONExport,
  generateSecurityReportHTML,
  downloadFile,
  downloadHTMLAsPrintable,
} from "@/lib/sbomGenerator";

export default function Reports() {
  const { data: scans } = useScans();
  const [selectedScanId, setSelectedScanId] = useState<string>("");
  const { data: scanDetails, isLoading } = useScanDetails(selectedScanId || undefined);
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const completedScans = (scans || []).filter(s => s.status === "completed");

  const handleExport = (format: 'cyclonedx' | 'spdx' | 'json') => {
    if (!scanDetails) return;
    setGenerating(format);
    try {
      const { scan, dependencies } = scanDetails;
      let content: string;
      let filename: string;
      if (format === 'cyclonedx') {
        content = generateCycloneDX(scan, dependencies);
        filename = `${scan.project_name}-sbom-cyclonedx.json`;
      } else if (format === 'spdx') {
        content = generateSPDX(scan, dependencies);
        filename = `${scan.project_name}-sbom-spdx.json`;
      } else {
        content = generateJSONExport(scan, dependencies);
        filename = `${scan.project_name}-export.json`;
      }
      downloadFile(content, filename, 'application/json');
      toast({ title: "Export complete", description: `${filename} downloaded` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
    setGenerating(null);
  };

  const handleReport = (type: 'executive' | 'full' | 'remediation') => {
    if (!scanDetails) return;
    setGenerating(type);
    try {
      const { scan, dependencies } = scanDetails;
      const html = generateSecurityReportHTML(scan, dependencies, type);
      const labels = { executive: 'Executive Summary', full: 'Full Security Report', remediation: 'Remediation Guide' };
      downloadHTMLAsPrintable(html, `${scan.project_name}-${type}-report.html`);
      toast({ title: "Report generated", description: `${labels[type]} opened for printing/saving as PDF` });
    } catch {
      toast({ title: "Report generation failed", variant: "destructive" });
    }
    setGenerating(null);
  };

  const hasScan = !!scanDetails && !isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & SBOM</h1>
        <p className="text-sm text-muted-foreground">
          Generate security reports and Software Bill of Materials
        </p>
      </div>

      {/* Scan selector */}
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-sm font-medium text-foreground">Select scan:</span>
            <Select value={selectedScanId} onValueChange={setSelectedScanId}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Choose a completed scan..." />
              </SelectTrigger>
              <SelectContent>
                {completedScans.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.projectName} — Grade {s.overallRiskGrade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {completedScans.length === 0 && (
              <p className="text-xs text-muted-foreground">Run a scan first to generate reports.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SBOM Export */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              SBOM Export
            </CardTitle>
            <CardDescription>
              Generate Software Bill of Materials in industry-standard formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {[
                { key: 'cyclonedx' as const, label: 'CycloneDX', desc: 'OWASP standard format', icon: FileCode },
                { key: 'spdx' as const, label: 'SPDX', desc: 'Linux Foundation format', icon: FileCode },
                { key: 'json' as const, label: 'JSON', desc: 'Raw data export', icon: FileJson },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled={!hasScan} onClick={() => handleExport(item.key)}>
                    {generating === item.key ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}
                    Export
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Reports */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Security Reports
            </CardTitle>
            <CardDescription>
              Generate comprehensive security analysis reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {[
                { key: 'executive' as const, label: 'Executive Summary', desc: 'High-level overview for stakeholders' },
                { key: 'full' as const, label: 'Full Security Report', desc: 'Detailed vulnerability analysis' },
                { key: 'remediation' as const, label: 'Remediation Guide', desc: 'Step-by-step fix instructions' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled={!hasScan} onClick={() => handleReport(item.key)}>
                    {generating === item.key ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}
                    PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
