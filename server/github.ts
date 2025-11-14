import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  // Check cached connection settings first (with expiry check)
  if (connectionSettings && connectionSettings.settings?.expires_at) {
    const expiresAt = new Date(connectionSettings.settings.expires_at).getTime();
    if (expiresAt > Date.now()) {
      return connectionSettings.settings.access_token;
    }
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.log('[GitHub] No Replit token available, checking for GITHUB_TOKEN env var');
    // Fallback to manual GitHub token for development
    if (process.env.GITHUB_TOKEN) {
      console.log('[GitHub] Using GITHUB_TOKEN environment variable');
      return process.env.GITHUB_TOKEN;
    }
    return null;
  }

  if (!hostname) {
    console.error('[GitHub] REPLIT_CONNECTORS_HOSTNAME not set');
    return process.env.GITHUB_TOKEN || null;
  }

  try {
    console.log('[GitHub] Fetching connector token...');
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    if (!response.ok) {
      console.error('[GitHub] Connector API error:', response.status, response.statusText);
      return process.env.GITHUB_TOKEN || null;
    }
    
    const data = await response.json();
    connectionSettings = data.items?.[0];

    if (!connectionSettings) {
      console.log('[GitHub] No GitHub connector found');
      return process.env.GITHUB_TOKEN || null;
    }

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
    
    if (accessToken) {
      console.log('[GitHub] Successfully retrieved connector token');
      return accessToken;
    }
    
    console.log('[GitHub] No access token in connector settings');
    return process.env.GITHUB_TOKEN || null;
  } catch (error) {
    console.error('[GitHub] Error fetching connector token:', error);
    return process.env.GITHUB_TOKEN || null;
  }
}

// Export getAccessToken for use in other modules (e.g., template generation)
export { getAccessToken };

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  // Create client with or without auth
  return new Octokit(accessToken ? { auth: accessToken } : {});
}

// Fetch starred repositories from a specific list
export async function fetchStarredList(username: string, listName: string) {
  const octokit = await getUncachableGitHubClient();
  
  try {
    // GitHub API doesn't have a direct endpoint for starred lists, 
    // so we'll fetch all starred repos
    // Remove sort parameter to get repos in the order they were starred
    const { data } = await octokit.rest.activity.listReposStarredByUser({
      username,
      per_page: 100,
      // No sort parameter - returns repos in starred order
    });

    return data;
  } catch (error) {
    console.error('Error fetching starred repos:', error);
    throw error;
  }
}

// Fetch README content for a repository
export async function fetchReadme(owner: string, repo: string) {
  const octokit = await getUncachableGitHubClient();
  
  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
    });

    return data;
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error);
    return null;
  }
}

// Check if the authenticated user has starred a repository
export async function checkIfStarred(owner: string, repo: string): Promise<boolean> {
  const octokit = await getUncachableGitHubClient();
  
  try {
    await octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
      owner,
      repo,
    });
    return true;
  } catch (error: any) {
    // 404 means not starred
    if (error.status === 404) {
      return false;
    }
    console.error(`Error checking star status for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Star a repository for the authenticated user
export async function starRepository(owner: string, repo: string): Promise<void> {
  const octokit = await getUncachableGitHubClient();
  
  try {
    await octokit.rest.activity.starRepoForAuthenticatedUser({
      owner,
      repo,
    });
    console.log(`Successfully starred ${owner}/${repo}`);
  } catch (error) {
    console.error(`Error starring ${owner}/${repo}:`, error);
    throw error;
  }
}

// Unstar a repository for the authenticated user
export async function unstarRepository(owner: string, repo: string): Promise<void> {
  const octokit = await getUncachableGitHubClient();
  
  try {
    await octokit.rest.activity.unstarRepoForAuthenticatedUser({
      owner,
      repo,
    });
    console.log(`Successfully unstarred ${owner}/${repo}`);
  } catch (error) {
    console.error(`Error unstarring ${owner}/${repo}:`, error);
    throw error;
  }
}
