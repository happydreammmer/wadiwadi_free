# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wadi Wadi is a collection of AI-powered Chrome extensions and tools built to demonstrate the power of AI for non-developers. The repository houses multiple self-contained projects in the `tools/` directory, each implementing a complete solution from concept to production.

## Repository Structure

```
wadiwadi-free/
├── README.md                   # Project overview and philosophy
├── START.md                    # Development environment setup guide
├── docs/                       # Documentation
│   └── GEMINI_API_DOC.md      # Comprehensive Gemini API reference
├── tools/                      # Individual tool projects
│   ├── 001-linkedin-profile-researcher/  # Production-ready LinkedIn research extension
│   └── 002-instagram-profile-analysis/   # Instagram profile analysis extension
└── workflows/                  # n8n automation workflows
```

## Development Environment

This project uses:
- **Chrome Extensions (Manifest V3)**: Primary platform for tools
- **Vanilla JavaScript (ES6+)**: No build system required, direct file loading
- **Google Gemini API**: Primary AI integration via `@google/genai`
- **Chrome APIs**: Storage, downloads, tabs, screenshots

### Setup Commands
```bash
# Clone repository
git clone https://github.com/happydreammmer/wadiwadi_free/
cd wadiwadi-free

# Install AI development tools globally
npm install -g @google/gemini-cli
npm install -g @anthropic-ai/claude-code

# Setup Gemini CLI (requires Google account)
gemini
```

## Architecture Patterns

### Chrome Extension Structure
Each tool follows a consistent Manifest V3 architecture:

- **`manifest.json`**: Extension configuration with permissions
- **`background.js`**: Service worker for background tasks
- **`content/`**: Content scripts injected into web pages
- **`popup/`**: Browser action popup interfaces
- **`components/`**: Modular UI and logic components
- **`utils/`**: Shared utilities and helpers
- **`CLAUDE.md`**: Tool-specific development documentation

### Message Passing Protocol
- **Popup ↔ Content Script**: UI interactions and data requests
- **Content Script ↔ Background**: Downloads and persistent operations
- **Background ↔ External APIs**: AI processing and data fetching

### Data Flow Pattern
1. User interaction in popup interface
2. Popup sends extraction request to content script
3. Content script processes web page data
4. Results passed back through message system
5. Background worker handles file operations

## Key Technologies

### AI Integration
- **Gemini 2.5 Pro/Flash**: Primary models with 8192 token limits
- **Multimodal Analysis**: Screenshot-based profile analysis
- **Bilingual Support**: English and Arabic research generation
- **Context Caching**: 7-day local storage with metadata

### Chrome Extension APIs
- **activeTab**: Screenshot capture without broad permissions
- **storage**: Local caching and settings persistence
- **downloads**: File generation and export functionality
- **scripting**: Dynamic content script injection

## Development Workflow

### Testing Extensions
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select tool directory
5. Test on target websites

### Debugging
- **Content Scripts**: Browser console on target pages
- **Popup Scripts**: Right-click extension → "Inspect popup"
- **Background Scripts**: Extension details page → "Inspect views"
- **API Calls**: Network tab for external requests

## Brand Guidelines

### Color Palette
- **Wadi Blue**: `#0ea5e9` - Primary UI elements
- **Heritage Orange**: `#f97316` - Secondary actions
- **Sunset Coral**: `#fb923c` - Accents and highlights
- **Sky Light**: `#f0f9ff` - Backgrounds
- **Deep Sea**: `#0c4a6e` - Text and headers

### UI Patterns
- **Glassmorphic Design**: Translucent panels with backdrop blur
- **Progress Tracking**: Real-time status updates during operations
- **Responsive Layout**: Flexible positioning and sizing
- **Error Recovery**: User-friendly messages with retry options

## Security Best Practices

- **API Keys**: Store locally in Chrome storage (not synced)
- **Content Security Policy**: Strict CSP compliance in manifests
- **Input Sanitization**: All user data properly escaped
- **Minimal Permissions**: Only request necessary Chrome permissions
- **No Server Dependencies**: Client-side only architecture

## Tool-Specific Notes

### LinkedIn Profile Researcher (001)
- **Status**: Production ready, fully tested
- **Features**: AI analysis, bilingual reports, PDF export, smart caching
- **Architecture**: 5 core components, 3 utility modules
- **Recent Updates**: 8192 token limits, panel positioning fixes

### Instagram Profile Analysis (002)
- **Status**: Development/testing phase
- **Features**: Profile extraction, media downloads, DOM parsing
- **Challenges**: Instagram DOM changes require selector maintenance
- **Testing**: Manual verification on various profile types

## Common Development Issues

### Instagram Selector Updates
Instagram frequently changes DOM structure. Update `utils/selectors.js` with fallback strategies when extractions fail.

### Chrome Extension Permissions
- Ensure host permissions match target domains
- Use `activeTab` instead of broad `tabs` permission when possible
- Test permission requests in incognito mode

### API Integration
- Implement fallback models (Pro → Flash) for reliability
- Handle rate limiting with exponential backoff
- Cache responses locally to reduce API calls

## File Naming Conventions

- **Tool Directories**: `001-tool-name/` (numbered for chronological order)
- **Documentation**: `CLAUDE.md` (development), `README.md` (user-facing), `TODO.md` (tasks)
- **Components**: Descriptive names (`api-key-manager.js`, `results-panel.js`)
- **Utilities**: Functional names (`storage.js`, `selectors.js`, `helpers.js`)

## Testing Checklist

Before marking tools as production-ready:
- [ ] Extension loads without errors
- [ ] All permissions properly configured
- [ ] API integrations working with fallbacks
- [ ] UI responsive across different screen sizes
- [ ] Error handling with user-friendly messages
- [ ] Local storage management and cleanup
- [ ] Export functionality tested
- [ ] Cross-browser compatibility verified