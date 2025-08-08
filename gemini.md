# Gemini Project Brief: Wadi Wadi

This file provides context for the Gemini AI assistant to ensure it aligns with the project's goals, conventions, and technical landscape.

## 1. Project Overview & Core Mission

**Wadi Wadi** is a public-facing educational project aimed at empowering non-developers to build their own AI-powered tools. The core philosophy is that "AI is the great equalizer," enabling anyone to become a problem-solver.

The project consists of two main parts:
1.  **A YouTube Channel:** Demonstrates the process of building useful tools from scratch, following a specific narrative formula ("The Golden Formula").
2.  **This GitHub Repository:** Acts as a community toolkit, housing the source code for every tool built on the channel.

The primary audience is curious beginners and non-developers. The tone should be encouraging, clear, and focused on the practical application of AI to solve real-world problems.

## 2. Key Files & Structure

-   `README.md`: The main entry point and public face of the project. It explains the philosophy, mission, and how to get involved. **All changes should preserve its structure and tone.**
-   `START.md`: A step-by-step quickstart guide for users to set up their local AI development environment. This is a critical document for the target audience.
-   `.github/assets/`: Contains all branding images (banner, logo) and favicons.
-   `/tools/`: This directory houses individual AI tool projects, with each project in its own sub-folder (e.g., `/tools/001-linkedin-profile-researcher`).
-   `/workflows/`: This directory contains automation workflows for tools like n8n.

## 3. Technical & Style Conventions

-   **Documentation-First:** The project is currently documentation-heavy. All Markdown files (`.md`) should be well-structured, using clear headings, lists, and code blocks.
-   **Branding:** Adhere to the brand kit defined in the `README.md`, especially the color palette and typography, if any web-based UIs are created.
-   **Code Style:** For any future code, prioritize clarity and simplicity. The goal is to create code that is easy for a beginner to understand, even if it's not the most condensed or "clever" solution. Add comments to explain the "why" behind non-obvious code.
-   **Git Commits:** Commit messages should be clear and descriptive.

## 4. My Role as an AI Assistant

Your primary role is to act as a development partner in fulfilling the project's mission. Key tasks include:

-   **Maintaining Documentation:** Updating `README.md` and `START.md` with clear, accurate, and encouraging instructions.
-   **Scaffolding New Projects:** Creating the directory structure and initial files for new tool projects under the `/projects/` directory.
-   **Developing AI Tools:** Writing, debugging, and refactoring code for the various AI tools that will be built.
-   **Adhering to Conventions:** Strictly follow the established conventions in this brief. When in doubt, analyze existing files for patterns.
