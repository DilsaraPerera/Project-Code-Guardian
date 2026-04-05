import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, ZoomIn, ZoomOut, Maximize, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScans } from "@/hooks/useScans";
import { useDependencyGraph, type GraphNode } from "@/hooks/useDependencyGraph";
import { DependencyForceGraph } from "@/components/graph/DependencyForceGraph";
import { NodeDetailPanel } from "@/components/graph/NodeDetailPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function Graph() {
  const { data: scans, isLoading: scansLoading } = useScans();
  const completedScans = scans?.filter((s) => s.status === "completed") || [];

  const [selectedScanId, setSelectedScanId] = useState<string | undefined>();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedScanId && completedScans.length > 0) {
      setSelectedScanId(completedScans[0].id);
    }
  }, [completedScans, selectedScanId]);

  const { data: graphData, isLoading: graphLoading } = useDependencyGraph(selectedScanId);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const hasData = graphData && graphData.nodes.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dependency Graph</h1>
          <p className="text-sm text-primary/70">
            Visualize your project's dependency tree with vulnerability propagation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {completedScans.length > 0 && (
            <Select value={selectedScanId} onValueChange={setSelectedScanId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select scan" />
              </SelectTrigger>
              <SelectContent>
                {completedScans.map((scan) => (
                  <SelectItem key={scan.id} value={scan.id}>
                    {scan.projectName} — {scan.overallRiskGrade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Graph area */}
      <Card className="bg-gradient-card border-border/50 relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-primary">
              <Network className="h-5 w-5 text-primary" />
              Dependency Tree
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-xs text-primary/60">Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-xs text-primary/60">Weak Links</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-severity-high" />
                <span className="text-xs text-primary/60">Vulnerable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-severity-critical" />
                <span className="text-xs text-primary/60">Critical</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div
            ref={containerRef}
            className="h-[500px] rounded-lg border border-border bg-background/30 overflow-hidden"
          >
            {scansLoading || graphLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-3">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <p className="text-sm text-primary/60">Loading graph data…</p>
                </div>
              </div>
            ) : hasData ? (
              <DependencyForceGraph
                data={graphData}
                width={containerSize.width}
                height={containerSize.height}
                onNodeClick={handleNodeClick}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Network className="mx-auto h-16 w-16 text-primary/30 mb-4" />
                  <p className="text-primary/70 mb-2">No dependency data to visualize</p>
                  <p className="text-sm text-primary/50 max-w-md">
                    Run a scan first to see your project's dependency tree with color-coded risk levels
                  </p>
                  <Link to="/scan">
                    <Button className="mt-4 glow-primary" size="sm">
                      Start a Scan
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {selectedNode && (
            <div className="absolute top-4 right-4 z-10">
              <NodeDetailPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats panel */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Nodes", value: hasData ? graphData.stats.totalNodes : '--' },
          { label: "Max Depth", value: hasData ? graphData.stats.maxDepth : '--' },
          { label: "Circular Deps", value: hasData ? graphData.stats.circularDeps : '--' },
          { label: "High-Risk Paths", value: hasData ? graphData.stats.highRiskPaths : '--' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-gradient-card border-border/50">
            <CardContent className="pt-4">
              <p className="text-sm text-primary/60">{stat.label}</p>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
