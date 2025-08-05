# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that extracts Instagram profile data and downloads media from Instagram pages. The extension uses Manifest V3 and is fully functional with a modern popup interface.

## Architecture

### Extension Structure
- **Manifest V3**: Modern Chrome extension using service workers
- **Content Scripts**: Inject into Instagram pages for DOM access (`content/`)
- **Popup Interface**: User interaction through browser action popup (`popup/`)
- **Background Service Worker**: Handles downloads and background tasks (`background/`)
- **Utilities**: Shared selectors and helper functions (`utils/`)

### Key Components
- `content/content.js`: Main content script coordinator that handles message passing
- `content/extractor.js`: Core data extraction logic for profiles and media
- `popup/popup.js`: Popup UI controller with comprehensive state management
- `background/background.js`: Service worker for handling downloads via Chrome APIs
- `utils/selectors.js`: Instagram DOM selectors (frequently updated due to Instagram UI changes)
- `utils/helpers.js`: Shared utility functions

### Data Flow
1. **Popup** sends messages to **Content Script** for extraction
2. **Content Script** uses **Extractor** to parse Instagram DOM
3. **Content Script** sends results back to **Popup**
4. **Popup** sends download requests to **Background** service worker
5. **Background** uses Chrome Downloads API to save files

## Development Commands

Since this is a Chrome extension without a build system, there are no npm/build commands. Development workflow:

1. **Testing in Browser**: Load unpacked extension in `chrome://extensions/`
2. **Console Testing**: Run `tests/test_extraction.js` in browser console on Instagram profiles
3. **Reload Extension**: Click reload button in Chrome extensions page after changes
4. **Debug**: Use Chrome DevTools on popup (right-click extension → Inspect popup)

## Instagram DOM Patterns

### Profile Detection
- Profile URLs match: `instagram.com/[username]/` or `instagram.com/[username]`
- Avoid post URLs (`/p/`), reel URLs (`/reel/`), story URLs (`/stories/`)

### Key Selectors (in `utils/selectors.js`)
- **Username**: Multiple fallback selectors for `h2` elements and profile headers
- **Stats**: Links containing `/followers/` and `/following/` with adjacent count spans
- **Post Count**: Elements containing "posts" text with numeric spans
- **Bio**: Profile description sections with `dir="auto"` attributes
- **Profile Picture**: `img` elements with profile-related alt text
- **Media**: Post containers with images and videos, reel containers

### Extraction Strategy
- **Retry Logic**: Built-in retry mechanisms for failed extractions
- **Fallback Selectors**: Multiple selector strategies per data type
- **Dynamic Content**: Handles lazy-loading and Instagram's dynamic DOM changes
- **Rate Limiting**: Includes delays to avoid overwhelming Instagram

## Message Passing Protocol

### Content Script Messages
- `extractProfile`: Extract all profile data
- `scanMedia`: Find downloadable media items  
- `checkPage`: Verify page type and Instagram compatibility
- `fetchImageAsDataUrl`: Convert images to data URLs for download

### Background Messages
- `downloadMedia`: Bulk download selected media items
- `downloadSingleMedia`: Download individual media item
- `getBatchStatus`: Check progress of bulk downloads

## Testing

### Manual Testing
1. Navigate to Instagram profile page
2. Open extension popup  
3. Click "Extract Profile Data"
4. Verify all profile fields are populated
5. Click "Scan Media" 
6. Select media items and test downloads

### Console Testing
Run code from `tests/test_extraction.js` in browser console on Instagram profile pages to verify extraction functions.

## Common Issues

### Instagram Changes
- Instagram frequently updates DOM structure - update `utils/selectors.js` when extractions fail
- Selectors use fallback strategies, but may need periodic maintenance
- Monitor console errors for selector failures

### Extension Permissions  
- Requires `activeTab`, `downloads`, `storage`, `scripting` permissions
- Host permissions for `*.instagram.com`
- Content script injection may fail on restricted pages

### Content Script Injection
- Extension automatically injects content scripts on Instagram pages
- Popup manually re-injects scripts if communication fails
- Refresh Instagram page if persistent communication issues occur

## Code Patterns

### Error Handling
- All async operations wrapped in try-catch blocks
- User-friendly error messages in popup UI
- Console logging for debugging
- Graceful degradation when features fail

### State Management
- Popup caches data using Chrome storage API
- Cache persists across popup open/close cycles
- Cache cleared when navigating to different Instagram profiles
- Settings persisted in Chrome local storage

### Memory Management
- Content scripts clean up event listeners
- Popup properly manages DOM element references  
- Background worker handles batch download tracking
- Images converted to data URLs to avoid CORS issues

## Development Tips

- Use Chrome DevTools to inspect Instagram DOM structure when updating selectors
- Test on various profile types (public, private, verified, business)
- Monitor Chrome extension console for content script errors
- Use Instagram's mobile view patterns as fallbacks for desktop changes