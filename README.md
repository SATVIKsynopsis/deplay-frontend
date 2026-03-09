<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/AI_Powered-✨-purple?style=for-the-badge" alt="AI Powered"/>
</p>

<h1 align="center">⚡ Deplay</h1>
<h3 align="center">Pre-Deployment Sandbox with AI-Powered Analysis</h3>

<p align="center">
  <strong>Deploy with Confidence — Test Before You Ship</strong><br/>
  Catch bugs, security vulnerabilities, and build failures <em>before</em> they reach production.
</p>

<p align="center">
  <a href="#-demo">View Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a>
</p>

---

## 🎯 Problem Statement

**Deploying code is risky business.**

Developers face a critical challenge: *How do you know if your code will actually work in production?*

- 🔴 **68% of production outages** are caused by bad deployments
- 🔴 **Manual testing** is time-consuming and error-prone
- 🔴 **CI/CD pipelines** often miss environment-specific issues
- 🔴 **Security vulnerabilities** slip through to production
- 🔴 **Build failures** discovered too late in the deployment process

## 💡 Our Solution

**Deplay** is an AI-powered pre-deployment sandbox that tests your code in an isolated environment before you ship. Simply paste your repository URL, and within seconds get:

- ✅ **Automated Docker Build** — Your code runs in an isolated container
- ✅ **Real-time Build Logs** — Watch the build process live
- ✅ **AI Analysis** — Get actionable insights from Claude/GPT-powered analysis
- ✅ **Deployment Readiness Score** — Know if your code is production-ready
- ✅ **Security Scanning** — Detect vulnerabilities before they become problems

---

## ✨ Features

### 🔒 Secure Sandbox Execution
Every repository runs in an isolated Docker container with no access to your production systems. Test dangerous code safely.

### 🤖 AI-Powered Analysis
Our AI engine analyzes build logs, dependencies, and code patterns to provide:
- Developer-friendly summaries
- Actionable fix suggestions with severity ratings
- Command-line hints for quick fixes

### ⚡ Real-time Streaming Logs
Watch your build happen live with Server-Sent Events (SSE) streaming. No more waiting — see every step as it executes.

### 🔐 GitHub Integration
Connect your GitHub account to:
- Browse and select repositories directly
- Access private repositories securely
- Auto-detect programming languages

### 📊 Deployment Status Dashboard
Visual timeline showing:
- Repository cloning status
- Dockerfile generation
- Dependency installation progress
- Build completion status
- AI analysis results

### 📥 Export Reports
Download comprehensive Markdown reports with all analysis data for team sharing and documentation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **State** | React Hooks, Server-Sent Events |
| **Backend API** | Next.js API Routes (Proxy to sandbox service) |
| **Sandbox Engine** | Docker containers, custom orchestration |
| **AI Analysis** | OpenAI GPT-5.2 log analysis (Rust backend) |
| **Authentication** | GitHub OAuth, session cookies |
| **Infrastructure** | AWS EC2, ECS, API Gateway, S3, DynamoDB |

---

## 🏗️ Architecture  

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Landing   │  │  Dashboard   │  │   Profile   │  │  Auth (OAuth) │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS API LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ /api/run │  │/api/logs │  │/api/repos│  │/api/me   │  │/api/analysis│ │
│  └────┬─────┘  └────┬─────┘  └─────┬────┘  └────┬─────┘  └─────┬─────┘  │
└───────┼─────────────┼──────────────┼────────────┼──────────────┼────────┘
        │             │              │            │              │
        ▼             ▼              ▼            ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVICES (AWS)                           │
│  ┌─────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐  │
│  │  Sandbox Runner │  │   GitHub OAuth API  │  │   AI Analysis API    │  │
│  │   (EC2 + Docker)│  │   (API Gateway)     │  │   (Lambda + LLM)     │  │
│  └────────┬────────┘  └─────────────────────┘  └──────────────────────┘  │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      DOCKER SANDBOX ENVIRONMENT                      │ │
│  │  ┌─────────┐  ┌──────────────┐  ┌─────────┐  ┌─────────────────────┐│ │
│  │  │  Clone  │→ │  Generate    │→ │  Build  │→ │  Stream Logs (SSE) ││ │
│  │  │  Repo   │  │  Dockerfile  │  │  Image  │  │  to Client          ││ │
│  │  └─────────┘  └──────────────┘  └─────────┘  └─────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎬 Demo

### Landing Page
The landing page showcases Deplay's value proposition with a modern, gradient-rich design featuring:
- Hero section with animated code preview
- Feature grid highlighting key capabilities
- Step-by-step "How it Works" section
- Social proof and benefits

### Dashboard Experience
1. **Input Your Repository** — Paste a URL or select from your GitHub repos
2. **Watch the Build** — Real-time logs stream as Docker builds your project
3. **Get AI Insights** — Receive actionable suggestions with severity ratings
4. **Export Report** — Download a detailed Markdown report for your team

### Supported Languages
| Language | Status |
|----------|--------|
| JavaScript/TypeScript | ✅ Full Support |
| Python | ✅ Full Support |
| Rust | ✅ Full Support |
| Java | ✅ Full Support |
| C/C++ | ✅ Full Support |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/depliks-frontend.git
cd depliks-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file:

```env
# Backend API endpoints (already configured)
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8080
NEXT_PUBLIC_AUTH_URL=https://your-auth-api-url
```

---

## 📁 Project Structure

```
depliks-frontend/
├── app/
│   ├── api/                    # Next.js API routes (backend proxy)
│   │   ├── analysis/[id]/      # AI analysis endpoint
│   │   ├── logs/[id]/          # SSE log streaming
│   │   ├── me/                 # User profile
│   │   ├── repos/              # GitHub repositories
│   │   └── run/                # Sandbox execution
│   ├── components/             # Page-specific components
│   │   ├── landing.tsx         # Landing page component
│   │   └── theme-provider.tsx  # Theme context
│   ├── dashboard/              # Dashboard page
│   │   └── page.tsx            # Main sandbox interface
│   ├── me/                     # User profile page
│   │   └── page.tsx            # Profile & run history
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── runs-card.tsx       # Custom runs display
│   │   └── ...                 # 40+ UI components
│   └── theme-toggle.tsx        # Dark/light mode toggle
├── hooks/                      # Custom React hooks
│   ├── use-mobile.ts           # Mobile detection
│   └── use-toast.ts            # Toast notifications
├── lib/
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── components.json             # shadcn/ui config
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript config
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/run` | POST | Start a new sandbox run |
| `/api/logs/[id]` | GET | Stream build logs (SSE) |
| `/api/analysis/[id]` | GET | Get AI analysis results |
| `/api/repos` | GET | List user's GitHub repositories |
| `/api/me` | GET | Get authenticated user profile |
| `/api/runs` | GET | Get user's run history |

### Example: Start a Sandbox Run

```typescript
// POST /api/run
{
  "repoUrl": "https://github.com/user/repo",
  "language": "javascript"
}

// Response
{
  "runId": "abc123-def456-..."
}
```

---

## 🎨 UI Components

Built with **shadcn/ui** — a collection of beautifully designed, accessible components:

- **40+ components** including buttons, cards, dialogs, forms, and more
- **Dark/Light mode** with smooth transitions
- **Fully responsive** design for all screen sizes
- **Accessible** following WAI-ARIA guidelines

---

## 🧠 AI Analysis Features

The AI analysis engine provides:

### Severity Classification
| Level | Color | Triggers |
|-------|-------|----------|
| 🔴 High | Red | Vulnerabilities, security issues, critical errors |
| 🟡 Medium | Amber | Warnings, optimization opportunities, updates needed |
| 🟢 Low | Green | Best practices, minor improvements |

### Command Extraction
The AI automatically extracts actionable commands from suggestions:
```
Suggestion: "Update lodash to fix vulnerability using `npm update lodash`"
→ Extracted: $ npm update lodash
```

---

## 📊 User Dashboard Features

### Execution Timeline
Visual progress indicator showing:
1. ✅ Repository cloned
2. ✅ Dockerfile generated  
3. ✅ Dependencies installed
4. ✅ Docker build completed
5. ✅ AI analysis complete

### Deployment Status Badges
- 🛡️ **Ready for Deployment** — All checks passed
- ⚠️ **Needs Attention** — Warnings or vulnerabilities detected
- 🚫 **Build Failed** — Docker build error occurred

### Report Export
Download comprehensive Markdown reports including:
- Repository information
- Build status and duration
- AI summary and suggestions
- Timestamp and run ID

---

## 🔮 Roadmap

### Phase 1: MVP (Current)
- [x] GitHub repository analysis
- [x] Docker sandbox execution
- [x] Real-time log streaming
- [x] AI-powered suggestions
- [x] GitHub OAuth integration

### Phase 2: Enhanced Analysis
- [ ] Dependency vulnerability scanning (Snyk/Dependabot)
- [ ] Code quality metrics (complexity, coverage)
- [ ] Performance benchmarking
- [ ] Custom Dockerfile templates

### Phase 3: Team Features
- [ ] Organization workspaces
- [ ] Shared reports and history
- [ ] Slack/Discord notifications
- [ ] CI/CD pipeline integration

### Phase 4: Enterprise
- [ ] Self-hosted deployment option
- [ ] Custom AI models
- [ ] Compliance reporting
- [ ] SSO/SAML authentication

---

## 🏆 Why Deplay Wins

| Feature | Traditional CI/CD | Deplay |
|---------|-------------------|--------|
| Setup Time | Hours/Days | Seconds |
| Build Isolation | Shared runners | Full Docker isolation |
| AI Insights | ❌ | ✅ Actionable suggestions |
| Real-time Feedback | Delayed logs | Live streaming |
| Security Analysis | Extra tools needed | Built-in |
| Learning Curve | High | Zero |

---

## 👥 Team

Built with ❤️ for the hackathon by passionate developers who believe deployment should be safe, fast, and intelligent.

---

## 📄 License

MIT License — feel free to use this project for your own deployments!

---

<p align="center">
  <strong>⚡ Deplay — Because shipping broken code isn't an option.</strong>
</p>

<p align="center">
  <a href="#-deplay">Back to Top</a>
</p>
