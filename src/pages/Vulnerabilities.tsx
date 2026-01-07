import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SeverityLevel } from "@/types/security";

// Mock data
const mockVulnerabilities = [
  {
    id: "GHSA-4q6p-r6v2-jvc5",
    source: "github" as const,
    severity: "critical" as SeverityLevel,
    title: "Prototype Pollution in minimist",
    description: "Affected versions of minimist are vulnerable to prototype pollution. An attacker can inject properties onto Object.prototype.",
    package: "minimist",
    affectedVersions: "<1.2.6",
    patchedVersions: ">=1.2.6",
    cvssScore: 9.8,
    cweIds: ["CWE-1321"],
    publishedDate: "2022-03-21",
    references: ["https://github.com/advisories/GHSA-4q6p-r6v2-jvc5"],
  },
  {
    id: "CVE-2021-3749",
    source: "osv" as const,
    severity: "high" as SeverityLevel,
    title: "Regular Expression Denial of Service in axios",
    description: "axios before 0.21.2 allows server-side request forgery. An attacker can use this vulnerability to make requests to internal resources.",
    package: "axios",
    affectedVersions: "<0.21.2",
    patchedVersions: ">=0.21.2",
    cvssScore: 7.5,
    cweIds: ["CWE-918"],
    publishedDate: "2021-08-31",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2021-3749"],
  },
  {
    id: "CVE-2022-0155",
    source: "npm" as const,
    severity: "medium" as SeverityLevel,
    title: "Exposure of Sensitive Information in axios",
    description: "follow-redirects is vulnerable to Exposure of Private Personal Information to an Unauthorized Actor.",
    package: "axios",
    affectedVersions: "<0.21.4",
    patchedVersions: ">=0.21.4",
    cvssScore: 6.5,
    cweIds: ["CWE-359"],
    publishedDate: "2022-02-09",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2022-0155"],
  },
  {
    id: "GHSA-35jh-r3h4-6jhm",
    source: "github" as const,
    severity: "high" as SeverityLevel,
    title: "Uncontrolled Resource Consumption in node-fetch",
    description: "node-fetch before 2.6.7 and 3.x before 3.1.1 is vulnerable to uncontrolled resource consumption.",
    package: "node-fetch",
    affectedVersions: "<2.6.7",
    patchedVersions: ">=2.6.7",
    cvssScore: 7.5,
    cweIds: ["CWE-400"],
    publishedDate: "2022-01-14",
    references: ["https://github.com/advisories/GHSA-35jh-r3h4-6jhm"],
  },
];

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: "text-severity-critical",
    bgColor: "bg-severity-critical/10",
    borderColor: "border-severity-critical/30",
  },
  high: {
    icon: AlertTriangle,
    color: "text-severity-high",
    bgColor: "bg-severity-high/10",
    borderColor: "border-severity-high/30",
  },
  medium: {
    icon: AlertCircle,
    color: "text-severity-medium",
    bgColor: "bg-severity-medium/10",
    borderColor: "border-severity-medium/30",
  },
  low: {
    icon: Info,
    color: "text-severity-low",
    bgColor: "bg-severity-low/10",
    borderColor: "border-severity-low/30",
  },
  info: {
    icon: Info,
    color: "text-severity-info",
    bgColor: "bg-severity-info/10",
    borderColor: "border-severity-info/30",
  },
};

type FilterSeverity = 'all' | SeverityLevel;

export default function Vulnerabilities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredVulnerabilities = mockVulnerabilities.filter((vuln) => {
    const matchesSearch = 
      vuln.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const counts = {
    critical: mockVulnerabilities.filter(v => v.severity === 'critical').length,
    high: mockVulnerabilities.filter(v => v.severity === 'high').length,
    medium: mockVulnerabilities.filter(v => v.severity === 'medium').length,
    low: mockVulnerabilities.filter(v => v.severity === 'low').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vulnerabilities</h1>
        <p className="text-sm text-muted-foreground">
          Security vulnerabilities detected in your dependencies
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(Object.entries(counts) as [SeverityLevel, number][]).map(([severity, count]) => {
          const config = severityConfig[severity];
          const Icon = config.icon;
          return (
            <Card 
              key={severity}
              className={`bg-gradient-card border-border/50 cursor-pointer transition-all hover:border-primary/30 ${severityFilter === severity ? 'ring-1 ring-primary' : ''}`}
              onClick={() => setSeverityFilter(severityFilter === severity ? 'all' : severity)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg ${config.bgColor} p-2`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">{severity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and list */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium">
              {filteredVulnerabilities.length} Vulnerabilities Found
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vulnerabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 bg-background/50"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {severityFilter === 'all' ? 'All Severities' : severityFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSeverityFilter('all')}>
                    All Severities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter('critical')}>
                    Critical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter('high')}>
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter('medium')}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSeverityFilter('low')}>
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredVulnerabilities.map((vuln) => {
            const config = severityConfig[vuln.severity];
            const Icon = config.icon;
            const isExpanded = expandedItems.has(vuln.id);

            return (
              <Collapsible
                key={vuln.id}
                open={isExpanded}
                onOpenChange={() => toggleExpand(vuln.id)}
              >
                <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} transition-all`}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-4">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{vuln.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {vuln.source.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">{vuln.id}</span>
                          <span>•</span>
                          <span>Affects: {vuln.package}</span>
                          {vuln.cvssScore && (
                            <>
                              <span>•</span>
                              <span>CVSS: {vuln.cvssScore}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${config.bgColor} ${config.color} ${config.borderColor}`}>
                        {vuln.severity}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border/50 p-4 space-y-4">
                      <p className="text-sm text-muted-foreground">{vuln.description}</p>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Affected Versions</p>
                          <code className="text-sm text-foreground">{vuln.affectedVersions}</code>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Patched Versions</p>
                          <code className="text-sm text-success">{vuln.patchedVersions}</code>
                        </div>
                      </div>

                      {vuln.cweIds && vuln.cweIds.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">CWE IDs</p>
                          <div className="flex gap-1">
                            {vuln.cweIds.map((cwe) => (
                              <Badge key={cwe} variant="outline" className="text-xs">
                                {cwe}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {vuln.references.map((ref, i) => (
                          <Button key={i} variant="outline" size="sm" asChild>
                            <a href={ref} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View Advisory
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}

          {filteredVulnerabilities.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No vulnerabilities found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
