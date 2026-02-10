import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScanComparisonDialog } from "@/components/history/ScanComparisonDialog";
import { useScans } from "@/hooks/useScans";
import {
  History as HistoryIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  GitCompareArrows,
  Scan,
} from "lucide-react";
import { format } from "date-fns";

const gradeColors: Record<string, string> = {
  A: "bg-success/20 text-success border-success/30",
  B: "bg-success/10 text-success/80 border-success/20",
  C: "bg-warning/20 text-warning border-warning/30",
  D: "bg-severity-high/20 text-severity-high border-severity-high/30",
  F: "bg-danger/20 text-danger border-danger/30",
};

export default function History() {
  const { data: scans, isLoading } = useScans();
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const selectedScans = (scans || []).filter((s) => selected.includes(s.id));
  const scanA = selectedScans[0] ?? null;
  const scanB = selectedScans[1] ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
          <p className="text-sm text-muted-foreground">
            View results and compare scans side-by-side
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length === 2 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setCompareOpen(true)}
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare ({selected.length})
            </Button>
          )}
          <Badge variant="outline" className="text-muted-foreground">
            {scans?.length ?? 0} scans
          </Badge>
        </div>
      </div>

      {/* Comparison hint */}
      {selected.length > 0 && selected.length < 2 && (
        <p className="text-xs text-muted-foreground">
          Select one more completed scan to compare.
        </p>
      )}

      {/* Scans list */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <HistoryIcon className="h-5 w-5 text-primary" />
            All Scans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!scans || scans.length === 0) && (
            <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
              <Scan className="h-10 w-10" />
              <p className="text-sm">No scans yet. Run your first scan to see results here.</p>
              <Link to="/scan">
                <Button size="sm" className="gap-2">
                  <Scan className="h-4 w-4" /> New Scan
                </Button>
              </Link>
            </div>
          )}

          {scans?.map((scan) => {
            const totalVulns =
              scan.criticalVulnerabilities +
              scan.highVulnerabilities +
              scan.mediumVulnerabilities +
              scan.lowVulnerabilities;
            const isCompleted = scan.status === "completed";
            const isSelected = selected.includes(scan.id);

            return (
              <div
                key={scan.id}
                className={`flex flex-col gap-3 rounded-lg border bg-background/50 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                  isSelected
                    ? "border-primary/50 ring-1 ring-primary/20"
                    : "border-border/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(scan.id)}
                      aria-label={`Select ${scan.projectName} for comparison`}
                    />
                  )}

                  {scan.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  )}
                  {scan.status === "failed" && (
                    <XCircle className="h-4 w-4 text-danger shrink-0" />
                  )}
                  {(scan.status === "pending" || scan.status === "scanning") && (
                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {scan.projectName}
                      </span>
                      {isCompleted && (
                        <Badge
                          variant="outline"
                          className={gradeColors[scan.overallRiskGrade]}
                        >
                          Grade {scan.overallRiskGrade}
                        </Badge>
                      )}
                      {scan.status === "failed" && (
                        <Badge variant="outline" className="text-danger border-danger/30">
                          Failed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(scan.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div>
                      <span className="text-muted-foreground">Deps: </span>
                      <span className="font-medium text-foreground">{scan.totalDependencies}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vulns: </span>
                      <span className="font-medium text-severity-high">{totalVulns}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weak: </span>
                      <span className="font-medium text-warning">{scan.weakLinkSignals}</span>
                    </div>
                    <Link to={`/history/${scan.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Comparison dialog */}
      <ScanComparisonDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        scanA={scanA}
        scanB={scanB}
      />
    </div>
  );
}
