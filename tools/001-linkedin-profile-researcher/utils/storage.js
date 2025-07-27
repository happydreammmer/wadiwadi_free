if (!window.WadiStorageManager) {
class WadiStorageManager {
    constructor() {
        this.storagePrefix = 'linkedin_researcher_';
    }

    // Save research results with cache metadata
    async saveResults(profileUrl, data) {
        const key = this.getKey(profileUrl);
        const storageData = {
            ...data,
            timestamp: Date.now(),
            profileUrl,
            cacheVersion: '1.0',
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
            accessCount: 1,
            lastAccessed: Date.now()
        };

        try {
            await chrome.storage.local.set({ [key]: storageData });
            console.log('Research results saved for:', profileUrl);
            
            // Update cache index
            await this.updateCacheIndex(profileUrl, storageData);
        } catch (error) {
            console.error('Failed to save results:', error);
            throw error;
        }
    }

    // Load research results with cache validation
    async loadResults(profileUrl, skipExpiredCheck = false) {
        const key = this.getKey(profileUrl);
        
        try {
            const result = await chrome.storage.local.get([key]);
            const cachedData = result[key];
            
            if (!cachedData) {
                return null;
            }

            // Check if cache is expired
            if (!skipExpiredCheck && cachedData.expiresAt && Date.now() > cachedData.expiresAt) {
                console.log('Cache expired for:', profileUrl);
                await this.deleteResults(profileUrl);
                return null;
            }

            // Update access metadata
            cachedData.accessCount = (cachedData.accessCount || 0) + 1;
            cachedData.lastAccessed = Date.now();
            
            // Save updated metadata
            await chrome.storage.local.set({ [key]: cachedData });
            
            console.log('Cache hit for:', profileUrl, 'Access count:', cachedData.accessCount);
            return cachedData;
        } catch (error) {
            console.error('Failed to load results:', error);
            return null;
        }
    }

    // Save API key securely
    async saveApiKey(apiKey) {
        try {
            await chrome.storage.local.set({ 
                [this.storagePrefix + 'api_key']: apiKey 
            });
            console.log('API key saved');
        } catch (error) {
            console.error('Failed to save API key:', error);
            throw error;
        }
    }

    // Load API key
    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get([this.storagePrefix + 'api_key']);
            return result[this.storagePrefix + 'api_key'] || null;
        } catch (error) {
            console.error('Failed to load API key:', error);
            return null;
        }
    }

    // Clear API key
    async clearApiKey() {
        try {
            await chrome.storage.local.remove([this.storagePrefix + 'api_key']);
            console.log('API key cleared');
        } catch (error) {
            console.error('Failed to clear API key:', error);
            throw error;
        }
    }

    // Get all saved results
    async getAllResults() {
        try {
            const allData = await chrome.storage.local.get(null);
            const results = {};
            
            for (const [key, value] of Object.entries(allData)) {
                if (key.startsWith(this.storagePrefix + 'result_')) {
                    const profileUrl = key.replace(this.storagePrefix + 'result_', '');
                    results[profileUrl] = value;
                }
            }
            
            return results;
        } catch (error) {
            console.error('Failed to load all results:', error);
            return {};
        }
    }

    // Delete specific results
    async deleteResults(profileUrl) {
        const key = this.getKey(profileUrl);
        
        try {
            await chrome.storage.local.remove([key]);
            console.log('Results deleted for:', profileUrl);
        } catch (error) {
            console.error('Failed to delete results:', error);
            throw error;
        }
    }

    // Clear all data
    async clearAllData() {
        try {
            const allData = await chrome.storage.local.get(null);
            const keysToRemove = Object.keys(allData).filter(key => 
                key.startsWith(this.storagePrefix)
            );
            
            if (keysToRemove.length > 0) {
                await chrome.storage.local.remove(keysToRemove);
                console.log('All extension data cleared');
            }
        } catch (error) {
            console.error('Failed to clear all data:', error);
            throw error;
        }
    }

    // Check if results exist for a profile
    async hasResults(profileUrl) {
        const results = await this.loadResults(profileUrl);
        return results !== null;
    }

    // Get storage usage
    async getStorageUsage() {
        try {
            const usage = await chrome.storage.local.getBytesInUse();
            return {
                used: usage,
                available: chrome.storage.local.QUOTA_BYTES - usage,
                usedMB: (usage / (1024 * 1024)).toFixed(2),
                availableMB: ((chrome.storage.local.QUOTA_BYTES - usage) / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Failed to get storage usage:', error);
            return null;
        }
    }

    // Generate storage key for profile
    getKey(profileUrl) {
        // Clean the URL to create a consistent key
        const cleanUrl = profileUrl.replace(/[^a-zA-Z0-9]/g, '_');
        return this.storagePrefix + 'result_' + cleanUrl;
    }

    // Save user preferences
    async savePreferences(prefs) {
        try {
            await chrome.storage.local.set({ 
                [this.storagePrefix + 'preferences']: prefs 
            });
            console.log('Preferences saved');
        } catch (error) {
            console.error('Failed to save preferences:', error);
            throw error;
        }
    }

    // Load user preferences
    async loadPreferences() {
        try {
            const result = await chrome.storage.local.get([this.storagePrefix + 'preferences']);
            return result[this.storagePrefix + 'preferences'] || {
                autoSave: true,
                showNotifications: true,
                defaultLanguage: 'en'
            };
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return {
                autoSave: true,
                showNotifications: true,
                defaultLanguage: 'en'
            };
        }
    }

    // Cache management methods
    async updateCacheIndex(profileUrl, data) {
        try {
            const indexKey = this.storagePrefix + 'cache_index';
            const result = await chrome.storage.local.get([indexKey]);
            const index = result[indexKey] || {};
            
            index[profileUrl] = {
                timestamp: data.timestamp,
                expiresAt: data.expiresAt,
                size: JSON.stringify(data).length,
                lastAccessed: data.lastAccessed
            };
            
            await chrome.storage.local.set({ [indexKey]: index });
        } catch (error) {
            console.error('Failed to update cache index:', error);
        }
    }

    async isCacheValid(profileUrl, maxAge = 7 * 24 * 60 * 60 * 1000) {
        try {
            const cached = await this.loadResults(profileUrl, true); // Skip expiry check
            if (!cached) return false;
            
            const age = Date.now() - cached.timestamp;
            return age < maxAge && (!cached.expiresAt || Date.now() < cached.expiresAt);
        } catch (error) {
            console.error('Failed to check cache validity:', error);
            return false;
        }
    }

    async getCacheStats() {
        try {
            const indexKey = this.storagePrefix + 'cache_index';
            const result = await chrome.storage.local.get([indexKey]);
            const index = result[indexKey] || {};
            
            const now = Date.now();
            let totalEntries = 0;
            let validEntries = 0;
            let expiredEntries = 0;
            let totalSize = 0;
            
            for (const [url, info] of Object.entries(index)) {
                totalEntries++;
                totalSize += info.size || 0;
                
                if (info.expiresAt && now > info.expiresAt) {
                    expiredEntries++;
                } else {
                    validEntries++;
                }
            }
            
            return {
                totalEntries,
                validEntries,
                expiredEntries,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Failed to get cache stats:', error);
            return null;
        }
    }

    async cleanExpiredCache() {
        try {
            const indexKey = this.storagePrefix + 'cache_index';
            const result = await chrome.storage.local.get([indexKey]);
            const index = result[indexKey] || {};
            
            const now = Date.now();
            const expiredUrls = [];
            const cleanIndex = {};
            
            for (const [url, info] of Object.entries(index)) {
                if (info.expiresAt && now > info.expiresAt) {
                    expiredUrls.push(url);
                } else {
                    cleanIndex[url] = info;
                }
            }
            
            // Remove expired entries
            for (const url of expiredUrls) {
                await this.deleteResults(url);
            }
            
            // Update clean index
            await chrome.storage.local.set({ [indexKey]: cleanIndex });
            
            console.log(`Cleaned ${expiredUrls.length} expired cache entries`);
            return expiredUrls.length;
        } catch (error) {
            console.error('Failed to clean expired cache:', error);
            return 0;
        }
    }
}

// Export for use in other scripts
try {
    window.WadiStorageManager = WadiStorageManager;
    console.log('WadiStorageManager class exported successfully');
} catch (error) {
    console.error('Failed to export WadiStorageManager:', error);
}
}