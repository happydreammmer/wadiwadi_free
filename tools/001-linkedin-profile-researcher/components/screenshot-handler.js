if (!window.ScreenshotHandler) {
class ScreenshotHandler {
    constructor() {
        // Screenshot handling methods
    }

    // Request screenshot via background script (proper activeTab flow)
    async requestScreenshotViaBackground() {
        return new Promise((resolve, reject) => {
            console.log('Requesting screenshot via background script...');
            
            chrome.runtime.sendMessage({
                action: 'captureScreenshot'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                } else if (response?.error) {
                    reject(new Error(response.error));
                } else if (!response?.screenshotData) {
                    reject(new Error('No screenshot data returned'));
                } else {
                    resolve(response.screenshotData);
                }
            });
        });
    }

    // Show instruction to click extension icon
    showExtensionActionInstruction() {
        // Remove any existing instruction
        const existing = document.getElementById('linkedin-researcher-instruction');
        if (existing) existing.remove();
        
        const instruction = document.createElement('div');
        instruction.id = 'linkedin-researcher-instruction';
        instruction.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            width: 320px;
            background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
            color: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(10, 102, 194, 0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.3s ease;
        `;
        
        instruction.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 600;">Click Extension Icon</h3>
                <button id="close-instruction" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 16px; cursor: pointer; border-radius: 4px; width: 24px; height: 24px;">×</button>
            </div>
            <p style="margin: 0; font-size: 13px; line-height: 1.4; opacity: 0.9;">To capture screenshots, click the LinkedIn Profile Researcher extension icon in your browser's toolbar instead of this button.</p>
        `;
        
        document.body.appendChild(instruction);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (instruction.parentNode) instruction.remove();
        }, 8000);
        
        // Close button
        document.getElementById('close-instruction')?.addEventListener('click', () => {
            instruction.remove();
        });
    }

    // Handle research button click (legacy - now handled via extension icon)
    async handleResearchClick(event) {
        // Ensure this is triggered by user action
        if (!event.isTrusted) {
            console.error('Screenshot capture must be triggered by user action');
            return;
        }
        
        const button = document.getElementById('linkedin-researcher-button');
        const originalContent = button.innerHTML;
        
        try {
            button.innerHTML = `
                <div style="width: 20px; height: 20px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                Processing...
            `;
            button.style.pointerEvents = 'none';

            // Create progress panel first to show user feedback
            if (window.ProgressPanel) {
                const progressPanel = new window.ProgressPanel();
                progressPanel.create();
                progressPanel.updateProgress('Capturing screenshot...', 10);
            }
            console.log('Starting screenshot capture...');
            
            // Try screenshot capture via background script
            const screenshotData = await this.requestScreenshotViaBackground();
            console.log('Screenshot capture completed, data type:', typeof screenshotData);
            console.log('Screenshot data length:', screenshotData ? screenshotData.length : 'undefined');
            
            // Trigger research process with screenshot data
            if (window.WadiMain && window.WadiMain.startResearchProcess) {
                await window.WadiMain.startResearchProcess(screenshotData);
            }
            
        } catch (error) {
            console.error('Research failed:', error);
            
            // Show error in results panel instead of alert
            if (window.ResultsPanel) {
                const resultsPanel = new window.ResultsPanel();
                resultsPanel.show();
                resultsPanel.showError(error.message);
            }
            
            button.innerHTML = originalContent;
            button.style.pointerEvents = 'auto';
        }
    }
}

// Export for use in content script
if (typeof window !== 'undefined') {
    window.ScreenshotHandler = ScreenshotHandler;
}
}

console.log('🌊 Wadi Wadi ScreenshotHandler loaded');