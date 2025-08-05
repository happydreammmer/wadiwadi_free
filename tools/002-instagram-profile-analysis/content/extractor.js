// Wadi Wadi - Instagram Data Extractor
// This class handles the extraction of profile data and media from Instagram pages

// Utility functions for DOM element interaction
function trySelectors(selectors) {
    if (!Array.isArray(selectors)) {
        selectors = [selectors];
    }
    
    for (const selector of selectors) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        } catch (error) {
            console.warn('Invalid selector:', selector, error);
        }
    }
    return null;
}

function trySelectorAll(selectors) {
    if (!Array.isArray(selectors)) {
        selectors = [selectors];
    }
    
    for (const selector of selectors) {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                return Array.from(elements);
            }
        } catch (error) {
            console.warn('Invalid selector:', selector, error);
        }
    }
    return [];
}

function extractText(element) {
    if (!element) return null;
    
    // Try different text extraction methods
    const text = element.textContent || element.innerText || element.title || element.alt || '';
    return text.trim();
}

function extractUrl(element) {
    if (!element) return null;
    
    // Try different URL extraction methods
    return element.src || element.href || element.dataset.src || element.dataset.href || null;
}

if (typeof window.InstagramExtractor === 'undefined') {
window.InstagramExtractor = class {
    constructor() {
        this.selectors = window.InstagramSelectors;
        this.helpers = window.InstagramHelpers;
        
        // Cache for extracted data to avoid re-extraction
        this.cache = {
            profile: null,
            media: null,
            lastUpdate: null
        };
    }

    // Profile Data Extraction Methods

    extractUsername() {
        try {
            const element = trySelectors(this.selectors.profile.username);
            if (element) {
                const username = extractText(element);
                if (username && this.helpers.validate.username(username)) {
                    return username;
                }
            }
            
            // Fallback: try to extract from URL
            const urlUsername = this.helpers.url.extractUsername(window.location.href);
            if (urlUsername && this.helpers.validate.username(urlUsername)) {
                return urlUsername;
            }
            
            return null;
        } catch (error) {
            console.error('Username extraction error:', error);
            return null;
        }
    }

    extractPostCount() {
        try {
            // Updated selectors for post count based on actual HTML structure
            const postCountSelectors = [
                // New structure selectors (from provided HTML)
                'span[class*="html-span"][class*="xdj266r"]', // New span structure with xdj266r class
                'span.html-span.xdj266r', // More specific new structure
                'span[class*="html-span"] span[class*="xdj266r"]', // Nested span structure
                
                // Legacy selectors
                'ul li span.html-span:first-child', // The number span before "posts" text
                'section ul li:first-child span.html-span', // First li in stats ul
                'li span.html-span', // Generic span with html-span class
                'span.html-span' // Fallback - look for any span followed by "posts" text
            ];
            
            // Method 1: Look for elements with specific "posts" context - more flexible number matching
            const allSpans = document.querySelectorAll('span');
            for (const span of allSpans) {
                const parentText = span.parentElement ? span.parentElement.textContent : '';
                const grandParentText = span.parentElement?.parentElement ? span.parentElement.parentElement.textContent : '';
                const spanText = span.textContent.trim();
                
                // Check if this span contains a number (with or without commas) and context contains "posts"
                const numberPattern = /^[\d,]+$/; // Allow digits and commas
                const contextHasPosts = parentText.includes('posts') || grandParentText.includes('posts');
                
                if (contextHasPosts && numberPattern.test(spanText)) {
                    const number = this.parseNumberWithCommas(spanText);
                    if (number !== null) {
                        return number;
                    }
                }
            }
            
            // Method 2: Try the selectors approach with improved number parsing
            for (const selector of postCountSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const text = extractText(element);
                    if (!text) continue;
                    
                    const parentText = element.parentElement ? element.parentElement.textContent : '';
                    const grandParentText = element.parentElement?.parentElement ? element.parentElement.parentElement.textContent : '';
                    
                    // More flexible number pattern matching
                    const numberPattern = /^[\d,]+$/;
                    const contextHasPosts = parentText.includes('posts') || grandParentText.includes('posts');
                    
                    if (numberPattern.test(text) && contextHasPosts) {
                        const number = this.parseNumberWithCommas(text);
                        if (number !== null) {
                            return number;
                        }
                    }
                }
            }
            
            // Method 3: More aggressive search - look for any number followed by "posts" in the same container
            const postContainers = document.querySelectorAll('*');
            for (const container of postContainers) {
                const containerText = container.textContent;
                if (containerText.includes('posts')) {
                    // Look for patterns like "25,142 posts" or "549 posts"
                    const postPattern = /([\d,]+)\s+posts/i;
                    const match = containerText.match(postPattern);
                    if (match) {
                        const number = this.parseNumberWithCommas(match[1]);
                        if (number !== null) {
                            return number;
                        }
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Post count extraction error:', error);
            return null;
        }
    }

    parseNumberWithCommas(text) {
        try {
            if (!text) return null;
            
            // Remove commas and parse as integer
            const cleanText = text.replace(/,/g, '');
            const number = parseInt(cleanText, 10);
            
            // Validate the parsed number
            if (isNaN(number) || number < 0) {
                return null;
            }
            
            return number;
        } catch (error) {
            console.error('Number parsing error:', error);
            return null;
        }
    }

    extractFollowersCount() {
        try {
            const element = trySelectors(this.selectors.profile.followers);
            if (element) {
                const text = extractText(element);
                const number = this.helpers.text.extractNumber(text);
                if (number !== null) {
                    return number;
                }
                
                // Handle "K" and "M" suffixes
                if (text.includes('K')) {
                    const baseNumber = parseFloat(text.replace(/[^\d.]/g, ''));
                    return Math.round(baseNumber * 1000);
                } else if (text.includes('M')) {
                    const baseNumber = parseFloat(text.replace(/[^\d.]/g, ''));
                    return Math.round(baseNumber * 1000000);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Followers count extraction error:', error);
            return null;
        }
    }

    extractFollowingCount() {
        try {
            const element = trySelectors(this.selectors.profile.following);
            if (element) {
                const text = extractText(element);
                const number = this.helpers.text.extractNumber(text);
                if (number !== null) {
                    return number;
                }
                
                // Handle "K" and "M" suffixes
                if (text.includes('K')) {
                    const baseNumber = parseFloat(text.replace(/[^\d.]/g, ''));
                    return Math.round(baseNumber * 1000);
                } else if (text.includes('M')) {
                    const baseNumber = parseFloat(text.replace(/[^\d.]/g, ''));
                    return Math.round(baseNumber * 1000000);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Following count extraction error:', error);
            return null;
        }
    }

    extractBio() {
        try {
            // Enhanced bio selectors based on actual HTML structure
            const bioSelectors = [
                // Updated selectors from the actual HTML
                'section div div span[dir="auto"]', // Bio text with dir attribute
                'div._ap3a._aaco._aacu._aacy._aad6._aade[dir="auto"]', // Specific bio classes
                'h1._ap3a._aaco._aacu._aacy._aad6._aade[dir="auto"]', // Alternative bio location
                'section span[dir="auto"]', // Bio text without links
                'div[style*="line-height"] span[dir="auto"]', // Bio with line-height styling
                // Fallback selectors
                'div.-vDIg span',
                '[data-testid="user-bio"]',
                'section div div div span'
            ];
            
            let bioText = '';
            let foundBioParts = [];
            
            // Look for bio elements using selectors
            for (const selector of bioSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const text = extractText(element);
                    if (text && text.length > 5 && 
                        !text.includes('posts') && 
                        !text.includes('followers') && 
                        !text.includes('following') &&
                        !text.match(/^\d+$/)) { // Avoid pure numbers
                        
                        // Check if this looks like bio content
                        const isBioContent = text.length > 10 || 
                                           text.includes('Company') || 
                                           text.includes('Building') ||
                                           text.includes('construction') ||
                                           text.includes('Design') ||
                                           text.includes('✨') ||
                                           text.includes('🔺') ||
                                           text.includes('years');
                        
                        if (isBioContent && !foundBioParts.includes(text)) {
                            foundBioParts.push(text);
                        }
                    }
                }
            }
            
            // Alternative approach: look for common bio patterns in header section
            const headerSection = document.querySelector('header');
            if (headerSection && foundBioParts.length === 0) {
                const spans = headerSection.querySelectorAll('span[dir="auto"]');
                for (const span of spans) {
                    const text = extractText(span);
                    if (text && text.length > 10 && 
                        !text.includes('posts') && 
                        !text.includes('followers') &&
                        !foundBioParts.includes(text)) {
                        foundBioParts.push(text);
                    }
                }
            }
            
            // Combine bio parts into a single bio text
            if (foundBioParts.length > 0) {
                bioText = foundBioParts.join('\n').trim();
                return this.helpers.text.clean(bioText);
            }
            
            return null;
        } catch (error) {
            console.error('Bio extraction error:', error);
            return null;
        }
    }

    extractProfilePicture() {
        try {
            // Enhanced profile picture selectors
            const profilePictureSelectors = [
                'img[alt*="profile picture"]', // Alt text contains "profile picture"
                'span[role="link"] img', // Profile image within link span
                'canvas + span img', // Image next to canvas element
                'header img[crossorigin="anonymous"]', // Profile image in header
                'img.xpdipgo.x972fbf.x10w94by', // Specific profile image classes
                'img[src*="fbcdn.net"][alt*="profile"]', // Instagram CDN images with profile alt
                'header section img', // Any image in header section
                'header img[src*="instagram"]' // Instagram images in header
            ];
            
            // Try each selector
            for (const selector of profilePictureSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const url = extractUrl(element);
                    if (url && this.helpers.validate.url(url)) {
                        // Additional validation for profile picture URLs
                        if (url.includes('fbcdn.net') || url.includes('cdninstagram') || url.includes('instagram')) {
                            return this.helpers.url.getHighResUrl(url);
                        }
                    }
                }
            }
            
            // Fallback: use the original selector approach
            const element = trySelectors(this.selectors.profile.profilePicture);
            if (element) {
                const url = extractUrl(element);
                if (url && this.helpers.validate.url(url)) {
                    return this.helpers.url.getHighResUrl(url);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Profile picture extraction error:', error);
            return null;
        }
    }

    isVerifiedProfile() {
        try {
            const element = trySelectors(this.selectors.profile.verificationBadge);
            return !!element;
        } catch (error) {
            console.error('Verification check error:', error);
            return false;
        }
    }

    isPrivateProfile() {
        try {
            const element = trySelectors(this.selectors.profile.privateIndicator);
            return !!element;
        } catch (error) {
            console.error('Private check error:', error);
            return false;
        }
    }

    extractCategory() {
        try {
            const element = trySelectors(this.selectors.profile.category);
            if (element) {
                const text = extractText(element);
                if (text && !text.includes('posts') && !text.includes('followers')) {
                    return this.helpers.text.clean(text);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Category extraction error:', error);
            return null;
        }
    }

    extractExternalUrl() {
        try {
            // First try the new button-based bio link approach
            const bioLinkResult = this.extractBioLinkFromButton();
            if (bioLinkResult) {
                return bioLinkResult;
            }
            
            // Legacy approach - look for direct links in profile/bio sections
            const profileSections = document.querySelectorAll('header, section');
            
            for (const section of profileSections) {
                // Look for external links in this section only
                const links = section.querySelectorAll('a[href^="http"]');
                
                for (const link of links) {
                    const url = extractUrl(link);
                    if (url) {
                        // Handle Instagram redirect URLs
                        const actualUrl = this.extractUrlFromInstagramRedirect(url);
                        
                        if (actualUrl && 
                            this.helpers.validate.url(actualUrl) && 
                            !actualUrl.includes('instagram.com') && 
                            !actualUrl.includes('meta.com') && 
                            !actualUrl.includes('facebook.com') &&
                            !actualUrl.includes('cdninstagram.com')) {
                            
                            // Additional check: make sure it's in a bio-like context
                            const parentText = link.parentElement ? link.parentElement.textContent : '';
                            const isInBioContext = link.closest('[dir="auto"]') || 
                                                 link.closest('span') || 
                                                 parentText.length < 200; // Not in long footer text
                            
                            if (isInBioContext) {
                                return actualUrl;
                            }
                        }
                        
                        // Fallback: if not a redirect URL, use original logic
                        if (!url.includes('instagram.com') && 
                            !url.includes('meta.com') && 
                            !url.includes('facebook.com') &&
                            !url.includes('cdninstagram.com') &&
                            this.helpers.validate.url(url)) {
                            
                            const parentText = link.parentElement ? link.parentElement.textContent : '';
                            const isInBioContext = link.closest('[dir="auto"]') || 
                                                 link.closest('span') || 
                                                 parentText.length < 200;
                            
                            if (isInBioContext) {
                                return url;
                            }
                        }
                    }
                }
            }
            
            // Fallback to original selector method
            const element = trySelectors(this.selectors.profile.externalUrl);
            if (element) {
                const url = extractUrl(element);
                if (url && this.helpers.validate.url(url) && !this.helpers.url.isInstagramUrl(url)) {
                    return url;
                }
            }
            
            return null;
        } catch (error) {
            console.error('External URL extraction error:', error);
            return null;
        }
    }

    extractBioLinkFromButton() {
        try {
            // Look for bio link sections with link icons (both button and non-button structures)
            const bioLinkIcons = document.querySelectorAll('svg[aria-label*="Link icon"]');
            
            for (const linkIcon of bioLinkIcons) {
                // Method 1: Button-based structure
                const button = linkIcon.closest('button');
                if (button) {
                    // Find the text container within the button
                    const textContainer = button.querySelector('div[dir="auto"]');
                    if (textContainer) {
                        const linkText = extractText(textContainer);
                        if (linkText) {
                            // Extract domain from text like "wadiwadi.net and 1 more" or just "example.com"
                            const domains = this.extractDomainsFromLinkText(linkText);
                            if (domains.length > 0) {
                                // Return the first domain as a proper URL
                                return this.convertDomainToUrl(domains[0]);
                            }
                        }
                    }
                }
                
                // Method 2: Link-based structure (look for nearby <a> elements)
                const parentContainer = linkIcon.closest('div');
                if (parentContainer) {
                    // Look for <a> elements in the same container or nearby siblings
                    const nearbyLink = parentContainer.querySelector('a[href]') || 
                                     parentContainer.nextElementSibling?.querySelector('a[href]') ||
                                     parentContainer.parentElement?.querySelector('a[href]');
                    
                    if (nearbyLink) {
                        const url = extractUrl(nearbyLink);
                        if (url) {
                            // Handle Instagram redirect URLs
                            const actualUrl = this.extractUrlFromInstagramRedirect(url);
                            if (actualUrl && this.helpers.validate.url(actualUrl)) {
                                return actualUrl;
                            }
                        }
                    }
                }
            }
            
            // Alternative approach: look for div elements with domain-like text
            const profileSections = document.querySelectorAll('header, section');
            for (const section of profileSections) {
                const domainContainers = section.querySelectorAll('div._ap3a._aaco._aacw._aacz._aada._aade[dir="auto"]');
                
                for (const container of domainContainers) {
                    const text = extractText(container);
                    if (text && this.looksLikeDomainText(text)) {
                        const domains = this.extractDomainsFromLinkText(text);
                        if (domains.length > 0) {
                            return this.convertDomainToUrl(domains[0]);
                        }
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Bio link button extraction error:', error);
            return null;
        }
    }

    extractDomainsFromLinkText(text) {
        try {
            const domains = [];
            
            // Pattern to match domain names (with optional protocol)
            const domainPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,})/g;
            
            let match;
            while ((match = domainPattern.exec(text)) !== null) {
                const domain = match[1] || match[0];
                if (domain && !domains.includes(domain)) {
                    domains.push(domain);
                }
            }
            
            // Also look for simple domain patterns without full validation
            if (domains.length === 0) {
                const simplePattern = /([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
                while ((match = simplePattern.exec(text)) !== null) {
                    const domain = match[1];
                    if (domain && !domains.includes(domain)) {
                        domains.push(domain);
                    }
                }
            }
            
            return domains;
        } catch (error) {
            console.error('Domain extraction error:', error);
            return [];
        }
    }

    looksLikeDomainText(text) {
        // Check if text looks like it contains domain information
        return text && (
            text.includes('.com') ||
            text.includes('.net') ||
            text.includes('.org') ||
            text.includes('.co') ||
            text.includes('.io') ||
            text.includes(' and ') || // "domain.com and 1 more"
            /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(text) // General domain pattern
        );
    }

    convertDomainToUrl(domain) {
        try {
            // If it already has protocol, return as is
            if (domain.startsWith('http://') || domain.startsWith('https://')) {
                return domain;
            }
            
            // Add https by default for domains
            return `https://${domain}`;
        } catch (error) {
            console.error('URL conversion error:', error);
            return domain;
        }
    }

    extractUrlFromInstagramRedirect(url) {
        try {
            // Check if this is an Instagram redirect URL
            if (!url.includes('l.instagram.com')) {
                return url; // Not a redirect, return original
            }
            
            // Parse the URL to extract the 'u' parameter
            const urlObj = new URL(url);
            const actualUrl = urlObj.searchParams.get('u');
            
            if (actualUrl) {
                // URL decode the actual URL
                return decodeURIComponent(actualUrl);
            }
            
            return url; // Fallback to original if extraction fails
        } catch (error) {
            console.error('Instagram redirect URL extraction error:', error);
            return url; // Fallback to original on error
        }
    }

    // Media Extraction Methods

    extractMediaItems() {
        try {
            const mediaItems = [];
            
            // Extract images
            const images = this.extractImages();
            mediaItems.push(...images);
            
            // Extract videos
            const videos = this.extractVideos();
            mediaItems.push(...videos);
            
            // Remove duplicates based on URL
            const uniqueItems = this.removeDuplicateMedia(mediaItems);
            
            return uniqueItems;
        } catch (error) {
            console.error('Media extraction error:', error);
            return [];
        }
    }

    extractImages() {
        const images = [];
        
        try {
            const imageElements = trySelectorAll(this.selectors.media.images);
            
            for (const element of imageElements) {
                const url = extractUrl(element);
                if (url && this.helpers.validate.url(url) && !this.helpers.url.isVideoUrl(url)) {
                    // Skip profile pictures and very small images
                    if (this.isValidMediaImage(element, url)) {
                        const postData = this.extractPostMetadata(element);
                        images.push({
                            type: 'image',
                            url: this.getHighResolutionUrl(url),
                            thumbnail: url,
                            originalUrl: url,
                            alt: element.alt || '',
                            width: element.naturalWidth || element.width,
                            height: element.naturalHeight || element.height,
                            postId: postData.postId,
                            postType: postData.postType,
                            postUrl: postData.postUrl,
                            filename: this.generateMediaFilename(url, postData, 'image')
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Image extraction error:', error);
        }
        
        return images;
    }

    extractVideos() {
        const videos = [];
        
        try {
            // Extract direct video elements (traditional posts with video)
            const videoElements = trySelectorAll(this.selectors.media.videos);
            
            for (const element of videoElements) {
                const url = extractUrl(element);
                if (url && this.helpers.validate.url(url)) {
                    // Get video thumbnail if available
                    const thumbnail = element.poster || this.findVideoThumbnail(element);
                    const postData = this.extractPostMetadata(element);
                    
                    videos.push({
                        type: 'video',
                        url: url,
                        originalUrl: url,
                        thumbnail: thumbnail,
                        duration: element.duration || null,
                        width: element.videoWidth || element.width,
                        height: element.videoHeight || element.height,
                        postId: postData.postId,
                        postType: postData.postType,
                        postUrl: postData.postUrl,
                        filename: this.generateMediaFilename(url, postData, 'video')
                    });
                }
            }

            // Extract reel videos (requires special handling)
            const reelVideos = this.extractReelVideos();
            videos.push(...reelVideos);
            
        } catch (error) {
            console.error('Video extraction error:', error);
        }
        
        return videos;
    }

    extractReelVideos() {
        const reels = [];
        
        try {
            // Find reel links in the profile grid
            const reelLinks = trySelectorAll(this.selectors.media.reels);
            
            for (const reelLink of reelLinks) {
                const reelUrl = reelLink.href;
                if (reelUrl && reelUrl.includes('/reel/')) {
                    const postId = this.extractPostIdFromUrl(reelUrl);
                    
                    // Find thumbnail image for this reel
                    const thumbnail = this.findReelThumbnail(reelLink);
                    
                    reels.push({
                        type: 'video',
                        url: reelUrl, // This will be the reel page URL initially
                        originalUrl: reelUrl,
                        thumbnail: thumbnail,
                        postId: postId,
                        postType: 'reel',
                        postUrl: reelUrl,
                        isReelPlaceholder: true, // Flag to indicate this needs video URL extraction
                        filename: this.generateMediaFilename(reelUrl, { postId, postType: 'reel' }, 'video')
                    });
                }
            }
        } catch (error) {
            console.error('Reel extraction error:', error);
        }
        
        return reels;
    }

    findReelThumbnail(reelLink) {
        try {
            // Look for thumbnail image near the reel link
            const parent = reelLink.closest('div');
            if (parent) {
                const img = parent.querySelector('img');
                if (img && img.src) {
                    return img.src;
                }
            }
            return null;
        } catch (error) {
            console.warn('Error finding reel thumbnail:', error);
            return null;
        }
    }

    isValidMediaImage(element, url) {
        // Skip profile pictures
        if (element.alt && element.alt.includes('profile picture')) {
            return false;
        }
        
        // Skip very small images (likely icons or UI elements)
        const width = element.naturalWidth || element.width || 0;
        const height = element.naturalHeight || element.height || 0;
        if (width < 100 || height < 100) {
            return false;
        }
        
        // Skip Instagram UI images
        if (url.includes('static.cdninstagram.com') && !url.includes('scontent')) {
            return false;
        }
        
        return true;
    }

    findVideoThumbnail(videoElement) {
        try {
            // Look for nearby img elements that might be thumbnails
            const parent = videoElement.parentElement;
            if (parent) {
                const thumbnail = parent.querySelector('img');
                if (thumbnail) {
                    return extractUrl(thumbnail);
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    removeDuplicateMedia(mediaItems) {
        const seen = new Set();
        return mediaItems.filter(item => {
            const key = item.url;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Extract post metadata from media element
    extractPostMetadata(element) {
        try {
            // Find the closest post link
            let postLink = element.closest('a[href*="/p/"], a[href*="/reel/"]');
            if (!postLink) {
                // Look for post link in parent containers
                let parent = element.parentElement;
                while (parent && !postLink) {
                    postLink = parent.querySelector('a[href*="/p/"], a[href*="/reel/"]');
                    parent = parent.parentElement;
                }
            }

            if (postLink) {
                const href = postLink.href;
                const postId = this.extractPostIdFromUrl(href);
                const postType = href.includes('/reel/') ? 'reel' : 'post';
                
                return {
                    postId: postId,
                    postType: postType,
                    postUrl: href
                };
            }

            return {
                postId: null,
                postType: 'unknown',
                postUrl: null
            };
        } catch (error) {
            console.error('Post metadata extraction error:', error);
            return {
                postId: null,
                postType: 'unknown',
                postUrl: null
            };
        }
    }

    // Extract post ID from Instagram URL
    extractPostIdFromUrl(url) {
        try {
            const postMatch = url.match(/\/p\/([A-Za-z0-9_-]+)/);
            if (postMatch) {
                return postMatch[1];
            }
            
            const reelMatch = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
            if (reelMatch) {
                return reelMatch[1];
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    // Get high resolution URL for images
    getHighResolutionUrl(url) {
        try {
            if (!url || !url.includes('scontent.cdninstagram.com')) {
                return url;
            }

            // Try to get higher resolution by modifying URL parameters
            let highResUrl = url;

            // Remove size restrictions
            highResUrl = highResUrl.replace(/&stp=dst-jpg_s\d+x\d+/g, '&stp=dst-jpg_e35');
            highResUrl = highResUrl.replace(/&stp=dst-jpg_e15/g, '&stp=dst-jpg_e35');
            
            // Try to get original size
            if (highResUrl.includes('_s.jpg')) {
                highResUrl = highResUrl.replace('_s.jpg', '_n.jpg');
            }
            
            return highResUrl;
        } catch (error) {
            console.error('High resolution URL error:', error);
            return url;
        }
    }

    // Generate meaningful filename for media
    generateMediaFilename(url, postData, mediaType) {
        try {
            const username = this.extractUsername() || 'instagram_user';
            const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const postId = postData.postId || 'unknown';
            const postType = postData.postType || 'media';
            
            // Get file extension
            const extension = this.getFileExtensionFromUrl(url, mediaType);
            
            // Generate filename: username_postType_postId_timestamp.ext
            const filename = `${this.sanitizeFilename(username)}_${postType}_${postId}_${timestamp}.${extension}`;
            
            return filename;
        } catch (error) {
            console.error('Filename generation error:', error);
            return `instagram_media_${Date.now()}.jpg`;
        }
    }

    // Get file extension from URL
    getFileExtensionFromUrl(url, mediaType) {
        try {
            if (mediaType === 'video') {
                return 'mp4';
            }
            
            // Try to extract extension from URL
            const match = url.match(/\.([a-z0-9]+)(?:\?|&|$)/i);
            if (match) {
                return match[1].toLowerCase();
            }
            
            // Default based on media type
            return mediaType === 'video' ? 'mp4' : 'jpg';
        } catch (error) {
            return 'jpg';
        }
    }

    // Sanitize filename for filesystem
    sanitizeFilename(filename) {
        return filename
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .substring(0, 50);
    }

    // Utility Methods

    clearCache() {
        this.cache = {
            profile: null,
            media: null,
            lastUpdate: null
        };
    }

    getCachedProfile() {
        if (this.cache.profile && this.isCacheValid()) {
            return this.cache.profile;
        }
        return null;
    }

    setCachedProfile(data) {
        this.cache.profile = data;
        this.cache.lastUpdate = Date.now();
    }

    getCachedMedia() {
        if (this.cache.media && this.isCacheValid()) {
            return this.cache.media;
        }
        return null;
    }

    setCachedMedia(data) {
        this.cache.media = data;
        this.cache.lastUpdate = Date.now();
    }

    isCacheValid(maxAge = 30000) { // 30 seconds
        return this.cache.lastUpdate && (Date.now() - this.cache.lastUpdate) < maxAge;
    }

    // Profile Detection & Error Handling Methods

    isInstagramProfilePage() {
        try {
            // Check if current URL is an Instagram profile
            const url = window.location.href;
            const isProfileUrl = /instagram\.com\/[^\/]+\/?$/.test(url);
            
            if (!isProfileUrl) return false;
            
            // Additional checks for profile page elements
            const hasProfileElements = this.hasProfilePageElements();
            
            return hasProfileElements;
        } catch (error) {
            console.error('Profile page detection error:', error);
            return false;
        }
    }

    hasProfilePageElements() {
        // Check for key profile page elements
        const profileIndicators = [
            'article', // Posts container
            'h2', // Username header
            'img[alt*="profile picture"]', // Profile picture
            'span:contains("posts")', // Posts count
            'a[href*="/followers/"]', // Followers link
            'a[href*="/following/"]' // Following link
        ];

        let foundElements = 0;
        for (const selector of profileIndicators) {
            try {
                if (selector.includes(':contains(')) {
                    // Handle :contains() pseudo-selector manually
                    const elements = document.querySelectorAll('span');
                    for (const element of elements) {
                        if (element.textContent.includes('posts')) {
                            foundElements++;
                            break;
                        }
                    }
                } else {
                    const element = document.querySelector(selector);
                    if (element) foundElements++;
                }
            } catch (error) {
                // Ignore selector errors
            }
        }

        // Need at least 3 profile indicators to be confident
        return foundElements >= 3;
    }

    handleLoadingStates() {
        return new Promise((resolve) => {
            // Wait for Instagram's dynamic content to load
            const maxWaitTime = 10000; // 10 seconds
            const checkInterval = 500; // Check every 500ms
            let waitTime = 0;

            const checkLoaded = () => {
                if (waitTime >= maxWaitTime) {
                    console.warn('Profile loading timeout reached');
                    resolve(false);
                    return;
                }

                // Check if key elements are loaded
                const username = this.extractUsername();
                const hasContent = document.querySelectorAll('article').length > 0 || 
                                 document.querySelector('h2') !== null;

                if (username && hasContent) {
                    resolve(true);
                } else {
                    waitTime += checkInterval;
                    setTimeout(checkLoaded, checkInterval);
                }
            };

            checkLoaded();
        });
    }

    async extractProfileWithRetry(maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Wait for page to load
                await this.handleLoadingStates();

                // Check if it's a valid profile page
                if (!this.isInstagramProfilePage()) {
                    throw new Error('Not a valid Instagram profile page');
                }

                // Extract profile data
                const profileData = {
                    username: this.extractUsername(),
                    postCount: this.extractPostCount(),
                    followersCount: this.extractFollowersCount(),
                    followingCount: this.extractFollowingCount(),
                    bio: this.extractBio(),
                    profilePicture: this.extractProfilePicture(),
                    isVerified: this.isVerifiedProfile(),
                    isPrivate: this.isPrivateProfile(),
                    category: this.extractCategory(),
                    externalUrl: this.extractExternalUrl(),
                    extractedAt: new Date().toISOString(),
                    url: window.location.href
                };

                // Validate that we got essential data
                if (!profileData.username) {
                    throw new Error('Could not extract username');
                }

                // Cache the successful extraction
                this.setCachedProfile(profileData);

                return this.helpers.error.createResponse(true, profileData);

            } catch (error) {
                console.warn(`Profile extraction attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    return this.helpers.error.createResponse(false, null, {
                        message: `Failed to extract profile after ${maxRetries} attempts`,
                        lastError: error.message,
                        isPrivate: this.isPrivateProfile(),
                        isValidPage: this.isInstagramProfilePage()
                    });
                }

                // Wait before retry
                await this.helpers.timing.sleep(1000 * attempt);
            }
        }
    }

    async extractMediaWithRetry(maxRetries = 2) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Check if profile is private
                if (this.isPrivateProfile()) {
                    return this.helpers.error.createResponse(false, [], {
                        message: 'Cannot extract media from private profile',
                        isPrivate: true
                    });
                }

                const mediaItems = this.extractMediaItems();
                
                // Cache the successful extraction
                this.setCachedMedia(mediaItems);

                return this.helpers.error.createResponse(true, mediaItems);

            } catch (error) {
                console.warn(`Media extraction attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    return this.helpers.error.createResponse(false, [], {
                        message: `Failed to extract media after ${maxRetries} attempts`,
                        lastError: error.message
                    });
                }

                await this.helpers.timing.sleep(500 * attempt);
            }
        }
    }

    // Debug method
    debugExtraction() {
        console.log('Wadi Wadi - Instagram Extractor Debug:', {
            url: window.location.href,
            isProfilePage: this.isInstagramProfilePage(),
            hasProfileElements: this.hasProfilePageElements(),
            username: this.extractUsername(),
            posts: this.extractPostCount(),
            followers: this.extractFollowersCount(),
            following: this.extractFollowingCount(),
            bio: this.extractBio(),
            isVerified: this.isVerifiedProfile(),
            isPrivate: this.isPrivateProfile(),
            mediaCount: this.extractMediaItems().length
        });
    }
};
}