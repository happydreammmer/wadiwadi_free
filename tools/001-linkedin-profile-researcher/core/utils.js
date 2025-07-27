// Check if we're on a LinkedIn profile page
function isLinkedInProfilePage() {
    return window.location.href.match(window.WADI_CONFIG.profilePagePattern);
}

// Load external StorageManager
async function loadStorageManager() {
    // Storage is now loaded via manifest, so just return the class
    if (!window.WadiStorageManager) {
        console.error('WadiStorageManager not available - check loading order');
        return null;
    }
    return window.WadiStorageManager;
}

// Load script helper
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(src);
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Format time ago helper
function formatTimeAgo(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'just now';
}

// Format text for HTML display (markdown-like formatting)
function formatTextForHTML(text) {
    if (!text) return '';
    
    // Handle case where text might be an object (like nested JSON response)
    if (typeof text === 'object') {
        if (text.executiveSummary) {
            // Convert nested object to readable format
            let formatted = '';
            Object.keys(text).forEach(key => {
                const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                formatted += `## ${title}\n${text[key]}\n\n`;
            });
            text = formatted;
        } else {
            // Fallback: convert object to JSON string
            text = JSON.stringify(text, null, 2);
        }
    }
    
    // Ensure text is a string
    text = String(text);
    
    return text
        .replace(/\n\n/g, '</p><p style="margin-bottom: 12px;">')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1a1a1a; font-weight: 600;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color: #495057; font-style: italic;">$1</em>')
        .replace(/#{3,}\s*(.*?)(?=\n|$)/g, '<h4 style="color: #0a66c2; font-size: 15px; font-weight: 600; margin: 16px 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid #e9ecef;">$1</h4>')
        .replace(/#{2}\s*(.*?)(?=\n|$)/g, '<h3 style="color: #1a1a1a; font-size: 16px; font-weight: 700; margin: 18px 0 10px 0;">$1</h3>')
        .replace(/#{1}\s*(.*?)(?=\n|$)/g, '<h2 style="color: #1a1a1a; font-size: 18px; font-weight: 700; margin: 20px 0 12px 0;">$1</h2>')
        .replace(/^/, '<p style="margin-bottom: 12px;">')
        .replace(/$/, '</p>');
}

// Export utilities to global scope
window.WadiUtils = {
    isLinkedInProfilePage,
    loadStorageManager,
    loadScript,
    formatTimeAgo,
    formatTextForHTML
};

console.log('🌊 Wadi Wadi utilities loaded');