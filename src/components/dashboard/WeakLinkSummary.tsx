import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2Off, UserX, AlertTriangle, Copy, Clock, Download, User } from "lucide-react";

interface WeakLinkSummaryProps {
  installScripts: number;
  maintainerInactive: number;
  deprecated: number;
  typosquatting: number;
  singleMaintainer: number;
  lowDownloads: number;
}

export function WeakLinkSummary({
  installScripts,
  maintainerInactive,
  deprecated,
  typosquatting,
  singleMaintainer,
  lowDownloads,
}: WeakLinkSummaryProps) {
  const signals = [
    {
      label: "Install Scripts",
      count: installScripts,
      icon: AlertTriangle,
      severity: "critical" as const,
      description: "Packages with pre/post install hooks",
    },
    {
      label: "Typosquatting Risk",
      count: typosquatting,
      icon: Copy,
      severity: "critical" as const,
      description: "Names similar to popular packages",
    },
    {
      label: "Inactive Maintainers",
      count: maintainerInactive,
      icon: UserX,
      severity: "high" as const,
      description: "No updates in 12+ months",
    },
    {
      label: "Deprecated",
      count: deprecated,
      icon: Link2Off,
      severity: "medium" as const,
      description: "Marked as deprecated on npm",
    },
    {
      label: "Single Maintainer",
      count: singleMaintainer,
      icon: User,
      severity: "low" as const,
      description: "Only one maintainer",
    },
    {
      label: "Low Downloads",
      count: lowDownloads,
      icon: Download,
      severity: "low" as const,
      description: "Under 1000 weekly downloads",
    },
  ];

  const severityColors = {
    critical: "bg-severity-critical/10 text-severity-critical border-severity-critical/30",
    high: "bg-severity-high/10 text-severity-high border-severity-high/30",
    medium: "bg-severity-medium/10 text-severity-medium border-severity-medium/30",
    low: "bg-severity-low/10 text-severity-low border-severity-low/30",
  };

  const total = signals.reduce((acc, s) => acc + s.count, 0);

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-2 text-primary/80">
            <Link2Off className="h-4 w-4" />
            Weak-Link Signals
          </span>
          <Badge variant="outline" className="text-foreground">
            {total} detected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {signals.map((signal) => (
            <div
              key={signal.label}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-2.5 transition-all hover:bg-background/50"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-md p-1.5 ${severityColors[signal.severity]}`}>
                  <signal.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{signal.label}</p>
                  <p className="text-xs text-muted-foreground">{signal.description}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={signal.count > 0 ? severityColors[signal.severity] : "text-muted-foreground"}
              >
                {signal.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
