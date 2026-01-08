import { Button } from "@/components/ui/button";
import { Scan, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { SecurityScoreCard } from "@/components/dashboard/SecurityScoreCard";
import { VulnerabilityStats } from "@/components/dashboard/VulnerabilityStats";
import { DependencyOverview } from "@/components/dashboard/DependencyOverview";
import { RecentScans } from "@/components/dashboard/RecentScans";
import { WeakLinkSummary } from "@/components/dashboard/WeakLinkSummary";
import { useScans } from "@/hooks/useScans";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: scans, isLoading } = useScans(5);
  
  // Get the most recent completed scan for stats
  const latestScan = scans?.find(s => s.status === 'completed');
  const hasScans = scans && scans.length > 0;

  // Transform scans data for RecentScans component
  const recentScans = scans?.map(scan => ({
    id: scan.id,
    projectName: scan.projectName,
    timestamp: scan.createdAt,
    status: scan.status,
    grade: scan.status === 'completed' ? scan.overallRiskGrade : undefined,
    vulnerabilities: scan.criticalVulnerabilities + scan.highVulnerabilities + 
                     scan.mediumVulnerabilities + scan.lowVulnerabilities,
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Monitor your supply chain security posture
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your supply chain security posture
          </p>
        </div>
        <Link to="/scan">
          <Button className="glow-primary gap-2">
            <Scan className="h-4 w-4" />
            New Scan
          </Button>
        </Link>
      </div>

      {!hasScans ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No scans yet
          </h2>
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            Start by scanning your first project to analyze dependencies, 
            detect vulnerabilities, and identify weak-link signals.
          </p>
          <Link to="/scan">
            <Button className="glow-primary gap-2">
              <Scan className="h-4 w-4" />
              Start Your First Scan
            </Button>
          </Link>
        </div>
      ) : (
        /* Dashboard with data */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Main stats */}
          <div className="space-y-6 lg:col-span-2">
            {/* Top row - Score and Vulnerabilities */}
            <div className="grid gap-6 sm:grid-cols-2">
              <SecurityScoreCard
                grade={latestScan?.overallRiskGrade || 'A'}
                score={Math.round(100 - (latestScan?.overallRiskScore || 0))}
              />
              <VulnerabilityStats
                critical={latestScan?.criticalVulnerabilities || 0}
                high={latestScan?.highVulnerabilities || 0}
                medium={latestScan?.mediumVulnerabilities || 0}
                low={latestScan?.lowVulnerabilities || 0}
              />
            </div>

            {/* Dependencies overview */}
            <DependencyOverview
              total={latestScan?.totalDependencies || 0}
              direct={0}
              transitive={0}
              withIssues={latestScan?.weakLinkSignals || 0}
            />

            {/* Weak-link summary */}
            <WeakLinkSummary
              installScripts={0}
              maintainerInactive={0}
              deprecated={0}
              typosquatting={0}
              singleMaintainer={0}
              lowDownloads={latestScan?.weakLinkSignals || 0}
            />
          </div>

          {/* Right column - Recent scans */}
          <div className="lg:col-span-1">
            <RecentScans scans={recentScans} />
          </div>
        </div>
      )}
    </div>
  );
}