# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Tutorial Tinder is a Tinder-style web app that helps developers discover GitHub repositories and launch them instantly in Replit. The app features swipeable cards, AI-powered project suggestions, preflight checks for Replit compatibility, and automatic template generation.

**Key Features:**
- Swipeable card interface for browsing curated GitHub repos
- AI-generated project suggestions using GPT-4 via Replit AI
- Preflight analysis to detect languages/frameworks and suggest run commands
- Template generator that creates Replit-ready versions of repos
- Per-user GitHub OAuth for starring repos and pushing templates
- Replit Auth (OIDC) for user authentication

## Common Commands

### Development
```bash
npm run dev        # Start development server (frontend + backend on port 5000)
npm run build      # Build for production (Vite + esbuild)
npm start          # Start production server
npm run check      # Run TypeScript type checking
```

### Database
```bash
npm run db:push    # Push database schema changes (Drizzle ORM)
```

### Testing
This project does not currently have a test suite. To verify changes:
- Run `npm run check` for TypeScript errors
- Run `npm run dev` and manually test features
- Check browser console and server logs for errors

## Architecture

### Stack Overview
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express + TypeScript (runs on same port as frontend in dev)
- **Routing:** Wouter (lightweight React router)
- **Styling:** Tailwind CSS 3 + shadcn/ui components
- **Data Fetching:** TanStack Query (React Query)
- **Animations:** react-spring + @use-gesture for swipe gestures
- **Database:** PostgreSQL (via Replit) + Drizzle ORM
- **Authentication:** 
  - Replit Auth (OIDC) for user login/session management
  - GitHub OAuth for per-user GitHub access (starring, template creation)
- **External APIs:** GitHub REST API (Octokit), OpenAI (via Replit AI)

### Directory Structure
```
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Route components (landing, list-selector, deck, not-found)
│       ├── components/  # Reusable React components (mostly shadcn/ui)
│       ├── lib/         # Frontend utilities (queryClient, auth context)
│       └── main.tsx     # Vite entry point
├── server/              # Express backend
│   ├── index.ts         # App entry point, middleware setup
│   ├── routes.ts        # API route definitions
│   ├── github.ts        # GitHub API client (Replit connector + OAuth)
│   ├── githubOAuth.ts   # Per-user GitHub OAuth implementation
│   ├── replitAuth.ts    # Replit Auth (OIDC) setup
│   ├── preflight.ts     # Repository analysis (clone + detect language/framework)
│   ├── template-generator.ts  # Convert repos to Replit-ready templates
│   ├── ai.ts            # OpenAI GPT-4 integration for suggestions
│   ├── reddit.ts        # Reddit API integration (deprecated - now pre-curated)
│   ├── storage.ts       # Database abstraction layer
│   ├── db.ts            # Drizzle ORM setup
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared TypeScript code (types, schemas, lists)
│   ├── schema.ts        # Zod schemas for validation
│   └── lists.ts         # Curated repository list definitions
└── attached_assets/     # Static assets (images, icons)
```

### Key Architectural Patterns

**Monorepo Structure:**
- Frontend and backend share types via `@shared/*` path alias
- Single build process compiles both (Vite for client, esbuild for server)
- Dev mode runs Express with Vite middleware for hot reload

**Authentication Flow:**
1. User logs in via Replit Auth (OIDC) → session stored in PostgreSQL
2. User connects GitHub via OAuth → token stored in DB per user
3. API routes use `requireAuth` middleware for Replit auth
4. Template/star routes use `requireGitHub` middleware (checks both)

**GitHub Integration:**
- **Legacy connector:** Replit GitHub connector (deprecated, read-only) for fetching public repo data
- **Per-user OAuth:** Custom GitHub OAuth flow for write operations (star/unstar, create repos)
- All GitHub operations should prefer per-user tokens when available

**Template Generation Flow:**
1. User clicks "Convert to Replit Template" on a card
2. Frontend calls `POST /api/template` with `{owner, repo, defaultBranch?}`
3. Backend (template-generator.ts):
   - Shallow clones repo to temp directory
   - Detects language (Node.js/Python/other) and framework
   - Removes build artifacts (.git, node_modules, dist, etc.)
   - Creates/updates `.replit` config with detected run command
   - Writes new README with Replit instructions
   - Initializes new git repo and pushes to user's GitHub
4. Returns `{templateRepoUrl, replitImportUrl}` to frontend
5. Frontend opens replitImportUrl in new tab

**Preflight Analysis:**
- Shallow clones repo to analyze files without full history
- Parses package.json/requirements.txt to detect frameworks
- Returns confidence score (0-1) + suggested run command
- Used to show user what will happen before launching

**Data Caching:**
- AI suggestions: 1 hour in-memory cache (Map)
- Reddit list: 10 minutes in-memory cache (object)
- GitHub tokens: stored in PostgreSQL, refreshed on demand
- Session data: PostgreSQL via connect-pg-simple

## Important Implementation Details

### Path Aliases (tsconfig.json)
```typescript
"@/*"       → "./client/src/*"    // Frontend code
"@shared/*" → "./shared/*"        // Shared types/schemas
"@assets/*" → "./attached_assets/*" // Static files
```

### Port Configuration
- Development: Port 5000 (both frontend and backend)
- Production: Port 5000 (set via `PORT` env var)
- **CRITICAL:** Replit firewalls all ports except the configured PORT. Always use port 5000.

### Environment Variables Required
```bash
# Replit Auth (OIDC)
ISSUER_URL=https://replit.com/oidc
REPL_ID=<replit-repl-id>
SESSION_SECRET=<random-secret>

# Database
DATABASE_URL=<postgresql-connection-string>

# GitHub OAuth (per-user)
GITHUB_OAUTH_CLIENT_ID=<github-oauth-app-client-id>
GITHUB_OAUTH_CLIENT_SECRET=<github-oauth-app-secret>

# Optional: Legacy Replit GitHub connector (auto-provided on Replit)
REPLIT_CONNECTORS_HOSTNAME=replit.com
REPL_IDENTITY=<auto-provided>
WEB_REPL_RENEWAL=<auto-provided>

# Optional: Manual GitHub token for local dev
GITHUB_TOKEN=<personal-access-token>

# Optional: Target org for template generation
TEMPLATE_ORG=<github-username-or-org>
```

### Database Schema (Drizzle ORM)
The app uses PostgreSQL with the following key tables:
- `users` - Replit user info (id, email, first_name, last_name, profile_image_url)
- `github_tokens` - Per-user GitHub OAuth tokens (user_id, access_token, scope)
- `sessions` - Express session storage (managed by connect-pg-simple)

After schema changes in `server/db.ts`, run: `npm run db:push`

### Curated Lists (shared/lists.ts)
Lists are hardcoded TypeScript arrays, not fetched dynamically:
- `ai-engineer-tutorials` - AI/LLM projects
- `tutorials` - General beginner-friendly repos
- `mcp` - Model Context Protocol projects
- `reddit-cool` - Pre-curated from r/coolgithubprojects (Reddit blocks Replit IPs)

To add repos: edit `shared/lists.ts` and include full GitHub repo names (e.g., "owner/repo").

### API Routes Overview

**Authentication:**
- `GET /api/login` - Initiate Replit Auth flow
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - End session
- `GET /api/user` - Get current user info

**GitHub OAuth:**
- `GET /api/github/oauth/connect` - Initiate GitHub OAuth
- `GET /api/github/oauth/callback` - OAuth callback
- `GET /api/github/oauth/status` - Check connection status
- `POST /api/github/oauth/disconnect` - Revoke GitHub access

**Repository Operations:**
- `GET /api/lists` - Fetch all curated lists
- `GET /api/repos?listId=<id>` - Fetch repos for a list
- `GET /api/readme/:owner/:repo` - Get README preview
- `GET /api/suggestions/:owner/:repo` - AI project suggestions
- `GET /api/star/:owner/:repo` - Check star status (requires GitHub)
- `POST /api/star/:owner/:repo` - Star repo (requires GitHub)
- `DELETE /api/star/:owner/:repo` - Unstar repo (requires GitHub)

**Analysis & Templates:**
- `POST /api/preflight` - Analyze repo Replit compatibility
- `POST /api/template` - Generate Replit-ready template (requires GitHub)

### Shadcn/ui Components
Components are sourced from shadcn/ui (not installed as package):
- Located in `client/src/components/ui/`
- Customized via `components.json` config
- Use Tailwind + Radix UI primitives
- To add new components: manually copy from shadcn/ui docs

### Working with Swipe Gestures
The card deck uses `@use-gesture/react` + `react-spring`:
- `useDrag` hook handles swipe/drag interactions
- `useSpring` animates card position/rotation
- Gestures are optimized for both mouse and touch
- See `client/src/pages/deck.tsx` for implementation

## Development Tips

### Adding a New Curated List
1. Edit `shared/lists.ts` and add to `LISTS` array
2. Provide: `id`, `name`, `description`, `username`, `listName`, `repos[]`
3. Ensure repos are starred by the specified GitHub user
4. Restart dev server to reload

### Modifying Template Generation Logic
- Edit `server/template-generator.ts`
- Key functions: `detectProjectDetails()`, `cleanTemplate()`, `createReplitConfig()`
- Test by converting a real repo via the UI
- Check temp directories are cleaned up after (uses `tmp` package)

### Debugging Authentication Issues
- Replit Auth tokens expire after 1 week (refresh handled automatically)
- GitHub OAuth tokens don't expire but can be revoked by user
- Check `requireAuth` and `requireGitHub` middleware in routes.ts
- Session data is in PostgreSQL `sessions` table
- Use `req.isAuthenticated()` to check login status

### Avoiding GitHub Rate Limits
- Use per-user OAuth tokens when possible (higher rate limit)
- Cache AI suggestions (1 hour) and Reddit list (10 minutes)
- Preflight/template operations use shallow clones (`--depth 1`)
- Don't call GitHub API in loops - batch requests

### Working with TypeScript
- Always run `npm run check` before committing
- Shared types are in `shared/schema.ts` (Zod schemas)
- Use Zod's `.parse()` for API request validation
- Frontend/backend share types via `@shared/*` imports

### Replit-Specific Considerations
- Replit provides REPL_IDENTITY for connector auth (auto-configured)
- GitHub connector is legacy; prefer per-user OAuth for write ops
- Database and connectors work differently in local dev vs. Replit
- Use `process.env.REPL_ID` to detect Replit environment

## Production Deployment (Replit)

The `.replit` file configures deployment:
- **Build:** `npm run build` (compiles client + server)
- **Run:** `npm run start` (runs dist/index.js)
- **Port:** 5000 (only non-firewalled port)
- **Autoscale:** Configured for Replit autoscale deployments

Build output:
- Client: `dist/public/` (static files served by Express)
- Server: `dist/index.js` (bundled Express app)

## Common Pitfalls

1. **Never cache Octokit clients** - Access tokens expire. Always call `getUncachableGitHubClient()`.
2. **Don't expose tokens to frontend** - GitHub tokens are server-only. Never send in API responses.
3. **Cleanup temp directories** - Use `tmp.setGracefulCleanup()` and `removeCallback()`.
4. **Check authentication middleware** - Use `requireGitHub` for write operations, not just `requireAuth`.
5. **Avoid blocking operations** - Template generation can take 60+ seconds; use timeouts.
6. **Port 5000 only** - Other ports are firewalled by Replit. Frontend and backend must share.
7. **Path aliases in imports** - Use `@/` (frontend), `@shared/` (shared), never relative paths across boundaries.
