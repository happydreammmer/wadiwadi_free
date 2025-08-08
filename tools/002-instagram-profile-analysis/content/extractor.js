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

    isFormattedNumber(text) {
        try {
            if (!text) return false;
            
            // Check if text matches patterns like: 70.4K, 1.2M, 1,234, 5000, etc.
            const patterns = [
                /^\d+\.?\d*[KM]$/i, // 70.4K, 1.2M
                /^\d{1,3}(,\d{3})*$/, // 1,234, 12,345,678
                /^\d+$/ // Plain numbers: 1234, 5000
            ];
            
            return patterns.some(pattern => pattern.test(text.trim()));
        } catch (error) {
            console.error('Formatted number check error:', error);
            return false;
        }
    }

    parseFormattedNumber(text) {
        try {
            if (!text) return null;
            
            const cleanText = text.trim().toUpperCase();
            
            // Handle "K" suffix (thousands)
            if (cleanText.includes('K')) {
                const baseNumber = parseFloat(cleanText.replace(/[^\d.]/g, ''));
                if (!isNaN(baseNumber)) {
                    return Math.round(baseNumber * 1000);
                }
            }
            
            // Handle "M" suffix (millions)
            if (cleanText.includes('M')) {
                const baseNumber = parseFloat(cleanText.replace(/[^\d.]/g, ''));
                if (!isNaN(baseNumber)) {
                    return Math.round(baseNumber * 1000000);
                }
            }
            
            // Handle comma-separated numbers (1,234,567)
            if (cleanText.includes(',')) {
                const number = parseInt(cleanText.replace(/,/g, ''), 10);
                if (!isNaN(number) && number >= 0) {
                    return number;
                }
            }
            
            // Handle plain numbers
            const number = parseInt(cleanText, 10);
            if (!isNaN(number) && number >= 0) {
                return number;
            }
            
            return null;
        } catch (error) {
            console.error('Formatted number parsing error:', error);
            return null;
        }
    }

    extractFollowersCount() {
        try {
            // Updated selectors based on the actual HTML structure
            const followersSelectors = [
                // From the HTML sample: <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs">70.4K</span> followers
                'a[href*="/followers/"] span.html-span', // Main selector for formatted numbers
                'a[href*="/followers/"] span[title]', // With title showing full count
                'li a[href*="/followers/"] span', // Within list item
                'span[title]', // With title attribute
                // Additional selectors for the exact HTML structure
                'a[href*="/followers/"] span.x5n08af', // The span with "70.4K" text
                'span.html-span.xdj266r.x14z9mp' // Specific classes from HTML
            ];
            
            // Method 1: Try to find the formatted number next to "followers" text
            const allSpans = document.querySelectorAll('span');
            for (const span of allSpans) {
                const spanText = span.textContent.trim();
                const parentText = span.parentElement ? span.parentElement.textContent : '';
                const grandParentText = span.parentElement?.parentElement ? span.parentElement.parentElement.textContent : '';
                
                // Check if context contains "followers" and span contains a formatted number
                const contextHasFollowers = parentText.includes('followers') || grandParentText.includes('followers');
                
                if (contextHasFollowers && this.isFormattedNumber(spanText)) {
                    const number = this.parseFormattedNumber(spanText);
                    if (number !== null) {
                        return number;
                    }
                }
            }
            
            // Method 2: Try the specific selectors
            for (const selector of followersSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const text = extractText(element);
                    if (!text) continue;
                    
                    const parentText = element.parentElement ? element.parentElement.textContent : '';
                    const grandParentText = element.parentElement?.parentElement ? element.parentElement.parentElement.textContent : '';
                    
                    const contextHasFollowers = parentText.includes('followers') || grandParentText.includes('followers');
                    
                    if (contextHasFollowers && this.isFormattedNumber(text)) {
                        const number = this.parseFormattedNumber(text);
                        if (number !== null) {
                            return number;
                        }
                    }
                }
            }
            
            // Method 3: Look for pattern like "70.4K followers" in any container
            const allElements = document.querySelectorAll('*');
            for (const element of allElements) {
                const elementText = element.textContent;
                if (elementText.includes('followers')) {
                    // Look for patterns like "70.4K followers" or "1,234 followers"
                    const followersPattern = /([\d,.]+[KM]?)\s+followers/i;
                    const match = elementText.match(followersPattern);
                    if (match) {
                        const number = this.parseFormattedNumber(match[1]);
                        if (number !== null) {
                            return number;
                        }
                    }
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
            // Updated selectors based on the actual HTML structure (similar to followers)
            const followingSelectors = [
                'a[href*="/following/"] span.html-span', // Main selector for formatted numbers
                'a[href*="/following/"] span[title]', // With title showing full count
                'li a[href*="/following/"] span', // Within list item
                'span[title]', // With title attribute
                // Additional selectors for the exact HTML structure
                'a[href*="/following/"] span.x5n08af', // The span with formatted text
                'span.html-span.xdj266r.x14z9mp' // Specific classes from HTML
            ];
            
            // Method 1: Try to find the formatted number next to "following" text
            const allSpans = document.querySelectorAll('span');
            for (const span of allSpans) {
                const spanText = span.textContent.trim();
                const parentText = span.parentElement ? span.parentElement.textContent : '';
                const grandParentText = span.parentElement?.parentElement ? span.parentElement.parentElement.textContent : '';
                
                // Check if context contains "following" and span contains a formatted number
                const contextHasFollowing = parentText.includes('following') || grandParentText.includes('following');
                
                if (contextHasFollowing && this.isFormattedNumber(spanText)) {
                    const number = this.parseFormattedNumber(spanText);
                    if (number !== null) {
                        return number;
                    }
                }
            }
            
            // Method 2: Try the specific selectors
            for (const selector of followingSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const text = extractText(element);
                    if (!text) continue;
                    
                    const parentText = element.parentElement ? element.parentElement.textContent : '';
                    const grandParentText = element.parentElement?.parentElement ? element.parentElement.parentElement.textContent : '';
                    
                    const contextHasFollowing = parentText.includes('following') || grandParentText.includes('following');
                    
                    if (contextHasFollowing && this.isFormattedNumber(text)) {
                        const number = this.parseFormattedNumber(text);
                        if (number !== null) {
                            return number;
                        }
                    }
                }
            }
            
            // Method 3: Look for pattern like "1,234 following" in any container
            const allElements = document.querySelectorAll('*');
            for (const element of allElements) {
                const elementText = element.textContent;
                if (elementText.includes('following')) {
                    // Look for patterns like "1.2K following" or "1,234 following"
                    const followingPattern = /([\d,.]+[KM]?)\s+following/i;
                    const match = elementText.match(followingPattern);
                    if (match) {
                        const number = this.parseFormattedNumber(match[1]);
                        if (number !== null) {
                            return number;
                        }
                    }
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
            // Enhanced profile picture selectors based on the actual HTML structure
            const profilePictureSelectors = [
                // From the HTML sample: <img alt="claudeai's profile picture" class="xpdipgo x972fbf x10w94by x1qhh985 x14e42zd xk390pu x5yr21d xdj266r x14z9mp xat24cr x1lziwak xl1xv1r xexx8yu xyri2b x18d9i69 x1c1uobl x11njtxf xh8yej3" 
                'img[alt*="profile picture"]', // Alt text contains "profile picture"
                'img.xpdipgo.x972fbf.x10w94by.x1qhh985.x14e42zd', // Specific classes from HTML
                'span[role="link"] img', // Profile image within link span
                'canvas + span img', // Image next to canvas element (from HTML: <canvas> followed by <span> with <img>)
                'header img[crossorigin="anonymous"]', // Profile image in header
                'img[src*="fbcdn.net"][alt*="profile"]', // Instagram CDN images with profile alt
                'section span[role="link"] img', // Image in section within span with role="link"
                'header section img', // Any image in header section
                'img[draggable="false"][crossorigin="anonymous"]' // From HTML sample attributes
            ];
            
            // Method 1: Try to find profile picture using specific patterns from HTML
            const allImages = document.querySelectorAll('img');
            for (const img of allImages) {
                const alt = img.alt || '';
                const src = img.src || '';
                
                // Check for profile picture indicators
                if (alt.includes('profile picture') || alt.includes('\'s profile picture')) {
                    const url = extractUrl(img);
                    if (url && this.helpers.validate.url(url)) {
                        // Additional validation for profile picture URLs
                        if ((url.includes('fbcdn.net') || url.includes('cdninstagram') || url.includes('instagram')) && 
                            !url.includes('static.cdninstagram.com')) {
                            return this.getHighResolutionUrl(url);
                        }
                    }
                }
            }
            
            // Method 2: Try the specific selectors
            for (const selector of profilePictureSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const url = extractUrl(element);
                    const alt = element.alt || '';
                    
                    if (url && this.helpers.validate.url(url)) {
                        // Additional validation for profile picture URLs
                        const isProfileUrl = (url.includes('fbcdn.net') || url.includes('cdninstagram') || url.includes('instagram')) && 
                                           !url.includes('static.cdninstagram.com');
                        const hasProfileAlt = alt.includes('profile picture') || alt.includes('\'s profile picture');
                        
                        if (isProfileUrl && (hasProfileAlt || selector.includes('canvas + span img'))) {
                            return this.getHighResolutionUrl(url);
                        }
                    }
                }
            }
            
            // Method 3: Look for images in header section that might be profile pictures
            const headerSection = document.querySelector('header, section');
            if (headerSection) {
                const headerImages = headerSection.querySelectorAll('img[src*="fbcdn.net"], img[src*="cdninstagram"], img[src*="instagram"]');
                for (const img of headerImages) {
                    const url = extractUrl(img);
                    if (url && this.helpers.validate.url(url) && !url.includes('static.cdninstagram.com')) {
                        // Check if this looks like a profile picture (square dimensions, reasonable size)
                        const width = img.naturalWidth || img.width || 0;
                        const height = img.naturalHeight || img.height || 0;
                        
                        if (width >= 100 && height >= 100 && Math.abs(width - height) < 50) {
                            return this.getHighResolutionUrl(url);
                        }
                    }
                }
            }
            
            // Fallback: use the original selector approach
            const element = trySelectors(this.selectors.profile.profilePicture);
            if (element) {
                const url = extractUrl(element);
                if (url && this.helpers.validate.url(url)) {
                    return this.getHighResolutionUrl(url);
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
                        
                        // Check if this is part of an album/carousel
                        const albumData = this.checkIfPartOfAlbum(element);
                        
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
                            isAlbum: albumData.isAlbum,
                            albumIndex: albumData.albumIndex,
                            albumTotal: albumData.albumTotal,
                            filename: this.generateMediaFilename(url, postData, 'image', albumData.albumIndex)
                        });
                    }
                }
            }
            
            // Additionally, extract album posts that might need special handling
            const albumImages = this.extractAlbumImages();
            images.push(...albumImages);
            
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

    checkIfPartOfAlbum(element) {
        try {
            // Default response
            const defaultResponse = {
                isAlbum: false,
                albumIndex: null,
                albumTotal: null
            };
            
            // Look for carousel indicators in the parent containers
            let currentElement = element;
            let searchDepth = 0;
            const maxDepth = 8;
            
            while (currentElement && searchDepth < maxDepth) {
                // Check for carousel SVG icon
                const carouselSvg = currentElement.querySelector('svg[aria-label="Carousel"]');
                if (carouselSvg) {
                    return {
                        isAlbum: true,
                        albumIndex: this.getAlbumIndex(element),
                        albumTotal: null // We'll try to detect this when opening the album
                    };
                }
                
                // Check for carousel-related classes or structures
                if (currentElement.classList) {
                    const classString = currentElement.className;
                    // Look for carousel-related classes
                    if (classString.includes('_aagu') || classString.includes('_aagv')) {
                        // These classes appeared in the album HTML sample
                        const hasCarouselIndicator = currentElement.closest('a[href*="/p/"]');
                        if (hasCarouselIndicator) {
                            const carouselCheck = hasCarouselIndicator.querySelector('svg[aria-label="Carousel"]');
                            if (carouselCheck) {
                                return {
                                    isAlbum: true,
                                    albumIndex: this.getAlbumIndex(element),
                                    albumTotal: null
                                };
                            }
                        }
                    }
                }
                
                currentElement = currentElement.parentElement;
                searchDepth++;
            }
            
            return defaultResponse;
        } catch (error) {
            console.warn('Error checking album status:', error);
            return {
                isAlbum: false,
                albumIndex: null,
                albumTotal: null
            };
        }
    }

    getAlbumIndex(element) {
        try {
            // Try to determine the index of this image in the album
            // Look for carousel list structure
            const carouselList = element.closest('ul._acay');
            if (carouselList) {
                const listItems = carouselList.querySelectorAll('li._acaz');
                for (let i = 0; i < listItems.length; i++) {
                    if (listItems[i].contains(element)) {
                        return i + 1; // 1-based indexing
                    }
                }
            }
            
            // Fallback: try to detect from transform styles
            const listItem = element.closest('li._acaz');
            if (listItem) {
                const transformStyle = listItem.style.transform;
                if (transformStyle && transformStyle.includes('translateX')) {
                    const match = transformStyle.match(/translateX\((\d+)px\)/);
                    if (match) {
                        const translateX = parseInt(match[1]);
                        // Assuming each slide is around 500-600px wide
                        const estimatedIndex = Math.round(translateX / 524) + 1;
                        return estimatedIndex > 0 ? estimatedIndex : 1;
                    }
                }
            }
            
            return 1; // Default to first image
        } catch (error) {
            console.warn('Error getting album index:', error);
            return 1;
        }
    }

    extractAlbumImages() {
        const albumImages = [];
        
        try {
            // Find all posts with carousel indicators
            const carouselPosts = document.querySelectorAll('a[href*="/p/"] svg[aria-label="Carousel"]');
            
            for (const carouselSvg of carouselPosts) {
                const postLink = carouselSvg.closest('a[href*="/p/"]');
                if (postLink) {
                    const postUrl = postLink.href;
                    const postId = this.extractPostIdFromUrl(postUrl);
                    
                    // Find the thumbnail image for this carousel post
                    const thumbnailImg = postLink.querySelector('img');
                    if (thumbnailImg && thumbnailImg.src) {
                        albumImages.push({
                            type: 'album',
                            url: postUrl, // This will need to be opened to get all images
                            thumbnail: thumbnailImg.src,
                            originalUrl: postUrl,
                            alt: thumbnailImg.alt || '',
                            width: thumbnailImg.naturalWidth || thumbnailImg.width,
                            height: thumbnailImg.naturalHeight || thumbnailImg.height,
                            postId: postId,
                            postType: 'album',
                            postUrl: postUrl,
                            isAlbum: true,
                            albumIndex: 1,
                            albumTotal: null,
                            needsExpansion: true, // Flag to indicate this needs to be opened to get all images
                            filename: this.generateMediaFilename(postUrl, { postId, postType: 'album' }, 'album', 1)
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Album extraction error:', error);
        }
        
        return albumImages;
    }

    async extractImagesFromAlbumPage(albumUrl) {
        try {
            // This method would be called when an album post is opened
            // It extracts all images from the carousel on the album page
            const albumImages = [];
            
            // Wait for the album page to load
            await this.helpers.timing.sleep(2000);
            
            // Updated selectors based on the actual HTML samples
            // Try multiple approaches to find the carousel container
            let carouselContainer = null;
            
            // Method 1: Look for the main carousel container
            carouselContainer = document.querySelector('div._aatk._aatl') || 
                              document.querySelector('div[style*="max-height"][style*="max-width"]') ||
                              document.querySelector('ul._acay');
            
            if (!carouselContainer) {
                console.warn('Album carousel container not found, trying alternative approach');
                
                // Method 2: Look for carousel items directly
                const carouselItems = document.querySelectorAll('li._acaz');
                if (carouselItems.length > 0) {
                    // Process items directly
                    return this.processCarouselItems(carouselItems, albumUrl);
                }
                
                // Method 3: Look for images in _aagu containers (from the sample HTML)
                const albumContainers = document.querySelectorAll('div._aagu._aato, div._aagu');
                if (albumContainers.length > 0) {
                    return this.processAlbumContainers(albumContainers, albumUrl);
                }
                
                console.warn('No album content found');
                return [];
            }
            
            // Find all carousel items within the container
            const carouselItems = carouselContainer.querySelectorAll('li._acaz') ||
                                carouselContainer.querySelectorAll('li');
            
            if (carouselItems.length > 0) {
                return this.processCarouselItems(carouselItems, albumUrl);
            }
            
            // If no carousel items found, look for direct image containers
            const imageContainers = carouselContainer.querySelectorAll('div._aagu, div[class*="_aagu"]');
            if (imageContainers.length > 0) {
                return this.processAlbumContainers(imageContainers, albumUrl);
            }
            
            return [];
        } catch (error) {
            console.error('Album page extraction error:', error);
            return [];
        }
    }

    processCarouselItems(carouselItems, albumUrl) {
        const albumImages = [];
        
        for (let i = 0; i < carouselItems.length; i++) {
            const item = carouselItems[i];
            
            // Look for images in this carousel item
            const img = item.querySelector('img');
            if (img && img.src && !img.alt.includes('profile picture')) {
                // Ensure we have a valid Instagram CDN URL, not a blob or page URL
                if (img.src.includes('scontent') || img.src.includes('cdninstagram') || img.src.includes('fbcdn')) {
                    const postId = this.extractPostIdFromUrl(albumUrl);
                    albumImages.push({
                        type: 'image',
                        url: this.getHighResolutionUrl(img.src),
                        thumbnail: img.src,
                        originalUrl: img.src,
                        alt: img.alt || '',
                        width: img.naturalWidth || img.width,
                        height: img.naturalHeight || img.height,
                        postId: postId,
                        postType: 'album',
                        postUrl: albumUrl,
                        isAlbum: true,
                        albumIndex: i + 1,
                        albumTotal: carouselItems.length,
                        filename: this.generateMediaFilename(img.src, { postId, postType: 'album' }, 'image', i + 1)
                    });
                } else {
                    console.warn('Skipping invalid image URL in album:', img.src);
                }
            }
            
            // Look for videos in this carousel item
            const video = item.querySelector('video');
            if (video && video.src && !video.src.startsWith('blob:')) {
                // Only process videos with actual URLs, not blob URLs
                if (video.src.includes('scontent') || video.src.includes('cdninstagram') || video.src.includes('fbcdn')) {
                    const postId = this.extractPostIdFromUrl(albumUrl);
                    albumImages.push({
                        type: 'video',
                        url: video.src,
                        thumbnail: video.poster || img?.src,
                        originalUrl: video.src,
                        duration: video.duration || null,
                        width: video.videoWidth || video.width,
                        height: video.videoHeight || video.height,
                        postId: postId,
                        postType: 'album',
                        postUrl: albumUrl,
                        isAlbum: true,
                        albumIndex: i + 1,
                        albumTotal: carouselItems.length,
                        filename: this.generateMediaFilename(video.src, { postId, postType: 'album' }, 'video', i + 1)
                    });
                } else {
                    console.warn('Skipping blob/invalid video URL in album:', video.src);
                }
            }
        }
        
        console.log('Processed album items:', albumImages.length, albumImages);
        return albumImages;
    }

    processAlbumContainers(containers, albumUrl) {
        const albumImages = [];
        
        for (let i = 0; i < containers.length; i++) {
            const container = containers[i];
            
            // Look for images in this container
            const img = container.querySelector('img');
            if (img && img.src && !img.alt.includes('profile picture')) {
                // Ensure we have a valid Instagram CDN URL
                if (img.src.includes('scontent') || img.src.includes('cdninstagram') || img.src.includes('fbcdn')) {
                    const postId = this.extractPostIdFromUrl(albumUrl);
                    albumImages.push({
                        type: 'image',
                        url: this.getHighResolutionUrl(img.src),
                        thumbnail: img.src,
                        originalUrl: img.src,
                        alt: img.alt || '',
                        width: img.naturalWidth || img.width,
                        height: img.naturalHeight || img.height,
                        postId: postId,
                        postType: 'album',
                        postUrl: albumUrl,
                        isAlbum: true,
                        albumIndex: i + 1,
                        albumTotal: containers.length,
                        filename: this.generateMediaFilename(img.src, { postId, postType: 'album' }, 'image', i + 1)
                    });
                } else {
                    console.warn('Skipping invalid image URL in album container:', img.src);
                }
            }
            
            // Look for videos in this container
            const video = container.querySelector('video');
            if (video && video.src) {
                const postId = this.extractPostIdFromUrl(albumUrl);
                albumImages.push({
                    type: 'video',
                    url: video.src,
                    thumbnail: video.poster || img?.src,
                    originalUrl: video.src,
                    duration: video.duration || null,
                    width: video.videoWidth || video.width,
                    height: video.videoHeight || video.height,
                    postId: postId,
                    postType: 'album',
                    postUrl: albumUrl,
                    isAlbum: true,
                    albumIndex: i + 1,
                    albumTotal: containers.length,
                    filename: this.generateMediaFilename(video.src, { postId, postType: 'album' }, 'video', i + 1)
                });
            }
        }
        
        return albumImages;
    }

    isValidMediaImage(element, url) {
        // Skip profile pictures
        if (element.alt && element.alt.includes('profile picture')) {
            return false;
        }
        
        // Skip messages section images (based on HTML sample structure)
        if (this.isInMessagesSection(element)) {
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

    isInMessagesSection(element) {
        try {
            // Check if the image is within a messages section based on the HTML structure
            // From the HTML sample, messages section has:
            // 1. SVG with aria-label="Messages"
            // 2. Text content "Messages"
            // 3. Specific container classes
            
            let currentElement = element;
            let searchDepth = 0;
            const maxDepth = 10; // Limit search depth to avoid infinite loops
            
            while (currentElement && searchDepth < maxDepth) {
                // Check for Messages SVG icon in the same container
                const messagesSvg = currentElement.querySelector('svg[aria-label="Messages"]');
                if (messagesSvg) {
                    return true;
                }
                
                // Check for "Messages" text in the container
                const hasMessagesText = currentElement.textContent && currentElement.textContent.includes('Messages');
                if (hasMessagesText) {
                    // Additional check: make sure it's not just incidental text
                    // Check if any span in the container contains "Messages" text
                    const spans = currentElement.querySelectorAll('span');
                    let hasMessagesSpan = false;
                    for (const span of spans) {
                        if (span.textContent && span.textContent.includes('Messages')) {
                            hasMessagesSpan = true;
                            break;
                        }
                    }
                    if (hasMessagesSpan || currentElement.textContent.trim() === 'Messages') {
                        return true;
                    }
                }
                
                // Check for specific classes that indicate messages section
                if (currentElement.classList) {
                    const classString = currentElement.className;
                    // Look for button-like containers that might contain Messages
                    if (classString.includes('_aswp') && classString.includes('_aswq') && hasMessagesText) {
                        return true;
                    }
                }
                
                // Check parent element
                currentElement = currentElement.parentElement;
                searchDepth++;
            }
            
            // Additional check: look for messages-related attributes
            let checkElement = element;
            searchDepth = 0;
            while (checkElement && searchDepth < maxDepth) {
                // Check for aria-describedby attributes that might indicate messages
                if (checkElement.getAttribute('aria-describedby')) {
                    const ariaId = checkElement.getAttribute('aria-describedby');
                    if (ariaId && ariaId.includes('_r_')) {
                        // This pattern was in the messages HTML - check if nearby elements have Messages text
                        const nearbyElements = checkElement.parentElement?.querySelectorAll('*');
                        if (nearbyElements) {
                            for (const nearbyElement of nearbyElements) {
                                if (nearbyElement.textContent && nearbyElement.textContent.includes('Messages')) {
                                    return true;
                                }
                            }
                        }
                    }
                }
                
                checkElement = checkElement.parentElement;
                searchDepth++;
            }
            
            return false;
        } catch (error) {
            console.warn('Error checking messages section:', error);
            return false;
        }
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
    generateMediaFilename(url, postData, mediaType, albumIndex = null) {
        try {
            const username = this.extractUsername() || 'instagram_user';
            const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const postId = postData.postId || 'unknown';
            const postType = postData.postType || 'media';
            
            // Get file extension
            const extension = this.getFileExtensionFromUrl(url, mediaType);
            
            // Add album index if provided
            const albumSuffix = albumIndex ? `_${albumIndex}` : '';
            
            // Generate filename: username_postType_postId_timestamp[_albumIndex].ext
            const filename = `${this.sanitizeFilename(username)}_${postType}_${postId}_${timestamp}${albumSuffix}.${extension}`;
            
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
            'span', // Posts count spans
            'a[href*="/followers/"]', // Followers link
            'a[href*="/following/"]' // Following link
        ];

        let foundElements = 0;
        for (const selector of profileIndicators) {
            try {
                const element = document.querySelector(selector);
                if (element) foundElements++;
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

    // Method to detect if current page is an album post
    isAlbumPostPage() {
        try {
            const url = window.location.href;
            // Check if URL matches album post pattern (/p/POST_ID)
            const isPostUrl = /instagram\.com\/p\/[A-Za-z0-9_-]+/.test(url);
            
            if (!isPostUrl) return false;
            
            // Check for carousel indicator
            const carouselIndicator = document.querySelector('svg[aria-label="Carousel"]');
            return !!carouselIndicator;
        } catch (error) {
            console.error('Album post detection error:', error);
            return false;
        }
    }

    // Method to extract current album post images (when viewing an album post)
    async extractCurrentAlbumImages() {
        try {
            if (!this.isAlbumPostPage()) {
                return this.helpers.error.createResponse(false, [], {
                    message: 'Not an album post page'
                });
            }

            const albumUrl = window.location.href;
            const albumImages = await this.extractImagesFromAlbumPage(albumUrl);
            
            return this.helpers.error.createResponse(true, albumImages);
        } catch (error) {
            console.error('Current album extraction error:', error);
            return this.helpers.error.createResponse(false, [], {
                message: 'Failed to extract album images',
                error: error.message
            });
        }
    }

    // Debug method
    debugExtraction() {
        console.log('Wadi Wadi - Instagram Extractor Debug:', {
            url: window.location.href,
            isProfilePage: this.isInstagramProfilePage(),
            isAlbumPost: this.isAlbumPostPage(),
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