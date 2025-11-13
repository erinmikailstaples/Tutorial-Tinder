# Tutorial Tinder

## Overview

Tutorial Tinder is a web application that gamifies the discovery of beginner-friendly GitHub repositories. Users swipe through curated repositories with a Tinder-like interface, saving projects they're interested in or skipping ones they're not. Each repository can be launched directly in Replit with a single click, making it easy for learners to start coding immediately without complex setup.

The application fetches repositories from a curated GitHub starred list, displays them in an interactive card deck with swipe gestures, and provides repository metadata including descriptions, star counts, languages, and README previews.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety and component structure
- Vite as the build tool and development server for fast HMR and optimized builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Tailwind CSS for utility-first styling with a custom design system

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system (New York variant) providing pre-styled components
- Custom components built on top of Radix for cards, buttons, badges, toasts, etc.

**Interaction Design:**
- React Spring for physics-based animations and smooth transitions
- @use-gesture/react for touch and drag gesture handling
- Custom swipeable card component that responds to drag velocity and direction
- Keyboard shortcuts for power users (arrow keys for skip/save, enter for launch)

**State Management Strategy:**
- Server state managed through React Query with infinite staleTime for static repo data
- Client state (saved/skipped repos) persisted in localStorage
- No global state management library needed due to simple data flow

**Design System:**
- CSS custom properties (HSL-based) for theming with light/dark mode support
- Consistent spacing scale using Tailwind units (2, 4, 8, 12, 16, 20, 24, 32)
- Typography hierarchy using DM Sans/Inter for body text and JetBrains Mono/Fira Code for code
- Elevation system using subtle box shadows and opacity-based borders

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js with TypeScript
- ESM module system for modern JavaScript features
- Middleware for JSON parsing, request logging, and performance monitoring

**API Design:**
- RESTful endpoints for repository data and README content
- `/api/repos` - Fetches starred repositories filtered by "beginner-friendly" topic
- `/api/readme/:owner/:repo` - Returns README preview (first 500 chars) and full content
- Stateless design with no session management required

**GitHub Integration Strategy:**
- Octokit REST client for GitHub API communication
- Dynamic token management supporting both Replit connectors and manual tokens
- Unauthenticated fallback for development without affecting core functionality
- Token refresh handled automatically through Replit connector API

**Error Handling:**
- Try-catch blocks with detailed error logging
- Graceful degradation when GitHub API is unavailable
- HTTP status codes (404, 500) with descriptive error messages

### Data Storage Solutions

**Current Implementation:**
- In-memory storage for user interactions (MemStorage class implementing IStorage interface)
- localStorage for persisting saved and skipped repository IDs on the client
- No database currently required due to read-only GitHub data

**Storage Interface Design:**
- Abstract IStorage interface allows easy migration to persistent database
- Prepared for future PostgreSQL integration via Drizzle ORM
- Schema definitions already present in shared/schema.ts using Zod for validation

**Data Models:**
- Repository schema with owner, metadata, stars, language, topics
- UserInteraction schema tracking save/skip actions with timestamps
- Readme schema for content and encoding information
- Type-safe schemas shared between client and server

### External Dependencies

**GitHub API:**
- Primary data source for repository information
- Fetches starred repositories from user "erinmikailstaples" with topic filtering
- README content retrieval with base64 decoding
- Rate limiting considerations (5000 requests/hour authenticated, 60 unauthenticated)

**Replit Integration:**
- Replit connectors for GitHub OAuth token management
- Environment variables for Replit identity and renewal tokens
- One-click repository launch via `replit.com/github/:owner/:repo` URLs
- Development plugins (cartographer, dev banner, runtime error overlay) for Replit environment

**Third-Party Libraries:**
- date-fns for timestamp formatting ("2 hours ago" style)
- nanoid for unique ID generation
- Zod for runtime schema validation
- react-icons for icon library (GitHub icon via simple-icons)

**Build and Development Tools:**
- TypeScript compiler for type checking (noEmit mode)
- esbuild for production server bundle
- PostCSS with Tailwind and Autoprefixer for CSS processing
- Drizzle Kit for future database migrations (currently unused)

**Authentication Flow:**
- Optional GitHub authentication through Replit connectors
- Falls back to unauthenticated requests if tokens unavailable
- No user authentication required - app is read-only for discovery
- Future consideration: User accounts to sync saved repos across devices