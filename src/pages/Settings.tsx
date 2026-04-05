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
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-primary/70">
          Configure scanner settings and integrations
        </p>
      </div>

      <div className="grid gap-6">
        {/* API Keys */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Key className="h-5 w-5 text-primary" />
              API Integrations
            </CardTitle>
            <CardDescription className="text-primary/60">
              Configure external vulnerability database connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Free APIs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-primary">Free Data Sources</h3>
              
              {[
                { name: "OSV Database", desc: "Open Source Vulnerabilities" },
                { name: "GitHub Advisory Database", desc: "GitHub security advisories" },
                { name: "npm Registry", desc: "Package metadata" },
              ].map((src) => (
                <div key={src.name} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-primary">{src.name}</p>
                      <p className="text-sm text-primary/60">{src.desc}</p>
                    </div>
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </div>
              ))}
            </div>

            <Separator />

            {/* Premium APIs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-primary">Premium Data Sources (Optional)</h3>
              
              <div className="rounded-lg border border-border/50 bg-background/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary/50" />
                    <div>
                      <p className="font-medium text-primary">Snyk Vulnerability Database</p>
                      <p className="text-sm text-primary/60">Enhanced vulnerability data</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary/50">
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
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5 text-primary" />
              Scan Configuration
            </CardTitle>
            <CardDescription className="text-primary/60">
              Customize how the scanner analyzes your dependencies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Scan Dev Dependencies", desc: "Include devDependencies in security analysis" },
              { label: "Typosquatting Detection", desc: "Check for packages with names similar to popular ones" },
              { label: "Install Script Detection", desc: "Flag packages with pre/post install scripts" },
              { label: "Maintainer Activity Check", desc: "Alert on packages with inactive maintainers" },
            ].map((item, i) => (
              <div key={item.label}>
                {i > 0 && <Separator className="mb-6" />}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-primary">{item.label}</Label>
                    <p className="text-sm text-primary/60">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <Label className="text-primary">Inactivity Threshold (months)</Label>
              <Input 
                type="number" 
                defaultValue="12" 
                className="w-32 bg-background"
              />
              <p className="text-sm text-primary/60">
                Flag packages not updated in this many months
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CI/CD Integration */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Code className="h-5 w-5 text-primary" />
              CI/CD Integration
            </CardTitle>
            <CardDescription className="text-primary/60">
              Integrate security scanning into your pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-background/30 p-4">
              <p className="text-sm text-primary/70 mb-3">
                Use our API to integrate security scanning into your CI/CD pipeline:
              </p>
              <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm font-mono text-primary/60">
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
            <Badge variant="outline" className="text-primary/50">
              API documentation coming soon
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
