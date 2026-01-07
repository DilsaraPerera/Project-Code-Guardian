import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  FileJson, 
  FileCode,
  Calendar,
  Clock
} from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & SBOM</h1>
        <p className="text-sm text-muted-foreground">
          Generate security reports and Software Bill of Materials
        </p>
      </div>

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
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <FileCode className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">CycloneDX</p>
                    <p className="text-sm text-muted-foreground">OWASP standard format</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <FileCode className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">SPDX</p>
                    <p className="text-sm text-muted-foreground">Linux Foundation format</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <FileJson className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">JSON</p>
                    <p className="text-sm text-muted-foreground">Raw data export</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </div>
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
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Executive Summary</p>
                    <p className="text-sm text-muted-foreground">High-level overview for stakeholders</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  PDF
                </Button>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Full Security Report</p>
                    <p className="text-sm text-muted-foreground">Detailed vulnerability analysis</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  PDF
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Remediation Guide</p>
                    <p className="text-sm text-muted-foreground">Step-by-step fix instructions</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No reports generated yet</p>
            <p className="text-sm text-muted-foreground/70">
              Run a scan first to generate security reports
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
