import { Repository } from "@shared/schema";

interface RedditPost {
  data: {
    title: string;
    author: string;
    score: number;
    url: string;
    selftext: string;
    created_utc: number;
    num_comments: number;
    permalink: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
    after: string | null;
  };
}

export async function fetchRedditPosts(subreddit: string, limit: number = 100): Promise<RedditResponse> {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'web:tutorial-tinder:v1.0.0 (by /u/erinmikailstaples)',
      },
    });

    if (!response.ok) {
      console.error(`Reddit API error: ${response.status} ${response.statusText}`);
      throw new Error(`Reddit API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
}

export function extractGitHubRepos(posts: RedditPost[]): string[] {
  const repoPattern = /github\.com\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/gi;
  const repos = new Set<string>();

  for (const post of posts) {
    const textToSearch = `${post.data.url} ${post.data.selftext} ${post.data.title}`;
    const matches = Array.from(textToSearch.matchAll(repoPattern));
    
    for (const match of matches) {
      let repo = match[1];
      // Clean up repo name (remove trailing slashes, anchors, etc.)
      repo = repo.replace(/[\/\?#].*$/, '');
      
      // Filter out common non-repo paths
      if (!repo.includes('/') || 
          repo.startsWith('github.com') || 
          repo.includes('/issues') ||
          repo.includes('/pull') ||
          repo.includes('/wiki')) {
        continue;
      }
      
      repos.add(repo);
    }
  }

  return Array.from(repos);
}

export async function fetchCoolGitHubProjects(limit: number = 50): Promise<string[]> {
  console.log('[Reddit] Fetching posts from r/coolgithubprojects');
  
  const response = await fetchRedditPosts('coolgithubprojects', limit);
  const repos = extractGitHubRepos(response.data.children);
  
  console.log(`[Reddit] Found ${repos.length} unique GitHub repos from ${response.data.children.length} posts`);
  
  return repos;
}
