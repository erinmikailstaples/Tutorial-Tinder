import { Repository } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Heart, X } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";

interface RepoCardProps {
  repo: Repository;
  readmePreview?: string;
  onSave: () => void;
  onSkip: () => void;
  onLaunch: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function RepoCard({ 
  repo, 
  readmePreview, 
  onSave, 
  onSkip, 
  onLaunch,
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

      <CardContent className="flex-1 flex flex-col pb-4">
        {/* Description */}
        {repo.description && (
          <p className="text-base leading-relaxed mb-6 line-clamp-3">
            {repo.description}
          </p>
        )}

        {/* README Preview */}
        {readmePreview && (
          <div className="flex-1 mt-auto">
            <h3 className="font-semibold text-sm mb-2 text-muted-foreground">README Preview</h3>
            <div className="max-h-48 overflow-y-auto bg-muted/30 p-4 rounded-lg">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                {readmePreview}
              </pre>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4">
        {/* Primary Action - Launch in Replit */}
        <Button 
          size="lg"
          className="w-full font-semibold hover-elevate active-elevate-2"
          onClick={handleLaunch}
          data-testid={`button-launch-${repo.id}`}
        >
          <Rocket className="mr-2 h-5 w-5" />
          Launch in Replit
        </Button>

        {/* Secondary Actions */}
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="default"
            className="flex-1 hover-elevate active-elevate-2"
            onClick={handleGitHub}
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
            data-testid={`button-save-${repo.id}`}
          >
            <Heart className="h-5 w-5 text-green-600" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hover-elevate active-elevate-2 bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
            onClick={onSkip}
            data-testid={`button-skip-${repo.id}`}
          >
            <X className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Import for the Rocket icon
import { Rocket } from "lucide-react";
