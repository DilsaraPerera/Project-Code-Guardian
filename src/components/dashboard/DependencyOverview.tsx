import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, GitBranch, AlertTriangle } from "lucide-react";

interface DependencyOverviewProps {
  total: number;
  direct: number;
  transitive: number;
  withIssues: number;
}

export function DependencyOverview({ total, direct, transitive, withIssues }: DependencyOverviewProps) {
  const healthyPercentage = total > 0 ? Math.round(((total - withIssues) / total) * 100) : 100;

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Package className="h-4 w-4" />
          Dependencies Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{total}</span>
            <span className="text-sm text-muted-foreground">packages</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                Direct
              </div>
              <div className="text-xl font-semibold text-foreground">{direct}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                Transitive
              </div>
              <div className="text-xl font-semibold text-foreground">{transitive}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                With Issues
              </div>
              <div className="text-xl font-semibold text-severity-high">{withIssues}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Health</span>
              <span className="font-medium text-foreground">{healthyPercentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${healthyPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
