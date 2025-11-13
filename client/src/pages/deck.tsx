import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Repository } from "@shared/schema";
import { SwipeableCard } from "@/components/swipeable-card";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { EmptyState } from "@/components/empty-state";
import { DeckHeader } from "@/components/deck-header";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIST_ID } from "@shared/lists";
import { queryClient } from "@/lib/queryClient";

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

  // Reset current index and readme cache when listId changes to prevent showing cached data from previous list
  useEffect(() => {
    setCurrentIndex(0);
    setReadmeCache({});
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

  // Update cache when README data arrives
  useEffect(() => {
    if (readmeData && currentRepo && !readmeCache[currentRepo.id]) {
      setReadmeCache(prev => ({
        ...prev,
        [currentRepo.id]: readmeData.preview
      }));
    }
  }, [readmeData, currentRepo, readmeCache]);

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

  const handleSave = useCallback(() => {
    if (!currentRepo) return;
    
    const newSaved = [...savedRepos, currentRepo.id];
    setSavedRepos(newSaved);
    localStorage.setItem(SAVED_REPOS_KEY, JSON.stringify(newSaved));
    
    toast({
      title: "Saved!",
      description: `${currentRepo.name} added to your saved list.`,
    });
    
    setCurrentIndex(prev => prev + 1);
  }, [currentRepo, savedRepos, toast]);

  const handleSkip = useCallback(() => {
    if (!currentRepo) return;
    
    const newSkipped = [...skippedRepos, currentRepo.id];
    setSkippedRepos(newSkipped);
    localStorage.setItem(SKIPPED_REPOS_KEY, JSON.stringify(newSkipped));
    
    setCurrentIndex(prev => prev + 1);
  }, [currentRepo, skippedRepos]);

  const handleLaunch = useCallback(() => {
    if (!currentRepo) return;
    
    toast({
      title: "Launching in Replit...",
      description: "Opening this repository in a new tab. Go build!",
    });
  }, [currentRepo, toast]);

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
                onSave={handleSave}
                onSkip={handleSkip}
                onLaunch={handleLaunch}
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
    </div>
  );
}
