 // Wadi Wadi - Instagram Analyzer Helper Functions

if (typeof window.InstagramHelpers === 'undefined') {
window.InstagramHelpers = {
    
    // Text processing helpers
    text: {
        // Clean and normalize text content
        clean(text) {
            if (!text) return '';
            return text.trim()
                      .replace(/\s+/g, ' ')
                      .replace(/\n+/g, '\n')
                      .trim();
        },
        
        // Extract numbers from text (e.g., "1,234 followers" -> 1234)
        extractNumber(text) {
            if (!text) return null;
            
            // Remove commas and extract numbers
            const match = text.replace(/,/g, '').match(/(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        },
        
        // Format large numbers (e.g., 1234 -> "1.2K")
        formatNumber(num) {
            if (!num || isNaN(num)) return '0';
            
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        },
        
        // Sanitize text for filename use
        sanitizeForFilename(text) {
            if (!text) return 'untitled';
            
            return text.replace(/[<>:"/\\|?*]/g, '_')
                      .replace(/\s+/g, '_')
                      .substring(0, 50)
                      .toLowerCase();
        }
    },
    
    // URL processing helpers
    url: {
        // Check if URL is an Instagram URL
        isInstagramUrl(url) {
            if (!url) return false;
            return url.includes('instagram.com') || url.includes('cdninstagram.com');
        },
        
        // Extract username from Instagram profile URL
        extractUsername(url) {
            if (!url) return null;
            
            const match = url.match(/instagram\.com\/([^\/\?]+)/);
            return match ? match[1] : null;
        },
        
        // Convert Instagram image URL to higher resolution
        getHighResUrl(url) {
            if (!url) return null;
            
            // Try to get higher resolution by modifying URL parameters
            return url.replace(/s\d+x\d+/, 's1080x1080')
                     .replace(/c\d+\.\d+\.\d+\.\d+/, 'c0.0.1080.1080');
        },
        
        // Check if URL points to a video
        isVideoUrl(url) {
            if (!url) return false;
            return url.includes('.mp4') || 
                   url.includes('.mov') || 
                   url.includes('.avi') ||
                   url.includes('video');
        },
        
        // Extract file extension from URL
        getFileExtension(url) {
            if (!url) return 'jpg';
            
            const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
            return match ? match[1].toLowerCase() : 'jpg';
        }
    },
    
    // DOM manipulation helpers
    dom: {
        // Wait for element to appear in DOM
        waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }
                
                const observer = new MutationObserver((mutations, obs) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element not found: ${selector}`));
                }, timeout);
            });
        },
        
        // Check if element is visible
        isVisible(element) {
            if (!element) return false;
            
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && 
                   rect.height > 0 && 
                   rect.top >= 0 && 
                   rect.left >= 0;
        },
        
        // Scroll element into view
        scrollIntoView(element, behavior = 'smooth') {
            if (!element) return;
            
            element.scrollIntoView({
                behavior: behavior,
                block: 'center',
                inline: 'center'
            });
        },
        
        // Get all text content from element and children
        getAllText(element) {
            if (!element) return '';
            
            return element.textContent || element.innerText || '';
        }
    },
    
    // Validation helpers
    validate: {
        // Check if string is a valid Instagram username
        username(username) {
            if (!username) return false;
            return /^[a-zA-Z0-9._]{1,30}$/.test(username);
        },
        
        // Check if URL is valid
        url(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        // Check if string contains only digits and common separators
        number(str) {
            if (!str) return false;
            return /^[\d,.\s]+$/.test(str);
        }
    },
    
    // Timing helpers
    timing: {
        // Sleep/delay function
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        // Debounce function calls
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function calls
        throttle(func, limit) {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    },
    
    // Storage helpers (for Chrome extension storage)
    storage: {
        // Get data from Chrome storage
        async get(key) {
            try {
                const result = await chrome.storage.local.get(key);
                return result[key];
            } catch (error) {
                console.error('Storage get error:', error);
                return null;
            }
        },
        
        // Set data in Chrome storage
        async set(key, value) {
            try {
                await chrome.storage.local.set({ [key]: value });
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },
        
        // Remove data from Chrome storage
        async remove(key) {
            try {
                await chrome.storage.local.remove(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        }
    },
    
    // Error handling helpers
    error: {
        // Create standardized error response
        createResponse(success, data = null, error = null) {
            return {
                success: success,
                data: data,
                error: error,
                timestamp: new Date().toISOString()
            };
        },
        
        // Log error with context
        log(error, context = '') {
            console.error(`Wadi Wadi - Instagram Analyzer Error ${context}:`, error);
            
            // Could also send to analytics or error reporting service
            return {
                message: error.message || 'Unknown error',
                context: context,
                timestamp: new Date().toISOString()
            };
        }
    },
    
    // Debug helpers
    debug: {
        // Log with timestamp and context
        log(message, data = null) {
            if (this.isDebugMode()) {
                console.log(`[Wadi Wadi - Instagram Analyzer] ${new Date().toISOString()}: ${message}`, data);
            }
        },
        
        // Check if debug mode is enabled
        isDebugMode() {
            return localStorage.getItem('wadiwadi_instagram_analyzer_debug') === 'true';
        },
        
        // Enable debug mode
        enable() {
                    localStorage.setItem('wadiwadi_instagram_analyzer_debug', 'true');
        console.log('Wadi Wadi - Instagram Analyzer debug mode enabled');
        },
        
        // Disable debug mode
        disable() {
                    localStorage.removeItem('wadiwadi_instagram_analyzer_debug');
        console.log('Wadi Wadi - Instagram Analyzer debug mode disabled');
        }
    }
};
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.InstagramHelpers;
}