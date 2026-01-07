import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  ExternalLink,
  ChevronDown,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - will be replaced with real data
const mockDependencies = [
  {
    name: "lodash",
    version: "4.17.21",
    isDev: false,
    isDirect: true,
    vulnerabilities: 0,
    weakLinks: 1,
    riskLevel: "low" as const,
    lastUpdated: "2024-02-15",
  },
  {
    name: "axios",
    version: "0.21.1",
    isDev: false,
    isDirect: true,
    vulnerabilities: 2,
    weakLinks: 0,
    riskLevel: "high" as const,
    lastUpdated: "2021-01-01",
  },
  {
    name: "express",
    version: "4.18.2",
    isDev: false,
    isDirect: true,
    vulnerabilities: 0,
    weakLinks: 0,
    riskLevel: "low" as const,
    lastUpdated: "2024-01-10",
  },
  {
    name: "node-fetch",
    version: "2.6.1",
    isDev: false,
    isDirect: false,
    vulnerabilities: 1,
    weakLinks: 2,
    riskLevel: "medium" as const,
    lastUpdated: "2020-09-05",
  },
  {
    name: "minimist",
    version: "1.2.5",
    isDev: false,
    isDirect: false,
    vulnerabilities: 1,
    weakLinks: 1,
    riskLevel: "critical" as const,
    lastUpdated: "2020-03-12",
  },
  {
    name: "jest",
    version: "29.7.0",
    isDev: true,
    isDirect: true,
    vulnerabilities: 0,
    weakLinks: 0,
    riskLevel: "low" as const,
    lastUpdated: "2024-01-20",
  },
];

const riskColors = {
  critical: "bg-severity-critical/20 text-severity-critical border-severity-critical/30",
  high: "bg-severity-high/20 text-severity-high border-severity-high/30",
  medium: "bg-severity-medium/20 text-severity-medium border-severity-medium/30",
  low: "bg-severity-low/20 text-severity-low border-severity-low/30",
};

type FilterType = 'all' | 'direct' | 'transitive' | 'dev' | 'with-issues';

export default function Dependencies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredDependencies = mockDependencies.filter((dep) => {
    const matchesSearch = dep.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'direct':
        return matchesSearch && dep.isDirect;
      case 'transitive':
        return matchesSearch && !dep.isDirect;
      case 'dev':
        return matchesSearch && dep.isDev;
      case 'with-issues':
        return matchesSearch && (dep.vulnerabilities > 0 || dep.weakLinks > 0);
      default:
        return matchesSearch;
    }
  });

  const filterLabels: Record<FilterType, string> = {
    all: 'All Dependencies',
    direct: 'Direct Only',
    transitive: 'Transitive Only',
    dev: 'Dev Dependencies',
    'with-issues': 'With Issues',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dependencies</h1>
        <p className="text-sm text-muted-foreground">
          View and analyze all project dependencies
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockDependencies.length}</p>
                <p className="text-xs text-muted-foreground">Total Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockDependencies.filter(d => d.vulnerabilities === 0 && d.weakLinks === 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Clean Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-severity-high/10 p-2">
                <AlertTriangle className="h-5 w-5 text-severity-high" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockDependencies.filter(d => d.vulnerabilities > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Vulnerable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockDependencies.filter(d => d.weakLinks > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">With Weak Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium">Package List</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 bg-background/50"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {filterLabels[filter]}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(filterLabels).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setFilter(key as FilterType)}
                      className={filter === key ? 'bg-accent' : ''}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Vulnerabilities</TableHead>
                <TableHead className="text-center">Weak Links</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDependencies.map((dep) => (
                <TableRow key={dep.name} className="hover:bg-background/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {dep.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {dep.version}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {dep.isDirect ? (
                        <Badge variant="outline" className="text-xs">Direct</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Transitive</Badge>
                      )}
                      {dep.isDev && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Dev</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {dep.vulnerabilities > 0 ? (
                      <Badge className="bg-severity-high/20 text-severity-high border-severity-high/30">
                        {dep.vulnerabilities}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {dep.weakLinks > 0 ? (
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        {dep.weakLinks}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={riskColors[dep.riskLevel]}>
                      {dep.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://www.npmjs.com/package/${dep.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDependencies.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No dependencies found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
