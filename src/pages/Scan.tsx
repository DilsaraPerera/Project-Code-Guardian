import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileJson, Scan as ScanIcon, AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScan } from "@/hooks/useScan";

export default function Scan() {
  const [packageJsonContent, setPackageJsonContent] = useState("");
  const [lockfileContent, setLockfileContent] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { scanProgress, startScan, resetScan } = useScan();

  const validatePackageJson = (content: string): boolean => {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.name && !parsed.dependencies && !parsed.devDependencies) {
        setParseError("Invalid package.json: missing required fields");
        return false;
      }
      setParseError(null);
      return true;
    } catch {
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

    const content = await file.text();
    
    if (file.name === 'package-lock.json') {
      setLockfileContent(content);
      toast({
        title: "Lockfile uploaded",
        description: "package-lock.json will be used for transitive dependency analysis",
      });
      return;
    }

    if (file.name.endsWith('.json')) {
      setPackageJsonContent(content);
      validatePackageJson(content);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid package.json file",
        variant: "destructive",
      });
    }
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

    const result = await startScan(packageJsonContent, lockfileContent || undefined);
    
    if (result) {
      toast({
        title: "Scan completed",
        description: `Found ${result.summary.criticalVulnerabilities + result.summary.highVulnerabilities} critical/high vulnerabilities`,
      });
      navigate(`/vulnerabilities?scanId=${result.id}`);
    }
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
  const isScanning = scanProgress.status === 'scanning' || scanProgress.status === 'parsing';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">New Security Scan</h1>
        <p className="text-sm text-primary/70">
          Analyze your project dependencies for vulnerabilities and weak-link signals
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileJson className="h-5 w-5 text-primary" />
                Package.json
              </CardTitle>
              <CardDescription className="text-primary/60">
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
                    disabled={isScanning}
                  />
                  <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/50 p-4 transition-all hover:border-primary hover:bg-background">
                    <Upload className="h-5 w-5 text-primary/50" />
                    <span className="text-sm text-primary/60">
                      Upload package.json
                    </span>
                  </div>
                </label>
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isScanning}
                  />
                  <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/50 p-4 transition-all hover:border-primary hover:bg-background">
                    <Lock className="h-5 w-5 text-primary/50" />
                    <span className="text-sm text-primary/60">
                      Upload lockfile (optional)
                    </span>
                  </div>
                </label>
              </div>

              {lockfileContent && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Lockfile attached - transitive dependencies will be analyzed
                </div>
              )}

              <div className="relative flex items-center">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-primary/50">or paste content</span>
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
                disabled={isScanning}
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

          {/* Progress section */}
          {isScanning && (
            <Card className="bg-gradient-card border-primary/30">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary/70">{scanProgress.message}</span>
                    <span className="font-mono text-primary">{scanProgress.progress}%</span>
                  </div>
                  <Progress value={scanProgress.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error display */}
          {scanProgress.status === 'failed' && (
            <Card className="bg-danger/10 border-danger/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-danger">
                  <AlertCircle className="h-5 w-5" />
                  <span>{scanProgress.message}</span>
                </div>
                <Button variant="outline" className="mt-4" onClick={resetScan}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scan button */}
          <Button
            onClick={handleStartScan}
            className="w-full glow-primary gap-2"
            size="lg"
            disabled={!packageJsonContent.trim() || !!parseError || isScanning}
          >
            {isScanning ? (
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
                <CardTitle className="text-sm font-medium text-primary/80">
                  Detected Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary">Dependencies</span>
                    <Badge variant="outline">{counts.deps}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary">Dev Dependencies</span>
                    <Badge variant="outline">{counts.devDeps}</Badge>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">Total</span>
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
              <CardTitle className="text-sm font-medium text-primary/80">
                Security Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {[
                  "Known CVE vulnerabilities",
                  "Install script detection",
                  "Maintainer activity analysis",
                  "Typosquatting detection",
                  "Deprecated package alerts",
                  "SBOM generation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-success" />
                    <span className="text-primary/70">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Data sources */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">
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
