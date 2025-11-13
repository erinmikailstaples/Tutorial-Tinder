import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { parseStarredListUrl } from "@shared/lists";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Sparkles } from "lucide-react";

interface ListInfo {
  id: string;
  name: string;
  description: string;
}

export default function ListSelector() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [customUrl, setCustomUrl] = useState("");

  // Fetch available lists
  const { data: listsData, isLoading } = useQuery<{ lists: ListInfo[] }>({
    queryKey: ["/api/lists"],
  });

  const lists = listsData?.lists || [];

  const handleSelectList = (listId: string) => {
    setLocation(`/deck?listId=${listId}`);
  };

  const handleCustomUrl = () => {
    const parsed = parseStarredListUrl(customUrl);
    
    if (!parsed) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub starred list URL (e.g., https://github.com/stars/username/lists/list-name)",
        variant: "destructive",
      });
      return;
    }

    // Check if this list is in our known lists by matching list name from URL
    const matchedList = lists.find((l) => {
      // Match by exact list name or check if the parsed name matches our list ID
      return l.id === parsed.listName || l.id.replace(/-/g, '') === parsed.listName.replace(/-/g, '');
    });

    if (matchedList) {
      // Redirect to the matched list
      toast({
        title: "List Found!",
        description: `Loading "${matchedList.name}"...`,
      });
      setLocation(`/deck?listId=${matchedList.id}`);
    } else {
      // Show message about unsupported list
      toast({
        title: "List Not Available",
        description: `The list "${parsed.listName}" isn't available yet. We currently support: ${lists.map(l => l.name).join(', ')}. Request this list to be added!`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Choose Your Adventure</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Select a Tutorial List
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our curated collections or paste your own GitHub starred list URL to get started
          </p>
        </div>

        {/* Suggested Lists */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Suggested Lists</h2>
          
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {lists.map((list) => (
                <Card 
                  key={list.id}
                  className="hover-elevate active-elevate-2 transition-all cursor-pointer"
                  onClick={() => handleSelectList(list.id)}
                  data-testid={`card-list-${list.id}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {list.name}
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>{list.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectList(list.id);
                      }}
                      data-testid={`button-select-${list.id}`}
                    >
                      Start Swiping
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Custom URL Input */}
        <Card>
          <CardHeader>
            <CardTitle>Or Paste Your Own List URL</CardTitle>
            <CardDescription>
              Enter a GitHub starred list URL (e.g., https://github.com/stars/username/lists/list-name)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom-url">GitHub Starred List URL</Label>
                <Input
                  id="custom-url"
                  type="url"
                  placeholder="https://github.com/stars/username/lists/list-name"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomUrl()}
                  data-testid="input-custom-url"
                />
              </div>
              <Button 
                onClick={handleCustomUrl}
                disabled={!customUrl}
                data-testid="button-submit-custom-url"
              >
                Load This List
              </Button>
              <p className="text-xs text-muted-foreground">
                Note: We can only load lists that have been pre-curated. If your list isn't available, 
                we'll let you know and suggest alternatives.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
