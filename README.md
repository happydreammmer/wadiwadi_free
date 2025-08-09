<h1 align="center">
  <img src=".github/assets/wadiwadi-logo.jpg" alt="Wadi Wadi Logo" width="200">
</h1>
<p align="center">
  <a href="https://www.youtube.com/@wadiwadi_ai" target="_blank">
    <img src=".github/assets/wadiwadi-banner.jpg" alt="Wadi Wadi Project Banner">
  </a>
</p>
<p align="center">
  <strong>Your ideas, flowing into reality with the power of AI.</strong>
</p>

<p align="center">
    <a href="https://www.youtube.com/@wadiwadi_ai">
        <img src="https://img.shields.io/badge/YouTube-%40wadiwadi__ai-f97316?style=for-the-badge&logo=youtube&logoColor=white&color=f97316" alt="YouTube">
    </a>
    <img src="https://img.shields.io/badge/Status-Building_in_Public-0ea5e9?style=for-the-badge" alt="Status">
    <img src="https://img.shields.io/badge/Tools-AI_Powered-0ea5e9?style=for-the-badge" alt="AI Powered">
    <a href="LICENSE">
        <img src="https://img.shields.io/badge/License-MIT-f97316?style=for-the-badge" alt="License">
    </a>
</p>

---

### Core Philosophy

**Wadi Wadi** is built on a single, powerful belief: **AI is the great equalizer.**

For years, the power to create software, automate tasks, and build custom tools belonged exclusively to developers. This project is about changing that. We believe that with the right guidance and the new generation of AI tools, anyone with a problem and an idea can become a builder.

This isn't about becoming a traditional programmer. It's about becoming a **problem-solver in the age of AI**. It's about teaching you how to partner with artificial intelligence to turn your unique frustrations and brilliant ideas into tangible, working tools. We will show you the real, messy, and exciting process of creation—failures and all.

---

### The Mission

This repository and its accompanying YouTube channel serve as a public record of our journey. Our mission is to:

1.  **Build in Public:** Document the creation of personal, useful, AI-powered tools from scratch.
2.  **Empower the Curious:** Provide a clear, honest roadmap for non-developers to start building.
3.  **Embrace the Process:** Show the reality of development—the brilliant successes, the frustrating errors, and the critical moments of learning. Failure isn't just an option; it's a valuable part of our content.
4.  **Create a Community Toolkit:** This repository will house every tool we build. Fork them, use them, improve them. They are for you.

---

### The "Wadi Wadi" YouTube Show

Each video on our channel is a self-contained story of creation. We follow a "Golden Formula" to turn a simple build into a compelling journey.

<details>
<summary><strong>🎬 The Golden Formula (Our 5-Act Story Structure)</strong></summary>
<br>

1.  **The Human Problem (The Hook):** We start not with tech, but with a relatable human frustration. *"I have 50 browser tabs open and I can't find anything."*
2.  **The "What If?" Question (The Premise):** We frame the goal as an empowering question. *"What if an AI could read all my tabs and give me a one-sentence summary of each?"*
3.  **The Build (The "Messy Middle"):** The heart of the show. A fast-paced look at the real process—prompting the AI, pasting code, hitting errors, debugging with the AI's help, and the "aha!" moments.
4.  **The Reveal & Demo (The Climax):** The moment of truth. We run the final tool. Does it work? We show the result in a clean, satisfying way. If it failed, we analyze exactly why.
5.  **The Empowerment Takeaway (The "So What?"):** We connect it back to you. The code is in this repository. The skill is within your reach. **What problem will *you* solve?**

</details>

<details>
<summary><strong>💡 Potential Video Ideas</strong></summary>
<br>

*   **Productivity & Automation:**
    *   **AI Email Triage:** I built an AI to read my emails and tell me what's actually important.
    *   **The Subscription Killer:** I got tired of paying for subscriptions, so I built an AI to find me free alternatives.
    *   **The Automated Job Applicant:** A personal AI agent that finds and filters job postings for me.
*   **Creativity & Exploration:**
    *   **The AI Recipe Generator:** An app that creates meals from whatever is in my fridge.
    *   **The "What Should I Watch?" Bot:** An AI that gives me movie recommendations based on my specific mood, not just my viewing history.
*   **The "Honest Failure" Series:**
    *   **I Tried to Build an AI to Win My Fantasy Football League... And Here's Why It Failed.**
    *   **My AI Meeting Summarizer Was a Disaster (And I Learned More From It Than Any Success).**

</details>

---

### How to Use This Repository

This repository is the central hub for our community and every tool we create.

*   **Project Structure:** Each project (tool or workflow) has its own dedicated folder under `/tools` or `/workflows`. Inside each folder, you'll typically find:
    *   `README.md`: A detailed guide explaining what the project does and how to use it.
    *   Source code and configuration files.
    *   `CLAUDE.md` or `GEMINI.md`: Development notes and AI conversations.

*   **Repository Structure:**
    ```
    wadiwadi-free/
    ├── README.md                   # This file
    ├── LICENSE                     # MIT License
    ├── START.md                    # Getting started guide
    ├── docs/                       # General documentation
    ├── tools/                      # AI-powered browser extensions and tools
    └── workflows/                  # n8n automation workflows
    ```

*   **Get the Code:** To get started with a project, you can `git clone` this repository to your computer.
*   **Contribute:** Have an idea for a tool or an improvement? Open an "Issue" in the repository. We want this to be a collaborative space.

---

## 🛠️ Available Tools

This section includes AI-powered browser extensions and other custom-built tools.

### 001 - LinkedIn Profile Researcher
**📍 Location:** `/tools/001-linkedin-profile-researcher/`  
**🚀 Status:** ✅ **Production Ready**

A powerful Chrome extension that transforms LinkedIn profile research using AI. Generate comprehensive bilingual reports (English/Arabic) from LinkedIn profiles with one-click screenshot analysis.

**✨ Key Features:**
- **AI-Powered Analysis:** Gemini 2.5 Pro/Flash with 8192 token limit
- **Bilingual Reports:** Professional insights in English and Arabic
- **PDF Export:** Clean, printable reports with optimized formatting
- **Smart Caching:** 7-day local storage with intelligent cleanup
- **Modern UI:** Glassmorphic design with real-time progress tracking

**💡 What You'll Learn:**
- Chrome Extension V3 development with service workers
- Gemini API integration with multimodal analysis
- Modern JavaScript patterns and modular architecture
- Browser APIs (screenshots, storage, message passing)
- PDF generation and responsive UI design

### 002 - Instagram Profile Analysis
**📍 Location:** `/tools/002-instagram-profile-analysis/`  
**🚀 Status:** ✅ **Production Ready**

A sophisticated Chrome extension that extracts Instagram profile data, downloads media, and provides AI-powered profile analysis. Features advanced reel video extraction and intelligent media organization.

**✨ Key Features:**
- **AI Profile Analysis:** Gemini-powered insights with user media selection
- **Complete Data Extraction:** Bio, followers, posts, and profile statistics
- **Advanced Media Downloads:** Images, videos, and reels with multi-layer extraction
- **Modern Tabbed Interface:** Clean separation of profile, media, and AI analysis
- **Smart Caching:** Context-aware persistence across sessions
- **Bulk Operations:** Select and download multiple media items with progress tracking

**💡 What You'll Learn:**
- Advanced DOM parsing and dynamic selector strategies
- Chrome Downloads API with bulk operations
- Complex message passing between extension components
- Instagram's changing DOM structure and fallback techniques
- Media processing and CORS handling strategies

---

## 🚀 Available Workflows

This section contains automation workflows for tools like n8n, designed to connect different apps and services to automate repetitive tasks.

### 000 - Self-Hosted n8n with Docker
**📍 Location:** `/workflows/000-setup-n8n/`

A simple setup to run your own instance of n8n locally using Docker. This is the foundation for building and testing custom automation workflows.

**✨ Features:**
- **Docker Compose:** One-command setup using `docker-compose.yml`
- **Local Environment:** Perfect for developing and testing n8n workflows securely
- **Foundation for Automation:** Starting point for all n8n projects in this repository

**💡 What You'll Learn:**
- Docker and Docker Compose fundamentals
- n8n setup and self-hosting benefits
- Local automation platform development

### 001 - GSC API Quick Wins
**📍 Location:** `/workflows/001-gsc-api/`  
**🚀 Status:** ✅ **Production Ready**

An intelligent n8n workflow that automatically analyzes Google Search Console data using AI to identify SEO "quick wins" - high-impact, low-effort optimization opportunities.

**✨ Key Features:**
- **Automated GSC Data Fetching:** Pulls 30-day search performance data via API
- **AI-Powered SEO Analysis:** Gemini AI identifies striking distance keywords, low CTR pages, and consolidation opportunities
- **Google Sheets Integration:** Writes structured findings directly to spreadsheets
- **Professional Setup:** Complete with placeholders and comprehensive documentation

**💡 What You'll Learn:**
- Google Search Console API integration
- n8n workflow automation with AI agents
- SEO data analysis and optimization strategies
- Google OAuth2 and Sheets API configuration

<details>
<summary><strong>🛠️ The Tools of the Trade: Your Local AI Dev Setup</strong></summary>
<br>

We believe in empowering you with real, professional tools from day one. Instead of using a limited online editor, we will guide you in setting up a powerful local environment on your own machine. This gives you maximum flexibility and control.

Our **"Video Zero"** on the channel will be a dedicated guide walking you through this entire setup.

1.  **Code Editor: [Visual Studio Code](https://code.visualstudio.com/)**
    *   The industry-standard for a reason. It's free, powerful, and has a massive ecosystem of extensions.
2.  **Runtime: [Node.js](https://nodejs.org/)**
    *   The engine that allows us to run JavaScript (the language of the web) on our computer to build everything from web servers to automation scripts.
3.  **Version Control: [Git](https://git-scm.com/) & [GitHub](https://github.com/)**
    *   The fundamental system for tracking changes in code and sharing it. It's how you'll get the code from this repository onto your machine.
4.  **AI Partners: Command Line Interfaces (CLIs)**
    *   **[Gemini CLI](https://developers.google.com/gemini/tutorials/cli_quickstart)**: A powerful, free tool to interact with Google's Gemini models directly from our terminal.
    *   **[Claude Code CLI](https://www.npmjs.com/package/@anthropic-ai/claude-cli)**: An excellent alternative from Anthropic for generating code.

This setup puts you in the driver's seat, ready to tackle any project we explore on the channel.
</details>

<details>
<summary><strong>🎨 The Brand Kit</strong></summary>
<br>

#### Color Palette

| Name              | Hex       | RGB                 | HSL                    | Usage                                             |
| ----------------- | --------- | ------------------- | ---------------------- | ------------------------------------------------- |
| **Wadi Blue**     | `#0ea5e9` | `rgb(14, 165, 233)` | `hsl(200, 88%, 48%)`   | Primary brand color, CTAs, headers, main UI       |
| **Heritage Orange**| `#f97316` | `rgb(249, 115, 22)` | `hsl(24, 95%, 53%)`    | Secondary actions, highlights, cultural elements  |
| **Sunset Coral**  | `#fb923c` | `rgb(251, 146, 60)` | `hsl(27, 96%, 61%)`    | Warm accents, success states, friendly elements   |
| **Sky Light**     | `#f0f9ff` | `rgb(240, 249, 255)`| `hsl(200, 100%, 97%)` | Backgrounds, cards, subtle areas                  |
| **Deep Sea**      | `#0c4a6e` | `rgb(12, 74, 110)`  | `hsl(202, 80%, 24%)`   | Text, headers, high contrast elements             |

#### Typography

| Language | Family    | Weights             | Usage                                                  | Characteristics                                  |
| -------- | --------- | ------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| **English**  | **Inter** | `300, 400, 500, 600, 700` | All English content, UI elements, technical docs       | Clean, modern, highly legible, tech-forward      |
| **Arabic**   | **Tajawal** | `300, 400, 500, 700` | All Arabic content, bilingual headers, cultural comms | Modern Arabic font, excellent readability, balanced |
</details>

---

### Get Involved

Wadi Wadi is more than a channel; it's a community experiment. Here's how you can be a part of it:

*   **[➡️ Subscribe to the YouTube Channel](https://www.youtube.com/@wadiwadi_ai)**
*   **[⭐ Star this Repository](https://github.com/happydreammmer/wadiwadi_free)**
*   **[💡 Suggest an Idea](https://github.com/happydreammmer/wadiwadi_free/issues/new)**

Let's start building.
