# Your Local AI Development Environment: A Quickstart Guide

This guide provides step-by-step instructions to set up a professional development environment on your Windows, macOS, or Linux machine. We'll install the essential tools for modern software and AI development.

---

### 1. Install Visual Studio Code (VS Code)

VS Code is the industry-standard code editor. It's powerful, free, and has a built-in terminal we'll use for all our commands.

- **Website:** [**code.visualstudio.com/download**](https://code.visualstudio.com/download)

#### Installation
- **Windows:** Run the `.exe` installer. Crucially, ensure the **"Add to PATH"** option is checked during installation.
- **macOS:** Unzip the downloaded file and drag the `Visual Studio Code.app` into your `Applications` folder.
- **Linux:** Download the `.deb` (Debian/Ubuntu) or `.rpm` (Fedora/Red Hat) package and install it using your system's software manager.

---

### 2. Install Node.js and npm

Node.js lets you run JavaScript code on your computer, and it includes npm (Node Package Manager), the tool we need to install community-built packages and AI CLIs.

- **Website:** [**nodejs.org**](https://nodejs.org/)

Download the **LTS (Long-Term Support)** version, as it is the most stable and reliable.

#### Installation
- **Windows & macOS:** Run the official installer (`.msi` or `.pkg`) and accept the default settings. The setup wizard will handle the installation and path configuration for you.
- **Linux:** While you can use the official package, it's often easier to install from your distribution's repository. For Debian/Ubuntu systems, run the following commands in your terminal:
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```

#### Verify Your Installation (All Systems)
After installation is complete, **close and re-open your terminal** (or VS Code). Run the following commands one by one to confirm a successful setup:

```bash
node -v
```
```bash
npm -v
```
You should see a version number for each command (e.g., `v20.15.1` and `10.7.0`). If you see a "command not found" error, try restarting your computer.

---

### 3. Install and Configure Git

Git is the world's most popular version control system. It tracks changes in your code, allows you to collaborate with others, and is how you'll download projects from GitHub.

- **Website:** [**git-scm.com/downloads**](https://git-scm.com/downloads)

#### Installation
- **Windows:** Run the "Git for Windows" installer. It presents many options; for best results, **accept the recommended default settings**.
- **macOS:** A version of Git is likely pre-installed. To ensure you have the latest, run `xcode-select --install` in your terminal, which installs the Xcode Command Line Tools.
- **Linux:** Install using your package manager. For Debian/Ubuntu systems:
  ```bash
  sudo apt install git
  ```

#### One-Time Setup (All Systems)
After installing, you must introduce yourself to Git. This name and email will be attached to every commit you make.

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

#### Cloning an Existing Repository

To work on an existing project from a remote host like GitHub, you can use `git pull` to get the files. If you are starting from an empty directory, you first need to initialize git.

```bash
git init
git pull https://github.com/happydreammmer/wadiwadi_free/
```

---

### 4. Install the Google Gemini CLI

This command-line interface (CLI) lets you interact with Google's powerful Gemini AI models directly from your terminal.

1.  **Open VS Code** and launch the integrated terminal (**View > Terminal** or `Ctrl+` \`).
2.  In the terminal, run the following command to install the CLI globally on your system:
    ```bash
    npm install -g @google/gemini-cli
    ```
3.  After installation, run the one-time setup command. It will prompt you to log in with your Google account in a web browser to complete authentication.
    ```bash
    gemini
    ```

---

### 5. Install the Anthropic Claude CLI

Anthropic's official CLI is a powerful coding assistant that runs in your terminal and can interact directly with your project files to help you code, debug, and test.

1.  In the VS Code terminal, install the CLI globally using npm:
    ```bash
    npm install -g @anthropic-ai/claude-code
    ```
2.  The tool is designed to be run from *within* a project folder. Navigate to your project directory in the terminal (e.g., `cd path/to/my-project`).
3.  Start the Claude interface. The first time you run it, it will open a browser for you to log in and authorize the tool.
    ```bash
    claude
    ```
Once authenticated, you will be in the Claude interactive environment, ready to work.
