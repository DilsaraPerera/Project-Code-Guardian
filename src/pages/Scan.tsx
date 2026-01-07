import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileJson, Scan as ScanIcon, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ScanStatus = 'idle' | 'validating' | 'scanning' | 'completed' | 'error';

export default function Scan() {
  const [packageJsonContent, setPackageJsonContent] = useState("");
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [parseError, setParseError] = useState<string | null>(null);
  const { toast } = useToast();

  const validatePackageJson = (content: string): boolean => {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.name && !parsed.dependencies && !parsed.devDependencies) {
        setParseError("Invalid package.json: missing required fields");
        return false;
      }
      setParseError(null);
      return true;
    } catch (e) {
      setParseError("Invalid JSON format");
      return false;
    }
  };

  const handleContentChange = (content: string) => {
    setPackageJsonContent(content);
    if (content.trim()) {
      validatePackageJson(content);
    } else {
      setParseError(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid package.json file",
        variant: "destructive",
      });
      return;
    }

    const content = await file.text();
    setPackageJsonContent(content);
    validatePackageJson(content);
  };

  const handleStartScan = async () => {
    if (!packageJsonContent.trim()) {
      toast({
        title: "No content",
        description: "Please paste or upload a package.json file",
        variant: "destructive",
      });
      return;
    }

    if (!validatePackageJson(packageJsonContent)) {
      return;
    }

    setStatus('scanning');
    
    // TODO: Implement actual scanning logic with edge function
    // For now, simulate a scan
    setTimeout(() => {
      setStatus('completed');
      toast({
        title: "Scan completed",
        description: "Your project has been analyzed successfully",
      });
    }, 3000);
  };

  const getDependencyCount = (): { deps: number; devDeps: number } | null => {
    try {
      const parsed = JSON.parse(packageJsonContent);
      return {
        deps: Object.keys(parsed.dependencies || {}).length,
        devDeps: Object.keys(parsed.devDependencies || {}).length,
      };
    } catch {
      return null;
    }
  };

  const counts = packageJsonContent ? getDependencyCount() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Security Scan</h1>
        <p className="text-sm text-muted-foreground">
          Analyze your project dependencies for vulnerabilities and weak-link signals
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" />
                Package.json
              </CardTitle>
              <CardDescription>
                Paste your package.json content or upload the file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File upload */}
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={status === 'scanning'}
                  />
                  <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/50 p-4 transition-all hover:border-primary hover:bg-background">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Upload package.json
                    </span>
                  </div>
                </label>
              </div>

              <div className="relative flex items-center">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-muted-foreground">or paste content</span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Textarea */}
              <Textarea
                placeholder={`{
  "name": "your-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    ...
  }
}`}
                value={packageJsonContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-background/50"
                disabled={status === 'scanning'}
              />

              {/* Validation feedback */}
              {parseError && (
                <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                  <AlertCircle className="h-4 w-4" />
                  {parseError}
                </div>
              )}

              {counts && !parseError && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  Valid package.json detected
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan button */}
          <Button
            onClick={handleStartScan}
            className="w-full glow-primary gap-2"
            size="lg"
            disabled={!packageJsonContent.trim() || !!parseError || status === 'scanning'}
          >
            {status === 'scanning' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <ScanIcon className="h-5 w-5" />
                Start Security Scan
              </>
            )}
          </Button>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          {/* Package summary */}
          {counts && (
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Detected Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Dependencies</span>
                    <Badge variant="outline">{counts.deps}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Dev Dependencies</span>
                    <Badge variant="outline">{counts.devDeps}</Badge>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Total</span>
                      <Badge className="bg-primary/20 text-primary">
                        {counts.deps + counts.devDeps}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What we check */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Security Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-success" />
                  <span className="text-muted-foreground">Known CVE vulnerabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-success" />
                  <span className="text-muted-foreground">Install script detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-success" />
                  <span className="text-muted-foreground">Maintainer activity analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-success" />
                  <span className="text-muted-foreground">Typosquatting detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-success" />
                  <span className="text-muted-foreground">Deprecated package alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-success" />
                  <span className="text-muted-foreground">SBOM generation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data sources */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/5">OSV Database</Badge>
                <Badge variant="outline" className="bg-primary/5">GitHub Advisory</Badge>
                <Badge variant="outline" className="bg-primary/5">npm Registry</Badge>
                <Badge variant="outline" className="bg-primary/5">Snyk (optional)</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
