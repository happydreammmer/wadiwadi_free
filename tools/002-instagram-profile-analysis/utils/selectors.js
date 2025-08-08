 // Wadi Wadi - Instagram DOM Selectors
// These selectors are based on Instagram's current DOM structure
// They may need updates when Instagram changes their layout

if (typeof window.InstagramSelectors === 'undefined') {
window.InstagramSelectors = {
    // Profile Information
    profile: {
        // Username selectors (based on actual HTML structure)
        username: [
            'h2 span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft', // Main username in profile header
            'h2 span', // Fallback for h2 span
            'a._a6hd h2 span', // Username within link
            '[data-testid="user-name"]' // If Instagram adds test IDs
        ],
        
        // Post count (from actual HTML: "549 posts")
        posts: [
            'ul li span.html-span', // More specific path
            'section ul li span', // In profile stats section
            'li span.html-span' // Within list item
        ],
        
        // Followers count (from actual HTML: href="/bousher_valley/followers/")
        followers: [
            'a[href*="/followers/"] span.html-span', // Link to followers page with span
            'a[href*="/followers/"] span[title]', // With title showing full count
            'li a[href*="/followers/"] span' // Within list item
        ],
        
        // Following count (from actual HTML: href="/bousher_valley/following/")
        following: [
            'a[href*="/following/"] span.html-span', // Link to following page
            'a[href*="/following/"] span[title]', // With title showing full count
            'li a[href*="/following/"] span' // Within list item
        ],
        
        // Bio/Description (from actual HTML structure)
        bio: [
            'section div div span[dir="auto"]', // Bio text with dir attribute
            'div._ap3a._aaco._aacu._aacy._aad6._aade[dir="auto"]', // Specific bio classes
            'h1._ap3a._aaco._aacu._aacy._aad6._aade[dir="auto"]', // Alternative bio location
            'section span[dir="auto"]:not(:has(a))', // Bio text without links
            'div[style*="line-height"] span[dir="auto"]' // Bio with line-height styling
        ],
        
        // Profile picture (from actual HTML: alt="bousher_valley's profile picture")
        profilePicture: [
            'img[alt*="profile picture"]', // Alt text contains "profile picture"
            'span[role="link"] img', // Profile image within link span
            'canvas + span img', // Image next to canvas element
            'header img[crossorigin="anonymous"]', // Profile image in header
            'img.xpdipgo.x972fbf.x10w94by' // Specific profile image classes
        ],
        
        // Verification badge
        verificationBadge: [
            '[aria-label*="Verified"]',
            '[title*="Verified"]',
            'svg[aria-label*="Verified"]'
        ],
        
        // Private account indicator
        privateIndicator: [
            '[aria-label*="private"]',
            'svg[aria-label*="private"]',
            '[title*="private"]'
        ],
        
        // Category/Business info (from actual HTML: "Construction Company")
        category: [
            'div._ap3a._aaco._aacu._aacy._aad6._aade[dir="auto"]', // Business category
            'section div div div._ap3a._aaco._aacu._aacy._aad6._aade', // Category in bio section
            '[data-testid="business-category"]' // If Instagram adds test IDs
        ],
        
        // External URL/Website
        externalUrl: [
            // New button-based bio link selectors (based on actual HTML structure)
            'button svg[aria-label*="Link icon"] + div[dir="auto"]', // Bio link button text next to link icon
            'button svg[aria-label="Link icon"]', // Bio link buttons with link icon
            'button._aswp._aswq._aswu._asw_._asx2 div[dir="auto"]', // Specific button classes with domain text
            'div._ap3a._aaco._aacw._aacz._aada._aade[dir="auto"]', // Domain text container classes
            
            // Legacy selectors for backward compatibility
            'section a[href^="http"]:not([href*="instagram.com"]):not([href*="meta.com"]):not([href*="facebook.com"])', // External links in profile section only
            'div[dir="auto"] a[href^="http"]:not([href*="instagram.com"]):not([href*="meta.com"]):not([href*="facebook.com"])', // Links in bio text
            'span[dir="auto"] a[href^="http"]:not([href*="instagram.com"]):not([href*="meta.com"]):not([href*="facebook.com"])', // Links in spans with dir attribute
            'section a[target="_blank"]:not([href*="instagram.com"]):not([href*="meta.com"]):not([href*="facebook.com"])', // Links opening in new tab
            '[data-testid="business-website"]' // If Instagram adds test IDs
        ],
        
        // Location (from actual HTML: "Azaiba, Muscat, Oman")
        location: [
            'h1._ap3a._aaco._aacu._aacy._aad6._aade[dir="auto"]', // Location text
            'section div:last-child span[dir="auto"]' // Last element in bio section
        ]
    },
    
    // Media Content
    media: {
        // Post containers (from actual HTML structure)
        posts: [
            'div._ac7v a[href*="/p/"]', // Post links in grid
            'div._ac7v a[href*="/reel/"]', // Reel links in grid
            'a[href*="/p/"][role="link"]', // Post links with role
            'a[href*="/reel/"][role="link"]', // Reel links with role
            'article' // Article containers for individual posts
        ],
        
        // Post grid containers
        postGrid: [
            'div._ac7v', // Main post grid container
            'div.x1lliihq.x1n2onr6.xh8yej3', // Grid item containers
            'div[style*="padding-bottom"]' // Post containers with aspect ratio
        ],
        
        // Images (from actual HTML)
        images: [
            'img[src*="scontent.cdninstagram.com"]', // Instagram CDN images
            'img[src*="instagram.f"]', // Instagram domain images
            'img.x5yr21d.xu96u03', // Specific image classes from HTML
            'div._aagu img', // Images in post containers
            'img[alt]:not([alt*="profile picture"]):not([alt*="story"]):not([alt*="highlight"])', // Images with alt text, excluding profile pics and stories
            'img[crossorigin="anonymous"]:not([alt*="profile picture"])' // Instagram images with crossorigin
        ],
        
        // Videos (from actual HTML)
        videos: [
            'video[src*="scontent.cdninstagram.com"]', // Instagram CDN videos
            'video[src*="instagram.f"]', // Instagram domain videos
            'video[playsinline]', // Videos with playsinline attribute
            'div._aagu video', // Videos in post containers
            'source[src*="scontent"]', // Video source elements
            'video[crossorigin="anonymous"]' // Instagram videos with crossorigin
        ],
        
        // Reels (from actual HTML: href="/bousher_valley/reel/...")
        reels: [
            'a[href*="/reel/"]', // Links to reels
            'div._aagu a[href*="/reel/"]', // Reel links in grid
            'svg[aria-label="Clip"]', // Reel/clip indicators
            'div.html-div svg[aria-label="Clip"]', // More specific reel indicators
            'div._ac7v a[href*="/reel/"]' // Reels in post grid
        ],
        
        // Carousel posts (from actual HTML)
        carousels: [
            'svg[aria-label="Carousel"]', // Carousel indicators
            'div.html-div svg[aria-label="Carousel"]', // More specific carousel indicators
            'a[href*="/p/"] svg[aria-label="Carousel"]' // Carousel posts
        ],
        
        // Media metadata extraction
        postLinks: [
            'a[href*="/p/"]', // Regular post links
            'a[href*="/reel/"]' // Reel links
        ],
        
        // High resolution image patterns
        highResPatterns: [
            'img[src*="scontent.cdninstagram.com"]',
            'img[src*="&stp=dst-jpg_e35"]', // High quality JPEG
            'img[src*="&stp=dst-jpg_e15"]', // Standard quality JPEG
            'img[src*="_n.jpg"]' // Full size images
        ]
    },
    
    // Stories and Highlights (from actual HTML)
    stories: {
        highlights: [
            'div._acaz img[alt*="highlight story picture"]', // Highlight story images
            'img[alt*="highlight story picture"]', // Highlight images
            'div.html-div img[alt*="highlight"]', // Highlight containers
            'canvas + div img' // Images next to canvas (story rings)
        ],
        
        storyRings: [
            'canvas[height="115"][width="115"]', // Story ring canvas elements
            'div.x1upo8f9.xpdipgo canvas', // Canvas with specific classes
            'div[style*="cursor: pointer"] canvas' // Clickable story rings
        ]
    },
    
    // Navigation and UI (from actual HTML)
    navigation: {
        tabs: [
            'div[role="tablist"] a', // Tab navigation
            'a[aria-selected="true"]', // Selected tabs
            'a[href*="/tagged/"]', // Tagged tab
            'a[href*="/reels/"]', // Reels tab
            'svg[viewBox="0 0 24 24"]' // Tab icons
        ],
        
        followButton: [
            'button._aswp._aswr._aswu._asw_._asx2', // Follow button classes
            'div._ap3a._aaco._aacw._aad6._aade' // Follow button text
        ]
    },
    
    // Loading states
    loading: {
        spinners: [
            '[role="progressbar"]', // Loading progress bars
            '.loading', // Loading class
            '[aria-label*="loading"]' // Loading aria labels
        ]
    }
};
}

// Helper functions
if (typeof window.trySelectors === 'undefined') {
window.trySelectors = function(selectors, parent = document) {
    for (const selector of selectors) {
        try {
            const element = parent.querySelector(selector);
            if (element) {
                return element;
            }
        } catch (error) {
            console.warn('Selector failed:', selector, error);
        }
    }
    return null;
};

window.trySelectorAll = function(selectors, parent = document) {
    for (const selector of selectors) {
        try {
            const elements = parent.querySelectorAll(selector);
            if (elements.length > 0) {
                return Array.from(elements);
            }
        } catch (error) {
            console.warn('Selector failed:', selector, error);
        }
    }
    return [];
};

window.extractText = function(element) {
    if (!element) return null;
    
    // Try different text extraction methods
    return element.textContent?.trim() || 
           element.innerText?.trim() || 
           element.getAttribute('aria-label')?.trim() ||
           element.getAttribute('title')?.trim() ||
           null;
};

window.extractUrl = function(element) {
    if (!element) return null;
    
    // Try different URL extraction methods
    return element.src ||
           element.href ||
           element.dataset.src ||
           element.getAttribute('data-src') ||
           window.extractUrlFromStyle(element) ||
           null;
};

window.extractUrlFromStyle = function(element) {
    if (!element || !element.style) return null;
    
    const backgroundImage = element.style.backgroundImage;
    if (backgroundImage && backgroundImage.includes('url(')) {
        const match = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        return match ? match[1] : null;
    }
    
    return null;
};
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        InstagramSelectors: window.InstagramSelectors, 
        trySelectors: window.trySelectors, 
        trySelectorAll: window.trySelectorAll, 
        extractText: window.extractText, 
        extractUrl: window.extractUrl 
    };
}