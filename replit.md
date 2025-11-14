# Tutorial Tinder

## Overview
Tutorial Tinder is a web application designed to help beginner developers discover and instantly launch curated GitHub repositories in Replit. It uses a Tinder-style swipeable interface to make learning and building projects engaging and accessible. The project aims to simplify the process of finding beginner-friendly educational content and immediately setting up development environments.

## User Preferences
- Curated AI engineering tutorials from GitHub starred list
- Focus on successful Replit launches
- Multiple list support with ability to paste custom URLs
- Clean, engaging UI with Tinder-style interactions
- **GitHub starring integration**: Save button should star repos on GitHub, not just localStorage
- AI-powered project suggestions to help users get started

## System Architecture

### UI/UX Decisions
The frontend is built with React and TypeScript, utilizing Tailwind CSS for styling and shadcn/ui for components. Visuals include a gradient background, decorative code elements, and a card stack with depth perception, layering, scaling, and blur effects. Animations are handled by `react-spring`, and swipe gestures by `@use-gesture/react`, ensuring smooth and engaging interactions. The design emphasizes a clean, mobile-first, and touch-optimized experience with Inter font for UI and JetBrains Mono for code.

### Technical Implementations
- **Card Deck Interface**: Features Tinder-style swipeable cards displaying repository details, including name, owner, language, stars, last updated, description, and a README preview. Interactive buttons for "Launch in Replit," "Convert to Replit Template," "View on GitHub," "Save," and "Skip" are included.
- **Keyboard Shortcuts**: Supports `←` (Skip), `→` (Save), and `↵` (Launch) for efficient navigation.
- **Data Persistence**: Uses `localStorage` for saving and skipping repos, with saved repos also starred on GitHub.
- **AI-Powered Features**: Integrates OpenAI GPT-5 via Replit AI Integrations to generate project suggestions and example prompts based on repository READMEs, with 10-minute caching.
- **Preflight Check System**: Analyzes repositories before launching in Replit by shallow cloning, detecting language/frameworks, identifying manifest files, inferring run commands, and calculating a Replit compatibility confidence score.
- **Template Generation System**: Converts any GitHub repository into a Replit-ready template. This involves authenticating with GitHub, cloning the repository, language/framework detection, cleaning unnecessary files, creating a `.replit` config, generating a new README, initializing a new Git repository, pushing to the user's GitHub, and launching in Replit.

### System Design Choices
The application follows a client-server architecture. The frontend handles user interactions and data presentation, while the Node.js Express backend manages API requests, GitHub integrations, AI processing, and repository operations. Data flow involves fetching curated lists and repositories, README previews, and AI suggestions, with user actions triggering backend processes like starring on GitHub or initiating preflight checks and template generation. Security measures include origin validation, size/time limits, automatic cleanup of temporary files, and per-user token isolation.

## External Dependencies
- **GitHub API (Octokit)**: Used for fetching repository data (stars, READMEs), starring repositories, and managing template creation (pushing to user's GitHub).
- **OpenAI GPT-5**: Integrated via Replit AI Integrations for generating project suggestions.
- **Replit GitHub Connector**: Facilitates user authentication with GitHub and manages access tokens for authenticated API calls.
- **`simple-git`**: For cloning GitHub repositories during preflight checks and template generation.
- **`tmp`**: For secure temporary directory management during repository operations.
- **Wouter**: For client-side routing.
- **TanStack Query**: For data fetching and caching on the frontend.
- **Tailwind CSS**: For utility-first styling.
- **`shadcn/ui`**: For pre-built UI components.
- **`react-spring`**: For animation effects.
- **`@use-gesture/react`**: For handling swipe gestures.