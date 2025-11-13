import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  Rocket,
  GitBranch,
  FileCode,
  Terminal
} from "lucide-react";
import type { PreflightResult } from "@shared/schema";

interface PreflightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: PreflightResult | null;
  repoName: string;
  onLaunch: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function PreflightModal({
  open,
  onOpenChange,
  result,
  repoName,
  onLaunch,
  onSkip,
  isLoading = false,
}: PreflightModalProps) {
  if (!result) return null;

  const canLaunch = result.confidence >= 0.5;
  const isHighConfidence = result.confidence >= 0.8;
  const isLowConfidence = result.confidence < 0.5;

  const getConfidenceBadge = () => {
    if (isHighConfidence) {
      return <Badge className="bg-green-500 dark:bg-green-600">High Confidence</Badge>;
    } else if (canLaunch) {
      return <Badge variant="secondary">Medium Confidence</Badge>;
    } else {
      return <Badge variant="destructive">Low Confidence</Badge>;
    }
  };

  const getConfidenceIcon = () => {
    if (isHighConfidence) {
      return <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400" />;
    } else if (canLaunch) {
      return <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
    } else {
      return <XCircle className="h-6 w-6 text-destructive" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-preflight">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {getConfidenceIcon()}
            <div className="flex-1">
              <DialogTitle className="text-xl" data-testid="text-preflight-title">
                Preflight Check: {repoName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Repository analysis to ensure Replit compatibility
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" data-testid="text-confidence-score">
                {Math.round(result.confidence * 100)}%
              </span>
              {getConfidenceBadge()}
            </div>
          </div>

          {result.language && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <FileCode className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">Detected Language</div>
                <div className="text-sm text-muted-foreground mt-1" data-testid="text-language">
                  {result.language}
                  {result.framework && ` (${result.framework})`}
                </div>
              </div>
            </div>
          )}

          {result.runCommand && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <Terminal className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">Suggested Run Command</div>
                <code className="block mt-1 text-xs font-mono bg-background p-2 rounded" data-testid="text-run-command">
                  {result.runCommand}
                </code>
              </div>
            </div>
          )}

          {result.detectedFiles && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <GitBranch className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">Detected Files</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.detectedFiles.hasPackageJson && (
                    <Badge variant="outline" className="text-xs">package.json</Badge>
                  )}
                  {result.detectedFiles.hasRequirementsTxt && (
                    <Badge variant="outline" className="text-xs">requirements.txt</Badge>
                  )}
                  {result.detectedFiles.hasPyprojectToml && (
                    <Badge variant="outline" className="text-xs">pyproject.toml</Badge>
                  )}
                  {result.detectedFiles.hasDockerfile && (
                    <Badge variant="outline" className="text-xs">Dockerfile</Badge>
                  )}
                  {result.detectedFiles.hasReplitFile && (
                    <Badge variant="outline" className="text-xs">.replit</Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {result.issues && result.issues.length > 0 && (
            <div className="space-y-2">
              <div className="font-medium text-sm">Issues & Warnings</div>
              {result.issues.map((issue, index) => (
                <Alert
                  key={index}
                  variant={issue.severity === 'error' ? 'destructive' : 'default'}
                  className="py-2"
                  data-testid={`alert-issue-${index}`}
                >
                  <div className="flex items-start gap-2">
                    {issue.severity === 'error' && <XCircle className="h-4 w-4 mt-0.5" />}
                    {issue.severity === 'warning' && <AlertTriangle className="h-4 w-4 mt-0.5" />}
                    {issue.severity === 'info' && <Info className="h-4 w-4 mt-0.5" />}
                    <AlertDescription className="text-sm">{issue.message}</AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {isHighConfidence && (
            <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                This repository is ready to launch in Replit! Everything looks good.
              </AlertDescription>
            </Alert>
          )}

          {!isHighConfidence && canLaunch && (
            <Alert className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                This repository might need some manual configuration after launching in Replit.
              </AlertDescription>
            </Alert>
          )}

          {isLowConfidence && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This repository may not be compatible with Replit or requires significant manual setup.
                We recommend viewing it on GitHub first.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isLoading}
            data-testid="button-skip-preflight"
          >
            Skip
          </Button>
          
          {canLaunch ? (
            <Button
              onClick={onLaunch}
              disabled={isLoading}
              data-testid="button-launch-preflight"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Launch in Replit
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => window.open(`https://github.com/${repoName}`, '_blank')}
              data-testid="button-view-github"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
