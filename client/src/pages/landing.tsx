import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Rocket, Zap, CheckCircle2, Heart, Hammer, Wrench, Sparkles } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { GitHubConnectDialog } from "@/components/github-connect-dialog";

export default function Landing() {
  const [githubConnectDialogOpen, setGithubConnectDialogOpen] = useState(false);

  // Check GitHub connection status
  const { data: githubStatus, isLoading: isLoadingGitHubStatus } = useQuery<{ connected: boolean; message: string }>({
    queryKey: ['/api/github/status'],
  });

  const isGitHubConnected = githubStatus?.connected ?? false;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          {/* Code brackets */}
          <div className="absolute top-20 left-10 text-6xl font-mono text-primary">{"{"}</div>
          <div className="absolute top-40 right-20 text-6xl font-mono text-primary">{"}"}</div>
          <div className="absolute bottom-32 left-1/4 text-4xl font-mono text-accent-foreground">{"<>"}</div>
          <div className="absolute bottom-20 right-1/3 text-4xl font-mono text-accent-foreground">{"</>"}</div>
          
          {/* Hearts */}
          <Heart className="absolute top-32 right-1/4 h-12 w-12 text-primary fill-primary" />
          <Heart className="absolute bottom-40 left-20 h-8 w-8 text-accent-foreground fill-accent-foreground" />
          <Heart className="absolute top-1/2 left-10 h-10 w-10 text-primary fill-primary" />
          
          {/* Builder icons */}
          <Hammer className="absolute top-1/3 right-12 h-14 w-14 text-accent-foreground" />
          <Wrench className="absolute bottom-1/3 right-1/4 h-10 w-10 text-primary" />
          <Sparkles className="absolute top-1/4 left-1/3 h-12 w-12 text-primary" />
          <Rocket className="absolute bottom-1/4 left-1/3 h-16 w-16 text-accent-foreground" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            From "just browsing" to{" "}
            <span className="text-primary">"I'm building"</span>
            <br />
            at the speed of a{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              swipe
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            Swipe, match, and instantly launch repos that look fun. You'll learn way more from rollin' with real code than from a perfectly polished README trying to catfish you.
          </p>

          {/* GitHub Connection Status */}
          {!isLoadingGitHubStatus && (
            <div className="mb-8 flex flex-col items-center gap-3">
              {isGitHubConnected ? (
                <Badge 
                  variant="secondary" 
                  className="px-4 py-2 text-sm gap-2"
                  data-testid="badge-github-connected"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  GitHub Connected
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGithubConnectDialogOpen(true)}
                  className="gap-2"
                  data-testid="button-connect-github-landing"
                >
                  <SiGithub className="h-5 w-5" />
                  Connect GitHub to Create Templates
                </Button>
              )}
            </div>
          )}

          <Link href="/select-list">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold hover-elevate active-elevate-2"
              data-testid="button-start-swiping"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Start Swiping
            </Button>
          </Link>
        </div>
      </div>

      <GitHubConnectDialog
        open={githubConnectDialogOpen}
        onOpenChange={setGithubConnectDialogOpen}
      />

      {/* Features Section */}
      <div className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <Code2 className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-3">Curated Tutorials</h3>
              <p className="text-muted-foreground leading-relaxed">
                Handpicked beginner-friendly repositories designed to help you learn by building.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-3">Instant Setup</h3>
              <p className="text-muted-foreground leading-relaxed">
                One-click launch into Replit. No configuration, no setup—just start coding.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <Rocket className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-3">Learn by Doing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Swipe through projects, save your favorites, and build real applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
