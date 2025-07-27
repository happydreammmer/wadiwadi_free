if (!window.ProgressPanel) {
class ProgressPanel {
    constructor() {
        this.panelId = 'linkedin-researcher-progress';
    }

    create() {
        if (document.getElementById(this.panelId)) return;

        const panel = document.createElement('div');
        panel.id = this.panelId;
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 320px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(224, 224, 224, 0.8);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            backdrop-filter: blur(20px);
            z-index: 9999;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 28px; height: 28px; background: linear-gradient(135deg, ${window.WADI_COLORS.primary} 0%, ${window.WADI_COLORS.dark} 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🌊</div>
                    <div>
                        <h3 style="margin: 0; font-size: 16px; color: ${window.WADI_COLORS.dark}; font-weight: 600;">Research Progress</h3>
                        <p style="margin: 0; font-size: 10px; color: #666; font-weight: 400;">Wadi Wadi AI</p>
                    </div>
                </div>
                <button id="close-progress" style="background: rgba(128, 128, 128, 0.1); border: none; font-size: 16px; cursor: pointer; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #666; transition: all 0.2s ease;">×</button>
            </div>
            <div id="progress-bar-container" style="background: rgba(224, 224, 224, 0.6); border-radius: 8px; height: 6px; margin-bottom: 16px; overflow: hidden;">
                <div id="progress-bar" style="background: linear-gradient(90deg, ${window.WADI_COLORS.primary} 0%, ${window.WADI_COLORS.dark} 100%); height: 100%; border-radius: 8px; width: 0%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
            </div>
            <div id="progress-status" style="font-size: 14px; color: #555; line-height: 1.4;">Initializing...</div>
        `;

        document.body.appendChild(panel);

        const closeBtn = document.getElementById('close-progress');
        closeBtn.addEventListener('click', () => {
            panel.remove();
        });
        
        // Add hover effects
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(128, 128, 128, 0.2)';
            closeBtn.style.color = '#333';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(128, 128, 128, 0.1)';
            closeBtn.style.color = '#666';
        });

        return panel;
    }

    show() {
        const panel = document.getElementById(this.panelId) || this.create();
        panel.style.display = 'block';
    }

    hide() {
        const panel = document.getElementById(this.panelId);
        if (panel) {
            panel.style.display = 'none';
        }
    }

    remove() {
        const panel = document.getElementById(this.panelId);
        if (panel) {
            panel.remove();
        }
    }

    updateProgress(message, percentage) {
        const progressBar = document.getElementById('progress-bar');
        const progressStatus = document.getElementById('progress-status');
        
        if (progressBar) progressBar.style.width = percentage + '%';
        if (progressStatus) progressStatus.textContent = message;
    }
}

// Export for use in content script
if (typeof window !== 'undefined') {
    window.ProgressPanel = ProgressPanel;
}
}

console.log('🌊 Wadi Wadi ProgressPanel loaded');