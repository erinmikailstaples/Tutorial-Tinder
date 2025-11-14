import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Repository, ProjectSuggestion, PreflightResult, TemplateResponse } from "@shared/schema";
import { SwipeableCard } from "@/components/swipeable-card";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { EmptyState } from "@/components/empty-state";
import { DeckHeader } from "@/components/deck-header";
import { PreflightModal } from "@/components/preflight-modal";
import { GitHubConnectDialog } from "@/components/github-connect-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIST_ID } from "@shared/lists";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Local storage keys
const SAVED_REPOS_KEY = "tutorial-tinder-saved";
const SKIPPED_REPOS_KEY = "tutorial-tinder-skipped";

export default function Deck() {
  const { toast } = useToast();
  const searchString = useSearch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedRepos, setSavedRepos] = useState<number[]>([]);
  const [skippedRepos, setSkippedRepos] = useState<number[]>([]);
  const [readmeCache, setReadmeCache] = useState<Record<number, string>>({});
  const [suggestionsCache, setSuggestionsCache] = useState<Record<number, ProjectSuggestion>>({});
  const [preflightModalOpen, setPreflightModalOpen] = useState(false);
  const [preflightResult, setPreflightResult] = useState<PreflightResult | null>(null);
  const [isTemplateGenerating, setIsTemplateGenerating] = useState(false);
  const [githubConnectDialogOpen, setGithubConnectDialogOpen] = useState(false);

  // Get listId from URL query params or use default
  const listId = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get('listId') || DEFAULT_LIST_ID;
  }, [searchString]);

  // Load saved/skipped repos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_REPOS_KEY);
    const skipped = localStorage.getItem(SKIPPED_REPOS_KEY);
    
    if (saved) setSavedRepos(JSON.parse(saved));
    if (skipped) setSkippedRepos(JSON.parse(skipped));
  }, []);

  // Reset current index and caches when listId changes to prevent showing cached data from previous list
  useEffect(() => {
    setCurrentIndex(0);
    setReadmeCache({});
    setSuggestionsCache({});
  }, [listId]);

  // Fetch repositories for the selected list
  const { data: reposData, isLoading, error } = useQuery<{ repositories: Repository[]; listName: string }>({
    queryKey: ["/api/repos", listId],
    queryFn: async () => {
      const res = await fetch(`/api/repos?listId=${listId}`);
      if (!res.ok) throw new Error('Failed to fetch repos');
      return res.json();
    },
  });

  const repos = reposData?.repositories || [];
  const currentRepo = repos[currentIndex];

  // Fetch README for current repo
  const ownerRepo = currentRepo?.full_name?.split('/');
  const { data: readmeData } = useQuery<{ preview: string }>({
    queryKey: ownerRepo ? [`/api/readme/${ownerRepo[0]}/${ownerRepo[1]}`] : [],
    enabled: !!currentRepo && !!ownerRepo && !readmeCache[currentRepo.id],
  });

  // Fetch AI suggestions for current repo
  const { data: suggestionsData } = useQuery<ProjectSuggestion>({
    queryKey: ownerRepo ? [`/api/suggestions/${ownerRepo[0]}/${ownerRepo[1]}`] : [],
    enabled: !!currentRepo && !!ownerRepo && !suggestionsCache[currentRepo.id],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Update cache when README data arrives
  useEffect(() => {
    if (readmeData && currentRepo && !readmeCache[currentRepo.id]) {
      setReadmeCache(prev => ({
        ...prev,
        [currentRepo.id]: readmeData.preview
      }));
    }
  }, [readmeData, currentRepo, readmeCache]);

  // Update cache when AI suggestions arrive
  useEffect(() => {
    if (suggestionsData && currentRepo && !suggestionsCache[currentRepo.id]) {
      setSuggestionsCache(prev => ({
        ...prev,
        [currentRepo.id]: suggestionsData
      }));
    }
  }, [suggestionsData, currentRepo, suggestionsCache]);

  // Prefetch READMEs for next 2-3 repos to improve loading speed
  useEffect(() => {
    if (!repos.length) return;
    
    const prefetchCount = 3;
    for (let i = 1; i <= prefetchCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex >= repos.length) break;
      
      const nextRepo = repos[nextIndex];
      if (!nextRepo || readmeCache[nextRepo.id]) continue;
      
      const [owner, repo] = nextRepo.full_name.split('/');
      const queryKey = [`/api/readme/${owner}/${repo}`];
      
      // Prefetch in the background
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const res = await fetch(`/api/readme/${owner}/${repo}`);
          if (!res.ok) throw new Error('Failed to fetch README');
          const data = await res.json();
          
          // Update cache immediately
          setReadmeCache(prev => ({
            ...prev,
            [nextRepo.id]: data.preview
          }));
          
          return data;
        },
      });
    }
  }, [currentIndex, repos, readmeCache]);

  // Mutation for starring a repository on GitHub
  const starMutation = useMutation({
    mutationFn: async (repo: Repository) => {
      const [owner, repoName] = repo.full_name.split('/');
      return apiRequest('POST', `/api/star/${owner}/${repoName}`);
    },
    onSuccess: (data, repo) => {
      toast({
        title: "Starred on GitHub! ⭐",
        description: `${repo.name} has been added to your GitHub stars.`,
        duration: 4000,
      });
    },
    onError: (error: any, repo) => {
      console.error('Failed to star repository:', error);
      
      // Show helpful error message
      if (error.message?.includes('Unauthorized') || error.message?.includes('connect')) {
        toast({
          title: "GitHub Connection Required",
          description: "Please make sure your GitHub account is connected in Replit.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Failed to star on GitHub",
          description: "Saved locally, but couldn't star on GitHub. Try again later.",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
  });

  // Mutation for preflight check
  const preflightMutation = useMutation({
    mutationFn: async (repo: Repository): Promise<PreflightResult> => {
      const [owner, repoName] = repo.full_name.split('/');
      const response = await apiRequest('POST', '/api/preflight', {
        owner,
        repo: repoName,
        fullName: repo.full_name,
      });
      return response.json();
    },
    onSuccess: (data: PreflightResult) => {
      setPreflightResult(data);
      setPreflightModalOpen(true);
    },
    onError: (error: any) => {
      console.error('Preflight check failed:', error);
      toast({
        title: "Preflight Check Failed",
        description: "Unable to analyze repository. You can still try launching it.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Mutation for template generation
  const templateMutation = useMutation({
    mutationFn: async (repo: Repository): Promise<TemplateResponse> => {
      const [owner, repoName] = repo.full_name.split('/');
      const response = await apiRequest('POST', '/api/template', {
        owner,
        repo: repoName,
        defaultBranch: 'main',
      });
      return response.json();
    },
    onSuccess: (data: TemplateResponse) => {
      setIsTemplateGenerating(false);
      
      toast({
        title: "Template Created! 🎉",
        description: (
          <div className="space-y-2">
            <p>Your template "{data.templateName}" has been created successfully!</p>
            <div className="flex flex-col gap-2 text-xs">
              <a 
                href={data.templateRepoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                View on GitHub →
              </a>
              <a 
                href={data.replitImportUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                Open in Replit →
              </a>
            </div>
          </div>
        ),
        duration: 8000,
      });
      
      // Auto-open the template in Replit
      window.open(data.replitImportUrl, "_blank");
    },
    onError: (error: any, repo) => {
      setIsTemplateGenerating(false);
      
      console.error('Template generation failed:', error);
      
      // Check if error requires GitHub authentication
      if (error.response?.status === 401 || error.requiresAuth) {
        // Show GitHub connect dialog instead of error toast
        setGithubConnectDialogOpen(true);
        return;
      }
      
      // Determine error message based on error type
      let errorTitle = "Template Generation Failed";
      let errorDescription = "Couldn't create template. Launching original repo instead.";
      
      if (error.message?.includes('timeout')) {
        errorTitle = "Repository Too Large";
        errorDescription = "The repository is too large to convert. Launching original repo instead.";
      }
      
      // Show error toast
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 6000,
      });
      
      // Fallback: launch original repo after a short delay to ensure toast is shown
      setTimeout(() => {
        const replitUrl = `https://replit.com/github.com/${repo.full_name}`;
        window.open(replitUrl, "_blank");
      }, 500);
    },
  });

  const handleSave = useCallback(() => {
    if (!currentRepo) return;
    
    // Save locally first
    const newSaved = [...savedRepos, currentRepo.id];
    setSavedRepos(newSaved);
    localStorage.setItem(SAVED_REPOS_KEY, JSON.stringify(newSaved));
    
    // Star on GitHub in the background
    starMutation.mutate(currentRepo);
    
    setCurrentIndex(prev => prev + 1);
  }, [currentRepo, savedRepos, starMutation]);

  const handleSkip = useCallback(() => {
    if (!currentRepo) return;
    
    const newSkipped = [...skippedRepos, currentRepo.id];
    setSkippedRepos(newSkipped);
    localStorage.setItem(SKIPPED_REPOS_KEY, JSON.stringify(newSkipped));
    
    setCurrentIndex(prev => prev + 1);
  }, [currentRepo, skippedRepos]);

  const handleLaunch = useCallback(() => {
    if (!currentRepo) return;
    
    // Run preflight check first
    preflightMutation.mutate(currentRepo);
  }, [currentRepo, preflightMutation]);

  const handleConfirmLaunch = useCallback(() => {
    if (!currentRepo) return;
    
    // Close modal and open Replit
    setPreflightModalOpen(false);
    
    const replitUrl = `https://replit.com/github.com/${currentRepo.full_name}`;
    window.open(replitUrl, "_blank");
    
    toast({
      title: "Launching in Replit...",
      description: "Opening this repository in a new tab. Go build!",
      duration: 3000,
    });
  }, [currentRepo, toast]);

  const handleSkipPreflight = useCallback(() => {
    setPreflightModalOpen(false);
    setPreflightResult(null);
  }, []);

  const handleConvertToTemplate = useCallback(() => {
    // Prevent duplicate submissions with immediate local flag
    if (!currentRepo || isTemplateGenerating || templateMutation.isPending) return;
    
    setIsTemplateGenerating(true);
    
    toast({
      title: "Generating Replit Template...",
      description: "This may take a minute. We're cloning the repo and preparing it for Replit.",
    });
    
    templateMutation.mutate(currentRepo);
  }, [currentRepo, isTemplateGenerating, templateMutation, toast]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSavedRepos([]);
    setSkippedRepos([]);
    localStorage.removeItem(SAVED_REPOS_KEY);
    localStorage.removeItem(SKIPPED_REPOS_KEY);
    setReadmeCache({});
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSkip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleLaunch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip, handleSave, handleLaunch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DeckHeader current={0} total={0} />
        <div className="pt-24 pb-24 px-6">
          <div className="max-w-md mx-auto">
            <Skeleton className="w-full h-[600px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-bold text-2xl mb-4">Oops! Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn't load the repositories. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Show empty state when all repos are viewed
  if (currentIndex >= repos.length) {
    return (
      <div className="min-h-screen bg-background">
        <DeckHeader current={repos.length} total={repos.length} />
        <EmptyState onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DeckHeader current={currentIndex + 1} total={repos.length} />
      
      <div className="pt-24 pb-32 px-4 md:px-6">
        <div className="max-w-md mx-auto relative min-h-[650px]">
          {/* Card Stack */}
          {repos.slice(currentIndex, currentIndex + 3).map((repo, index) => {
            const zIndex = 50 - index * 10;
            const opacity = index === 0 ? 1 : 0.7;
            const blur = index > 0 ? `blur(${index * 2}px)` : 'none';

            return (
              <SwipeableCard
                key={repo.id}
                repo={repo}
                readmePreview={readmeCache[repo.id]}
                suggestions={suggestionsCache[repo.id]}
                onSave={handleSave}
                onSkip={handleSkip}
                onLaunch={handleLaunch}
                onConvertToTemplate={handleConvertToTemplate}
                isProcessing={isTemplateGenerating || templateMutation.isPending}
                isTop={index === 0}
                index={index}
                style={{
                  zIndex,
                  opacity,
                  filter: blur,
                  transition: index === 0 ? 'none' : 'all 0.3s ease-out',
                }}
              />
            );
          })}
        </div>
      </div>

      <KeyboardShortcuts />
      
      <PreflightModal
        open={preflightModalOpen}
        onOpenChange={setPreflightModalOpen}
        result={preflightResult}
        repoName={currentRepo?.full_name || ''}
        onLaunch={handleConfirmLaunch}
        onSkip={handleSkipPreflight}
        isLoading={preflightMutation.isPending}
      />

      <GitHubConnectDialog
        open={githubConnectDialogOpen}
        onOpenChange={setGithubConnectDialogOpen}
      />
    </div>
  );
}
