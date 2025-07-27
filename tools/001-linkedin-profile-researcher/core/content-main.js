(function() {
    'use strict';
    
    console.log('🌊 Wadi Wadi LinkedIn Researcher content script loaded', {
        url: window.location.href,
        isProfile: window.location.href.match(window.WADI_CONFIG?.profilePagePattern),
        version: window.WADI_CONFIG?.version || '1.0.0'
    });

    // Main application class
    class WadiLinkedInResearcher {
        constructor() {
            this.initialized = false;
            this.components = {};
        }

        async initialize() {
            try {
                if (!window.WadiUtils.isLinkedInProfilePage()) {
                    return;
                }

                if (!chrome?.runtime?.getURL) {
                    console.error('Chrome extension APIs not available');
                    return;
                }

                // Load all required components
                await this.loadComponents();
                
                // Initialize message listeners
                this.setupMessageListeners();
                
                // Clean up any existing elements
                this.cleanup();
                
                this.initialized = true;
                console.log('🌊 Wadi Wadi LinkedIn Researcher initialized successfully - Ready to flow your ideas into reality!');
                
            } catch (error) {
                console.error('Extension initialization failed:', error);
            }
        }

        async loadComponents() {
            // Components are already loaded via manifest, just initialize them
            this.components = {
                apiKeyManager: window.ApiKeyManager,
                geminiResearcher: window.GeminiResearcher,
                resultsPanel: window.ResultsPanel,
                progressPanel: window.ProgressPanel,
                screenshotHandler: window.ScreenshotHandler
            };
        }

        cleanup() {
            // Remove any existing UI elements
            const existingButton = document.getElementById('linkedin-researcher-button');
            if (existingButton) {
                existingButton.remove();
            }

            const existingInstruction = document.getElementById('linkedin-researcher-instruction');
            if (existingInstruction) {
                existingInstruction.remove();
            }
        }

        setupMessageListeners() {
            // Listen for messages from background script
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                console.log('Content script received message:', request);
                
                if (request.action === 'startResearchWithScreenshot') {
                    console.log('Starting research with screenshot data from background');
                    
                    // Hide any instruction
                    const instruction = document.getElementById('linkedin-researcher-instruction');
                    if (instruction) instruction.remove();
                    
                    // Create progress panel and start research
                    const progressPanel = new this.components.progressPanel();
                    progressPanel.create();
                    progressPanel.updateProgress('Processing screenshot...', 20);
                    
                    // Start research process with provided screenshot
                    this.startResearchProcess(request.screenshotData).then(() => {
                        console.log('Research completed successfully');
                        sendResponse({ success: true });
                    }).catch(error => {
                        console.error('Research failed:', error);
                        
                        // Show error in results panel
                        const resultsPanel = new this.components.resultsPanel();
                        resultsPanel.show();
                        resultsPanel.showError('Research failed: ' + error.message);
                        
                        sendResponse({ success: false, error: error.message });
                    });
                    
                    return true; // Keep message channel open for async response
                }
                
                if (request.action === 'screenshotError') {
                    console.error('Screenshot error from background:', request.error);
                    
                    // Show error in results panel
                    const resultsPanel = new this.components.resultsPanel();
                    resultsPanel.show();
                    resultsPanel.showError('Screenshot capture failed: ' + request.error);
                    
                    sendResponse({ success: true });
                }
            });
        }

        async startResearchProcess(screenshotData) {
            try {
                const apiKeyManager = new this.components.apiKeyManager();
                const StorageManagerClass = await window.WadiUtils.loadStorageManager();
                const storageManager = new StorageManagerClass();
                const geminiResearcher = new this.components.geminiResearcher();
                const resultsPanel = new this.components.resultsPanel();
                const progressPanel = new this.components.progressPanel();
                progressPanel.create();

                const currentUrl = window.location.href;

                // Check for cached results first
                progressPanel.updateProgress('Checking for cached results...', 5);
                const cachedResults = await storageManager.loadResults(currentUrl);
                
                if (cachedResults) {
                    console.log('Found cached results for:', currentUrl);
                    progressPanel.updateProgress('Loading cached results...', 100);
                    
                    // Get the progress panel position before removing it
                    const progressPanelElement = document.getElementById('linkedin-researcher-progress');
                    const progressPosition = progressPanelElement ? {
                        top: progressPanelElement.style.top,
                        right: progressPanelElement.style.right
                    } : { top: '60px', right: '20px' };

                    // Show cached results with cache notification
                    resultsPanel.show();
                    resultsPanel.showCachedResults(cachedResults);
                    
                    // Move results panel to progress panel position
                    const resultsPanelElement = document.getElementById('linkedin-researcher-results-panel');
                    if (resultsPanelElement) {
                        resultsPanelElement.style.top = progressPosition.top;
                        resultsPanelElement.style.right = progressPosition.right;
                    }
                    
                    // Hide progress panel after showing results
                    setTimeout(() => {
                        progressPanel.remove();
                    }, 1500);
                    
                    return;
                }

                progressPanel.updateProgress('Getting API key...', 10);
                const apiKey = await apiKeyManager.getApiKey();
                
                if (!apiKey) {
                    progressPanel.remove();
                    console.log('User cancelled API key input - research cancelled');
                    return; // Exit gracefully instead of throwing error
                }

                await geminiResearcher.initialize(apiKey);

                progressPanel.updateProgress('Analyzing profile data...', 25);
                const profileData = await geminiResearcher.extractProfileData(screenshotData);
                console.log('Extracted profile data:', profileData);

                progressPanel.updateProgress('Conducting English research...', 40);
                const englishResearch = await geminiResearcher.conductEnglishResearch(profileData);

                progressPanel.updateProgress('Conducting Arabic research...', 65);
                const arabicResearch = await geminiResearcher.conductArabicResearch(profileData);

                progressPanel.updateProgress('Generating consolidated reports...', 85);
                const bothReports = await geminiResearcher.generateBothReports(profileData, englishResearch, arabicResearch);

                const results = {
                    profileData,
                    englishResearch,
                    arabicResearch,
                    finalReport: bothReports.englishReport,
                    arabicFinalReport: bothReports.arabicReport,
                    timestamp: Date.now(),
                    profileUrl: window.location.href
                };

                progressPanel.updateProgress('Saving results...', 95);
                await storageManager.saveResults(window.location.href, results);

                progressPanel.updateProgress('Research completed!', 100);
                
                // Get the progress panel position before removing it
                const progressPanelElement = document.getElementById('linkedin-researcher-progress');
                const progressPosition = progressPanelElement ? {
                    top: progressPanelElement.style.top,
                    right: progressPanelElement.style.right
                } : { top: '60px', right: '20px' };

                resultsPanel.show();
                resultsPanel.showResults(results);
                
                // Move results panel to progress panel position
                const resultsPanelElement = document.getElementById('linkedin-researcher-results-panel');
                if (resultsPanelElement) {
                    resultsPanelElement.style.top = progressPosition.top;
                    resultsPanelElement.style.right = progressPosition.right;
                }

                // Hide progress panel after completion
                setTimeout(() => {
                    progressPanel.remove();
                }, 2000);

            } catch (error) {
                console.error('Research process failed:', error);
                
                const resultsPanel = new this.components.resultsPanel();
                resultsPanel.show();
                resultsPanel.showError(error.message);
                
                throw error;
            }
        }
    }

    // Initialize application
    async function init() {
        const app = new WadiLinkedInResearcher();
        await app.initialize();
        
        // Export for access from other components
        window.WadiMain = app;
    }

    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // Listen for navigation changes (SPA)
    let currentUrl = window.location.href;
    new MutationObserver(() => {
        if (currentUrl !== window.location.href) {
            currentUrl = window.location.href;
            setTimeout(init, 1000);
        }
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });

})();