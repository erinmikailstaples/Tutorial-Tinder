import { Repository, ProjectSuggestion } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Heart, X, Lightbulb, Sparkles, Rocket, Wand2 } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";

interface RepoCardProps {
  repo: Repository;
  readmePreview?: string;
  suggestions?: ProjectSuggestion;
  onSave: () => void;
  onSkip: () => void;
  onLaunch: () => void;
  onConvertToTemplate?: () => void;
  isProcessing?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function RepoCard({ 
  repo, 
  readmePreview,
  suggestions,
  onSave, 
  onSkip, 
  onLaunch,
  onConvertToTemplate,
  isProcessing = false,
  style,
  className = ""
}: RepoCardProps) {
  const replitUrl = `https://replit.com/github.com/${repo.full_name}`;
  
  const handleLaunch = () => {
    window.open(replitUrl, "_blank");
    onLaunch();
  };

  const handleGitHub = () => {
    window.open(repo.html_url, "_blank");
  };

  return (
    <Card 
      className={`min-h-[600px] flex flex-col ${className}`}
      style={style}
      data-testid={`card-repo-${repo.id}`}
    >
      <CardHeader className="pb-4">
        {/* Repo Owner/Name Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="font-mono text-xs">
            <SiGithub className="mr-1 h-3 w-3" />
            {repo.full_name}
          </Badge>
        </div>

        {/* Repo Name */}
        <h2 className="font-bold text-xl md:text-2xl mb-4 leading-tight">
          {repo.name}
        </h2>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
          {repo.language && (
            <Badge variant="outline" className="rounded-full">
              {repo.language}
            </Badge>
          )}
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
            <span className="font-medium">{repo.stargazers_count.toLocaleString()}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pb-4 overflow-y-auto">
        {/* Description */}
        {repo.description && (
          <p className="text-base leading-relaxed mb-6 line-clamp-3">
            {repo.description}
          </p>
        )}

        {/* AI-Generated Suggestions */}
        {suggestions && (suggestions.projectIdeas.length > 0 || suggestions.firstPrompts.length > 0) && (
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">AI-Powered Ideas</h3>
            </div>
            
            {suggestions.projectIdeas.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  What You Could Build
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-900/90 dark:text-blue-100/90">
                  {suggestions.projectIdeas.slice(0, 2).map((idea, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600 dark:text-blue-400 shrink-0">•</span>
                      <span className="line-clamp-2">{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestions.firstPrompts.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">First Prompt Ideas</h4>
                <div className="space-y-1.5">
                  {suggestions.firstPrompts.slice(0, 2).map((prompt, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs bg-white/50 dark:bg-black/20 p-2 rounded border border-blue-200/30 dark:border-blue-700/30 font-mono line-clamp-2"
                      data-testid={`suggestion-prompt-${idx}`}
                    >
                      "{prompt}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* README Preview */}
        {readmePreview && (
          <div className="flex-1 mt-auto">
            <h3 className="font-semibold text-sm mb-2 text-muted-foreground">README Preview</h3>
            <div className="max-h-32 overflow-y-auto bg-muted/30 p-4 rounded-lg">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                {readmePreview}
              </pre>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4">
        {/* Primary Action - Convert to Template */}
        {onConvertToTemplate && (
          <Button 
            size="lg"
            className="w-full font-semibold bg-blue-600 hover:bg-blue-700 border-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-700"
            onClick={onConvertToTemplate}
            disabled={isProcessing}
            data-testid={`button-convert-template-${repo.id}`}
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {isProcessing ? 'Generating Template...' : 'Convert to Replit Template'}
          </Button>
        )}

        {/* Secondary Action - Launch as-is in Replit */}
        <Button 
          size="default"
          variant="secondary"
          className="w-full font-medium hover-elevate active-elevate-2"
          onClick={handleLaunch}
          disabled={isProcessing}
          data-testid={`button-launch-${repo.id}`}
        >
          <Rocket className="mr-2 h-4 w-4" />
          Launch as-is in Replit
        </Button>
        
        {/* Compatibility Callout */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-muted/50 border border-muted-foreground/20">
          <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Not all repos are optimized for Replit. The template converter cleans and configures the repo for best results.
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="default"
            className="flex-1 hover-elevate active-elevate-2"
            onClick={handleGitHub}
            disabled={isProcessing}
            data-testid={`button-github-${repo.id}`}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on GitHub
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hover-elevate active-elevate-2 bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
            onClick={onSave}
            disabled={isProcessing}
            data-testid={`button-save-${repo.id}`}
          >
            <Heart className="h-5 w-5 text-green-600" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hover-elevate active-elevate-2 bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
            onClick={onSkip}
            disabled={isProcessing}
            data-testid={`button-skip-${repo.id}`}
          >
            <X className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
