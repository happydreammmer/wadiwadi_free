# 🌊 Wadi Wadi LinkedIn Profile Researcher

A powerful Chrome extension that transforms LinkedIn profile research using AI. Generates comprehensive professional reports in both English and Arabic using Google's Gemini API with advanced multimodal analysis.

## ✨ Features

- 🔍 **AI-Powered Analysis**: Gemini 2.5 Pro/Flash models with 8192 token limit for comprehensive analysis
- 🌐 **Bilingual Research**: Generates detailed reports in both English and Arabic with language switching
- 📸 **Smart Screenshot Capture**: One-click profile analysis using Chrome's activeTab permissions
- 📊 **Professional Reports**: Detailed insights with executive summary, company research, and verification
- 💾 **Intelligent Caching**: 7-day local storage with automatic cleanup and access tracking
- 📄 **PDF Export**: Clean, printable reports with optimized page breaks and professional formatting
- 🎨 **Modern UI**: Glassmorphic design with real-time progress tracking and smooth animations
- 🔄 **Smart Positioning**: Results panel automatically moves to progress panel position after completion
- 🔐 **Secure Storage**: Local API key management with no external data transmission
- ⚡ **Optimized Performance**: Single-scroll interface with flexbox layout and no double scrolling issues

## Installation

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key (starts with "AIza...")

2. **Install the Extension**:
   - Download or clone this repository
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension folder
   - The extension should now be installed

3. **First Use**:
   - Navigate to any LinkedIn profile page (linkedin.com/in/username)
   - Click the extension icon in the Chrome toolbar
   - The extension will prompt for your Gemini API key on first use
   - Research will begin automatically after API key is saved

## Usage

### Basic Research Flow

1. **Navigate to a LinkedIn Profile**: Go to any LinkedIn profile page (linkedin.com/in/username)
2. **Start Research**: Click the extension icon in Chrome toolbar
3. **API Key Setup**: On first use, enter your Gemini API key in the secure modal
4. **Automated Analysis**: The extension will automatically:
   - Capture a full-page screenshot of the profile
   - Extract comprehensive profile data using multimodal AI
   - Conduct detailed English research with Google Search integration
   - Perform Arabic research with cultural context
   - Generate consolidated bilingual reports
5. **View Results**: Results appear in a modern floating panel with:
   - Profile overview with extracted data
   - Language switching between English and Arabic reports
   - Real-time progress tracking during analysis
6. **Export Options**: 
   - **Copy**: Copy formatted text to clipboard
   - **PDF**: Generate professional PDF with optimized print layout

### Progress Tracking

The extension provides real-time progress updates in a modern glassmorphic panel:
- **Initializing...** (5%)
- **Getting API key...** (10%) 
- **Processing screenshot...** (20%)
- **Analyzing profile data...** (25%)
- **Conducting English research...** (40%)
- **Conducting Arabic research...** (65%)
- **Generating consolidated reports...** (85%)
- **Saving results...** (95%)
- **Research completed!** (100%)

### Results Panel

The modern floating results panel features:
- **Profile Overview**: Structured profile data with key information cards
- **Bilingual Reports**: Seamless language switching between English and Arabic
- **Professional Formatting**: Clean typography with Wadi Wadi branding
- **Smart Layout**: Single-scroll interface with optimized content flow
- **Cached Results**: Instant loading of previously researched profiles
- **Collapsible Interface**: Minimize/maximize for better screen real estate

### Export Options

- **Copy to Clipboard**: Copies formatted research report with full formatting preserved
- **PDF Export**: Generates professional PDF with:
  - Optimized page breaks and print layout
  - Brand-consistent styling and typography  
  - Clean margins and professional presentation
  - No empty spaces or layout issues

## 🏗️ File Structure

```
001-linkedin-profile-researcher/
├── CLAUDE.md                     # Development documentation  
├── README.md                     # This file
├── TODO.md                       # Development tasks
├── manifest.json                 # Chrome extension configuration
├── background.js                 # Service worker for screenshot capture
├── styles.css                    # UI styles
├── core/
│   ├── constants.js              # Configuration and brand colors
│   ├── content-main.js           # Main application logic and research flow
│   └── utils.js                  # Utility functions and helpers
├── components/
│   ├── api-key-manager.js        # Secure API key management UI
│   ├── gemini-researcher.js      # AI research logic and API integration
│   ├── progress-panel.js         # Real-time progress tracking UI
│   ├── results-panel.js          # Results display with language switching
│   └── screenshot-handler.js     # Screenshot capture handling
└── utils/
    ├── pdf-export.js             # Professional PDF generation
    └── storage.js                # Chrome storage management with caching
```

## 🤖 AI Integration

### Gemini Models & Configuration

- **Primary**: `gemini-2.5-pro` - High-quality analysis with 8192 token limit
- **Backup**: `gemini-2.5-flash` - Automatic fallback for performance optimization
- **Enhanced Tokens**: Increased from 2048 to 8192 tokens for comprehensive responses
- **Intelligent Fallback**: Seamless model switching on errors or quota issues

### Advanced Features

- **Multimodal Analysis**: Processes screenshot images with sophisticated text prompts
- **Google Search Integration**: Real-time web information grounding for accurate research
- **Structured JSON Output**: Consistent data schemas with validation and error recovery
- **Smart Caching**: 7-day intelligent storage with automatic cleanup and access tracking

### Research Methodology

1. **Multimodal Profile Extraction**: AI analyzes screenshots to extract comprehensive profile data
2. **English Research Pipeline**: Professional background research with Google Search grounding
3. **Arabic Research Pipeline**: Cultural context research with Arabic-language sources
4. **Consolidated Report Generation**: Intelligent synthesis of all findings into bilingual reports
5. **Quality Validation**: Error checking and fallback handling throughout the process

## Privacy & Security

- **Local Storage**: All data is stored locally in your browser
- **API Key Security**: Keys are stored locally and never transmitted except to Google's API
- **No External Servers**: Extension communicates only with LinkedIn and Google's Gemini API
- **User Control**: Users can clear all data at any time

## 🔧 Troubleshooting

### Common Issues & Solutions

**Extension not working:**
- Ensure you're on a LinkedIn profile page (linkedin.com/in/username)
- Check that the extension is enabled in chrome://extensions/
- Refresh the page and wait for content scripts to load
- Click the extension icon in Chrome toolbar (not a page button)

**API key errors:**
- Verify your API key is correct (starts with "AIza")
- Check your Google AI Studio quota and billing
- Ensure the Gemini API is enabled for your project
- Clear extension data and re-enter API key if persistent

**Research failures:**
- Check your internet connection stability
- Verify API key has sufficient quota for requests
- Try refreshing the page and restarting research
- Check browser console for specific error messages

**PDF export problems:**
- Ensure popup blockers aren't preventing the print dialog
- Check browser download and print permissions
- If PDF generation fails, use Copy to clipboard as alternative
- Verify no browser extensions are interfering with print functionality

**UI layout issues:**
- Clear browser cache and reload the extension
- Check for conflicting CSS from other extensions
- Ensure Chrome is updated to latest version (88+ required)
- Disable other extensions temporarily to test for conflicts

### Reset Extension Data

To completely reset the extension:
1. Go to `chrome://extensions/`
2. Find "Wadi Wadi LinkedIn Researcher"
3. Click "Remove" and confirm
4. Reinstall using the installation steps above
5. Re-enter your API key when prompted

**Alternative method:**
1. Open Chrome DevTools (F12) on any LinkedIn profile page
2. Go to Application tab → Storage → Local Storage
3. Clear all entries starting with `linkedin_researcher_`
4. Refresh the page and re-enter API key

## 🛠️ Development

### Requirements

- **Chrome 88+** (Manifest V3 support required)
- **Gemini API Key** with sufficient quota from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Active Internet Connection** for API calls and Google Search integration
- **Developer Mode** enabled in Chrome extensions

### Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/happydreammmer/wadiwadi_free.git
   cd wadiwadi_free/tools/001-linkedin-profile-researcher
   ```

2. **Load Extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the tool directory

3. **Development Workflow**:
   - Make changes to any `.js`, `.css`, or `.json` files
   - Click "Reload" button on the extension in `chrome://extensions/`
   - Test changes on LinkedIn profile pages
   - Check console logs for debugging (F12 → Console)

4. **Key Development Files**:
   - `core/content-main.js` - Main application logic
   - `components/` - UI components and functionality
   - `manifest.json` - Extension configuration
   - `CLAUDE.md` - Detailed development documentation

### Contributing

This project is part of the Wadi Wadi open-source toolkit:
- **Bug Reports**: [GitHub Issues](https://github.com/happydreammmer/wadiwadi_free/issues)
- **Feature Requests**: Submit detailed issues with use cases
- **Pull Requests**: Follow existing code style and add tests
- **Documentation**: Help improve README and code comments

## 📄 License

MIT License - See LICENSE file for details.

## 🚀 Version History

### v1.2.0 (June 2025) - **Current Version** ✅ **FULLY TESTED & VERIFIED**
**Major Optimizations & Bug Fixes:**
- ✅ **Enhanced API Performance**: Increased token limits from 2048 to 8192 for comprehensive responses
- ✅ **Fixed PDF Export**: Resolved constructor loading issues and optimized print layout  
- ✅ **Smart UI Positioning**: Results panel automatically moves to progress panel position
- ✅ **Optimized Layout**: Eliminated double scrolling with flexbox architecture
- ✅ **Professional PDF Styling**: Enhanced print styles with proper page breaks and no empty spaces
- ✅ **UI Polish**: Removed white space above results panel header for clean appearance
- ✅ **Chrome Compatibility**: Cleaned header comments to prevent extension loading errors
- ✅ **Comprehensive Testing**: All functionality verified working in production environment
- ✅ **Improved Error Handling**: Better fallback mechanisms and user feedback
- ✅ **Performance Optimizations**: Faster loading and smoother animations

### v1.1.0 (June 2025)
**Feature Enhancements:**
- 🌐 Added language switching between English and Arabic reports
- 💾 Implemented intelligent 7-day caching with automatic cleanup
- 🎨 Modern glassmorphic UI design with Wadi Wadi branding
- 📊 Enhanced progress tracking with real-time updates
- 🔄 Smart panel positioning and layout optimizations

### v1.0.0 (November 2024) - **Initial Release**
**Core Functionality:**
- 📸 Profile screenshot capture and AI analysis
- 🤖 Gemini API integration with multimodal processing
- 🌍 Bilingual research generation (English & Arabic)
- 📄 PDF and clipboard export capabilities
- 🔐 Secure local API key management
- 💾 Chrome storage integration with caching

## 📞 Support

For technical support, bug reports, or feature requests:
- **GitHub Issues**: [Open an issue](https://github.com/happydreammmer/wadiwadi_free/issues)
- **Documentation**: Check CLAUDE.md for development details
- **YouTube Channel**: [Wadi Wadi AI](https://www.youtube.com/@wadiwadi_ai)