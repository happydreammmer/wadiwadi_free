 // Wadi Wadi - Instagram Analyzer Background Script (Service Worker)

class InstagramBackground {
    constructor() {
        this.setupEventListeners();
        console.log('Wadi Wadi - Instagram Analyzer Background Service Worker initialized');
    }

    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Handle messages from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle download progress and completion
        chrome.downloads.onChanged.addListener((downloadDelta) => {
            this.handleDownloadChange(downloadDelta);
        });
    }

    handleInstallation(details) {
        if (details.reason === 'install') {
            console.log('Wadi Wadi - Instagram Analyzer installed');
            // Could open welcome page or set default settings
        } else if (details.reason === 'update') {
            console.log('Wadi Wadi - Instagram Analyzer updated');
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'downloadMedia':
                    const result = await this.downloadMedia(message.items, message.username);
                    sendResponse({ success: true, data: result });
                    break;

                case 'downloadSingleMedia':
                    const singleResult = await this.downloadSingleMedia(message.item, message.username);
                    sendResponse({ success: true, data: singleResult });
                    break;

                case 'getDownloadStatus':
                    const status = await this.getDownloadStatus(message.downloadId);
                    sendResponse({ success: true, data: status });
                    break;

                case 'getBatchStatus':
                    const batchStatus = this.getBatchStatus(message.batchId);
                    sendResponse({ success: true, data: batchStatus });
                    break;

                case 'cancelDownload':
                    await this.cancelDownload(message.downloadId);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action: ' + message.action });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async downloadMedia(items, username = 'instagram_user') {
        if (!items || items.length === 0) {
            throw new Error('No media items to download');
        }

        const downloads = [];
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const batchId = `batch_${Date.now()}`;

        // Store batch information for progress tracking
        this.downloadBatches = this.downloadBatches || {};
        this.downloadBatches[batchId] = {
            total: items.length,
            completed: 0,
            failed: 0,
            started: Date.now()
        };

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            try {
                // Add delay between downloads to avoid overwhelming Instagram's servers
                if (i > 0) {
                    await this.sleep(500);
                }
                
                const downloadId = await this.downloadSingleItem(item, username, timestamp, i);
                downloads.push({
                    id: downloadId,
                    item: item,
                    status: 'started',
                    batchId: batchId
                });
            } catch (error) {
                console.error('Download error for item:', item, error);
                downloads.push({
                    item: item,
                    status: 'failed',
                    error: error.message,
                    batchId: batchId
                });
                this.downloadBatches[batchId].failed++;
            }
        }

        return {
            batchId: batchId,
            total: items.length,
            started: downloads.filter(d => d.status === 'started').length,
            failed: downloads.filter(d => d.status === 'failed').length,
            downloads: downloads
        };
    }

    async downloadSingleItem(item, username, timestamp, index) {
        if (!item.url) {
            throw new Error('No URL provided for download');
        }

        let downloadUrl = item.url;

        // If this is a reel placeholder, extract the actual video URL
        if (item.isReelPlaceholder && item.postType === 'reel') {
            try {
                console.log('Extracting video URL for reel:', item.url);
                const videoUrlResult = await this.extractReelVideoUrl(item.url);
                if (videoUrlResult.success) {
                    downloadUrl = videoUrlResult.data;
                    console.log('Extracted reel video URL:', downloadUrl);
                } else {
                    throw new Error(`Failed to extract video URL: ${videoUrlResult.error}`);
                }
            } catch (error) {
                console.error('Error extracting reel video URL:', error);
                throw new Error(`Could not extract video URL from reel: ${error.message}`);
            }
        }

        // Generate filename
        const filename = this.generateFilename(item, username, timestamp, index);
        
        // Start download
        const downloadId = await chrome.downloads.download({
            url: downloadUrl,
            filename: filename,
            saveAs: false, // Don't prompt user for location
            conflictAction: 'uniquify' // Add number suffix if file exists
        });

        console.log(`Started download: ${filename} (ID: ${downloadId})`);
        return downloadId;
    }

    async extractReelVideoUrl(reelUrl) {
        try {
            // Find an active Instagram tab
            const tabs = await chrome.tabs.query({ 
                url: ['*://www.instagram.com/*', '*://instagram.com/*'] 
            });
            
            if (tabs.length === 0) {
                throw new Error('No Instagram tab found');
            }

            // Use the first Instagram tab to extract the video URL
            const tab = tabs[0];
            
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'extractVideoUrlFromReel',
                reelUrl: reelUrl
            });

            return response || { success: false, error: 'No response from content script' };
        } catch (error) {
            console.error('Error communicating with content script for reel extraction:', error);
            return { success: false, error: error.message };
        }
    }

    generateFilename(item, username, timestamp, index) {
        // Use pre-generated filename if available
        if (item.filename) {
            return `WadiWadi_Instagram_Downloads/${item.filename}`;
        }
        
        // Clean username for filesystem
        const cleanUsername = this.sanitizeFilename(username);
        
        // Determine file extension
        const extension = this.getFileExtension(item);
        
        // Include post type and ID if available
        const postType = item.postType || 'media';
        const postId = item.postId || String(index + 1).padStart(3, '0');
        
        // Generate filename: username_postType_postId_timestamp.ext
        const filename = `${cleanUsername}_${postType}_${postId}_${timestamp}.${extension}`;
        
        return `WadiWadi_Instagram_Downloads/${filename}`;
    }

    getFileExtension(item) {
        if (item.type === 'video') {
            return 'mp4';
        }
        
        // Try to extract extension from URL
        const url = item.url || '';
        const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
        if (match) {
            return match[1].toLowerCase();
        }
        
        // Default to jpg for images
        return 'jpg';
    }

    sanitizeFilename(filename) {
        // Remove or replace invalid filename characters
        return filename
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .substring(0, 50); // Limit length
    }

    async getDownloadStatus(downloadId) {
        try {
            const downloads = await chrome.downloads.search({ id: downloadId });
            if (downloads.length === 0) {
                return { status: 'not_found' };
            }
            
            const download = downloads[0];
            return {
                status: download.state,
                filename: download.filename,
                bytesReceived: download.bytesReceived,
                totalBytes: download.totalBytes,
                paused: download.paused,
                error: download.error
            };
        } catch (error) {
            throw new Error('Failed to get download status: ' + error.message);
        }
    }

    async cancelDownload(downloadId) {
        try {
            await chrome.downloads.cancel(downloadId);
            console.log(`Cancelled download: ${downloadId}`);
        } catch (error) {
            throw new Error('Failed to cancel download: ' + error.message);
        }
    }

    handleDownloadChange(downloadDelta) {
        if (downloadDelta.state && downloadDelta.state.current === 'complete') {
            console.log(`Download completed: ${downloadDelta.id}`);
            this.updateBatchProgress(downloadDelta.id, 'completed');
            this.notifyDownloadComplete(downloadDelta.id);
        } else if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
            console.log(`Download interrupted: ${downloadDelta.id}`);
            this.updateBatchProgress(downloadDelta.id, 'failed');
            this.notifyDownloadError(downloadDelta.id);
        }
    }

    updateBatchProgress(downloadId, status) {
        try {
            // Find which batch this download belongs to
            for (const batchId in this.downloadBatches || {}) {
                const batch = this.downloadBatches[batchId];
                if (status === 'completed') {
                    batch.completed++;
                } else if (status === 'failed') {
                    batch.failed++;
                }
                
                // Check if batch is complete
                if (batch.completed + batch.failed >= batch.total) {
                    console.log(`Batch ${batchId} completed: ${batch.completed}/${batch.total} successful`);
                    this.notifyBatchComplete(batchId, batch);
                }
            }
        } catch (error) {
            console.error('Batch progress update error:', error);
        }
    }

    async notifyBatchComplete(batchId, batch) {
        try {
            console.log(`Batch download completed: ${batch.completed}/${batch.total} files downloaded successfully`);
            // Could send notification to popup or user
        } catch (error) {
            console.error('Batch notification error:', error);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async downloadSingleMedia(item, username = 'instagram_user') {
        if (!item || !item.url) {
            throw new Error('No media item or URL provided');
        }

        const timestamp = new Date().toISOString().slice(0, 10);
        
        try {
            const downloadId = await this.downloadSingleItem(item, username, timestamp, 0);
            return {
                id: downloadId,
                item: item,
                status: 'started'
            };
        } catch (error) {
            console.error('Single download error:', error);
            throw error;
        }
    }

    getBatchStatus(batchId) {
        if (!this.downloadBatches || !this.downloadBatches[batchId]) {
            return { status: 'not_found' };
        }

        const batch = this.downloadBatches[batchId];
        const isComplete = batch.completed + batch.failed >= batch.total;
        
        return {
            status: isComplete ? 'complete' : 'in_progress',
            total: batch.total,
            completed: batch.completed,
            failed: batch.failed,
            remaining: batch.total - batch.completed - batch.failed,
            startTime: batch.started,
            duration: Date.now() - batch.started
        };
    }

    async notifyDownloadComplete(downloadId) {
        try {
            // Could send notification or update popup
            console.log(`Notifying download completion: ${downloadId}`);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    async notifyDownloadError(downloadId) {
        try {
            // Could send error notification
            console.log(`Notifying download error: ${downloadId}`);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    // Utility method to check if URL is accessible
    async checkUrlAccessibility(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Clean up old downloads (could be called periodically)
    async cleanupOldDownloads(daysOld = 30) {
        try {
            const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
            const downloads = await chrome.downloads.search({
                startedAfter: new Date(cutoffTime).toISOString()
            });
            
            console.log(`Found ${downloads.length} downloads from last ${daysOld} days`);
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }
}

// Initialize background script
new InstagramBackground();