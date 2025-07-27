if (!window.ResultsPanel) {
class ResultsPanel {
    constructor() {
        this.panelId = 'linkedin-researcher-results-panel';
        this.isVisible = false;
        this.isCollapsed = false;
        this.currentResults = null;
    }

    create() {
        if (document.getElementById(this.panelId)) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = this.panelId;
        panel.className = 'linkedin-researcher-results';
        
        panel.style.cssText = `
            position: fixed;
            top: 200px;
            right: 20px;
            width: 420px;
            height: 580px;
            max-height: 580px;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(224, 224, 224, 0.8);
            border-radius: 20px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(20px);
            z-index: 9998;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            padding: 0;
            margin: 0;
        `;

        panel.innerHTML = `
            <div class="results-header" style="padding: 20px 24px; border-bottom: 1px solid rgba(224, 224, 224, 0.6); display: flex; justify-content: space-between; align-items: center; background: rgba(248, 249, 250, 0.8); border-radius: 20px 20px 0 0; flex-shrink: 0; margin: 0;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, ${window.WADI_COLORS.primary} 0%, ${window.WADI_COLORS.dark} 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">🌊</div>
                    <div>
                        <h3 style="margin: 0; font-size: 16px; color: ${window.WADI_COLORS.dark}; font-weight: 600;">Research Results</h3>
                    </div>
                    <button id="toggle-collapse" style="background: rgba(128, 128, 128, 0.1); border: none; cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                        <svg width="16" height="16" fill="currentColor" style="transform: rotate(0deg); transition: transform 0.3s ease;">
                            <path d="M8 10.5l-4-4 1.5-1.5L8 7.5l2.5-2.5L12 6.5z"/>
                        </svg>
                    </button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="export-copy" style="background: linear-gradient(135deg, ${window.WADI_COLORS.primary} 0%, ${window.WADI_COLORS.dark} 100%); color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);">Copy</button>
                    <button id="export-pdf" style="background: linear-gradient(135deg, ${window.WADI_COLORS.secondary} 0%, ${window.WADI_COLORS.accent} 100%); color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">PDF</button>
                    <button id="close-results" style="background: rgba(128, 128, 128, 0.1); border: none; cursor: pointer; padding: 8px; color: #666; font-size: 16px; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">×</button>
                </div>
            </div>
            <div class="results-content" style="padding: 24px; flex: 1; overflow-y: auto; overflow-x: hidden;">
                <div id="results-loading" style="text-align: center; padding: 40px; color: #666;">
                    <div style="margin-bottom: 20px;">
                        <div style="width: 40px; height: 40px; border: 3px solid rgba(240, 240, 240, 0.8); border-top: 3px solid #0a66c2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                    <p style="margin: 0; font-size: 14px; color: #555;">Analyzing profile and conducting research...</p>
                </div>
                <div id="results-content" style="display: none;">
                    <!-- Results will be populated here -->
                </div>
                <div id="results-error" style="display: none; text-align: center; padding: 40px; color: #d73027;">
                    <p>Research failed. Please try again.</p>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.attachEventListeners();
        return panel;
    }

    show() {
        const panel = document.getElementById(this.panelId) || this.create();
        
        // Adjust position based on whether progress panel is visible
        const progressPanel = document.getElementById('linkedin-researcher-progress');
        if (progressPanel && progressPanel.style.display !== 'none') {
            // Calculate position: progress panel (60px) + panel height (~140px) + minimal gap (3px - 75% reduction)
            panel.style.top = '203px'; // Position below progress panel with 75% reduced gap
        } else {
            panel.style.top = '60px'; // Match progress panel position
        }
        
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        this.isVisible = true;
        this.showLoading();
    }

    hide() {
        const panel = document.getElementById(this.panelId);
        if (panel) {
            panel.style.display = 'none';
        }
        this.isVisible = false;
    }

    showLoading() {
        this.showSection('results-loading');
    }

    showResults(results) {
        const contentDiv = document.getElementById('results-content');
        if (contentDiv) {
            this.currentResults = results;
            contentDiv.innerHTML = this.formatResults(results);
            this.showSection('results-content');
            
            // Re-attach language switch event listeners after content is loaded
            setTimeout(() => {
                this.attachLanguageSwitchListeners();
            }, 100);
        }
    }

    showCachedResults(results) {
        const contentDiv = document.getElementById('results-content');
        if (contentDiv) {
            this.currentResults = results;
            
            // Add cache notification banner
            const cacheNotification = this.createCacheNotification(results);
            contentDiv.innerHTML = cacheNotification + this.formatResults(results);
            this.showSection('results-content');
            
            // Re-attach language switch event listeners after content is loaded
            setTimeout(() => {
                this.attachLanguageSwitchListeners();
            }, 100);
        }
    }

    createCacheNotification(results) {
        const age = Date.now() - results.timestamp;
        const ageText = window.WadiUtils.formatTimeAgo(age);
        const accessCount = results.accessCount || 1;
        
        return `
            <div style="margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 10px; border-left: 4px solid #2196f3; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 6px rgba(33,150,243,0.1);">
                <svg width="20" height="20" fill="#2196f3" viewBox="0 0 24 24">
                    <path d="M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16M12,10.5A1.5,1.5 0 0,1 13.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,12A1.5,1.5 0 0,1 12,10.5Z"/>
                </svg>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1565c0; font-size: 13px; margin-bottom: 2px;">
                        📁 Cached Results Loaded
                    </div>
                    <div style="font-size: 12px; color: #1976d2; opacity: 0.8;">
                        Generated ${ageText} • Accessed ${accessCount} time${accessCount !== 1 ? 's' : ''}
                    </div>
                </div>
                <button onclick="this.parentElement.style.display='none'" style="background: rgba(255,255,255,0.8); border: 1px solid rgba(33,150,243,0.3); color: #1565c0; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500;">
                    Dismiss
                </button>
            </div>
        `;
    }

    showError(error) {
        const errorDiv = document.getElementById('results-error');
        if (errorDiv) {
            errorDiv.innerHTML = `
                <div style="color: #d73027; text-align: center; padding: 20px;">
                    <p style="font-weight: 500; margin-bottom: 8px;">Research Failed</p>
                    <p style="font-size: 14px; margin: 0;">${error}</p>
                </div>
            `;
            this.showSection('results-error');
        }
    }

    showSection(sectionId) {
        ['results-loading', 'results-content', 'results-error'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = id === sectionId ? 'block' : 'none';
            }
        });
    }

    formatResults(results) {
        if (!results) return '<p>No results available.</p>';

        let html = '';

        if (results.profileData) {
            const profile = results.profileData;
            html += `
                <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border-left: 4px solid #0a66c2; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" fill="#0a66c2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Profile Overview
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                        ${profile.name ? `<div style="padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;"><strong style="color: #0a66c2;">Name:</strong><br>${profile.name}</div>` : ''}
                        ${profile.headline ? `<div style="padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;"><strong style="color: #0a66c2;">Title:</strong><br>${profile.headline}</div>` : ''}
                        ${profile.location ? `<div style="padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;"><strong style="color: #0a66c2;">Location:</strong><br>${profile.location}</div>` : ''}
                        ${profile.connections ? `<div style="padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;"><strong style="color: #0a66c2;">Connections:</strong><br>${profile.connections}</div>` : ''}
                    </div>
                </div>
            `;
        }

        if (results.summary) {
            html += `
                <div style="margin-bottom: 20px; padding: 18px; background: #fff; border-radius: 10px; border: 1px solid #e1e5e9; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                    <h4 style="margin: 0 0 14px 0; color: #1a1a1a; font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" fill="#28a745" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        Executive Summary
                    </h4>
                    <div style="font-size: 14px; line-height: 1.6; color: #333;">${window.WadiUtils.formatTextForHTML(results.summary)}</div>
                </div>
            `;
        }

        if (results.finalReport) {
            html += `
                <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #fff3cd 0%, #fef7e0 100%); border-radius: 12px; border-left: 4px solid #ffc107; box-shadow: 0 3px 10px rgba(255,193,7,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h4 style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                            <svg width="22" height="22" fill="#ffc107" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>
                            Final Report
                        </h4>
                        <div id="language-switch" style="display: flex; background: rgba(255,255,255,0.8); border-radius: 20px; padding: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <button id="lang-en" class="lang-btn active" style="padding: 6px 12px; border: none; background: linear-gradient(135deg, ${window.WADI_COLORS.primary} 0%, ${window.WADI_COLORS.dark} 100%); color: white; border-radius: 18px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(14, 165, 233, 0.3);">English</button>
                            <button id="lang-ar" class="lang-btn" style="padding: 6px 12px; border: none; background: transparent; color: #666; border-radius: 18px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease;">العربية</button>
                        </div>
                    </div>
                    <div id="final-report-content-en" style="font-size: 14px; line-height: 1.6; color: #333;">${window.WadiUtils.formatTextForHTML(results.finalReport)}</div>
                    <div id="final-report-content-ar" style="font-size: 14px; line-height: 1.6; color: #333; direction: rtl; text-align: right; display: none;">Loading Arabic version...</div>
                </div>
            `;
        }

        if (results.timestamp) {
            const date = new Date(results.timestamp);
            html += `
                <div style="margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-top: 3px solid #6c757d; font-size: 12px; color: #666; text-align: center;">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;"><path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/></svg>
                    Generated on: ${date.toLocaleString()}
                </div>
            `;
        }

        return html || '<p>No research data available.</p>';
    }

    attachEventListeners() {
        document.getElementById('close-results')?.addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('toggle-collapse')?.addEventListener('click', () => {
            this.toggleCollapse();
        });

        document.getElementById('export-copy')?.addEventListener('click', () => {
            this.exportToClipboard();
        });

        document.getElementById('export-pdf')?.addEventListener('click', () => {
            this.exportToPDF();
        });
    }

    attachLanguageSwitchListeners() {
        // Language switch functionality
        const enBtn = document.getElementById('lang-en');
        const arBtn = document.getElementById('lang-ar');
        
        if (enBtn) {
            enBtn.addEventListener('click', () => {
                console.log('English button clicked');
                this.switchLanguage('en');
            });
        }

        if (arBtn) {
            arBtn.addEventListener('click', () => {
                console.log('Arabic button clicked');
                this.switchLanguage('ar');
            });
        }
    }

    toggleCollapse() {
        const content = document.querySelector('.results-content');
        const toggleBtn = document.getElementById('toggle-collapse');
        const panel = document.getElementById(this.panelId);
        
        if (content && toggleBtn && panel) {
            this.isCollapsed = !this.isCollapsed;
            
            if (this.isCollapsed) {
                // Hide content and shrink panel to header only
                content.style.display = 'none';
                panel.style.height = 'auto';
                panel.style.minHeight = 'auto';
                toggleBtn.querySelector('svg').style.transform = 'rotate(-90deg)';
            } else {
                // Show content and restore full panel height
                content.style.display = 'block';
                panel.style.height = '580px';
                panel.style.minHeight = '580px';
                toggleBtn.querySelector('svg').style.transform = 'rotate(0deg)';
            }
        }
    }

    async exportToClipboard() {
        const contentDiv = document.getElementById('results-content');
        if (!contentDiv) return;

        try {
            const text = contentDiv.innerText;
            await navigator.clipboard.writeText(text);
            
            const btn = document.getElementById('export-copy');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = `linear-gradient(135deg, ${window.WADI_COLORS.accent} 0%, ${window.WADI_COLORS.secondary} 100%)`;
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = `linear-gradient(135deg, ${window.WADI_COLORS.primary} 0%, ${window.WADI_COLORS.dark} 100%)`;
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Failed to copy to clipboard');
        }
    }

    async exportToPDF() {
        try {
            const btn = document.getElementById('export-pdf');
            const originalText = btn.textContent;
            btn.textContent = 'Generating...';
            btn.disabled = true;

            // Use the PDF exporter utility
            if (!window.PDFExporter) {
                throw new Error('PDF exporter is not available. Please reload the page and try again.');
            }

            if (typeof window.PDFExporter !== 'function') {
                throw new Error('PDF exporter is not properly initialized. Please reload the page and try again.');
            }

            const pdfExporter = new window.PDFExporter();
            const results = this.currentResults || {};
            const profileData = results.profileData || {};

            await pdfExporter.exportToPDF(results, profileData);

            btn.textContent = 'PDF Generated!';
            btn.style.background = `linear-gradient(135deg, ${window.WADI_COLORS.accent} 0%, ${window.WADI_COLORS.secondary} 100%)`;
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = `linear-gradient(135deg, #057642 0%, #004a2f 100%)`;
                btn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('PDF export failed:', error);
            
            const btn = document.getElementById('export-pdf');
            btn.textContent = 'Error';
            btn.style.background = '#dc2626';
            
            setTimeout(() => {
                btn.textContent = 'PDF';
                btn.style.background = `linear-gradient(135deg, #057642 0%, #004a2f 100%)`;
                btn.disabled = false;
            }, 2000);
            
            // Show user-friendly error message
            this.showNotification('PDF export failed. Please try again or check your browser settings.', 'error');
        }
    }


    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc2626' : window.WADI_COLORS.primary};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            z-index: 10002;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    switchLanguage(lang) {
        console.log('switchLanguage called with:', lang);
        
        const enBtn = document.getElementById('lang-en');
        const arBtn = document.getElementById('lang-ar');
        const enContent = document.getElementById('final-report-content-en');
        const arContent = document.getElementById('final-report-content-ar');

        console.log('Elements found:', {
            enBtn: !!enBtn,
            arBtn: !!arBtn, 
            enContent: !!enContent,
            arContent: !!arContent,
            arabicReport: !!this.currentResults?.arabicFinalReport
        });

        if (!enBtn || !arBtn || !enContent || !arContent) {
            console.log('Missing required elements for language switch');
            return;
        }

        if (lang === 'en') {
            enBtn.style.background = `linear-gradient(135deg, ${window.WADI_COLORS.primary} 0%, ${window.WADI_COLORS.dark} 100%)`;
            enBtn.style.color = 'white';
            enBtn.style.boxShadow = '0 2px 6px rgba(14, 165, 233, 0.3)';
            enBtn.classList.add('active');
            arBtn.style.background = 'transparent';
            arBtn.style.color = '#666';
            arBtn.style.boxShadow = 'none';
            arBtn.classList.remove('active');
            enContent.style.display = 'block';
            arContent.style.display = 'none';
            console.log('Switched to English');
        } else {
            arBtn.style.background = `linear-gradient(135deg, ${window.WADI_COLORS.secondary} 0%, ${window.WADI_COLORS.accent} 100%)`;
            arBtn.style.color = 'white';
            arBtn.style.boxShadow = '0 2px 6px rgba(249, 115, 22, 0.3)';
            arBtn.classList.add('active');
            enBtn.style.background = 'transparent';
            enBtn.style.color = '#666';
            enBtn.style.boxShadow = 'none';
            enBtn.classList.remove('active');
            enContent.style.display = 'none';
            arContent.style.display = 'block';

            // Load Arabic content if not already loaded
            if (arContent.textContent === 'Loading Arabic version...' && this.currentResults?.arabicFinalReport) {
                console.log('Loading Arabic content...');
                arContent.innerHTML = window.WadiUtils.formatTextForHTML(this.currentResults.arabicFinalReport);
            } else {
                console.log('Arabic content already loaded or no report available');
            }
            console.log('Switched to Arabic');
        }
    }
}

// Export for use in content script
if (typeof window !== 'undefined') {
    window.ResultsPanel = ResultsPanel;
}
}

console.log('🌊 Wadi Wadi ResultsPanel loaded');