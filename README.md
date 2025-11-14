# 💖 Tutorial Tinder

> **From "just browsing" to "I'm building" at the speed of a swipe.**

Tutorial Tinder is a Tinder-style web app that helps developers discover curated GitHub repositories and launch them instantly in Replit. Swipe through beginner-friendly tutorials, get AI-powered project ideas, and start building in seconds.

![Tutorial Tinder](https://img.shields.io/badge/built%20with-Replit-orange?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

---

## 🎯 What is Tutorial Tinder?

You'll learn way more from rollin' with real code than from a perfectly polished README trying to catfish you. Tutorial Tinder lets you:

- **Swipe through curated repos** - Discover beginner-friendly GitHub projects with a fun, Tinder-style interface
- **Launch instantly in Replit** - One-click setup, no configuration needed
- **Get AI suggestions** - GPT-powered project ideas based on each repo
- **Save favorites** - Star repos directly to your GitHub account
- **Convert to templates** - Turn any repo into a Replit-ready template in your GitHub

---

## 🚀 Quick Start

### Using the App

1. **Visit the app on [Replit](https://replit.com/@erinmikail/Tutorial-Tinder?v=1#README.md)** and click "Start Swiping"
2. **Choose a list**: AI Engineer Tutorials, General Tutorials, MCP Projects, or Reddit's Cool Projects
3. **Swipe through repos**:
   - ❤️ **Save** - Stars the repo on GitHub
   - ❌ **Skip** - Move to the next one
   - 🚀 **Launch** - Opens in Replit immediately
   - 🔧 **Convert** - Creates a clean template in your GitHub

### Keyboard Shortcuts

- `←` Skip repo
- `→` Save repo
- `↵` Launch in Replit

---

## 📰 Build Story & Deep Dive

- [Live Demo on Replit](https://replit.com/@erinmikail/Tutorial-Tinder?v=1#README.md) — open the hosted version instantly and start swiping without any local setup.
- [Build case study: *Building Tutorial Tinder: from idea to deployed Replit demo*](https://www.erinmikailstaples.com/building-tutorial-tinder-from-idea-to-deployed-replit-demo/) — a detailed write-up covering ideation, architecture, and the AI prompts summarized below.

---

## ✨ Features

### 🎴 Card Deck Interface
- Tinder-style swipeable cards with smooth animations
- Beautiful card stack with depth perception and blur effects
- Each card shows:
  - Repository name, owner, and language
  - Star count and last updated date
  - Description and README preview
  - AI-generated project suggestions (powered by GPT-4)

### 🔍 Preflight Check
Before launching, Tutorial Tinder analyzes each repo:
- Detects language and framework
- Checks for manifest files (package.json, requirements.txt, etc.)
- Calculates Replit compatibility score
- Suggests run commands
- Shows confidence level (high/medium/low)

### 🎨 Template Generator
**The secret sauce!** Convert any GitHub repo into a Replit-ready template:

1. **One-Click Conversion** - Click "Convert to Replit Template"
2. **Connect GitHub** - Authenticate with GitHub (via Replit connector)
3. **Automatic Processing**:
   - Clones the repo
   - Detects language and framework
   - Removes build artifacts and tests
   - Creates `.replit` config with run command
   - Generates new README with setup instructions
   - Creates new GitHub repo in your account
   - Pushes everything and sets default branch
4. **Launch** - Opens your new template in Replit!

The generated template includes:
- Clean, Replit-optimized code
- `.replit` configuration file
- New README with setup instructions
- Attribution to original project

### 🤖 AI-Powered Suggestions
Get personalized project ideas for each repo:
- 2-3 project suggestions based on README content
- Example first prompts to get started
- Powered by GPT-4 via Replit AI
- 10-minute caching to stay efficient

### 💾 Data Persistence
- Saved repos are starred on your GitHub account
- Skipped repos tracked in localStorage
- Progress persists across sessions
- Clear history anytime with "Restart"

---

## 📚 Curated Lists

### AI Engineer Tutorials
Hand-picked repos for learning AI engineering with tools like LangChain, OpenAI, and RAG systems.

### General Tutorials
Beginner-friendly projects covering web dev, APIs, and full-stack applications.

### Model Context Protocol (MCP)
Learn about MCP servers, clients, and integrations.

### Reddit's Cool Projects
Community favorites from Reddit's r/GitHub collection.

---

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript** - Modern, type-safe UI
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **react-spring** - Smooth animations
- **@use-gesture/react** - Touch-optimized swipe gestures
- **TanStack Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Node.js** + **Express** - Fast, minimal API server
- **TypeScript** - Type safety everywhere
- **Octokit** - GitHub API integration
- **OpenAI** - GPT-4 for AI suggestions
- **simple-git** - Git operations for template generation

### Infrastructure
- **Replit** - Hosting and deployment
- **Replit GitHub Connector** - OAuth authentication
- **Replit AI Integrations** - Built-in OpenAI access

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- A Replit account
- GitHub account (for template generation)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tutorial-tinder.git
   cd tutorial-tinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```bash
   SESSION_SECRET=your-secret-key-here
   # Optional: TEMPLATE_ORG=your-github-org
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5000`

### On Replit

1. **Import this repo** to Replit
2. **Connect GitHub** using the Replit GitHub connector
3. **Click Run** - That's it!

The Replit GitHub connector handles all authentication automatically. No manual API keys needed!

---

## 🎨 How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Landing    │  │ List Select  │  │   Card Deck     │  │
│  │     Page     │  │     Page     │  │  (Swipe UI)     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   GitHub     │  │   Preflight  │  │    Template     │  │
│  │     API      │  │    Check     │  │   Generator     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   GitHub     │  │  OpenAI/GPT  │  │     Replit      │  │
│  │     API      │  │  (via Replit)│  │   Connector     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User swipes** → Frontend captures gesture
2. **Save action** → Backend stars repo on GitHub
3. **Launch action** → Backend runs preflight check → Opens in Replit
4. **Convert action** → Backend generates template → Pushes to user's GitHub → Opens in Replit

## 🤖 AI Build Prompts

These prompts come directly from the blog post [*Building Tutorial Tinder: from idea to deployed Replit demo*](https://www.erinmikailstaples.com/building-tutorial-tinder-from-idea-to-deployed-replit-demo/) and capture how Replit’s AI assistants were guided throughout the build. They’re intentionally verbose so you can study the structure, intent, and constraints that led to usable code suggestions.

<details>
<summary><strong>Prompt: Initial project scaffolding</strong></summary>

```text
You are creating a Replit demo project called **Tutorial Tinder** (aka Developer Tinder).

Goal:
Build a swipeable web app that helps beginner developers discover GitHub repos and 1-click launch them into Replit. This should feel fun (Tinder-style swipe UI) but also be a serious, educational demo that shows off why Replit is great for getting from "repo" → "running project" fast.

Tech stack:
- Next.js (App Router) + TypeScript
- Tailwind CSS for styling
- shadcn/ui for cards, buttons, modals
- TanStack Query for data fetching/caching
- API routes to proxy GitHub REST Search API 



Core features (must have):
1. **Landing page (`/`)**
   - Simple hero explaining: "Swipe through beginner-friendly GitHub repos and 1-click launch them in Replit."
   - CTA button: "Start Swiping" → `/deck`.

2. **Deck page (`/deck`) – Tinder-style interface**
   - Card stack UI:
     - Swipe right / or click "Save"
     - Swipe left / or click "Skip"
     - Optional "Launch in Replit" primary button on card
   - Keyboard shortcuts:
     - ← = skip
     - → = save
     - Enter = launch
   - Each card shows:
     - Repo name, owner, description
     - Primary language, stars, last updated
     - Difficulty tag (e.g., Beginner / Intermediate) inferred from topics / stars / description
     - Short README preview (first ~300–500 chars)
     - Button: "View on GitHub"
     - Button: "Launch in Replit"

3. **Saved repos (`/saved`)**
   - Simple list/table of repos the user swiped right on (stored in localStorage is fine for v1).
   - Each entry: minimal metadata + "Launch in Replit" + "Remove".

4. **GitHub search + backend**
   - API route: `/api/search`
     - Calls GitHub REST Search API: `/search/repositories`
     - Query tuned for beginner-friendly repos:
       - Topics like: `tutorial`, `starter`, `example`, `good-first-issue`
       - `stars:>10`
       - Sorted by `updated` or `stars`
     - Accepts filters as query params: `language`, `difficulty`, `page`.
     - Returns normalized JSON used by the frontend.
   - Basic error handling and a user-friendly error state:
     - "GitHub rate limit hit. Try again in a few minutes."
   - **Security:** do NOT expose tokens in the client. Use env vars on the server.

5. **Replit launch integration**
   - For each repo, generate a launch URL that opens the repo in Replit.
   - Use the GitHub -> Replit import URL pattern:
     - e.g. `https://replit.com/github/<owner>/<repo>` (or whatever the current Replit import URL pattern is).
   - Button "Launch in Replit":
     - Opens in a new tab
     - Show in-app toast: "Launching this repo in Replit… go build!"

6. **Run hints (simple version)**
   - On the backend, inspect repo data (filename heuristics only, no full clone needed):
     - If repo language is JavaScript/TypeScript and has `package.json`, suggest `npm install && npm run dev` or `npm start`.
     - If Python and contains `main.py` or `app.py`, suggest `python main.py` or `python app.py`.
   - Show "Suggested run command" in the card or details modal.

7. **README**
   - `README.md` in root must include:
     - What Tutorial Tinder is and why it's compelling for Replit builders.
     - How to run locally on Replit (clear steps).
     - How the GitHub search + swipe deck is implemented (high level).
     - How this demo showcases Replit's strengths:
       - Fast from idea → running app
       - Great for beginners launching repos with zero setup
     - Notes on what you would add/improve with more time (e.g., auth, real collections, better difficulty scoring).

Non-goals (to keep scope tight):
- No auth beyond localStorage for saves (v1).
- No full GitHub client (issues/PRs editing, etc.).
- No social features (comments, sharing) in v1.

UX details:
- Make it feel fun but fast:
  - Smooth card animations.
  - Skeleton loaders while fetching.
  - Toasts for errors, saves, and launches.
- Keep copy very beginner-friendly, but code and structure clean enough that advanced devs can read and learn from it.

Focus:
This should be a polished, educational Replit demo that:
- Shows off a real integration with an external API (GitHub).
- Makes it obvious why Replit is perfect for "see cool repo → instantly run it."
- Is easy for other builders to fork and extend on Replit.
```

</details>

<details>
<summary><strong>Prompt: Switching to curated lists</strong></summary>

```text
I would like to pull from a curated list of beginner-friendly repositories that I'll provide.

Most importantly i want people to be able to open the repositories in Replit and get a successful launch in replit.

Here's some additional information about the tech stack as well as the interface

Tech stack:

- Next.js (App Router) + TypeScript
- Tailwind CSS for styling
- shadcn/ui for cards, buttons, modals
- TanStack Query for data fetching/caching
- API routes to proxy GitHub REST Search API (no tokens on client)

Core features:

1. **Landing page (`/`)**
    
    - Simple hero explaining: "Swipe through beginner-friendly GitHub repos and 1-click launch them in Replit."
    - CTA button: "Start Swiping" → `/deck`.
2. Card stack UI:
    
    - Swipe right / or click "Save"
        
    - Swipe left / or click "Skip"
        
    - "Launch in Replit" primary button on card
        
    - Keyboard shortcuts:
        
        - ← = skip
        - → = save
        - Enter = launch
        
        Each card shows:
        
        - Repo name, owner, description
        - Primary language, stars, last updated  
            Short README preview (first ~300–500 chars)
        - Button: "View on GitHub"
        - Button: "Launch in Replit"
        
        Replit launch integration**
        
    - For each repo, generate a launch URL that opens the repo in Replit.
        
    - Use the GitHub -> Replit import URL pattern:
        
        - e.g. `https://replit.com/github/<owner>/<repo>` (or whatever the current Replit import URL pattern is).
    - Button "Launch in Replit":
        
        - Opens in a new tab
        - Show in-app toast: "Launching this repo in Replit… go build!"

Is there anything that would make this difficult in Replit or that I should be aware of when building?
```

</details>

<details>
<summary><strong>Prompt: Adding multiple lists</strong></summary>

```text
Add more of the following lists and projects: 

- https://github.com/stars/erinmikailstaples/lists/tutorials
- allow to sort from random projects from reddit's cool github projects https://www.reddit.com/r/coolgithubprojects/
- https://github.com/stars/erinmikailstaples/lists/mcp

Add a blurb describing the types of projects in each.
```

</details>

<details>
<summary><strong>Prompt: Reddit Integration + caching bugs</strong></summary>

```text
Can you please update to achieve this: Option A: Implement the Reddit integration now to fetch trending repos from r/coolgithubprojects as a fourth list

As well as please look into the frontend caching quirk
```

</details>

<details>
<summary><strong>Prompt: Preflight checks</strong></summary>

```text
Build the following changes into the project:

1. Add a new API route: POST /api/preflight
   - Backend clones the repo to a temp directory (shallow clone).
   - Detect language/framework:
     - Node: detect package.json, scripts, dependencies (Next.js, React, Vite).
     - Python: detect requirements.txt, pyproject.toml, main.py/app.py/manage.py, frameworks like Flask/FastAPI/Django.
   - Infer run command:
     - Node: "npm install && npm run dev" or "npm start" depending on scripts.
     - Python: "pip install -r requirements.txt && python app.py/main.py".
   - Identify potential issues (missing deps file, missing entrypoint, archived repo, etc.).
   - Return JSON: { language, framework, runCommand, issues: [], confidence: 0–1 }

2. On swipe-right or "Launch":
   - Frontend calls /api/preflight first.
   - Show a modal/toast summarizing:
     - Detected language
     - Suggested run command
     - Confidence score
     - Any warnings

3. If confidence >= 0.8:
   - Launch original repo to Replit as usual.

4. OPTIONAL (add scaffolding for this): Add a second backend endpoint POST /api/template that:
   - Takes repo info and the preflight data.
   - Cleans the repo: remove .github, .git, node_modules, __pycache__, .vscode, etc.
   - Writes a new README.md ("Start Here" with instructions).
   - Writes a .replit file:
     run = "<DETECTED_RUN_COMMAND>"
     [interpreter]
     language = "<DETECTED_LANGUAGE>"
   - Initializes a new git repo, commits, and pushes to a bot-owned GitHub org using PAT.
   - Returns: { templateRepoUrl, replitImportUrl }

5. In the frontend:
   - If confidence < 0.5, give user options:
     - Launch anyway
     - Skip
     - (Later) Try template generation
   - If using template generation, open the returned replitImportUrl instead of the original repo.

6. Keep everything in the existing Next.js + TypeScript + API routes structure. Use simple-git and @octokit/rest for backend logic. Use React Query for preflight requests.

Goal: Make sure repos launched from the app reliably run on Replit by adding preflight detection + optional auto-configuration. Keep the implementation clean and incremental—start with preflight, then layer in template generation logic.
```

</details>

<details>
<summary><strong>Prompt: Replit Template Generation</strong></summary>

```text
 have an existing Replit app that already:
- Fetches GitHub repos and shows them in a swipe UI.
- Can launch a repo on Replit via: https://replit.com/github/<owner>/<repo>
- has a /api/preflight endpoint that returns repo metadata (owner, name, defaultBranch, language guesses, etc.).

I want to add a **template conversion flow** so that, given an existing repo, the app can create a **Replit-friendly template** and launch THAT instead.

Please implement the following:

1. Create a new backend endpoint:
   - Route: POST /api/template
   - Request body (JSON):
     {
       "owner": string,
       "repo": string,
       "defaultBranch"?: string
     }
   - It can optionally accept extra hints like language or runCommand from the existing preflight endpoint, but it must also work if only owner/repo/defaultBranch are provided.

2. In /api/template, do this:
   - Use simple-git (or equivalent) to:
     - Create a temporary directory.
     - Shallow-clone the repo:
       git clone --depth 1 --branch <defaultBranch or main> https://github.com/<owner>/<repo>.git
   - Inspect the cloned repo to infer:
     - language: "nodejs" | "python" | "other"
     - framework (if obvious): "nextjs" | "react" | "vite" | "flask" | "fastapi" | "django" | null
     - runCommand:
       - If package.json exists:
         - If scripts.dev: "npm install && npm run dev"
         - Else if scripts.start: "npm install && npm start"
         - Else: "npm install && npm run dev"
       - Else if Python:
         - If app.py: "pip install -r requirements.txt && python app.py"
         - Else if main.py: "pip install -r requirements.txt && python main.py"
         - Else: "pip install -r requirements.txt && python main.py"
       - Else fallback: "echo 'Please see README.md for instructions'"
   - Strip unnecessary files to make a clean template:
     - Try to remove: .github, .git, .vscode, .idea, node_modules, dist, build, __pycache__, tests, test, docs
     - Use recursive deletion with force; ignore errors if files/folders don't exist.
   - Overwrite or create a new README.md in the root that:
     - States this is a Replit-ready starter generated from <owner>/<repo>.
     - Documents how to run the project on Replit using the inferred runCommand.
     - Briefly explains what the template generator did (detect language, clean files, add config).
   - Create or overwrite a .replit file in the root with content similar to:

     run = "<DETECTED_RUN_COMMAND>"

     [interpreter]
     language = "<DETECTED_LANGUAGE>"

     where DETECTED_LANGUAGE is "nodejs" or "python" or "bash" as appropriate.

   - Initialize a new git repo in this cleaned directory:
     - git init
     - git add .
     - git commit -m "chore: generate Replit-friendly template from <owner>/<repo>"

   - Use @octokit/rest and a GitHub Personal Access Token stored in an env var (e.g. TEMPLATE_BOT_TOKEN) to:
     - Create a new public repo in a configured org or user (env var TEMPLATE_ORG), with a name like:
       "<source-repo>-replit-template-<timestamp>"
     - Add that new repo as remote origin.
     - Push the local main branch to the new repo.

   - Respond with JSON:
     {
       "templateRepoUrl": "https://github.com/<org>/<slug>",
       "replitImportUrl": "https://replit.com/github/<org>/<slug>"
     }

3. Update the frontend:
   - For each repo card, add a "Convert to Replit Template" or "Launch as Template" action.
   - On that action:
     - Call POST /api/template with the repo's owner, name, and defaultBranch.
     - Show a loading toast: "Generating Replit-ready template…"
     - On success:
       - Show success toast: "Template created! Launching in Replit…"
       - Open the returned replitImportUrl in a new tab (window.open(url, "_blank", "noopener")).
     - On error:
       - Show error toast: "Template generation failed. Launching original repo instead."
       - Fall back to launching https://replit.com/github/<owner>/<repo>.

4. Keep everything in TypeScript and within the existing Next.js app/api structure. Make sure:
   - No GitHub tokens or secrets are sent to the client.
   - Temp directories are cleaned up after use.
   - Errors in cloning or pushing are caught and returned as proper 4xx/5xx responses with helpful error messages.

The end result should be:
- I can pick any repo surfaced by my app,
- Click a "Convert to Replit Template" / swipe-right,
- And the app will:
  - Clone it,
  - Infer language + run command,
  - Clean it,
  - Add README + .replit,
  - Push to a template repo,
  - And launch that template on Replit.
```

</details>

---

## 🔐 Security & Privacy

- **No API keys required** - GitHub auth handled by Replit connector
- **Per-user isolation** - Each user's GitHub token is separate
- **Automatic cleanup** - Temporary files deleted after template generation
- **Origin validation** - Only GitHub repositories allowed
- **Timeout protection** - 120-second max for cloning operations
- **No code execution** - Templates analyzed statically, never run

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit** (`git commit -m 'Add amazing feature'`)
5. **Push** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Ideas for Contributions
- Add more curated lists
- Improve language/framework detection
- Add support for more project types
- Enhance AI suggestions
- Improve UI/UX
- Add tests

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📧 Contact & Support

- **Issues**: Found a bug? [Open an issue](https://github.com/your-username/tutorial-tinder/issues)
- **Questions**: Have questions? Start a [discussion](https://github.com/your-username/tutorial-tinder/discussions)

---

## 🎓 Learn More

- [Replit Documentation](https://docs.replit.com)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [React Documentation](https://react.dev)

---

<div align="center">

**Made with ❤️ and curiosity by Erin Mikail Staples using Replit**

⭐ Star this repo if you find it helpful!

</div>
