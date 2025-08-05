# Instagram Profile Data Extractor & Media Downloader

## Project Overview

A **fully functional** Chrome extension that extracts Instagram profile data and downloads images/videos (including Reels) from Instagram pages. The extension features a modern tabbed interface, persistent data storage, and robust media downloading capabilities that work reliably with Instagram's dynamic structure.

## ✨ Current Features

### 1. Profile Data Extraction
- **Username/ID**: Extract the profile username (e.g., "bousher_valley")
- **Bio**: Extract profile bio/description text
- **Post Count**: Extract number of posts (e.g., "549 posts")
- **Followers Count**: Extract followers count (e.g., "3,471 followers") 
- **Following Count**: Extract following count (e.g., "5,460 following")
- **Profile Picture**: Extract profile picture URL
- **Additional Info**: Business category, location, contact info if available
- **Copy to Clipboard**: One-click copying of profile data
- **JSON Export**: Export profile data as structured JSON

### 2. Advanced Media Download System
- **Image Downloads**: Download individual images from posts in high quality
- **Video Downloads**: Download videos from posts with full quality preservation
- **Reel Video Downloads**: **✅ FULLY WORKING** - Advanced reel video extraction with multi-layer parsing
- **Bulk Download**: Download multiple media files with real-time progress tracking
- **Smart Organization**: Save files with meaningful names (username_postID_index.ext)
- **Quality Settings**: Automatic high-quality media detection
- **Media Filtering**: Filter by All/Images/Videos/Reels with instant UI updates
- **Batch Progress**: Real-time download progress with detailed success/failure tracking
- **Reel Processing**: Intelligent reel video URL extraction with up to 30-second processing time

### 3. Modern User Experience
- **Tabbed Interface**: Clean separation between "Profile Extraction" and "Media Download"
- **Data Persistence**: Cached data survives popup closes and page navigation
- **Responsive Design**: Optimized layout with proper scrolling and flex containers
- **Media Grid**: Thumbnail grid with scroll support and selection indicators
- **Smart Caching**: Context-aware data persistence with automatic refresh detection
- **Toast Notifications**: Comprehensive user feedback for all operations
- **Loading States**: Smooth animations and progress indicators
- **Error Recovery**: Robust error handling with detailed user messaging

### 4. Technical Reliability
- **Multi-Layer Reel Extraction**: 5 different parsing methods for video URL detection
- **Fallback Strategies**: Multiple URL formats and extraction techniques
- **CORS Handling**: Smart workarounds for Instagram's security restrictions  
- **Memory Management**: Efficient caching and cleanup to prevent data loss
- **Script Injection Safety**: Prevents redeclaration errors during multiple injections

## Technical Architecture

### Extension Structure
```
instagram-extension/
├── manifest.json          # Extension manifest (V3)
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic and user interactions
│   └── popup.css          # Popup styling
├── content/
│   ├── content.js         # Content script for DOM manipulation
│   └── extractor.js       # Profile data extraction logic
├── background/
│   └── background.js      # Service worker for downloads
├── utils/
│   ├── selectors.js       # CSS selectors for Instagram elements
│   └── helpers.js         # Utility functions
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── tests/
│   └── test_extraction.js # Testing utilities
└── intagram.html          # Sample Instagram HTML for development
```

### Key Technical Features

1. **Manifest V3**: Uses the latest Chrome extension API
2. **Content Scripts**: Injects scripts into Instagram pages to access DOM
3. **Message Passing**: Robust communication between popup, content script, and background
4. **Chrome Downloads API**: Handles file downloads with proper permissions and progress tracking
5. **Dynamic Selectors**: Robust selectors that work with Instagram's changing class names
6. **Multi-Strategy Extraction**: 5+ different methods for extracting reel video URLs
7. **Data Persistence Layer**: chrome.storage.local integration with smart caching
8. **Error Recovery Systems**: Comprehensive fallback mechanisms and user feedback

## Reel Video Download Technology

### Advanced Extraction Methods
The extension employs sophisticated techniques to extract reel video URLs:

1. **Multi-URL Strategy**: Attempts original URL, embed version, post format, and API variations
2. **HTML Parsing**: 5 different parsing methods including:
   - `window._sharedData` script extraction
   - `application/json` script tag parsing  
   - General script tag JSON detection
   - Direct .mp4 URL pattern matching
   - Data attribute video URL extraction
3. **Smart Response Detection**: Automatically detects and skips modal/incomplete responses
4. **Nested Data Handling**: Recursive search through Instagram's GraphQL structures
5. **Quality Prioritization**: Prefers Instagram CDN and fbcdn URLs for reliability

### Video URL Properties Detected
- Standard formats: `video_url`, `src`, `url`, `playback_url`
- Instagram-specific: `video_versions`, `dash_manifest`, `additional_candidates`
- Quality variants: `video_url_hd`, `progressive_download_url`, `download_url`
- And 15+ other common video property formats

## Instagram DOM Structure Analysis

The extension uses sophisticated selectors based on Instagram's current DOM structure:

### Profile Data Selectors
- **Username**: `h2 span` containing profile name with fallback selectors
- **Posts Count**: Elements containing "posts" text with numeric spans
- **Followers**: Links to `/username/followers/` with count spans
- **Following**: Links to `/username/following/` with count spans
- **Bio**: Profile description sections with `dir="auto"` attributes
- **Profile Picture**: `img` elements with profile picture alt text

### Media Elements
- **Post Images**: `img` elements within post containers with high-resolution URLs
- **Post Videos**: `video` elements and video thumbnail images
- **Reels**: Video content in reel containers
- **Media Metadata**: Extraction of post IDs, timestamps, and media types

## Installation & Usage

### Installation
1. Download or clone the extension
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

### Usage
1. **Navigate** to any Instagram profile page
2. **Click** the extension icon to open the popup
3. **"Profile Extraction" Tab**: View and copy profile data  
4. **"Media Download" Tab**: Browse and download media
5. **Select Media**: Click thumbnails to select individual items
6. **Download**: Use "Download Selected" or individual download buttons
7. **Monitor Progress**: Watch real-time download status and notifications

### Reel Video Downloads
- Reel videos show with a 🎬 icon and "Reel Video" label
- Processing may take up to 30 seconds per reel
- Toast notifications provide progress updates
- Failed downloads are clearly indicated with retry options

## Data Persistence & Caching

The extension includes intelligent data caching that:
- **Persists Data**: Survives popup closes and page navigation
- **Context Awareness**: Only caches data for the same Instagram profile
- **Smart Refresh**: Automatically detects when fresh data extraction is needed
- **Selective Caching**: Stores profile data, media items, selections, active tab, and filters
- **Memory Efficient**: Automatic cleanup and storage optimization

## Settings & Configuration

- **Quality Settings**: Choose high-quality only downloads
- **Media Types**: Include/exclude videos from downloads  
- **Organization**: Organize downloads by date
- **Filename Formats**: 
  - `username_001` (default)
  - `username_postID`
  - `postID only`

## Security & Compliance

- **Minimal Permissions**: Requests only required permissions (activeTab, downloads, storage)
- **Rate Limiting**: Implements delays to avoid overwhelming Instagram
- **User Consent**: Clear indication of data being extracted
- **Privacy**: No data storage beyond user's local machine
- **Error Handling**: Graceful handling of private profiles and network issues

## Browser Compatibility

- **Chrome**: Fully supported (Manifest V3)
- **Edge**: Compatible with Chromium-based Edge
- **Other Browsers**: May require adaptation for different extension APIs

## Development Status

**🎉 FULLY FUNCTIONAL & PRODUCTION READY**

All major features implemented and thoroughly tested:

- ✅ **Profile Data Extraction**: Complete with fallback selectors
- ✅ **Image Downloads**: High-quality image extraction and download
- ✅ **Video Downloads**: Standard video download functionality  
- ✅ **Reel Video Downloads**: Advanced multi-layer extraction system
- ✅ **Tabbed Interface**: Modern UI with profile/media separation
- ✅ **Data Persistence**: Smart caching with context awareness
- ✅ **Error Prevention**: Script injection safety and error recovery
- ✅ **User Experience**: Toast notifications, progress tracking, responsive design

## Resolved Issues & Improvements

### Fixed Problems
1. **✅ UI Layout Issues**: Implemented tabbed interface with proper flex containers
2. **✅ Profile Picture CORS**: Simplified to click-to-view button
3. **✅ Data Loss**: Added chrome.storage.local persistence 
4. **✅ Script Redeclaration**: Prevented duplicate variable declarations
5. **✅ Reel Video Downloads**: Multi-strategy extraction system
6. **✅ Media Grid Scrolling**: Fixed layout with proper overflow handling
7. **✅ Selection Persistence**: Maintains user selections across sessions

### Performance Optimizations
- Debounced DOM queries for efficiency
- Smart caching reduces redundant API calls  
- Lazy loading for media thumbnails
- Memory management prevents extension slowdown
- Parallel processing for bulk downloads

## Known Limitations

- Instagram frequently changes their DOM structure - selectors may need updates
- Private profiles have limited data extraction capabilities
- Download speed limited by Instagram's rate limiting
- Some media may require user to be logged in to Instagram

## Future Enhancements

- Download stories and highlights
- Batch processing multiple profiles  
- Advanced filtering options
- Cloud storage integration
- Automated selector updates

## Development Notes

- The extension includes comprehensive error handling and fallback strategies
- Selectors are designed to be resilient to Instagram's layout changes
- Regular testing across different profile types is recommended
- Performance optimizations include debouncing and memory management