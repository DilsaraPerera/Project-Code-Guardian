import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Scan {
  id: string;
  projectName: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'scanning' | 'pending';
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  vulnerabilities?: number;
}

interface RecentScansProps {
  scans: Scan[];
}

const gradeColors = {
  'A': 'bg-success/20 text-success border-success/30',
  'B': 'bg-success/10 text-success/80 border-success/20',
  'C': 'bg-warning/20 text-warning border-warning/30',
  'D': 'bg-severity-high/20 text-severity-high border-severity-high/30',
  'F': 'bg-danger/20 text-danger border-danger/30',
};

export function RecentScans({ scans }: RecentScansProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Recent Scans
        </CardTitle>
        <Link to="/history">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            View All
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No scans yet</p>
            <Link to="/scan">
              <Button variant="outline" size="sm" className="mt-2">
                Start your first scan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3 transition-all hover:border-primary/30 hover:bg-background"
              >
                <div className="flex items-center gap-3">
                  {scan.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  {scan.status === 'failed' && (
                    <XCircle className="h-4 w-4 text-danger" />
                  )}
                  {(scan.status === 'scanning' || scan.status === 'pending') && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {scan.projectName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(scan.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {scan.status === 'completed' && scan.grade && (
                    <Badge 
                      variant="outline" 
                      className={gradeColors[scan.grade]}
                    >
                      {scan.grade}
                    </Badge>
                  )}
                  {scan.status === 'completed' && scan.vulnerabilities !== undefined && scan.vulnerabilities > 0 && (
                    <Badge variant="outline" className="border-severity-high/30 bg-severity-high/10 text-severity-high">
                      {scan.vulnerabilities} issues
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
