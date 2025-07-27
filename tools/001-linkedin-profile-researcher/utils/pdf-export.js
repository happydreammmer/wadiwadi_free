if (!window.PDFExporter) {
class PDFExporter {
    constructor() {
        this.brandColors = {
            primary: '#0ea5e9',      // Wadi Blue
            secondary: '#f97316',    // Heritage Orange
            accent: '#fb923c',       // Sunset Coral
            light: '#f0f9ff',        // Sky Light
            dark: '#0c4a6e'          // Deep Sea
        };
    }

    async exportToPDF(results, profileData) {
        try {
            // Create a clean, printable version of the content
            const printContent = this.generatePrintableHTML(results, profileData);
            
            // Open print dialog with custom styles
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }

            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Wait for content to load then trigger print
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                
                // Close the window after printing (or if cancelled)
                setTimeout(() => {
                    printWindow.close();
                }, 1000);
            }, 500);

            return true;
        } catch (error) {
            console.error('PDF export failed:', error);
            throw error;
        }
    }

    generatePrintableHTML(results, profileData) {
        const currentReport = this.getCurrentReportContent(results);
        const timestamp = new Date().toLocaleString();
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Research Report - ${profileData?.name || 'Profile'}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
            color: ${this.brandColors.dark};
            background: white;
            font-size: 14px;
            margin: 0;
            padding: 0;
        }
        
        .header {
            background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.dark} 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin: 0 0 20px 0;
            page-break-after: avoid;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px 0;
        }
        
        .header .subtitle {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 400;
            margin: 0;
        }
        
        .header .tagline {
            font-size: 11px;
            opacity: 0.7;
            margin: 5px 0 0 0;
            font-style: italic;
        }
        
        .container {
            max-width: 100%;
            margin: 0;
            padding: 0 20px;
        }
        
        .profile-overview {
            background: ${this.brandColors.light};
            border-radius: 8px;
            padding: 15px;
            margin: 0 0 15px 0;
            border-left: 3px solid ${this.brandColors.primary};
            page-break-inside: avoid;
        }
        
        .profile-overview h2 {
            color: ${this.brandColors.dark};
            font-size: 16px;
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .profile-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .profile-item {
            background: white;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid rgba(14, 165, 233, 0.1);
        }
        
        .profile-item strong {
            color: ${this.brandColors.primary};
            font-weight: 600;
            display: block;
            margin-bottom: 3px;
            font-size: 12px;
        }
        
        .content-section {
            margin: 0 0 15px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid rgba(14, 165, 233, 0.1);
            page-break-inside: auto;
        }
        
        .content-section h2 {
            color: ${this.brandColors.dark};
            font-size: 16px;
            margin: 0 0 12px 0;
            padding-bottom: 6px;
            border-bottom: 2px solid ${this.brandColors.primary};
        }
        
        .content-section h3 {
            color: ${this.brandColors.dark};
            font-size: 14px;
            margin: 12px 0 6px 0;
            font-weight: 600;
            page-break-after: avoid;
        }
        
        .content-section h4 {
            color: ${this.brandColors.primary};
            font-size: 13px;
            margin: 10px 0 5px 0;
            font-weight: 600;
            page-break-after: avoid;
        }
        
        .content-section p {
            margin-bottom: 8px;
            line-height: 1.5;
            orphans: 2;
            widows: 2;
        }
        
        .content-section ul {
            margin: 8px 0;
            padding-left: 18px;
        }
        
        .content-section li {
            margin-bottom: 3px;
            line-height: 1.4;
        }
        
        .footer {
            background: ${this.brandColors.light};
            padding: 12px;
            text-align: center;
            border-radius: 6px;
            margin-top: 20px;
            border-top: 2px solid ${this.brandColors.secondary};
            page-break-inside: avoid;
        }
        
        .footer .timestamp {
            font-size: 10px;
            color: ${this.brandColors.dark};
            margin-bottom: 5px;
        }
        
        .footer .branding {
            font-size: 9px;
            color: #666;
        }
        
        .footer .wadi-link {
            color: ${this.brandColors.primary};
            text-decoration: none;
            font-weight: 600;
        }
        
        /* Print-specific styles */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                background: white !important;
                font-size: 11px !important;
                line-height: 1.3 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .header {
                background: ${this.brandColors.primary} !important;
                margin-bottom: 15px !important;
                padding: 15px !important;
                page-break-after: avoid !important;
            }
            
            .container {
                padding: 0 15px !important;
            }
            
            .profile-overview {
                page-break-inside: avoid !important;
                margin-bottom: 10px !important;
                padding: 12px !important;
            }
            
            .content-section {
                page-break-inside: auto !important;
                margin-bottom: 10px !important;
                padding: 12px !important;
            }
            
            .content-section h2 {
                page-break-after: avoid !important;
                margin-bottom: 8px !important;
            }
            
            .content-section h3 {
                page-break-after: avoid !important;
                margin: 8px 0 4px 0 !important;
            }
            
            .content-section h4 {
                page-break-after: avoid !important;
                margin: 6px 0 3px 0 !important;
            }
            
            .content-section p {
                margin-bottom: 6px !important;
                orphans: 3 !important;
                widows: 3 !important;
            }
            
            .footer {
                page-break-inside: avoid !important;
                margin-top: 15px !important;
                padding: 10px !important;
            }
            
            /* Avoid page breaks after headings */
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid !important;
            }
            
            /* Avoid page breaks inside these elements */
            p, li {
                page-break-inside: avoid !important;
            }
        }
        
        @page {
            margin: 0.75in;
            size: A4;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌊 Wadi Wadi LinkedIn Research Report</h1>
        <div class="subtitle">AI-Powered Professional Profile Analysis</div>
        <div class="tagline">Your ideas, flowing into reality with the power of AI</div>
    </div>
    
    <div class="container">
        ${profileData ? this.generateProfileSection(profileData) : ''}
        
        <div class="content-section">
            <h2>📊 Research Analysis</h2>
            ${currentReport}
        </div>
        
        <div class="footer">
            <div class="timestamp">📅 Generated on: ${timestamp}</div>
            <div class="branding">
                Powered by <a href="https://www.youtube.com/@wadiwadi_ai" class="wadi-link">Wadi Wadi</a> • 
                Building AI tools that empower everyone
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    generateProfileSection(profileData) {
        return `
        <div class="profile-overview">
            <h2>👤 Profile Overview</h2>
            <div class="profile-grid">
                ${profileData.name ? `<div class="profile-item"><strong>Name:</strong> ${profileData.name}</div>` : ''}
                ${profileData.headline ? `<div class="profile-item"><strong>Position:</strong> ${profileData.headline}</div>` : ''}
                ${profileData.location ? `<div class="profile-item"><strong>Location:</strong> ${profileData.location}</div>` : ''}
                ${profileData.connections ? `<div class="profile-item"><strong>Connections:</strong> ${profileData.connections}</div>` : ''}
            </div>
        </div>`;
    }

    getCurrentReportContent(results) {
        // Get the currently displayed report (English or Arabic)
        const enContent = document.getElementById('final-report-content-en');
        const arContent = document.getElementById('final-report-content-ar');
        
        let activeContent = '';
        
        if (enContent && enContent.style.display !== 'none') {
            activeContent = enContent.innerHTML;
        } else if (arContent && arContent.style.display !== 'none') {
            activeContent = arContent.innerHTML;
        } else if (results.finalReport) {
            activeContent = this.convertMarkdownToHTML(results.finalReport);
        } else {
            activeContent = '<p>No report content available.</p>';
        }
        
        return activeContent;
    }

    convertMarkdownToHTML(markdown) {
        if (!markdown) return '';
        
        return String(markdown)
            .replace(/#{4,}\s*(.*?)(?=\n|$)/g, '<h4>$1</h4>')
            .replace(/#{3}\s*(.*?)(?=\n|$)/g, '<h3>$1</h3>')
            .replace(/#{2}\s*(.*?)(?=\n|$)/g, '<h2>$1</h2>')
            .replace(/#{1}\s*(.*?)(?=\n|$)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }
}

// Export for use in content script
if (typeof window !== 'undefined') {
    window.PDFExporter = PDFExporter;
    console.log('🌊 Wadi Wadi PDFExporter loaded and available');
}
}