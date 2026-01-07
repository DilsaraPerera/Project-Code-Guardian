import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, ZoomIn, ZoomOut, Maximize, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Graph() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dependency Graph</h1>
          <p className="text-sm text-muted-foreground">
            Visualize your project's dependency tree
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ZoomOut className="mr-1 h-4 w-4" />
            Zoom Out
          </Button>
          <Button variant="outline" size="sm">
            <ZoomIn className="mr-1 h-4 w-4" />
            Zoom In
          </Button>
          <Button variant="outline" size="sm">
            <Maximize className="mr-1 h-4 w-4" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Graph area */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Network className="h-5 w-5 text-primary" />
              Dependency Tree
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-xs text-muted-foreground">Weak Links</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-severity-high" />
                <span className="text-xs text-muted-foreground">Vulnerable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-severity-critical" />
                <span className="text-xs text-muted-foreground">Critical</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Placeholder for graph visualization */}
          <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed border-border bg-background/30">
            <div className="text-center">
              <Network className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-2">Interactive dependency graph</p>
              <p className="text-sm text-muted-foreground/70 max-w-md">
                Run a scan to visualize your project's dependency tree with color-coded risk levels
              </p>
              <Badge variant="outline" className="mt-4">
                <Info className="mr-1 h-3 w-3" />
                Coming with scan integration
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats panel */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Nodes</p>
            <p className="text-2xl font-bold text-foreground">--</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Max Depth</p>
            <p className="text-2xl font-bold text-foreground">--</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Circular Deps</p>
            <p className="text-2xl font-bold text-foreground">--</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">High-Risk Paths</p>
            <p className="text-2xl font-bold text-foreground">--</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
