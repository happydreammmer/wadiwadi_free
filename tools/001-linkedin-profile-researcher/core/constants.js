// Wadi Wadi Brand Colors
window.WADI_COLORS = {
    primary: '#0ea5e9',      // Wadi Blue
    secondary: '#f97316',    // Heritage Orange
    accent: '#fb923c',       // Sunset Coral
    light: '#f0f9ff',        // Sky Light
    dark: '#0c4a6e'          // Deep Sea
};

// Extension Configuration
window.WADI_CONFIG = {
    version: '1.0.0',
    extensionName: 'Wadi Wadi LinkedIn Researcher',
    profilePagePattern: /^https:\/\/www\.linkedin\.com\/in\/[^\/]+\/?$/,
    cacheExpiryDays: 7,
    maxCacheAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

console.log('🌊 Wadi Wadi constants loaded');