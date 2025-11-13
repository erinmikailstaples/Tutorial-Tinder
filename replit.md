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
  - **Launch in Replit** - Opens repo in new Replit tab
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
- `POST /api/preflight` - Analyzes repository for Replit compatibility (clones, detects language, returns confidence score)

### GitHub Integration
- Uses Replit GitHub connector for authenticated requests
- Falls back to unauthenticated mode for development
- Supports manual `GITHUB_TOKEN` environment variable
- Fetches starred repos and filters server-side against curated list configuration
- **Starring**: Save button stars repositories on GitHub using authenticated API
- Permissions: read:org, read:project, read:user, repo, user:email

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
├── routes.ts                # API endpoints
├── storage.ts               # In-memory storage interface
├── index.ts                 # Express server setup
└── vite.ts                  # Vite dev server

shared/
└── schema.ts                # TypeScript types and Zod schemas (includes PreflightResult)

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
- `GITHUB_TOKEN` (optional) - Personal access token for GitHub API
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
- **Caching Strategy**: README, AI suggestions, and Reddit repos all use caching (10-min for AI, clears on list switch)
- Built to be easily expandable to support multiple lists and users
- Emphasizes visual polish and smooth interactions
- All core MVP features implemented with four working curated lists
