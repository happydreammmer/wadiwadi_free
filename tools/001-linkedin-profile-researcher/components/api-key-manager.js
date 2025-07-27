if (!window.ApiKeyManager) {
class ApiKeyManager {
    constructor() {
        this.modalId = 'wadi-linkedin-researcher-api-modal';
        this.brandColors = {
            primary: '#0ea5e9',      // Wadi Blue
            secondary: '#f97316',    // Heritage Orange
            accent: '#fb923c',       // Sunset Coral
            light: '#f0f9ff',        // Sky Light
            dark: '#0c4a6e'          // Deep Sea
        };
        this.storageManager = null;
    }

    // Get storage manager instance (lazy initialization)
    async getStorageManager() {
        if (!this.storageManager) {
            if (!window.WadiStorageManager) {
                console.error('WadiStorageManager not available - check loading order');
                throw new Error('Storage manager not available');
            }
            this.storageManager = new window.WadiStorageManager();
        }
        return this.storageManager;
    }

    // Load script helper
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(src);
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Show API key input modal
    async showApiKeyModal() {
        // Check if modal already exists
        if (document.getElementById(this.modalId)) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = this.modalId;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        modal.innerHTML = this.getModalHTML();
        document.body.appendChild(modal);

        this.attachModalEventListeners();
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('gemini-api-key-input');
            if (input) input.focus();
        }, 100);

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    // Get modal HTML
    getModalHTML() {
        return `
            <div style="background: white; border-radius: 12px; padding: 24px; width: 480px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; color: #1a1a1a; font-weight: 600;">Gemini API Key Required</h3>
                    <button id="close-api-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">×</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0 0 16px 0; color: #333; line-height: 1.5;">
                        To use the LinkedIn Profile Researcher, you need to provide your Gemini API key. 
                        Your key is stored locally and never shared.
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1a1a1a;">How to get your API key:</h4>
                        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #555; line-height: 1.4;">
                            <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #0a66c2;">Google AI Studio</a></li>
                            <li>Sign in with your Google account</li>
                            <li>Click "Create API Key"</li>
                            <li>Copy the generated key and paste it below</li>
                        </ol>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label for="gemini-api-key-input" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">API Key:</label>
                    <input 
                        type="password" 
                        id="gemini-api-key-input" 
                        placeholder="Enter your Gemini API key (starts with AIza...)"
                        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; font-family: monospace;"
                    >
                    <div style="display: flex; align-items: center; margin-top: 8px;">
                        <input type="checkbox" id="show-api-key" style="margin-right: 8px;">
                        <label for="show-api-key" style="font-size: 13px; color: #666; cursor: pointer;">Show API key</label>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-api-key" style="background: #f5f5f5; color: #333; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">Cancel</button>
                    <button id="save-api-key" style="background: #0a66c2; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">Save & Continue</button>
                </div>

                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
                    <strong>Privacy:</strong> Your API key is stored locally in your browser and is never transmitted to any servers other than Google's Gemini API.
                </div>
            </div>
        `;
    }

    // Attach modal event listeners
    attachModalEventListeners() {
        // Close modal
        document.getElementById('close-api-modal')?.addEventListener('click', () => {
            this.closeModal(null);
        });

        document.getElementById('cancel-api-key')?.addEventListener('click', () => {
            this.closeModal(null);
        });

        // Show/hide API key
        document.getElementById('show-api-key')?.addEventListener('change', (e) => {
            const input = document.getElementById('gemini-api-key-input');
            if (input) {
                input.type = e.target.checked ? 'text' : 'password';
            }
        });

        // Save API key
        document.getElementById('save-api-key')?.addEventListener('click', () => {
            this.saveApiKey();
        });

        // Enter key to save
        document.getElementById('gemini-api-key-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        // Click outside to close
        document.getElementById(this.modalId)?.addEventListener('click', (e) => {
            if (e.target.id === this.modalId) {
                this.closeModal(null);
            }
        });
    }

    // Save API key
    async saveApiKey() {
        const input = document.getElementById('gemini-api-key-input');
        const saveBtn = document.getElementById('save-api-key');
        
        if (!input || !saveBtn) return;

        const apiKey = input.value.trim();

        // Validate API key format
        if (!this.validateApiKey(apiKey)) {
            this.showError('Please enter a valid Gemini API key (should start with "AIza")');
            return;
        }

        // Update button to show saving state
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const storageManager = await this.getStorageManager();
            await storageManager.saveApiKey(apiKey);
            this.closeModal(apiKey);
        } catch (error) {
            console.error('Failed to save API key:', error);
            this.showError('Failed to save API key. Please try again.');
            
            // Reset button
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }

    // Validate API key format
    validateApiKey(apiKey) {
        // Basic validation - Gemini API keys typically start with "AIza"
        return apiKey && apiKey.length > 20 && apiKey.startsWith('AIza');
    }

    // Show error message
    showError(message) {
        // Remove existing error
        const existingError = document.getElementById('api-key-error');
        if (existingError) {
            existingError.remove();
        }

        const input = document.getElementById('gemini-api-key-input');
        if (!input) return;

        const error = document.createElement('div');
        error.id = 'api-key-error';
        error.style.cssText = `
            color: #d73027;
            font-size: 13px;
            margin-top: 8px;
            padding: 8px;
            background: #fff5f5;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
        `;
        error.textContent = message;

        input.parentNode.appendChild(error);
        input.style.borderColor = '#d73027';

        // Reset border color after 3 seconds
        setTimeout(() => {
            input.style.borderColor = '#ddd';
            if (error.parentNode) {
                error.remove();
            }
        }, 3000);
    }

    // Close modal
    closeModal(apiKey) {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.remove();
        }

        if (this.resolvePromise) {
            this.resolvePromise(apiKey);
        }
    }

    // Check if API key exists
    async hasApiKey() {
        const storageManager = await this.getStorageManager();
        const apiKey = await storageManager.loadApiKey();
        return !!apiKey;
    }

    // Get API key (show modal if not exists)
    async getApiKey() {
        const storageManager = await this.getStorageManager();
        let apiKey = await storageManager.loadApiKey();
        
        if (!apiKey) {
            apiKey = await this.showApiKeyModal();
        }

        return apiKey;
    }

    // Clear API key
    async clearApiKey() {
        const confirmed = confirm('Are you sure you want to remove your API key? You will need to enter it again to use the extension.');
        
        if (confirmed) {
            const storageManager = await this.getStorageManager();
            await storageManager.clearApiKey();
            alert('API key removed successfully.');
        }
    }

    // Show API key management options
    showApiKeyOptions() {
        const options = document.createElement('div');
        options.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            padding: 20px;
            min-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        options.innerHTML = `
            <h3 style="margin: 0 0 16px 0; font-size: 16px;">API Key Management</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button id="update-api-key" style="background: #0a66c2; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Update API Key</button>
                <button id="remove-api-key" style="background: #d73027; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Remove API Key</button>
                <button id="close-options" style="background: #f5f5f5; color: #333; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
        `;

        document.body.appendChild(options);

        // Event listeners
        document.getElementById('update-api-key')?.addEventListener('click', async () => {
            options.remove();
            await this.showApiKeyModal();
        });

        document.getElementById('remove-api-key')?.addEventListener('click', async () => {
            options.remove();
            await this.clearApiKey();
        });

        document.getElementById('close-options')?.addEventListener('click', () => {
            options.remove();
        });
    }
}

// Export for use in content script
try {
    window.ApiKeyManager = ApiKeyManager;
    console.log('ApiKeyManager class exported successfully');
} catch (error) {
    console.error('Failed to export ApiKeyManager:', error);
}
}