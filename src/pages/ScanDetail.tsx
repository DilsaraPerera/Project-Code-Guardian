import { useParams, Link } from "react-router-dom";
import { useScanDetails } from "@/hooks/useScans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  Package,
  AlertTriangle,
  Link2,
  ShieldAlert,
  AlertCircle,
  Info,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

const gradeColors: Record<string, string> = {
  A: "bg-success/20 text-success border-success/30",
  B: "bg-success/10 text-success/80 border-success/20",
  C: "bg-warning/20 text-warning border-warning/30",
  D: "bg-severity-high/20 text-severity-high border-severity-high/30",
  F: "bg-danger/20 text-danger border-danger/30",
};

const riskLevelColors: Record<string, string> = {
  critical: "text-severity-critical",
  high: "text-severity-high",
  medium: "text-severity-medium",
  low: "text-severity-low",
  info: "text-severity-info",
};

export default function ScanDetail() {
  const { scanId } = useParams<{ scanId: string }>();
  const { data, isLoading } = useScanDetails(scanId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data?.scan) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Scan not found</h2>
        <Link to="/history">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
          </Button>
        </Link>
      </div>
    );
  }

  const scan = data.scan;
  const deps = data.dependencies || [];
  const totalVulns =
    scan.critical_vulnerabilities +
    scan.high_vulnerabilities +
    scan.medium_vulnerabilities +
    scan.low_vulnerabilities;

  const topRiskDeps = deps.filter((d: any) => (d.risk_score ?? 0) > 0).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{scan.project_name}</h1>
              <Badge variant="outline" className={gradeColors[scan.overall_risk_grade]}>
                Grade {scan.overall_risk_grade}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(scan.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(100 - Number(scan.overall_risk_score))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-severity-high/10">
                <AlertTriangle className="h-5 w-5 text-severity-high" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vulnerabilities</p>
                <p className="text-2xl font-bold text-foreground">{totalVulns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dependencies</p>
                <p className="text-2xl font-bold text-foreground">{scan.total_dependencies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Link2 className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weak Links</p>
                <p className="text-2xl font-bold text-foreground">{scan.weak_link_signals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerability breakdown */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Vulnerability Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Critical", count: scan.critical_vulnerabilities, icon: ShieldAlert, color: "text-severity-critical", bg: "bg-severity-critical/10" },
              { label: "High", count: scan.high_vulnerabilities, icon: AlertTriangle, color: "text-severity-high", bg: "bg-severity-high/10" },
              { label: "Medium", count: scan.medium_vulnerabilities, icon: AlertCircle, color: "text-severity-medium", bg: "bg-severity-medium/10" },
              { label: "Low", count: scan.low_vulnerabilities, icon: Info, color: "text-severity-low", bg: "bg-severity-low/10" },
            ].map((s) => (
              <div key={s.label} className={`flex flex-col items-center rounded-lg p-4 ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color} mb-1`} />
                <span className={`text-2xl font-bold ${s.color}`}>{s.count}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top risk dependencies */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Top Risk Dependencies</CardTitle>
        </CardHeader>
        <CardContent>
          {topRiskDeps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No risky dependencies found — great job!
            </p>
          ) : (
            <div className="space-y-2">
              {topRiskDeps.map((dep: any) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">{dep.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">v{dep.version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${riskLevelColors[dep.risk_level] || "text-muted-foreground"}`}>
                      {dep.risk_level}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm text-muted-foreground">
                      Score: {Math.round(Number(dep.risk_score))}
                    </span>
                    {dep.vulnerabilities?.length > 0 && (
                      <Badge variant="outline" className="text-severity-high border-severity-high/30">
                        {dep.vulnerabilities.length} CVE{dep.vulnerabilities.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
