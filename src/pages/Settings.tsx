import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Key, 
  Shield, 
  Bell,
  Database,
  Code,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure scanner settings and integrations
        </p>
      </div>

      <div className="grid gap-6">
        {/* API Keys */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Integrations
            </CardTitle>
            <CardDescription>
              Configure external vulnerability database connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Free APIs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Free Data Sources</h3>
              
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">OSV Database</p>
                    <p className="text-sm text-muted-foreground">Open Source Vulnerabilities</p>
                  </div>
                </div>
                <Badge className="bg-success/20 text-success border-success/30">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">GitHub Advisory Database</p>
                    <p className="text-sm text-muted-foreground">GitHub security advisories</p>
                  </div>
                </div>
                <Badge className="bg-success/20 text-success border-success/30">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">npm Registry</p>
                    <p className="text-sm text-muted-foreground">Package metadata</p>
                  </div>
                </div>
                <Badge className="bg-success/20 text-success border-success/30">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Premium APIs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Premium Data Sources (Optional)</h3>
              
              <div className="rounded-lg border border-border/50 bg-background/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Snyk Vulnerability Database</p>
                      <p className="text-sm text-muted-foreground">Enhanced vulnerability data</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    <XCircle className="mr-1 h-3 w-3" />
                    Not Connected
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    placeholder="Enter Snyk API key" 
                    className="flex-1 bg-background"
                  />
                  <Button>Connect</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan Settings */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Scan Configuration
            </CardTitle>
            <CardDescription>
              Customize how the scanner analyzes your dependencies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Scan Dev Dependencies</Label>
                <p className="text-sm text-muted-foreground">
                  Include devDependencies in security analysis
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Typosquatting Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Check for packages with names similar to popular ones
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Install Script Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Flag packages with pre/post install scripts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintainer Activity Check</Label>
                <p className="text-sm text-muted-foreground">
                  Alert on packages with inactive maintainers
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Inactivity Threshold (months)</Label>
              <Input 
                type="number" 
                defaultValue="12" 
                className="w-32 bg-background"
              />
              <p className="text-sm text-muted-foreground">
                Flag packages not updated in this many months
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CI/CD Integration */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              CI/CD Integration
            </CardTitle>
            <CardDescription>
              Integrate security scanning into your pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-background/30 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Use our API to integrate security scanning into your CI/CD pipeline:
              </p>
              <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
{`POST /api/scan
Content-Type: application/json

{
  "packageJson": "<your package.json content>",
  "options": {
    "includeDevDeps": true,
    "failOnCritical": true
  }
}`}
              </pre>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              API documentation coming soon
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
