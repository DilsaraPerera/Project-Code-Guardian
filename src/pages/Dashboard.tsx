import { Button } from "@/components/ui/button";
import { Scan, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { SecurityScoreCard } from "@/components/dashboard/SecurityScoreCard";
import { VulnerabilityStats } from "@/components/dashboard/VulnerabilityStats";
import { DependencyOverview } from "@/components/dashboard/DependencyOverview";
import { RecentScans } from "@/components/dashboard/RecentScans";
import { WeakLinkSummary } from "@/components/dashboard/WeakLinkSummary";

// Mock data - will be replaced with real data from backend
const mockScanData = {
  grade: 'B' as const,
  score: 78,
  vulnerabilities: {
    critical: 1,
    high: 3,
    medium: 8,
    low: 12,
  },
  dependencies: {
    total: 247,
    direct: 23,
    transitive: 224,
    withIssues: 14,
  },
  weakLinks: {
    installScripts: 2,
    maintainerInactive: 5,
    deprecated: 1,
    typosquatting: 0,
    singleMaintainer: 8,
    lowDownloads: 3,
  },
  recentScans: [
    {
      id: '1',
      projectName: 'my-react-app',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed' as const,
      grade: 'B' as const,
      vulnerabilities: 24,
    },
    {
      id: '2',
      projectName: 'backend-api',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed' as const,
      grade: 'A' as const,
      vulnerabilities: 2,
    },
    {
      id: '3',
      projectName: 'legacy-app',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed' as const,
      grade: 'D' as const,
      vulnerabilities: 47,
    },
  ],
};

export default function Dashboard() {
  const hasScans = mockScanData.recentScans.length > 0;

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
                grade={mockScanData.grade}
                score={mockScanData.score}
              />
              <VulnerabilityStats
                critical={mockScanData.vulnerabilities.critical}
                high={mockScanData.vulnerabilities.high}
                medium={mockScanData.vulnerabilities.medium}
                low={mockScanData.vulnerabilities.low}
              />
            </div>

            {/* Dependencies overview */}
            <DependencyOverview
              total={mockScanData.dependencies.total}
              direct={mockScanData.dependencies.direct}
              transitive={mockScanData.dependencies.transitive}
              withIssues={mockScanData.dependencies.withIssues}
            />

            {/* Weak-link summary */}
            <WeakLinkSummary
              installScripts={mockScanData.weakLinks.installScripts}
              maintainerInactive={mockScanData.weakLinks.maintainerInactive}
              deprecated={mockScanData.weakLinks.deprecated}
              typosquatting={mockScanData.weakLinks.typosquatting}
              singleMaintainer={mockScanData.weakLinks.singleMaintainer}
              lowDownloads={mockScanData.weakLinks.lowDownloads}
            />
          </div>

          {/* Right column - Recent scans */}
          <div className="lg:col-span-1">
            <RecentScans scans={mockScanData.recentScans} />
          </div>
        </div>
      )}
    </div>
  );
}
