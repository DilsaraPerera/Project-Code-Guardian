import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  History as HistoryIcon, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  Download,
  Trash2
} from "lucide-react";

// Mock data
const mockScans = [
  {
    id: "scan-1",
    projectName: "my-react-app",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "completed" as const,
    grade: "B" as const,
    totalPackages: 247,
    vulnerabilities: { critical: 1, high: 3, medium: 8, low: 12 },
    weakLinks: 19,
  },
  {
    id: "scan-2",
    projectName: "backend-api",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: "completed" as const,
    grade: "A" as const,
    totalPackages: 89,
    vulnerabilities: { critical: 0, high: 0, medium: 1, low: 1 },
    weakLinks: 3,
  },
  {
    id: "scan-3",
    projectName: "legacy-app",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: "completed" as const,
    grade: "D" as const,
    totalPackages: 412,
    vulnerabilities: { critical: 5, high: 12, medium: 18, low: 12 },
    weakLinks: 34,
  },
  {
    id: "scan-4",
    projectName: "test-project",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    status: "failed" as const,
    grade: undefined,
    totalPackages: 0,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    weakLinks: 0,
  },
];

const gradeColors = {
  A: "bg-success/20 text-success border-success/30",
  B: "bg-success/10 text-success/80 border-success/20",
  C: "bg-warning/20 text-warning border-warning/30",
  D: "bg-severity-high/20 text-severity-high border-severity-high/30",
  F: "bg-danger/20 text-danger border-danger/30",
};

export default function History() {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalVulnerabilities = (vulns: typeof mockScans[0]["vulnerabilities"]) => {
    return vulns.critical + vulns.high + vulns.medium + vulns.low;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your previous security scans
          </p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {mockScans.length} scans
        </Badge>
      </div>

      {/* Scans list */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <HistoryIcon className="h-5 w-5 text-primary" />
            All Scans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockScans.map((scan) => (
            <div
              key={scan.id}
              className="flex flex-col gap-4 rounded-lg border border-border/50 bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {scan.status === "completed" && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {scan.status === "failed" && (
                  <XCircle className="h-5 w-5 text-danger" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {scan.projectName}
                    </span>
                    {scan.grade && (
                      <Badge
                        variant="outline"
                        className={gradeColors[scan.grade]}
                      >
                        Grade {scan.grade}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(scan.timestamp)}
                  </p>
                </div>
              </div>

              {scan.status === "completed" && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Packages:</span>
                    <span className="font-medium text-foreground">
                      {scan.totalPackages}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Vulnerabilities:</span>
                    <span className="font-medium text-severity-high">
                      {getTotalVulnerabilities(scan.vulnerabilities)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Weak Links:</span>
                    <span className="font-medium text-warning">
                      {scan.weakLinks}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {scan.status === "completed" && (
                  <>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 h-4 w-4" />
                      SBOM
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {mockScans.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No scan history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
