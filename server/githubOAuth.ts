// GitHub OAuth implementation for per-user GitHub authentication
import { type Express, type RequestHandler } from "express";
import { storage } from "./storage";
import { Octokit } from "@octokit/rest";

const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

// Debug logging for client ID
console.log('[GitHub OAuth] Client ID:', GITHUB_OAUTH_CLIENT_ID);
console.log('[GitHub OAuth] Client ID length:', GITHUB_OAUTH_CLIENT_ID?.length);
console.log('[GitHub OAuth] Client ID type:', typeof GITHUB_OAUTH_CLIENT_ID);

// Helper to get the base URL for OAuth callbacks
function getBaseUrl(req: any): string {
  return `${req.protocol}://${req.hostname}`;
}

// Generate GitHub OAuth authorization URL
export function getGitHubAuthUrl(req: any, userId: string): string {
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/github/oauth/callback`;
  const state = Buffer.from(JSON.stringify({ userId, returnTo: req.query.returnTo || '/' })).toString('base64');
  
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: 'repo,user', // repo: create/push repos, user: read user info
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code: string, req: any): Promise<{ access_token: string; scope: string }> {
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/github/oauth/callback`;

  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CLIENT_ID!,
    client_secret: GITHUB_OAUTH_CLIENT_SECRET!,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`GitHub OAuth token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return {
    access_token: data.access_token,
    scope: data.scope || '',
  };
}

// Setup GitHub OAuth routes
export function setupGitHubOAuth(app: Express) {
  // Initiate GitHub OAuth flow
  app.get('/api/github/oauth/connect', (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Please log in first' });
    }

    const userId = req.user.claims.sub;
    const authUrl = getGitHubAuthUrl(req, userId);
    res.redirect(authUrl);
  });

  // GitHub OAuth callback
  app.get('/api/github/oauth/callback', async (req: any, res) => {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        return res.status(400).send('Missing authorization code or state');
      }

      // Decode state
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const { userId, returnTo } = stateData;

      // Exchange code for token
      const { access_token, scope } = await exchangeCodeForToken(code as string, req);

      // Store token in database
      await storage.upsertGithubToken({
        userId,
        accessToken: access_token,
        scope,
      });

      console.log(`[GitHub OAuth] Successfully connected GitHub for user ${userId}`);

      // Redirect back to the app
      res.redirect(returnTo || '/');
    } catch (error) {
      console.error('[GitHub OAuth] Error in callback:', error);
      res.status(500).send('Failed to connect GitHub account. Please try again.');
    }
  });

  // Disconnect GitHub account
  app.post('/api/github/oauth/disconnect', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.claims.sub;

    try {
      await storage.deleteGithubToken(userId);
      console.log(`[GitHub OAuth] Disconnected GitHub for user ${userId}`);
      res.json({ success: true, message: 'GitHub account disconnected' });
    } catch (error) {
      console.error('[GitHub OAuth] Error disconnecting:', error);
      res.status(500).json({ message: 'Failed to disconnect GitHub account' });
    }
  });

  // Check GitHub connection status for current user
  app.get('/api/github/oauth/status', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ connected: false, user: null });
    }

    const userId = req.user.claims.sub;

    try {
      const token = await storage.getGithubToken(userId);
      
      if (!token) {
        return res.json({ connected: false, user: null });
      }

      // Verify token is valid by fetching user info
      const octokit = new Octokit({ auth: token.accessToken });
      const { data: githubUser } = await octokit.users.getAuthenticated();

      res.json({
        connected: true,
        user: {
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
        },
      });
    } catch (error: any) {
      // Token might be invalid
      if (error.status === 401) {
        // Delete invalid token
        await storage.deleteGithubToken(userId);
        return res.json({ connected: false, user: null });
      }
      
      console.error('[GitHub OAuth] Error checking status:', error);
      res.status(500).json({ message: 'Failed to check GitHub connection status' });
    }
  });
}

// Helper to get GitHub token for a user
export async function getGitHubTokenForUser(userId: string): Promise<string | null> {
  try {
    const token = await storage.getGithubToken(userId);
    return token?.accessToken || null;
  } catch (error) {
    console.error('[GitHub OAuth] Error getting token for user:', error);
    return null;
  }
}
