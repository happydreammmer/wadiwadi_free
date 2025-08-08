 // Wadi Wadi - Instagram Analyzer Popup Script

class InstagramPopup {
    constructor() {
        this.currentTab = null;
        this.profileData = {};
        this.mediaItems = [];
        this.filteredMediaItems = [];
        this.selectedMedia = new Set();
        this.aiSelectedMedia = { images: new Set(), videos: new Set() };
        this.settings = {
            highQualityOnly: true,
            includeVideos: true,
            organizeByDate: false,
            filenameFormat: 'username_index'
        };

        
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        await this.loadSettings();
        await this.loadCachedData();
        this.setupEventListeners();
        this.checkInstagramPage();
        this.loadApiKey();
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            console.error('Error getting current tab:', error);
            this.showError('Failed to access current tab');
        }
    }

    setupEventListeners() {
        // Profile extraction
        document.getElementById('extractBtn').addEventListener('click', () => {
            this.extractProfileData();
        });

        // Copy All Data functionality
        document.getElementById('copyAllBtn').addEventListener('click', () => {
            this.copyAllProfileData();
        });

        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportProfileData();
        });



        // Settings toggle
        document.getElementById('settingsToggle').addEventListener('click', () => {
            this.toggleSettings();
        });

        // Media scanning
        document.getElementById('scanMediaBtn').addEventListener('click', () => {
            this.scanMedia();
        });

        // Media selection
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.toggleSelectAll();
        });

        // Bulk download
        document.getElementById('downloadAllBtn').addEventListener('click', () => {
            this.downloadSelected();
        });

        // Media filter
        document.getElementById('mediaFilter').addEventListener('change', (e) => {
            this.filterMedia(e.target.value);
        });

        // Settings event listeners
        this.setupSettingsListeners();

        // Error message close
        document.getElementById('closeErrorBtn').addEventListener('click', () => {
            this.hideError();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // AI Analysis Listeners
        document.getElementById('saveApiKeyBtn').addEventListener('click', () => this.saveApiKey());
        document.getElementById('analyzeProfileBtn').addEventListener('click', () => this.startAnalysis());
        document.getElementById('cancelAnalysisBtn').addEventListener('click', () => this.toggleMediaSelectionModal(false));
        document.getElementById('confirmAnalysisBtn').addEventListener('click', () => this.confirmAnalysis());
    }

    setupSettingsListeners() {
        // High quality toggle
        document.getElementById('highQualityOnly').addEventListener('change', (e) => {
            this.settings.highQualityOnly = e.target.checked;
            this.saveSettings();
        });

        // Include videos toggle
        document.getElementById('includeVideos').addEventListener('change', (e) => {
            this.settings.includeVideos = e.target.checked;
            this.saveSettings();
            this.filterMedia(document.getElementById('mediaFilter').value);
        });

        // Organize by date toggle
        document.getElementById('organizeByDate').addEventListener('change', (e) => {
            this.settings.organizeByDate = e.target.checked;
            this.saveSettings();
        });

        // Filename format
        document.getElementById('filenameFormat').addEventListener('change', (e) => {
            this.settings.filenameFormat = e.target.value;
            this.saveSettings();
        });
    }

    checkInstagramPage() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            this.showError('Please make sure you have an active browser tab open.');
            return;
        }

        const url = this.currentTab.url;
        if (!url || (!url.includes('instagram.com') && !url.includes('www.instagram.com'))) {
            this.updateStatus('error', 'Not an Instagram page');
            this.showError('Please navigate to Instagram.com to use this analyzer.');
            this.disableFeatures();
            return;
        }

        // Check if it's a profile page
        const isProfilePage = url.match(/instagram\.com\/([^\/]+)\/?$/);
        if (isProfilePage) {
            this.updateStatus('success', 'Instagram profile detected');
            this.enableFeatures();
        } else {
            this.updateStatus('warning', 'Navigate to a profile page');
            this.showWarning('Please navigate to an Instagram profile page (e.g., instagram.com/username) to analyze data.');
            this.disableFeatures();
        }
    }

    updateStatus(type, message) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        statusDot.className = `status-dot ${type}`;
        statusText.textContent = message;
    }

    enableFeatures() {
        document.getElementById('extractBtn').disabled = false;
        document.getElementById('scanMediaBtn').disabled = false;
    }

    disableFeatures() {
        document.getElementById('extractBtn').disabled = true;
        document.getElementById('scanMediaBtn').disabled = true;
        document.getElementById('downloadAllBtn').disabled = true;
        document.getElementById('analyzeProfileBtn').disabled = true;
    }

    async extractProfileData() {
        this.showLoading('Extracting profile data...');
        
        try {
            const response = await this.sendMessageToContent({
                action: 'extractProfile'
            });

            if (response && response.success) {
                this.profileData = response.data;
                this.displayProfileData(response.data);
                this.updateStatus('success', 'Profile data extracted');
            } else {
                throw new Error(response?.error || 'Failed to extract profile data');
            }
        } catch (error) {
            console.error('Profile extraction error:', error);
            this.showError('Failed to extract profile data: ' + error.message);
            this.updateStatus('error', 'Extraction failed');
        } finally {
            this.hideLoading();
        }
    }

    displayProfileData(data) {
        // Username and badges
        document.getElementById('username').textContent = data.username || '-';
        
        // Verified badge removed - no longer displayed
        
        // Show private badge if private
        const privateBadge = document.getElementById('privateBadge');
        if (data.isPrivate) {
            privateBadge.style.display = 'inline-block';
        } else {
            privateBadge.style.display = 'none';
        }
        
        // Profile picture
        const profilePicturePlaceholder = document.getElementById('profilePicturePlaceholder');
        if (data.profilePicture) {
            this.setupProfilePictureButton(data.profilePicture, profilePicturePlaceholder);
        } else {
            // Reset to default user icon
            profilePicturePlaceholder.innerHTML = '<span>👤</span>';
            profilePicturePlaceholder.style.cursor = 'default';
            profilePicturePlaceholder.onclick = null;
        }
        
        // Category
        const profileCategory = document.getElementById('profileCategory');
        if (data.category) {
            profileCategory.textContent = data.category;
            profileCategory.style.display = 'block';
        } else {
            profileCategory.style.display = 'none';
        }
        
        // Stats
        document.getElementById('posts').textContent = this.formatNumber(data.postCount) || '-';
        document.getElementById('followers').textContent = this.formatNumber(data.followersCount) || '-';
        document.getElementById('following').textContent = this.formatNumber(data.followingCount) || '-';
        
        // Bio
        const bioContainer = document.getElementById('bioContainer');
        const bioElement = document.getElementById('bio');
        if (data.bio && data.bio.trim()) {
            bioElement.textContent = data.bio;
            bioContainer.style.display = 'flex';
        } else {
            bioContainer.style.display = 'none';
        }
        
        // External URL
        const urlContainer = document.getElementById('urlContainer');
        const externalUrl = document.getElementById('externalUrl');
        if (data.externalUrl) {
            externalUrl.href = data.externalUrl;
            externalUrl.textContent = data.externalUrl;
            urlContainer.style.display = 'flex';
        } else {
            urlContainer.style.display = 'none';
        }
        
        // Enable export and copy buttons
        document.getElementById('exportBtn').disabled = false;
        document.getElementById('copyAllBtn').disabled = false;
        
        // Show success toast
        this.showToast('Profile data extracted successfully!', 'success');
        
        // Save to cache
        this.saveCacheData();
    }

    formatNumber(num) {
        if (!num) return '';
        
        // Remove any non-numeric characters except commas and dots
        const cleanNum = num.toString().replace(/[^\d,.-]/g, '');
        
        // If it's already formatted (contains K, M, etc.), return as is
        if (num.toString().match(/[KMB]/i)) {
            return num;
        }
        
        // Try to parse as number
        const parsed = parseInt(cleanNum.replace(/,/g, ''));
        if (isNaN(parsed)) return num;
        
        // Format large numbers
        if (parsed >= 1000000) {
            return (parsed / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (parsed >= 1000) {
            return (parsed / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        
        return parsed.toLocaleString();
    }

    async scanMedia() {
        this.showLoading('Scanning for media...');
        
        try {
            const response = await this.sendMessageToContent({
                action: 'scanMedia'
            });

            if (response && response.success) {
                this.mediaItems = response.data;
                this.displayMediaItems(response.data);
                this.updateStatus('success', `Found ${response.data.length} media items`);
            } else {
                throw new Error(response?.error || 'Failed to scan media');
            }
        } catch (error) {
            console.error('Media scan error:', error);
            this.showError('Failed to scan media: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayMediaItems(items) {
        this.mediaItems = items;
        this.filteredMediaItems = [...items];
        this.selectedMedia.clear();
        
        const mediaCount = document.getElementById('mediaCount');
        mediaCount.textContent = items.length;
        
        this.renderMediaGrid();
        this.updateSelectedCount();
        
        // Enable download controls if items exist
        document.getElementById('downloadAllBtn').disabled = items.length === 0;
        
        if (items.length > 0) {
            const reelCount = items.filter(item => item.type === 'video' && item.postType === 'reel').length;
            const albumCount = items.filter(item => item.isAlbum || item.postType === 'album').length;
            
            let message = `Found ${items.length} media items`;
            
            const counts = [];
            if (reelCount > 0) {
                counts.push(`${reelCount} reel${reelCount > 1 ? 's' : ''}`);
            }
            if (albumCount > 0) {
                counts.push(`${albumCount} album item${albumCount > 1 ? 's' : ''}`);
            }
            
            if (counts.length > 0) {
                message += ` (${counts.join(', ')})`;
            }
            
            this.showToast(message, 'success');
        } else {
            this.showToast('No media items found', 'warning');
        }

        // Save to cache
        this.saveCacheData();
    }

    renderMediaGrid() {
        const mediaGrid = document.getElementById('mediaGrid');
        mediaGrid.innerHTML = '';

        if (this.filteredMediaItems.length === 0) {
            return; // CSS handles empty state
        }

        this.filteredMediaItems.forEach((item, index) => {
            const mediaElement = this.createMediaElement(item, index);
            mediaGrid.appendChild(mediaElement);
        });
    }

    createMediaElement(item, index) {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.dataset.index = index;

        // Determine media type and display
        let postType = 'Post';
        let mediaTypeIcon = '📷';
        
        if (item.postType === 'reel') {
            postType = 'Reel';
            mediaTypeIcon = '🎬';
        } else if (item.postType === 'album' || item.isAlbum) {
            postType = 'Album';
            mediaTypeIcon = '📖';
        } else if (item.type === 'video') {
            mediaTypeIcon = '🎥';
        }
        
        const dimensions = item.width && item.height ? `${item.width}×${item.height}` : '';
        const title = `${postType} ${index + 1}${dimensions ? ` (${dimensions})` : ''}`;
        
        // Better filename display
        const filename = item.filename || `${item.type}_${index + 1}`;
        const fileSize = item.fileSize ? this.formatFileSize(item.fileSize) : '';

        // Album info display
        const albumInfo = item.isAlbum && item.albumIndex && item.albumTotal ? 
            `${item.albumIndex}/${item.albumTotal}` : '';
        
        div.innerHTML = `
            <img src="${item.thumbnail || item.url}" alt="${title}" title="${title}" loading="lazy">
            <div class="media-type">${mediaTypeIcon}</div>
            <div class="media-info">
                <div class="media-post-type">${postType}${item.type === 'video' ? ' Video' : ''}</div>
                ${item.postId ? `<div class="media-post-id">${item.postId.substring(0, 8)}...</div>` : ''}
                ${albumInfo ? `<div class="media-album-info">${albumInfo}</div>` : ''}
                ${fileSize ? `<div class="media-file-size">${fileSize}</div>` : ''}
            </div>
            <div class="media-overlay">
                <button class="download-btn" title="Download ${filename}">⬇️</button>
                <div class="selection-indicator">✓</div>
            </div>
        `;

        // Click to select/deselect
        div.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-btn')) {
                e.stopPropagation();
                this.downloadSingle(index);
            } else {
                this.toggleMediaSelection(div, index);
            }
        });

        return div;
    }

    formatFileSize(bytes) {
        if (!bytes) return '';
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    toggleMediaSelection(element, index) {
        if (this.selectedMedia.has(index)) {
            this.selectedMedia.delete(index);
            element.classList.remove('selected');
        } else {
            this.selectedMedia.add(index);
            element.classList.add('selected');
        }

        this.updateDownloadButton();
        
        // Save selection to cache
        this.saveCacheData();
    }

    toggleSelectAll() {
        const allSelected = this.selectedMedia.size === this.filteredMediaItems.length;
        
        if (allSelected) {
            // Deselect all
            this.selectedMedia.clear();
            document.querySelectorAll('.media-item').forEach(item => {
                item.classList.remove('selected');
            });
        } else {
            // Select all filtered items
            this.selectedMedia.clear();
            this.filteredMediaItems.forEach((_, index) => {
                this.selectedMedia.add(index);
            });
            document.querySelectorAll('.media-item').forEach(item => {
                item.classList.add('selected');
            });
        }

        this.updateSelectedCount();
        
        // Save selection to cache
        this.saveCacheData();
    }

    updateDownloadButton() {
        const downloadBtn = document.getElementById('downloadAllBtn');
        const selectBtn = document.getElementById('selectAllBtn');
        
        downloadBtn.disabled = this.selectedMedia.size === 0;
        downloadBtn.textContent = `⬇️ Download ${this.selectedMedia.size > 0 ? `(${this.selectedMedia.size})` : 'Selected'}`;
        
        selectBtn.textContent = this.selectedMedia.size === this.filteredMediaItems.length ? '☑️ Deselect All' : '☑️ Select All';
    }

    async downloadSelected() {
        if (this.selectedMedia.size === 0) {
            this.showToast('No media selected', 'warning');
            return;
        }

        this.showLoading(`Downloading ${this.selectedMedia.size} items...`);
        this.updateDownloadProgress({
            percentage: 0,
            text: 'Preparing download...'
        });

        try {
            const selectedItems = Array.from(this.selectedMedia).map(index => this.filteredMediaItems[index]);
            
            // Check if any items are reel videos and show appropriate message
            const reelVideos = selectedItems.filter(item => item.type === 'video' && item.postType === 'reel');
            if (reelVideos.length > 0) {
                this.showToast(`Processing ${reelVideos.length} reel video${reelVideos.length > 1 ? 's' : ''}... This may take up to 30 seconds per reel.`, 'info', 8000);
            }

            const response = await this.sendMessageToBackground({
                action: 'downloadMedia',
                items: selectedItems,
                username: this.profileData.username || 'wadiwadi_user',
                settings: this.settings
            });

            if (response && response.success) {
                const data = response.data;
                if (data.failed > 0) {
                    this.showToast(`Download started: ${data.started}/${data.total} items (${data.failed} failed)`, 'warning', 5000);
                } else {
                    this.showToast(`Download started: ${data.started}/${data.total} items`, 'success');
                }
                
                // Start progress tracking if we have a batch ID
                if (data.batchId) {
                    this.trackBatchProgress(data.batchId);
                } else {
                    this.updateDownloadProgress(null);
                }
            } else {
                throw new Error(response?.error || 'Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Download failed: ' + error.message, 'error');
            this.updateDownloadProgress(null);
        } finally {
            this.hideLoading();
        }
    }

    async trackBatchProgress(batchId) {
        const checkProgress = async () => {
            try {
                const response = await this.sendMessageToBackground({
                    action: 'getBatchStatus',
                    batchId: batchId
                });

                if (response && response.success) {
                    const status = response.data;
                    const percentage = Math.round((status.completed / status.total) * 100);
                    
                    if (status.status === 'complete') {
                        this.updateDownloadProgress({
                            percentage: 100,
                            text: `Complete: ${status.completed}/${status.total} files downloaded`
                        });
                        
                        setTimeout(() => {
                            this.updateDownloadProgress(null);
                        }, 3000);
                        
                        this.showToast(`Download complete: ${status.completed}/${status.total} files`, 'success');
                        this.updateStatus('success', 'Download complete');
                        return; // Stop tracking
                    } else if (status.status === 'in_progress') {
                        this.updateDownloadProgress({
                            percentage: percentage,
                            text: `Downloading: ${status.completed}/${status.total} completed`
                        });
                        this.updateStatus('info', `Downloading: ${status.completed}/${status.total}`);
                        // Continue tracking
                        setTimeout(checkProgress, 2000);
                    }
                }
            } catch (error) {
                console.error('Progress tracking error:', error);
                this.updateDownloadProgress(null);
            }
        };

        // Start tracking after a short delay
        setTimeout(checkProgress, 1000);
    }

    async downloadSingle(index) {
        const item = this.filteredMediaItems[index];
        if (!item) return;

        // Show loading state for this specific item
        const mediaElement = document.querySelector(`[data-index="${index}"]`);
        const downloadBtn = mediaElement?.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.textContent = '⏳';
            downloadBtn.disabled = true;
        }

        try {
            // Show processing message for reel videos
            if (item.type === 'video' && item.postType === 'reel') {
                this.showToast('Processing reel video... This may take up to 30 seconds. Please be patient.', 'info', 6000);
            }

            const response = await this.sendMessageToBackground({
                action: 'downloadSingleMedia',
                item: item,
                username: this.profileData.username || 'wadiwadi_user',
                settings: this.settings
            });

            if (response && response.success) {
                const filename = item.filename || `${item.type}_${index + 1}`;
                this.showToast(`Download started: ${filename}`, 'success');
                if (downloadBtn) {
                    downloadBtn.textContent = '✅';
                    setTimeout(() => {
                        downloadBtn.textContent = '⬇️';
                        downloadBtn.disabled = false;
                    }, 2000);
                }
            } else {
                throw new Error(response?.error || 'Download failed');
            }
        } catch (error) {
            console.error('Single download error:', error);
            this.showToast('Download failed: ' + error.message, 'error');
            if (downloadBtn) {
                downloadBtn.textContent = '❌';
                setTimeout(() => {
                    downloadBtn.textContent = '⬇️';
                    downloadBtn.disabled = false;
                }, 2000);
            }
        }
    }

    exportProfileData() {
        if (!this.profileData || Object.keys(this.profileData).length === 0) {
            this.showError('No profile data to export');
            return;
        }

        const dataStr = JSON.stringify(this.profileData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.profileData.username || 'wadiwadi_profile'}_data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Profile data exported');
    }

    async copyAllProfileData() {
        if (!this.profileData || Object.keys(this.profileData).length === 0) {
            this.showToast('No profile data to copy', 'warning');
            return;
        }

        // Format the profile data as readable text
        let text = '';
        
        if (this.profileData.username) {
            text += `Username: @${this.profileData.username}\n`;
        }
        
        if (this.profileData.postCount !== null && this.profileData.postCount !== undefined) {
            text += `Posts: ${this.formatNumber(this.profileData.postCount)}\n`;
        }
        
        if (this.profileData.followersCount !== null && this.profileData.followersCount !== undefined) {
            text += `Followers: ${this.formatNumber(this.profileData.followersCount)}\n`;
        }
        
        if (this.profileData.followingCount !== null && this.profileData.followingCount !== undefined) {
            text += `Following: ${this.formatNumber(this.profileData.followingCount)}\n`;
        }
        
        if (this.profileData.category) {
            text += `Category: ${this.profileData.category}\n`;
        }
        
        if (this.profileData.bio) {
            text += `Bio: ${this.profileData.bio}\n`;
        }
        
        if (this.profileData.externalUrl) {
            text += `Website: ${this.profileData.externalUrl}\n`;
        }
        
        if (this.profileData.profilePicture) {
            text += `Profile Picture: ${this.profileData.profilePicture}\n`;
        }
        
        if (this.profileData.isVerified) {
            text += `Verified: Yes\n`;
        }
        
        if (this.profileData.isPrivate) {
            text += `Private: Yes\n`;
        }

        if (!text.trim()) {
            this.showToast('No profile data to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text.trim());
            this.showToast('All profile data copied to clipboard!', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    async sendMessageToContent(message, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                // First, try to inject the content script if it's not already there
                if (i === 0) {
                    await this.ensureContentScriptInjected();
                }
                
                const response = await chrome.tabs.sendMessage(this.currentTab.id, message);
                return response;
            } catch (error) {
                console.error(`Content script message error (attempt ${i + 1}):`, error);
                
                if (i === retries - 1) {
                    throw new Error('Failed to communicate with content script. Please refresh the Instagram page and try again.');
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    async ensureContentScriptInjected() {
        try {
            // Try to inject the content scripts manually
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                files: [
                    'utils/helpers.js',
                    'utils/selectors.js', 
                    'content/extractor.js',
                    'content/content.js'
                ]
            });
        } catch (error) {
            // Content script might already be injected, or we don't have permission
            console.log('Content script injection attempt:', error.message);
        }
    }

    async sendMessageToBackground(message) {
        try {
            const response = await chrome.runtime.sendMessage(message);
            return response;
        } catch (error) {
            console.error('Background script message error:', error);
            throw new Error('Failed to communicate with background script');
        }
    }

    showLoading(message = 'Loading...') {
        document.getElementById('loadingText').textContent = message;
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    showError(message) {
        document.getElementById('errorText').textContent = message;
        document.getElementById('errorMessage').classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').classList.remove('show');
    }

    showSuccess(message) {
        // For now, just update status - could add a success toast later
        this.updateStatus('success', message);
        setTimeout(() => {
            this.updateStatus('success', 'Ready');
        }, 3000);
    }

    showWarning(message) {
        this.updateStatus('warning', message);
        setTimeout(() => {
            this.updateStatus('success', 'Ready');
        }, 4000);
    }

    // New UI Enhancement Methods

    switchTab(tabName) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Save active tab to cache
        this.saveCacheData();
    }

    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        const settingsToggle = document.getElementById('settingsToggle');
        
        if (settingsPanel.classList.contains('show')) {
            settingsPanel.classList.remove('show');
            settingsToggle.classList.remove('active');
        } else {
            settingsPanel.classList.add('show');
            settingsToggle.classList.add('active');
        }
    }

    refreshData() {
        this.profileData = {};
        this.mediaItems = [];
        this.filteredMediaItems = [];
        this.selectedMedia.clear();
        
        // Reset UI
        document.getElementById('username').textContent = '-';
        document.getElementById('posts').textContent = '-';
        document.getElementById('followers').textContent = '-';
        document.getElementById('following').textContent = '-';
        document.getElementById('bioContainer').style.display = 'none';
        document.getElementById('urlContainer').style.display = 'none';
        
        // Reset profile picture placeholder
        const profilePicturePlaceholder = document.getElementById('profilePicturePlaceholder');
        if (profilePicturePlaceholder) {
            profilePicturePlaceholder.innerHTML = '<span>👤</span>';
            profilePicturePlaceholder.style.cursor = 'default';
            profilePicturePlaceholder.onclick = null;
        }
        
        document.getElementById('privateBadge').style.display = 'none';
        document.getElementById('profileCategory').style.display = 'none';
        
        document.getElementById('mediaCount').textContent = '0';
        document.getElementById('mediaGrid').innerHTML = '';
        document.getElementById('exportBtn').disabled = true;
        document.getElementById('copyAllBtn').disabled = true;
        document.getElementById('downloadAllBtn').disabled = true;
        
        this.updateSelectedCount();
        this.showToast('Data refreshed', 'info');
        
        // Clear cache
        this.clearCache();
    }

    filterMedia(filterType) {
        let filtered = [...this.mediaItems];
        
        switch (filterType) {
            case 'images':
                filtered = filtered.filter(item => item.type === 'image' && !item.isAlbum);
                break;
            case 'videos':
                filtered = filtered.filter(item => item.type === 'video');
                break;
            case 'albums':
                filtered = filtered.filter(item => item.isAlbum || item.postType === 'album');
                break;
            case 'reels':
                filtered = filtered.filter(item => item.postType === 'reel');
                break;
            case 'all':
            default:
                // No filtering
                break;
        }
        
        // Apply settings filter
        if (!this.settings.includeVideos) {
            filtered = filtered.filter(item => item.type !== 'video');
        }
        
        this.filteredMediaItems = filtered;
        this.selectedMedia.clear();
        this.renderMediaGrid();
        this.updateSelectedCount();
        
        // Update media count display
        const mediaCount = document.getElementById('mediaCount');
        mediaCount.textContent = filtered.length;
        
        // Save filter selection to cache
        this.saveCacheData();
    }

    updateSelectedCount() {
        const selectedCount = document.getElementById('selectedCount');
        const selectedNumber = document.getElementById('selectedNumber');
        
        if (this.selectedMedia.size > 0) {
            selectedNumber.textContent = this.selectedMedia.size;
            selectedCount.style.display = 'inline';
        } else {
            selectedCount.style.display = 'none';
        }
        
        this.updateDownloadButton();
    }

    saveSettings() {
        chrome.storage.local.set({ 
            wadiwadiInstagramAnalyzerSettings: this.settings 
        });
    }

    async loadSettings() {
        try {
                    const result = await chrome.storage.local.get('wadiwadiInstagramAnalyzerSettings');
        if (result.wadiwadiInstagramAnalyzerSettings) {
            this.settings = { ...this.settings, ...result.wadiwadiInstagramAnalyzerSettings };
                this.applySettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async loadCachedData() {
        try {
            const result = await chrome.storage.local.get([
                'wadiwadiInstagramAnalyzerProfileData',
                'wadiwadiInstagramAnalyzerMediaItems',
                'wadiwadiInstagramAnalyzerCurrentUrl',
                'wadiwadiInstagramAnalyzerSelectedMedia',
                'wadiwadiInstagramAnalyzerActiveTab',
                'wadiwadiInstagramAnalyzerMediaFilter'
            ]);

            // Only restore data if we're on the same Instagram page
            const currentUrl = this.currentTab?.url;
            const cachedUrl = result.wadiwadiInstagramAnalyzerCurrentUrl;
            
            if (currentUrl && cachedUrl && this.isSameInstagramProfile(currentUrl, cachedUrl)) {
                // Restore profile data
                if (result.wadiwadiInstagramAnalyzerProfileData) {
                    this.profileData = result.wadiwadiInstagramAnalyzerProfileData;
                    this.displayProfileData(this.profileData);
                }

                // Restore media items
                if (result.wadiwadiInstagramAnalyzerMediaItems) {
                    this.mediaItems = result.wadiwadiInstagramAnalyzerMediaItems;
                    this.displayMediaItems(this.mediaItems);
                }

                // Restore selected media items
                if (result.wadiwadiInstagramAnalyzerSelectedMedia) {
                    this.selectedMedia = new Set(result.wadiwadiInstagramAnalyzerSelectedMedia);
                    this.updateSelectedMediaDisplay();
                }

                // Restore media filter
                if (result.wadiwadiInstagramAnalyzerMediaFilter) {
                    const mediaFilter = document.getElementById('mediaFilter');
                    if (mediaFilter) {
                        mediaFilter.value = result.wadiwadiInstagramAnalyzerMediaFilter;
                        // Apply the filter
                        this.filterMedia(result.wadiwadiInstagramAnalyzerMediaFilter);
                    }
                }

                // Restore active tab
                const activeTab = result.wadiwadiInstagramAnalyzerActiveTab || 'profile';
                if (activeTab !== 'profile') {
                    this.switchTab(activeTab);
                }

                console.log('Cached data restored successfully');
            } else {
                // Clear cache if URL changed
                this.clearCache();
            }
        } catch (error) {
            console.error('Error loading cached data:', error);
        }
    }

    async saveCacheData() {
        try {
            const currentUrl = this.currentTab?.url;
            if (!currentUrl) return;

            const cacheData = {
                wadiwadiInstagramAnalyzerProfileData: this.profileData,
                wadiwadiInstagramAnalyzerMediaItems: this.mediaItems,
                wadiwadiInstagramAnalyzerCurrentUrl: currentUrl,
                wadiwadiInstagramAnalyzerSelectedMedia: Array.from(this.selectedMedia),
                wadiwadiInstagramAnalyzerActiveTab: this.getCurrentActiveTab(),
                wadiwadiInstagramAnalyzerMediaFilter: document.getElementById('mediaFilter')?.value || 'all'
            };

            await chrome.storage.local.set(cacheData);
        } catch (error) {
            console.error('Error saving cache data:', error);
        }
    }

    async clearCache() {
        try {
                    await chrome.storage.local.remove([
            'wadiwadiInstagramAnalyzerProfileData',
            'wadiwadiInstagramAnalyzerMediaItems',
            'wadiwadiInstagramAnalyzerCurrentUrl',
            'wadiwadiInstagramAnalyzerSelectedMedia',
            'wadiwadiInstagramAnalyzerActiveTab',
            'wadiwadiInstagramAnalyzerMediaFilter'
        ]);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    isSameInstagramProfile(url1, url2) {
        if (!url1 || !url2) return false;
        
        // Extract username from Instagram URLs
        const getUsername = (url) => {
            const match = url.match(/instagram\.com\/([^\/?]+)/);
            return match ? match[1] : null;
        };

        return getUsername(url1) === getUsername(url2);
    }

    getCurrentActiveTab() {
        const activeTabBtn = document.querySelector('.tab-btn.active');
        return activeTabBtn?.dataset.tab || 'profile';
    }

    updateSelectedMediaDisplay() {
        // Update visual selection in the media grid
        document.querySelectorAll('.media-item').forEach((item, index) => {
            if (this.selectedMedia.has(index)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        this.updateSelectedCount();
    }

    applySettings() {
        document.getElementById('highQualityOnly').checked = this.settings.highQualityOnly;
        document.getElementById('includeVideos').checked = this.settings.includeVideos;
        document.getElementById('organizeByDate').checked = this.settings.organizeByDate;
        document.getElementById('filenameFormat').value = this.settings.filenameFormat;
    }

    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;
        
        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    updateDownloadProgress(progress) {
        const progressElement = document.getElementById('downloadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progress === null) {
            progressElement.style.display = 'none';
            return;
        }
        
        progressElement.style.display = 'block';
                progressFill.style.width = `${progress.percentage}%`;
        progressText.textContent = progress.text;
    }

    setupProfilePictureButton(imageUrl, placeholderElement) {
        // Create a simple clickable button to view the profile picture
        placeholderElement.innerHTML = `
            <div style="cursor: pointer; text-align: center;" title="Click to view profile picture">
                <span style="font-size: 24px;">🖼️</span>
                <div style="font-size: 10px; margin-top: 2px;">Click to view</div>
            </div>
        `;
        placeholderElement.style.cursor = 'pointer';
        
        // Remove any existing click handlers
        placeholderElement.onclick = null;
        
        // Add click handler to open image in new tab
        placeholderElement.addEventListener('click', () => {
            window.open(imageUrl, '_blank');
        });
    }

    // --- AI Analysis Methods ---

    async saveApiKey() {
        const apiKey = document.getElementById('apiKey').value;
        if (!apiKey) {
            this.showToast('Please enter an API key.', 'warning');
            return;
        }
        await chrome.storage.local.set({ geminiApiKey: apiKey });
        this.showToast('API Key saved successfully!', 'success');
        document.getElementById('analyzeProfileBtn').disabled = false;
    }

    async loadApiKey() {
        const result = await chrome.storage.local.get('geminiApiKey');
        if (result.geminiApiKey) {
            document.getElementById('apiKey').value = result.geminiApiKey;
            document.getElementById('analyzeProfileBtn').disabled = false;
        }
    }

    async startAnalysis() {
        // 1. Ensure profile data is extracted
        if (!this.profileData || !this.profileData.username) {
            await this.extractProfileData();
            if (!this.profileData || !this.profileData.username) {
                this.showError('Could not extract profile data to start analysis.');
                return;
            }
        }

        // 2. Scan for media if not already done
        if (this.mediaItems.length === 0) {
            await this.scanMedia();
            if (this.mediaItems.length === 0) {
                this.showError('No media found on the profile to analyze.');
                return;
            }
        }

        // 3. Show media selection modal
        this.populateMediaSelectionGrid();
        this.toggleMediaSelectionModal(true);
    }

    toggleMediaSelectionModal(show) {
        const modal = document.getElementById('mediaSelectionModal');
        modal.style.display = show ? 'flex' : 'none';
    }

    populateMediaSelectionGrid() {
        const grid = document.getElementById('mediaSelectionGrid');
        grid.innerHTML = '';
        this.aiSelectedMedia = { images: new Set(), videos: new Set() };
        this.updateAISelectionCounters();

        this.mediaItems.forEach((item, index) => {
            const div = this.createMediaElement(item, index);
            div.dataset.mediaType = item.type;
            div.dataset.originalIndex = index;
            
            // Remove download button for this view
            const downloadBtn = div.querySelector('.download-btn');
            if(downloadBtn) downloadBtn.remove();

            div.addEventListener('click', () => this.toggleAIAnalysisMediaSelection(div, item));
            grid.appendChild(div);
        });
    }

    toggleAIAnalysisMediaSelection(element, item) {
        const isSelected = element.classList.contains('selected');
        const isImage = item.type === 'image';
        const isVideo = item.type === 'video';

        if (isSelected) {
            element.classList.remove('selected');
            if (isImage) this.aiSelectedMedia.images.delete(item);
            if (isVideo) this.aiSelectedMedia.videos.delete(item);
        } else {
            if (isImage && this.aiSelectedMedia.images.size < 5) {
                element.classList.add('selected');
                this.aiSelectedMedia.images.add(item);
            } else if (isVideo && this.aiSelectedMedia.videos.size < 5) {
                element.classList.add('selected');
                this.aiSelectedMedia.videos.add(item);
            } else {
                this.showToast(`You can only select up to 5 ${isImage ? 'images' : 'videos'}.`, 'warning');
            }
        }
        this.updateAISelectionCounters();
        this.updateDisabledMediaItems();
    }

    updateAISelectionCounters() {
        document.getElementById('imageSelectionCount').textContent = `Images: ${this.aiSelectedMedia.images.size}/5`;
        document.getElementById('videoSelectionCount').textContent = `Videos: ${this.aiSelectedMedia.videos.size}/5`;
        
        const confirmBtn = document.getElementById('confirmAnalysisBtn');
        const totalSelected = this.aiSelectedMedia.images.size + this.aiSelectedMedia.videos.size;
        confirmBtn.disabled = totalSelected === 0;
    }
    
    updateDisabledMediaItems() {
        const grid = document.getElementById('mediaSelectionGrid');
        const items = grid.querySelectorAll('.media-item');
        const imagesFull = this.aiSelectedMedia.images.size >= 5;
        const videosFull = this.aiSelectedMedia.videos.size >= 5;

        items.forEach(element => {
            const isSelected = element.classList.contains('selected');
            if (isSelected) {
                element.classList.remove('disabled');
                return;
            }
            const isImage = element.dataset.mediaType === 'image';
            const isVideo = element.dataset.mediaType === 'video';

            if ((isImage && imagesFull) || (isVideo && videosFull)) {
                element.classList.add('disabled');
            } else {
                element.classList.remove('disabled');
            }
        });
    }

    async confirmAnalysis() {
        this.toggleMediaSelectionModal(false);
        this.showLoading('Preparing AI analysis...');

        const apiKey = document.getElementById('apiKey').value;
        const analysisMode = document.querySelector('input[name="analysisMode"]:checked').value;
        const selectedItems = [...this.aiSelectedMedia.images, ...this.aiSelectedMedia.videos];

        try {
            // Fetch image data URLs
            const mediaWithData = [];
            for (const item of selectedItems) {
                if (item.type === 'image') {
                    this.showLoading(`Fetching image data (${mediaWithData.length + 1}/${selectedItems.length})...`);
                    const response = await this.sendMessageToContent({
                        action: 'fetchImageAsDataUrl',
                        imageUrl: item.url
                    });
                    if (response.success) {
                        mediaWithData.push({ ...item, dataUrl: response.data });
                    }
                } else {
                     // For videos, we'll just pass the thumbnail for now
                    this.showLoading(`Fetching video thumbnail data (${mediaWithData.length + 1}/${selectedItems.length})...`);
                     const response = await this.sendMessageToContent({
                        action: 'fetchImageAsDataUrl',
                        imageUrl: item.thumbnail
                    });
                    if (response.success) {
                        mediaWithData.push({ ...item, dataUrl: response.data, isVideoThumbnail: true });
                    }
                }
            }

            this.showLoading('Sending data to AI for analysis...');
            const response = await this.sendMessageToBackground({
                action: 'analyzeProfile',
                profileData: this.profileData,
                mediaItems: mediaWithData,
                apiKey: apiKey,
                analysisMode: analysisMode
            });

            if (response && response.success) {
                this.displayAnalysisResults(response.data);
            } else {
                throw new Error(response?.error || 'AI analysis failed');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Analysis failed: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayAnalysisResults(results) {
        const resultsSection = document.getElementById('analysisResultsSection');
        const resultContent = document.getElementById('analysisResult');
        
        // A simple markdown-to-HTML converter
        let html = results.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>'); // List items
        html = html.replace(/^(<li>.*<\/li>)$/gm, '<ul>$1</ul>'); // Wrap lists
        html = html.replace(/\n/g, '<br>'); // Newlines

        resultContent.innerHTML = html;
        resultsSection.style.display = 'block';
        this.showToast('Analysis complete!', 'success');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InstagramPopup();
});
