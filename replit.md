# Tutorial Tinder

A Tinder-style swipeable web application that helps beginner developers discover curated GitHub repositories and launch them instantly in Replit.

## Overview

Tutorial Tinder combines the engaging swipe mechanics of Tinder with educational content discovery, making it fun and easy for developers to find beginner-friendly projects to learn from and build.

## Features

### Landing Page
- Hero section with gradient background and decorative code elements
- Clear value proposition and call-to-action
- Three feature cards highlighting key benefits:
  - Curated Tutorials
  - Instant Setup
  - Learn by Doing

### Card Deck Interface
- Tinder-style swipeable cards displaying GitHub repositories
- Card stack with depth perception (layering, scaling, blur effects)
- Smooth swipe gestures with visual feedback
- Each card shows:
  - Repository name and owner
  - Programming language badge
  - Star count
  - Last updated timestamp
  - Description
  - README preview (first 300-500 characters)
  - AI-generated project suggestions (expandable section)
- Interactive buttons:
  - **Launch in Replit** - Runs preflight check, then opens repo in new Replit tab
  - **Convert to Replit Template** - Generates a clean, Replit-ready template from the repo
  - **View on GitHub** - Opens repo on GitHub
  - **Save** (heart icon) - Stars repo on GitHub and saves locally
  - **Skip** (X icon) - Skips to next repo

### Keyboard Shortcuts
- ← (Left Arrow) - Skip current repo
- → (Right Arrow) - Save current repo
- ↵ (Enter) - Launch current repo in Replit
- Visible indicator at bottom of screen

### Data Persistence
- Saved and skipped repos stored in localStorage
- Saved repos are also starred on GitHub via GitHub API
- Persists across page reloads
- Can restart to clear history

### AI-Powered Features
- **Project Suggestions**: Uses OpenAI GPT-5 via Replit AI Integrations
- Generates 2-3 project ideas based on repository README content
- Provides example first prompts to get started
- 10-minute caching to prevent rate limits
- No API key required (billed to Replit credits)

### Preflight Check System
- **Automated Repository Analysis**: Before launching in Replit, analyzes repositories for compatibility
- Clones repo to temporary directory (shallow clone, depth=1) for file inspection
- Detects language and framework (Node.js, Python, Docker)
- Identifies manifest files (package.json, requirements.txt, pyproject.toml, .replit)
- Infers recommended run commands based on detected environment
- Calculates confidence score (0-1) for Replit compatibility
- Shows modal with analysis results:
  - High confidence (≥0.8): Ready to launch
  - Medium confidence (0.5-0.8): May need manual configuration
  - Low confidence (<0.5): Not recommended, suggests viewing on GitHub instead
- Security features: origin validation, size/time limits, automatic cleanup, no code execution

### Template Generation System
- **One-Click Template Conversion**: Transforms any GitHub repo into a Replit-ready template
- **Authentication**: Requires users to connect their GitHub account via Replit connector
  - Templates are created in the user's personal GitHub account
  - GitHubConnectDialog prompts users to connect if not already authenticated
  - No manual token configuration required - handled automatically by Replit
- Process flow:
  1. Checks if user has connected GitHub account (shows connect dialog if not)
  2. Clones the repository (shallow clone, depth=1)
  3. Detects language and framework automatically
  4. Cleans unnecessary files (.github, node_modules, tests, build artifacts)
  5. Creates `.replit` configuration file with detected run command
  6. Generates new README with setup instructions and attribution
  7. Initializes new git repository
  8. Pushes to new GitHub repository in user's account
  9. Launches the template in Replit automatically
- Supported languages: Node.js, Python, others
- Framework detection: Next.js, React, Vite, Flask, FastAPI, Django
- Fallback handling: If template generation fails, launches original repo
- Security: 60-second clone timeout, automatic cleanup, origin validation, per-user token isolation
- Optional configuration via environment variable:
  - `TEMPLATE_ORG`: Target organization for templates (if user has org access)

## Tech Stack

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching and caching
- Tailwind CSS for styling
- shadcn/ui components (Card, Button, Badge, Toast)
- react-spring for animations
- @use-gesture/react for swipe gestures
- Inter font for UI, JetBrains Mono for code

### Backend
- Node.js + Express
- Octokit (GitHub REST API)
- OpenAI API via Replit AI Integrations (GPT-5)
- simple-git for repository cloning
- tmp for secure temporary directory management
- In-memory storage for session data

## Architecture

### Data Flow
1. User lands on `/` - sees hero and features
2. Clicks "Start Swiping" → navigates to `/select-list`
3. User chooses from curated lists or pastes custom GitHub starred list URL
4. After selection → navigates to `/deck?listId=<id>`
5. Frontend fetches repos from `/api/repos?listId=<id>`
6. For each repo, README preview fetched from `/api/readme/:owner/:repo`
7. README previews cached to avoid duplicate requests
8. AI suggestions fetched from `/api/suggestions/:owner/:repo` (cached 10 min)
9. User interactions (save/skip) stored in localStorage
10. **Save action** stars repo on GitHub via POST `/api/star/:owner/:repo`
11. Swipe gestures trigger animations and callbacks
12. **Launch action** triggers preflight check via POST `/api/preflight`
13. Preflight modal displays analysis results with confidence score
14. User confirms launch → opens `https://replit.com/github.com/:owner/:repo` in new tab

### API Endpoints
- `GET /api/lists` - Fetches available curated lists from configuration
- `GET /api/repos?listId=<id>` - Fetches starred repositories for specified list (defaults to ai-engineer-tutorials)
- `GET /api/readme/:owner/:repo` - Fetches README content and returns preview
- `GET /api/suggestions/:owner/:repo` - Generates AI-powered project suggestions (10-min cache)
- `GET /api/star/:owner/:repo` - Checks if repository is starred by authenticated user
- `POST /api/star/:owner/:repo` - Stars repository on GitHub for authenticated user
- `DELETE /api/star/:owner/:repo` - Unstars repository on GitHub for authenticated user
- `GET /api/github/status` - Checks if user has connected their GitHub account via Replit connector
- `POST /api/preflight` - Analyzes repository for Replit compatibility (clones, detects language, returns confidence score)
- `POST /api/template` - Generates Replit-ready template from GitHub repository (requires GitHub connection, creates repo in user's account)

### GitHub Integration
- Uses Replit GitHub connector for authenticated requests
- Falls back to unauthenticated mode for development
- Supports manual `GITHUB_TOKEN` environment variable for development
- Fetches starred repos and filters server-side against curated list configuration
- **Starring**: Save button stars repositories on GitHub using authenticated API
- **Template Generation**: Requires per-user GitHub authentication via Replit connector
  - Frontend checks authentication status via `/api/github/status`
  - Shows GitHubConnectDialog if user needs to connect
  - Templates created in user's personal account (or TEMPLATE_ORG if configured)
  - Token automatically managed by Replit connector
- Permissions required: read:org, read:project, read:user, repo, user:email

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── deck-header.tsx  # Top navigation with counter
│   │   ├── repo-card.tsx    # Individual repo card
│   │   ├── swipeable-card.tsx # Swipe gesture wrapper
│   │   ├── keyboard-shortcuts.tsx # Keyboard hints
│   │   ├── preflight-modal.tsx # Preflight analysis results dialog
│   │   ├── github-connect-dialog.tsx # GitHub connection prompt
│   │   └── empty-state.tsx  # No more repos state
│   ├── pages/
│   │   ├── landing.tsx      # Hero and features
│   │   ├── deck.tsx         # Card stack interface
│   │   └── not-found.tsx    # 404 page
│   ├── App.tsx              # Main app with routing
│   ├── index.css            # Global styles and design tokens
│   └── main.tsx             # Entry point
├── index.html               # HTML template with SEO meta tags
└── public/
    └── favicon.png

server/
├── ai.ts                    # OpenAI integration for project suggestions
├── github.ts                # GitHub API integration (starring, README, repos)
├── preflight.ts             # Repository analysis and Replit compatibility detection
├── template-generator.ts    # Template generation: clone, detect, clean, push
├── routes.ts                # API endpoints
├── storage.ts               # In-memory storage interface
├── index.ts                 # Express server setup
└── vite.ts                  # Vite dev server

shared/
└── schema.ts                # TypeScript types and Zod schemas (PreflightResult, TemplateResponse)

design_guidelines.md         # Design system documentation
replit.md                    # This file
```

## Design System

Following the design guidelines in `design_guidelines.md`:
- **Typography**: Inter for UI, JetBrains Mono for code
- **Colors**: Neutral grays with blue primary accent
- **Spacing**: Consistent 4px-based scale
- **Components**: shadcn/ui with custom elevation interactions
- **Animations**: Smooth swipe physics, subtle card transitions
- **Responsive**: Mobile-first, touch-optimized

## Development

### Running Locally
The workflow "Start application" runs `npm run dev` which:
1. Starts Express server on port 5000
2. Starts Vite dev server (proxied through Express)
3. Hot module replacement enabled

### Environment Variables
- `GITHUB_TOKEN` (optional) - Personal access token for GitHub API (used for starring, preflight, templates)
- `TEMPLATE_BOT_TOKEN` (optional) - Dedicated token for template generation (falls back to GITHUB_TOKEN)
- `TEMPLATE_ORG` (optional) - GitHub organization for generated templates (default: tutorial-tinder-templates)
- Replit connector handles authentication automatically when deployed

### Testing
End-to-end tests verify:
- Landing page rendering and navigation
- Deck page loading and card display
- Swipe gestures and button interactions
- Launch in Replit functionality
- localStorage persistence
- Header counter updates

## Future Enhancements

### Next Phase Ideas
- User accounts with persistent save history across devices
- Multiple list support (intermediate, advanced tutorials)
- Advanced filtering by language, topic, difficulty
- Analytics dashboard showing launch success rates
- Community features: users can create and share lists
- Social sharing of favorite repos
- Tutorial recommendations based on saved repos

## User Preferences

The user wants:
- Curated AI engineering tutorials from GitHub starred list
- Focus on successful Replit launches
- Multiple list support with ability to paste custom URLs
- Clean, engaging UI with Tinder-style interactions
- **GitHub starring integration**: Save button should star repos on GitHub, not just localStorage
- AI-powered project suggestions to help users get started

## Notes

- **Current Lists** (as of November 13, 2025): 
  - **AI Engineer Tutorials** (13 repos): microsoft/generative-ai-for-beginners, langchain-ai/langgraph, stripe/ai, vercel/ai, continuedev/continue, and more
  - **General Tutorials** (11 repos): JavaScript tutorials, API integrations, Astro projects, and beginner-friendly repos
  - **Model Context Protocol (MCP)** (6 repos): Python SDK, Google Sheets, LinkedIn, and Shortcut integrations
  - **Reddit's Cool GitHub Projects** (24 repos): Pre-curated selection from r/coolgithubprojects featuring AI tools, frameworks, and developer productivity apps
  - All repos verified to be actually starred by erinmikailstaples
- **Replit Launch**: Fixed URL format to `https://replit.com/github.com/:owner/:repo` for proper GitHub repo imports
- **Custom URLs**: Users can paste GitHub starred list URLs which are validated and matched against available lists
- **GitHub API**: Server-side fetches all starred repos (no sort parameter) then filters by curated list configuration
- **Important**: GitHub's "starred lists" feature is UI-only and not exposed in the API. We fetch all starred repos and filter against curated repo arrays
- **Reddit Integration**: Reddit blocks Replit infrastructure even with proper User-Agent headers, so the Reddit list is pre-curated rather than dynamically fetched
- **GitHub Starring**: When users click Save button, repo is starred on GitHub via API and saved to localStorage
- **AI Integration**: OpenAI GPT-5 integration via Replit AI Integrations (no API key needed, charges billed to Replit credits)
- **Template Generation**: Full pipeline from clone → detect → clean → configure → push → launch
- **Caching Strategy**: README, AI suggestions, and Reddit repos all use caching (10-min for AI, clears on list switch)
- **Security**: All GitHub operations use authenticated API, tokens never exposed to client, automatic cleanup of temp directories
- Built to be easily expandable to support multiple lists and users
- Emphasizes visual polish and smooth interactions
- All core MVP features implemented with four working curated lists plus template generation
