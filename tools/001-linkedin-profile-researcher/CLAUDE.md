# <
 Wadi Wadi LinkedIn Profile Researcher

A Chrome extension that uses AI to conduct comprehensive research on LinkedIn profiles.

## Project Overview

This is a Chrome Manifest V3 extension that analyzes LinkedIn profiles using Google's Gemini AI API. It captures profile screenshots, extracts data, and generates detailed research reports in both English and Arabic.

## Architecture

### Core Files
- `manifest.json` - Extension configuration (Manifest V3)
- `background.js` - Service worker handling screenshot capture
- `core/content-main.js` - Main application initialization and research flow

### Components
- `components/api-key-manager.js` - Handles Gemini API key management with secure storage
- `components/gemini-researcher.js` - Gemini API integration for profile analysis and research
- `components/progress-panel.js` - UI component showing research progress
- `components/results-panel.js` - UI component displaying research results with language switching
- `components/screenshot-handler.js` - Handles profile screenshot capture

### Utilities
- `utils/storage.js` - Chrome storage management with caching
- `utils/pdf-export.js` - PDF export functionality via print dialog
- `core/utils.js` - General utility functions
- `core/constants.js` - Brand colors and configuration

## Key Features

1. **AI-Powered Analysis**: Uses Gemini 2.5 Pro/Flash models with 8192 token limit
2. **Bilingual Reports**: Generates reports in both English and Arabic
3. **Smart Caching**: Saves results locally with 7-day expiration
4. **PDF Export**: Clean, printable reports via browser print dialog
5. **Progress Tracking**: Real-time progress updates during research
6. **Responsive UI**: Modern, glassmorphic design with Wadi Wadi branding

## Technical Implementation

### Research Flow
1. User clicks extension button on LinkedIn profile page
2. Background script captures full page screenshot using `chrome.tabs.captureVisibleTab`
3. Screenshot sent to content script via message passing
4. Gemini API extracts profile data from screenshot
5. Conducts English and Arabic research using Google Search integration
6. Generates consolidated bilingual reports
7. Results cached locally and displayed in floating panel

### API Integration
- **Gemini API**: Profile analysis, research, and report generation
- **Google Search**: Real-time information gathering for research
- **Chrome Storage**: Local caching with metadata tracking
- **Screenshot API**: Profile capture with activeTab permission

### Error Handling
- Fallback from Gemini 2.5 Pro to 2.5 Flash if primary model fails
- Graceful degradation for API failures
- User-friendly error messages with retry options
- Automatic cache cleanup for expired entries

## Development Notes

### Recent Fixes (Latest Session)
1. **Max Output Tokens**: Increased from 2048 to 8192 for longer responses
2. **PDF Export**: Fixed constructor error by including `utils/pdf-export.js` in manifest
3. **Panel Positioning**: Results panel now moves to progress panel position after completion
4. **Scroll Optimization**: Fixed double scroll issue with flexbox layout
5. **PDF Print Layout**: Enhanced print styles with proper page breaks and no empty spaces
6. **UI Polish**: Removed white space above results panel header bar
7. **Extension Compatibility**: Removed header comments to prevent Chrome extension errors

### Code Standards
- ES6+ JavaScript with async/await
- Chrome Extension Manifest V3 compliance
- Modular component architecture
- Consistent error handling patterns
- Brand-consistent UI design

### Testing Checklist
- [x] Extension loads on LinkedIn profile pages
- [x] Screenshot capture works with activeTab permission
- [x] API key management modal functions properly
- [x] Profile data extraction from screenshots
- [x] English and Arabic research generation
- [x] Report display with language switching
- [x] PDF export functionality
- [x] Cache management and expiration
- [x] Progress panel updates correctly
- [x] Results panel positioning after completion

**✅ All tests passed successfully! Extension is fully functional and production-ready.**

### Final Status: COMPLETE ✅
**Date:** June 2025  
**Testing:** All functionality verified working  
**Performance:** Optimized and production-ready  
**Documentation:** Complete and up-to-date

## Build Commands

The extension doesn't require a build step - it runs directly from source files.

### Loading in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension directory

### Debugging
- Check console logs in content script context
- Use Chrome DevTools for UI inspection
- Monitor background script in extension details
- Test API calls in Network tab

## File Structure

```
tools/001-linkedin-profile-researcher/
   manifest.json                 # Extension configuration
   background.js                 # Service worker
   styles.css                    # UI styles
   core/
      constants.js             # Configuration and colors
      utils.js                 # Utility functions
      content-main.js          # Main application logic
   components/
      api-key-manager.js       # API key management
      gemini-researcher.js     # AI research logic
      progress-panel.js        # Progress UI
      results-panel.js         # Results UI
      screenshot-handler.js    # Screenshot handling
   utils/
       storage.js               # Storage management
       pdf-export.js            # PDF generation
```

## Security Considerations

- API keys stored locally in Chrome storage (not synced)
- No server-side data transmission except to Google APIs
- activeTab permission for screenshot capture
- Content Security Policy compliance
- Input sanitization for all user data

## Future Enhancements

- [ ] Bulk profile analysis
- [ ] Export to multiple formats (Word, Excel)
- [ ] Advanced search filters
- [ ] Team collaboration features
- [ ] Analytics dashboard
- [ ] Chrome sync support for settings