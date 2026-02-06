import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Shield, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GraphNode } from "@/hooks/useDependencyGraph";

const severityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-severity-critical text-white' },
  high: { label: 'High', className: 'bg-severity-high text-white' },
  medium: { label: 'Medium', className: 'bg-severity-medium text-black' },
  low: { label: 'Low', className: 'bg-severity-low text-white' },
  info: { label: 'Info', className: 'bg-severity-info text-white' },
};

interface Props {
  node: GraphNode;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: Props) {
  const config = severityConfig[node.riskLevel] || severityConfig.info;

  return (
    <Card className="bg-gradient-card border-border/50 w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Package Details
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{node.name}</p>
          <p className="text-xs text-muted-foreground">v{node.version}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={config.className}>{config.label}</Badge>
          {node.isDirectDependency && (
            <Badge variant="outline" className="text-xs">Direct</Badge>
          )}
          {!node.isDirectDependency && (
            <Badge variant="outline" className="text-xs">Transitive (depth {node.depth})</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-background/50 p-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              Vulnerabilities
            </div>
            <p className="text-lg font-bold text-foreground">{node.vulnerabilityCount}</p>
          </div>
          <div className="rounded-md bg-background/50 p-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Weak Links
            </div>
            <p className="text-lg font-bold text-foreground">{node.weakLinkCount}</p>
          </div>
        </div>

        <div className="rounded-md bg-background/50 p-2">
          <p className="text-xs text-muted-foreground">Risk Score</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, node.riskScore)}%`,
                  backgroundColor: severityConfig[node.riskLevel]?.className.includes('critical')
                    ? '#dc2626'
                    : severityConfig[node.riskLevel]?.className.includes('high')
                    ? '#f97316'
                    : severityConfig[node.riskLevel]?.className.includes('medium')
                    ? '#eab308'
                    : '#22c55e',
                }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">{node.riskScore.toFixed(0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
