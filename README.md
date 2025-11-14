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

1. **Visit the app** and click "Start Swiping"
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

### 1. **AI Engineer Tutorials** (13 repos)
Hand-picked repos for learning AI engineering with tools like LangChain, OpenAI, and RAG systems.

### 2. **General Tutorials** (11 repos)
Beginner-friendly projects covering web dev, APIs, and full-stack applications.

### 3. **Model Context Protocol (MCP)** (6 repos)
Learn about MCP servers, clients, and integrations.

### 4. **Reddit's Cool Projects** (24 repos)
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

## 🙏 Acknowledgments

- **Replit** - For the amazing platform and integrations
- **GitHub** - For hosting all these amazing tutorials
- **OpenAI** - For powering the AI suggestions
- **The open-source community** - For creating all these wonderful learning resources

---

## 📧 Contact & Support

- **Issues**: Found a bug? [Open an issue](https://github.com/your-username/tutorial-tinder/issues)
- **Questions**: Have questions? Start a [discussion](https://github.com/your-username/tutorial-tinder/discussions)
- **Twitter**: Follow us [@TutorialTinder](https://twitter.com/TutorialTinder) (example)

---

## 🎓 Learn More

- [Replit Documentation](https://docs.replit.com)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [React Documentation](https://react.dev)

---

<div align="center">

**Made with ❤️ by developers, for developers**

⭐ Star this repo if you find it helpful!

</div>
