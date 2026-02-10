import { ScanSummary } from "@/hooks/useScans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format } from "date-fns";

interface ScanComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanA: ScanSummary | null;
  scanB: ScanSummary | null;
}

function DeltaIndicator({ before, after }: { before: number; after: number }) {
  const diff = after - before;
  if (diff === 0) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  // For vulns/weak links, going up is bad
  if (diff > 0) return <span className="flex items-center gap-0.5 text-severity-high text-xs font-medium"><ArrowUp className="h-3.5 w-3.5" />+{diff}</span>;
  return <span className="flex items-center gap-0.5 text-success text-xs font-medium"><ArrowDown className="h-3.5 w-3.5" />{diff}</span>;
}

const gradeColors: Record<string, string> = {
  A: "bg-success/20 text-success border-success/30",
  B: "bg-success/10 text-success/80 border-success/20",
  C: "bg-warning/20 text-warning border-warning/30",
  D: "bg-severity-high/20 text-severity-high border-severity-high/30",
  F: "bg-danger/20 text-danger border-danger/30",
};

export function ScanComparisonDialog({ open, onOpenChange, scanA, scanB }: ScanComparisonDialogProps) {
  if (!scanA || !scanB) return null;

  const rows = [
    { label: "Grade", a: scanA.overallRiskGrade, b: scanB.overallRiskGrade, type: "grade" as const },
    { label: "Risk Score", a: scanA.overallRiskScore, b: scanB.overallRiskScore, type: "number" as const },
    { label: "Dependencies", a: scanA.totalDependencies, b: scanB.totalDependencies, type: "number" as const },
    { label: "Critical", a: scanA.criticalVulnerabilities, b: scanB.criticalVulnerabilities, type: "number" as const },
    { label: "High", a: scanA.highVulnerabilities, b: scanB.highVulnerabilities, type: "number" as const },
    { label: "Medium", a: scanA.mediumVulnerabilities, b: scanB.mediumVulnerabilities, type: "number" as const },
    { label: "Low", a: scanA.lowVulnerabilities, b: scanB.lowVulnerabilities, type: "number" as const },
    { label: "Weak Links", a: scanA.weakLinkSignals, b: scanB.weakLinkSignals, type: "number" as const },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan Comparison</DialogTitle>
        </DialogHeader>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_auto_1fr] gap-2 text-xs font-medium text-muted-foreground border-b border-border/50 pb-2">
          <span>Metric</span>
          <span className="text-center">{scanA.projectName}<br /><span className="font-normal">{format(new Date(scanA.createdAt), "MMM d")}</span></span>
          <span className="text-center">Δ</span>
          <span className="text-center">{scanB.projectName}<br /><span className="font-normal">{format(new Date(scanB.createdAt), "MMM d")}</span></span>
        </div>

        <div className="space-y-1">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_1fr_auto_1fr] gap-2 items-center rounded-md px-2 py-2 hover:bg-muted/50"
            >
              <span className="text-sm text-foreground font-medium">{row.label}</span>
              {row.type === "grade" ? (
                <>
                  <span className="text-center">
                    <Badge variant="outline" className={`${gradeColors[row.a as string]} text-xs`}>
                      {row.a as string}
                    </Badge>
                  </span>
                  <span />
                  <span className="text-center">
                    <Badge variant="outline" className={`${gradeColors[row.b as string]} text-xs`}>
                      {row.b as string}
                    </Badge>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-center text-sm font-mono text-foreground">
                    {Math.round(row.a as number)}
                  </span>
                  <span className="text-center">
                    <DeltaIndicator before={row.a as number} after={row.b as number} />
                  </span>
                  <span className="text-center text-sm font-mono text-foreground">
                    {Math.round(row.b as number)}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
