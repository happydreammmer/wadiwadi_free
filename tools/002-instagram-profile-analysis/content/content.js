 // Wadi Wadi - Instagram Analyzer Content Script

if (typeof window.InstagramContentScript === 'undefined') {
window.InstagramContentScript = class {
    constructor() {
        this.extractor = null;
        this.init();
    }

    init() {
        // Wait for extractor to be available
        if (typeof window.InstagramExtractor !== 'undefined') {
            this.extractor = new window.InstagramExtractor();
            this.setupMessageListener();
            console.log('Wadi Wadi - Instagram Analyzer Content Script initialized');
        } else {
            // Retry after a short delay
            setTimeout(() => this.init(), 100);
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'extractProfile':
                    const profileData = await this.extractProfileData();
                    sendResponse({ success: true, data: profileData });
                    break;

                case 'scanMedia':
                    const mediaItems = await this.scanMediaItems();
                    sendResponse({ success: true, data: mediaItems });
                    break;

                case 'checkPage':
                    const pageInfo = this.checkPageType();
                    sendResponse({ success: true, data: pageInfo });
                    break;

                case 'fetchImageAsDataUrl':
                    const imageDataUrl = await this.fetchImageAsDataUrl(message.imageUrl);
                    sendResponse(imageDataUrl);
                    break;

                case 'extractVideoUrlFromReel':
                    const videoUrlData = await this.extractVideoUrlFromReel(message.reelUrl);
                    sendResponse(videoUrlData);
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action: ' + message.action });
            }
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async extractProfileData() {
        if (!this.extractor) {
            throw new Error('Extractor not initialized');
        }

        // Use the new retry method from extractor
        const result = await this.extractor.extractProfileWithRetry();
        
        if (!result.success) {
            throw new Error(result.error.message || 'Failed to extract profile data');
        }

        return result.data;
    }

    async scanMediaItems() {
        if (!this.extractor) {
            throw new Error('Extractor not initialized');
        }

        // Scroll to load more content if needed
        await this.scrollToLoadContent();

        // Use the new retry method from extractor
        const result = await this.extractor.extractMediaWithRetry();
        
        if (!result.success) {
            throw new Error(result.error.message || 'Failed to extract media items');
        }

        // Process and enhance media items
        return result.data.map((item, index) => ({
            ...item,
            id: `media_${index}`,
            index: index,
            extractedAt: new Date().toISOString()
        }));
    }

    checkPageType() {
        const url = window.location.href;
        const pathname = window.location.pathname;

        // Use extractor's profile detection if available
        const isProfile = this.extractor ? 
            this.extractor.isInstagramProfilePage() : 
            this.isProfilePage(pathname);

        return {
            isInstagram: url.includes('instagram.com'),
            isProfile: isProfile,
            isPost: pathname.includes('/p/'),
            isReel: pathname.includes('/reel/'),
            isStory: pathname.includes('/stories/'),
            url: url,
            pathname: pathname,
            hasProfileElements: this.extractor ? this.extractor.hasProfilePageElements() : false
        };
    }

    isProfilePage(pathname) {
        // Profile page patterns: /username/ or /username
        const profilePattern = /^\/([^\/]+)\/?$/;
        return profilePattern.test(pathname) && 
               !pathname.includes('/p/') && 
               !pathname.includes('/reel/') &&
               !pathname.includes('/tv/') &&
               !pathname.includes('/stories/');
    }

    async waitForPageLoad(maxWait = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            // Check if basic profile elements are loaded
            if (document.querySelector('h2') && 
                (document.querySelector('[href*="/followers/"]') || 
                 document.querySelector('[href*="/following/"]'))) {
                return;
            }
            
            await this.sleep(100);
        }
    }

    async scrollToLoadContent(maxScrolls = 3) {
        const initialHeight = document.body.scrollHeight;
        let scrollCount = 0;

        while (scrollCount < maxScrolls) {
            // Scroll to bottom
            window.scrollTo(0, document.body.scrollHeight);
            
            // Wait for content to load
            await this.sleep(1000);
            
            // Check if new content was loaded
            const newHeight = document.body.scrollHeight;
            if (newHeight === initialHeight) {
                break; // No new content loaded
            }
            
            scrollCount++;
        }

        // Scroll back to top
        window.scrollTo(0, 0);
        await this.sleep(500);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility method to safely query elements
    safeQuerySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn('Selector error:', selector, error);
            return null;
        }
    }

    // Utility method to safely query multiple elements
    safeQuerySelectorAll(selector, parent = document) {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch (error) {
            console.warn('Selector error:', selector, error);
            return [];
        }
    }

    // Debug method to log current page state
    debugPageState() {
        console.log('Wadi Wadi - Instagram Analyzer Content Script Debug:', {
            url: window.location.href,
            pathname: window.location.pathname,
            title: document.title,
            readyState: document.readyState,
            hasH2: !!document.querySelector('h2'),
            hasFollowersLink: !!document.querySelector('[href*="/followers/"]'),
            hasFollowingLink: !!document.querySelector('[href*="/following/"]'),
            profilePictures: document.querySelectorAll('img[alt*="profile picture"]').length,
            mediaItems: document.querySelectorAll('img').length
        });
    }

    // Fetch image and convert to data URL
    async fetchImageAsDataUrl(imageUrl) {
        try {
            // Use fetch to get the image blob with proper headers
            const response = await fetch(imageUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': navigator.userAgent,
                    'Accept': 'image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Referer': window.location.href,
                    'Origin': window.location.origin
                },
                mode: 'cors',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            
            // Convert blob to data URL
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({ success: true, data: reader.result });
                };
                reader.onerror = () => {
                    resolve({ success: false, error: 'Failed to convert image to data URL' });
                };
                reader.readAsDataURL(blob);
            });

        } catch (error) {
            console.error('Error fetching image:', error);
            return { success: false, error: error.message };
        }
    }

    // Extract video URL from reel page
    async extractVideoUrlFromReel(reelUrl) {
        try {
            console.log('Extracting video URL from reel:', reelUrl);
            
            // Try different URL formats to get the full page instead of modal
            const urlsToTry = [];
            
            // Original URL
            urlsToTry.push(reelUrl);
            
            // Add embed version which often contains more data
            if (reelUrl.includes('/reel/')) {
                const reelId = reelUrl.split('/reel/')[1].split('/')[0];
                urlsToTry.push(`${reelUrl}embed/`);
                urlsToTry.push(`https://www.instagram.com/p/${reelId}/`);
                // Add direct access without query params
                urlsToTry.push(`https://www.instagram.com/reel/${reelId}/`);
            }
            
            // Try to get desktop version with data
            urlsToTry.push(reelUrl + '?__a=1');
            urlsToTry.push(reelUrl + '?__a=1&__d=dis');
            
            let lastError = null;
            
            for (const url of urlsToTry) {
                try {
                    console.log('Trying URL:', url);
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5',
                            'Accept-Encoding': 'gzip, deflate',
                            'Referer': 'https://www.instagram.com/',
                            'Origin': 'https://www.instagram.com',
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        },
                        mode: 'cors',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        console.log(`Failed to fetch ${url}: ${response.status}`);
                        continue;
                    }

                    const html = await response.text();
                    
                    // Check if this looks like modal HTML (very short or missing key elements)
                    if (html.length < 10000 || !html.includes('<script')) {
                        console.log(`URL ${url} returned modal/minimal HTML, trying next...`);
                        continue;
                    }
                    
                    // Extract video URL from the page HTML
                    const videoUrl = this.extractVideoUrlFromHTML(html);
                    
                    if (videoUrl) {
                        console.log('Successfully extracted video URL:', videoUrl);
                        return { success: true, data: videoUrl };
                    } else {
                        console.log(`No video URL found in ${url}, trying next...`);
                    }
                    
                } catch (error) {
                    console.log(`Error fetching ${url}:`, error);
                    lastError = error;
                    continue;
                }
            }
            
            // If we still haven't found a video URL, try a different approach
            // Sometimes we need to wait for the page to load completely
            if (urlsToTry.length > 0) {
                console.log('Attempting secondary extraction method...');
                try {
                    const response = await fetch(reelUrl, {
                        method: 'GET',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                            'Accept': '*/*'
                        }
                    });
                    
                    if (response.ok) {
                        const html = await response.text();
                        const videoUrl = this.extractVideoUrlFromHTML(html);
                        if (videoUrl) {
                            console.log('Successfully extracted video URL with secondary method:', videoUrl);
                            return { success: true, data: videoUrl };
                        }
                    }
                } catch (error) {
                    console.log('Secondary extraction method failed:', error);
                }
            }
            
            return { success: false, error: 'Could not find video URL in any of the attempted URLs. The reel may be private, require login, or Instagram may have changed their structure.' };

        } catch (error) {
            console.error('Error extracting video URL from reel:', error);
            return { success: false, error: error.message };
        }
    }

    extractVideoUrlFromHTML(html) {
        try {
            console.log('Parsing HTML for video URLs...');
            
            // Method 1: Look for window._sharedData
            const scriptMatches = html.match(/<script[^>]*>window\._sharedData\s*=\s*({.+?})\s*;<\/script>/);
            if (scriptMatches) {
                console.log('Found window._sharedData');
                try {
                    const sharedData = JSON.parse(scriptMatches[1]);
                    const videoUrl = this.findVideoUrlInData(sharedData);
                    if (videoUrl) return videoUrl;
                } catch (e) {
                    console.log('Error parsing _sharedData:', e);
                }
            }

            // Method 2: Look for application/json script tags
            const additionalDataMatches = html.match(/<script[^>]*type="application\/json"[^>]*>({.+?})<\/script>/g);
            if (additionalDataMatches) {
                console.log(`Found ${additionalDataMatches.length} JSON script tags`);
                for (const match of additionalDataMatches) {
                    const jsonMatch = match.match(/>({.+?})</);
                    if (jsonMatch) {
                        try {
                            const data = JSON.parse(jsonMatch[1]);
                            const videoUrl = this.findVideoUrlInData(data);
                            if (videoUrl) return videoUrl;
                        } catch (e) {
                            // Continue to next match
                        }
                    }
                }
            }

            // Method 3: Look for other script tags with JSON data
            const allScriptMatches = html.match(/<script[^>]*>([^<]+)<\/script>/g);
            if (allScriptMatches) {
                console.log(`Found ${allScriptMatches.length} script tags to check`);
                for (const match of allScriptMatches) {
                    const scriptContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                    
                    // Look for JSON objects in script content
                    const jsonMatches = scriptContent.match(/({.+?})/g);
                    if (jsonMatches) {
                        for (const jsonMatch of jsonMatches) {
                            try {
                                const data = JSON.parse(jsonMatch);
                                const videoUrl = this.findVideoUrlInData(data);
                                if (videoUrl) return videoUrl;
                            } catch (e) {
                                // Continue to next match
                            }
                        }
                    }
                }
            }

            // Method 4: Look for direct video URLs in the HTML (enhanced patterns)
            const videoMatches = html.match(/https:\/\/[^"'\s]*\.mp4[^"'\s]*/g);
            if (videoMatches && videoMatches.length > 0) {
                console.log(`Found ${videoMatches.length} direct video URLs`);
                // Return the first valid video URL found, prioritizing Instagram CDN
                for (const url of videoMatches) {
                    if (url.includes('scontent.cdninstagram.com') || url.includes('instagram.com') || url.includes('fbcdn')) {
                        return url;
                    }
                }
                return videoMatches[0];
            }

            // Method 4b: Look for video URLs with different patterns
            const enhancedVideoMatches = html.match(/https:\/\/scontent[^"'\s]*\.mp4[^"'\s]*/g);
            if (enhancedVideoMatches && enhancedVideoMatches.length > 0) {
                console.log(`Found ${enhancedVideoMatches.length} enhanced video URLs`);
                return enhancedVideoMatches[0];
            }

            // Method 4c: Look for video URLs in specific Instagram patterns
            const igVideoMatches = html.match(/"video_url":"([^"]*\.mp4[^"]*)"/g);
            if (igVideoMatches && igVideoMatches.length > 0) {
                console.log(`Found ${igVideoMatches.length} Instagram-specific video URLs`);
                const url = igVideoMatches[0].match(/"video_url":"([^"]*)"/)[1];
                if (url) {
                    return url.replace(/\\u0026/g, '&').replace(/\\/g, '');
                }
            }

            // Method 5: Look for video URLs in data attributes
            const dataVideoMatches = html.match(/data-[^=]*=["']([^"']*\.mp4[^"']*)/g);
            if (dataVideoMatches && dataVideoMatches.length > 0) {
                console.log(`Found ${dataVideoMatches.length} data attribute video URLs`);
                for (const match of dataVideoMatches) {
                    const urlMatch = match.match(/=["']([^"']+)/);
                    if (urlMatch) return urlMatch[1];
                }
            }

            // Method 6: Look for video element src attributes (Selenium-like approach)
            const videoElementMatches = html.match(/<video[^>]*src=["']([^"']*\.mp4[^"']*)/gi);
            if (videoElementMatches && videoElementMatches.length > 0) {
                console.log(`Found ${videoElementMatches.length} video element src URLs`);
                for (const match of videoElementMatches) {
                    const srcMatch = match.match(/src=["']([^"']+)/i);
                    if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith('blob:')) {
                        return srcMatch[1];
                    }
                }
            }

            // Method 7: Look for Instagram-specific GraphQL patterns
            const graphqlMatches = html.match(/"video_resources":\s*\[([^\]]+)\]/g);
            if (graphqlMatches && graphqlMatches.length > 0) {
                console.log(`Found ${graphqlMatches.length} GraphQL video resources`);
                try {
                    const resourcesStr = graphqlMatches[0].match(/"video_resources":\s*\[([^\]]+)\]/)[1];
                    const videoResources = JSON.parse(`[${resourcesStr}]`);
                    if (videoResources && videoResources.length > 0) {
                        // Find the highest quality video
                        const sortedResources = videoResources.sort((a, b) => (b.config_width || 0) - (a.config_width || 0));
                        if (sortedResources[0] && sortedResources[0].src) {
                            return sortedResources[0].src;
                        }
                    }
                } catch (e) {
                    console.log('Error parsing GraphQL video resources:', e);
                }
            }

            console.log('No video URLs found in HTML');
            return null;
        } catch (error) {
            console.error('Error parsing HTML for video URL:', error);
            return null;
        }
    }

    findVideoUrlInData(data) {
        try {
            // Recursively search for video URLs in the data object
            if (typeof data === 'string') {
                // Check for various video URL patterns
                if (data.includes('.mp4') && 
                    (data.includes('scontent') || 
                     data.includes('cdninstagram') || 
                     data.includes('fbcdn') ||
                     data.includes('instagram') ||
                     data.startsWith('https://'))) {
                    console.log('Found video URL:', data);
                    return data;
                }
                return null;
            }

            if (Array.isArray(data)) {
                for (const item of data) {
                    const result = this.findVideoUrlInData(item);
                    if (result) return result;
                }
                return null;
            }

            if (typeof data === 'object' && data !== null) {
                // Look for common video URL properties (expanded list)
                const videoProps = [
                    'video_url', 'src', 'url', 'video_versions', 'playback_url',
                    'video_src', 'videoUrl', 'video', 'mp4', 'dash_manifest',
                    'video_dash_manifest', 'video_url_original', 'video_url_hd',
                    'additional_candidates', 'fallback_video_versions', 'download_url',
                    'progressive_download_url', 'cdn_url', 'cdn_url_orig', 'video_resources'
                ];
                
                for (const prop of videoProps) {
                    if (data[prop]) {
                        const result = this.findVideoUrlInData(data[prop]);
                        if (result) return result;
                    }
                }

                // Special handling for Instagram's nested structures
                if (data.media || data.items || data.data) {
                    const result = this.findVideoUrlInData(data.media || data.items || data.data);
                    if (result) return result;
                }

                // Look for edge or node patterns (GraphQL structure)
                if (data.edge_sidecar_to_children || data.edges) {
                    const result = this.findVideoUrlInData(data.edge_sidecar_to_children || data.edges);
                    if (result) return result;
                }

                if (data.node) {
                    const result = this.findVideoUrlInData(data.node);
                    if (result) return result;
                }

                // Recursively search all properties
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const result = this.findVideoUrlInData(data[key]);
                        if (result) return result;
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Error searching for video URL in data:', error);
            return null;
        }
    }
};
}

// Initialize content script when DOM is ready (only if not already initialized)
if (typeof window.instagramContentScriptInstance === 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.instagramContentScriptInstance = new window.InstagramContentScript();
        });
    } else {
        window.instagramContentScriptInstance = new window.InstagramContentScript();
    }
}