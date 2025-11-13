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
- Interactive buttons:
  - **Launch in Replit** - Opens repo in new Replit tab
  - **View on GitHub** - Opens repo on GitHub
  - **Save** (heart icon) - Saves repo for later
  - **Skip** (X icon) - Skips to next repo

### Keyboard Shortcuts
- ← (Left Arrow) - Skip current repo
- → (Right Arrow) - Save current repo
- ↵ (Enter) - Launch current repo in Replit
- Visible indicator at bottom of screen

### Data Persistence
- Saved and skipped repos stored in localStorage
- Persists across page reloads
- Can restart to clear history

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
8. User interactions (save/skip) stored in localStorage
9. Swipe gestures trigger animations and callbacks
10. Launch button opens `https://replit.com/github.com/:owner/:repo` in new tab

### API Endpoints
- `GET /api/lists` - Fetches available curated lists from configuration
- `GET /api/repos?listId=<id>` - Fetches starred repositories for specified list (defaults to ai-engineer-tutorials)
- `GET /api/readme/:owner/:repo` - Fetches README content and returns preview

### GitHub Integration
- Uses Replit GitHub connector for authenticated requests
- Falls back to unauthenticated mode for development
- Supports manual `GITHUB_TOKEN` environment variable
- Fetches starred repos and filters server-side against curated list configuration

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
├── github.ts                # GitHub API integration
├── routes.ts                # API endpoints
├── storage.ts               # In-memory storage interface
├── index.ts                 # Express server setup
└── vite.ts                  # Vite dev server

shared/
└── schema.ts                # TypeScript types and Zod schemas

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

## Notes

- **Current Lists** (as of November 13, 2025): 
  - **AI Engineer Tutorials** (13 repos): microsoft/generative-ai-for-beginners, langchain-ai/langgraph, stripe/ai, vercel/ai, continuedev/continue, and more
  - **General Tutorials** (11 repos): JavaScript tutorials, API integrations, Astro projects, and beginner-friendly repos
  - **Model Context Protocol (MCP)** (6 repos): Python SDK, Google Sheets, LinkedIn, and Shortcut integrations
  - All repos verified to be actually starred by erinmikailstaples
- **Replit Launch**: Fixed URL format to `https://replit.com/github.com/:owner/:repo` for proper GitHub repo imports
- **Custom URLs**: Users can paste GitHub starred list URLs which are validated and matched against available lists
- **GitHub API**: Server-side fetches all starred repos (no sort parameter) then filters by curated list configuration
- **Important**: GitHub's "starred lists" feature is UI-only and not exposed in the API. We fetch all starred repos and filter client-side against curated repo arrays
- Built to be easily expandable to support multiple lists and users
- Emphasizes visual polish and smooth interactions
- All core MVP features implemented with three working curated lists
