import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Shield,
  Scan,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useScans } from "@/hooks/useScans";
import { useVulnerabilities } from "@/hooks/useVulnerabilities";
import type { SeverityLevel } from "@/types/security";

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: "text-severity-critical",
    bgColor: "bg-severity-critical/10",
    borderColor: "border-severity-critical/30",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    color: "text-severity-high",
    bgColor: "bg-severity-high/10",
    borderColor: "border-severity-high/30",
    label: "High",
  },
  medium: {
    icon: AlertCircle,
    color: "text-severity-medium",
    bgColor: "bg-severity-medium/10",
    borderColor: "border-severity-medium/30",
    label: "Medium",
  },
  low: {
    icon: Info,
    color: "text-severity-low",
    bgColor: "bg-severity-low/10",
    borderColor: "border-severity-low/30",
    label: "Low",
  },
  info: {
    icon: Info,
    color: "text-severity-info",
    bgColor: "bg-severity-info/10",
    borderColor: "border-severity-info/30",
    label: "Info",
  },
};

type FilterSeverity = "all" | SeverityLevel;

export default function Vulnerabilities() {
  const { data: scans, isLoading: scansLoading } = useScans();
  const completedScans = scans?.filter((s) => s.status === "completed") || [];

  const [selectedScanId, setSelectedScanId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-select latest completed scan
  useEffect(() => {
    if (!selectedScanId && completedScans.length > 0) {
      setSelectedScanId(completedScans[0].id);
    }
  }, [completedScans, selectedScanId]);

  const { data: vulnerabilities, isLoading: vulnLoading } =
    useVulnerabilities(selectedScanId);

  const filteredVulnerabilities = useMemo(() => {
    if (!vulnerabilities) return [];
    return vulnerabilities.filter((vuln) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        vuln.title.toLowerCase().includes(q) ||
        vuln.packageName.toLowerCase().includes(q) ||
        vuln.sourceId.toLowerCase().includes(q) ||
        (vuln.description || "").toLowerCase().includes(q);
      const matchesSeverity =
        severityFilter === "all" || vuln.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [vulnerabilities, searchQuery, severityFilter]);

  const counts = useMemo(() => {
    if (!vulnerabilities) return { critical: 0, high: 0, medium: 0, low: 0 };
    return {
      critical: vulnerabilities.filter((v) => v.severity === "critical").length,
      high: vulnerabilities.filter((v) => v.severity === "high").length,
      medium: vulnerabilities.filter((v) => v.severity === "medium").length,
      low: vulnerabilities.filter((v) => v.severity === "low").length,
    };
  }, [vulnerabilities]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isLoading = scansLoading || vulnLoading;

  // Empty state: no completed scans at all
  if (!scansLoading && completedScans.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Vulnerabilities</h1>
          <p className="text-sm text-primary/70">
            Security vulnerabilities detected in your dependencies
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            No scans yet
          </h2>
          <p className="text-center text-primary/60 mb-6 max-w-md">
            Run a scan to detect vulnerabilities in your project dependencies.
          </p>
          <Link to="/scan">
            <Button className="glow-primary gap-2">
              <Scan className="h-4 w-4" />
              Start a Scan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Vulnerabilities</h1>
          <p className="text-sm text-primary/70">
            Security vulnerabilities detected in your dependencies
          </p>
        </div>
        {completedScans.length > 0 && (
          <Select value={selectedScanId} onValueChange={setSelectedScanId}>
            <SelectTrigger className="w-[220px]">
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

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-4">
          {(
            Object.entries(counts) as [SeverityLevel, number][]
          ).map(([severity, count]) => {
            const config = severityConfig[severity];
            const Icon = config.icon;
            return (
              <Card
                key={severity}
                className={`bg-gradient-card border-border/50 cursor-pointer transition-all hover:border-primary/30 ${
                  severityFilter === severity ? "ring-1 ring-primary" : ""
                }`}
                onClick={() =>
                  setSeverityFilter(
                    severityFilter === severity ? "all" : severity
                  )
                }
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg ${config.bgColor} p-2`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${config.color}`}>
                        {count}
                      </p>
                      <p className="text-xs text-primary/60 capitalize">
                        {severity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters and list */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium text-primary">
              {isLoading
                ? "Loading…"
                : `${filteredVulnerabilities.length} Vulnerabilities Found`}
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
                <Input
                  placeholder="Search by CVE, package, title…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 bg-background/50"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {severityFilter === "all"
                      ? "All Severities"
                      : severityConfig[severityFilter]?.label || severityFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSeverityFilter("all")}>
                    All Severities
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSeverityFilter("critical")}
                  >
                    Critical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter("high")}>
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter("medium")}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter("low")}>
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : filteredVulnerabilities.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldAlert className="mx-auto h-12 w-12 text-primary/30 mb-3" />
              <p className="text-primary/60">
                {vulnerabilities && vulnerabilities.length > 0
                  ? "No vulnerabilities match your filters"
                  : "No vulnerabilities found in this scan — your dependencies look clean!"}
              </p>
            </div>
          ) : (
            filteredVulnerabilities.map((vuln) => {
              const config = severityConfig[vuln.severity] || severityConfig.info;
              const Icon = config.icon;
              const isExpanded = expandedItems.has(vuln.id);

              return (
                <Collapsible
                  key={vuln.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(vuln.id)}
                >
                  <div
                    className={`rounded-lg border ${config.borderColor} ${config.bgColor} transition-all`}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-4 min-w-0">
                        <Icon
                          className={`h-5 w-5 shrink-0 ${config.color}`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-primary truncate">
                              {vuln.title}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0"
                            >
                              {vuln.source.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-primary/60 flex-wrap">
                            <span className="font-mono text-xs">
                              {vuln.sourceId}
                            </span>
                            <span>•</span>
                            <span>
                              {vuln.packageName}@{vuln.packageVersion}
                            </span>
                            {vuln.cvssScore != null && (
                              <>
                                <span>•</span>
                                <span className="font-semibold">
                                  CVSS {vuln.cvssScore.toFixed(1)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge
                          variant="outline"
                          className={`${config.bgColor} ${config.color} ${config.borderColor}`}
                        >
                          {vuln.severity}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-primary/50" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-primary/50" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border/50 p-4 space-y-4">
                        {vuln.description && (
                          <p className="text-sm text-primary/70">
                            {vuln.description}
                          </p>
                        )}

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-medium text-primary/60 mb-1">
                              Affected Versions
                            </p>
                            <code className="text-sm text-primary">
                              {vuln.affectedVersions || "N/A"}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-primary/60 mb-1">
                              Patched Versions
                            </p>
                            <code className="text-sm text-success">
                              {vuln.patchedVersions || "No fix available"}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-primary/60 mb-1">
                              Dependency Type
                            </p>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {vuln.isDirectDependency
                                  ? "Direct"
                                  : "Transitive"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Dependency path */}
                        {vuln.dependencyPath.length > 1 && (
                          <div>
                            <p className="text-xs font-medium text-primary/60 mb-1">
                              Dependency Path
                            </p>
                            <div className="flex items-center gap-1 flex-wrap text-xs font-mono text-primary/60">
                              {vuln.dependencyPath.map((seg, i) => (
                                <span key={i} className="flex items-center gap-1">
                                  {i > 0 && (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                  <span
                                    className={
                                      i === vuln.dependencyPath.length - 1
                                        ? config.color
                                        : ""
                                    }
                                  >
                                    {seg}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {vuln.cweIds.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-primary/60 mb-1">
                              CWE IDs
                            </p>
                            <div className="flex gap-1 flex-wrap">
                              {vuln.cweIds.map((cwe) => (
                                <Badge
                                  key={cwe}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cwe}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {vuln.publishedDate && (
                          <div>
                            <p className="text-xs font-medium text-primary/60 mb-1">
                              Published
                            </p>
                            <p className="text-sm text-primary">
                              {new Date(vuln.publishedDate).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        )}

                        {vuln.referenceUrls.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {vuln.referenceUrls.map((ref, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                  {ref.includes("github.com")
                                    ? "GitHub Advisory"
                                    : ref.includes("nvd.nist")
                                    ? "NVD Detail"
                                    : "View Reference"}
                                </a>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
