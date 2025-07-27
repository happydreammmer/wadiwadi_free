// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'captureScreenshot') {
        console.log('Processing screenshot request for tab:', sender.tab.id);
        
        captureFullPageScreenshot(sender.tab.id)
            .then(screenshotData => {
                console.log('Screenshot captured successfully, data length:', screenshotData ? screenshotData.length : 'undefined');
                sendResponse({ screenshotData });
            })
            .catch(error => {
                console.error('Screenshot capture failed:', error);
                sendResponse({ error: error.message });
            });
        
        // Return true to indicate we'll send response asynchronously
        return true;
    }
});

// Capture full page screenshot
async function captureFullPageScreenshot(tabId) {
    try {
        console.log('Getting tab info for tabId:', tabId);
        
        // Get the tab's viewport info
        const tab = await chrome.tabs.get(tabId);
        console.log('Tab info retrieved:', { id: tab.id, windowId: tab.windowId, url: tab.url, active: tab.active });
        
        // Make sure the tab is active and window is focused
        if (!tab.active) {
            console.log('Tab is not active, activating it first...');
            await chrome.tabs.update(tabId, { active: true });
            // Also focus the window to ensure proper permissions
            await chrome.windows.update(tab.windowId, { focused: true });
            // Wait for tab to become active
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('Attempting to capture visible tab for windowId:', tab.windowId);
        
        // Try capturing the screenshot
        // In Manifest V3, captureVisibleTab should work with activeTab permission
        const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: 'png'
        });
        
        if (!screenshot) {
            throw new Error('Screenshot capture returned empty data');
        }
        
        console.log('Screenshot captured successfully, type:', typeof screenshot, 'starts with:', screenshot.substring(0, 50));
        return screenshot;
        
    } catch (error) {
        console.error('Error in captureFullPageScreenshot:', error);
        
        // More specific error handling
        if (error.message.includes('Cannot access') || error.message.includes('activeTab')) {
            throw new Error('Permission denied: The extension needs activeTab permission to capture screenshots. Make sure you clicked the extension button from a user action.');
        }
        
        if (error.message.includes('No tab with id')) {
            throw new Error('Tab not found: The tab may have been closed or is not accessible.');
        }
        
        throw new Error('Screenshot capture failed: ' + error.message);
    }
}

// Handle extension action button click - this grants activeTab permission
chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension action clicked for tab:', tab.id);
    
    // Check if we're on a LinkedIn profile page
    if (!tab.url || !tab.url.match(/^https:\/\/www\.linkedin\.com\/in\/[^\/]+\/?$/)) {
        console.log('Not on a LinkedIn profile page');
        return;
    }
    
    // Ensure content scripts are injected (in case they didn't load automatically)
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [
                'core/constants.js',
                'utils/storage.js',
                'utils/pdf-export.js',
                'core/utils.js',
                'components/api-key-manager.js',
                'components/gemini-researcher.js',
                'components/results-panel.js',
                'components/progress-panel.js',
                'components/screenshot-handler.js',
                'core/content-main.js'
            ]
        });
        console.log('Content scripts injected successfully');
        
        // Wait a moment for the scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.log('Content scripts may already be loaded or injection failed:', error);
    }
    
    try {
        // Now we have activeTab permission, capture screenshot immediately
        const screenshotData = await captureFullPageScreenshot(tab.id);
        
        // Send screenshot data to content script
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'startResearchWithScreenshot',
                screenshotData: screenshotData
            });
            console.log('Sent screenshot data to content script');
        } catch (messageError) {
            console.error('Failed to send message to content script:', messageError);
            // Content script might not be loaded yet, wait and retry
            setTimeout(async () => {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'startResearchWithScreenshot',
                        screenshotData: screenshotData
                    });
                    console.log('Sent screenshot data to content script on retry');
                } catch (retryError) {
                    console.error('Failed to send message on retry:', retryError);
                }
            }, 1000);
        }
        
    } catch (error) {
        console.error('Failed to capture screenshot from action:', error);
        
        // Send error to content script
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'screenshotError',
                error: error.message
            });
        } catch (messageError) {
            console.error('Failed to send error message to content script:', messageError);
        }
    }
});

// Install/startup handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('LinkedIn Profile Researcher extension installed');
});