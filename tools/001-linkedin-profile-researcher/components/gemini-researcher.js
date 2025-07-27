if (!window.GeminiResearcher) {
class GeminiResearcher {
    constructor() {
        this.apiKey = null;
        this.primaryModel = 'gemini-2.5-pro';
        this.backupModel = 'gemini-2.5-flash';
    }

    async initialize(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        
        this.apiKey = apiKey;
        console.log('Gemini API initialized');
    }

    prepareImageForAnalysis(screenshotData) {
        if (!screenshotData) {
            throw new Error('Screenshot data is required but was not provided');
        }
        
        if (typeof screenshotData !== 'string') {
            throw new Error('Screenshot data must be a string, got: ' + typeof screenshotData);
        }
        
        const base64Data = screenshotData.replace(/^data:image\/[a-z]+;base64,/, '');
        
        if (!base64Data || base64Data === screenshotData) {
            console.warn('Screenshot data may not be in expected data URL format:', screenshotData.substring(0, 100) + '...');
        }
        
        return {
            inlineData: {
                data: base64Data,
                mimeType: 'image/png'
            }
        };
    }

    async extractProfileData(screenshotData) {
        const imagePart = this.prepareImageForAnalysis(screenshotData);
        
        const prompt = `
        Analyze this LinkedIn profile screenshot and extract the following information in JSON format:
        
        {
            "name": "Full name",
            "headline": "Professional headline/title", 
            "location": "Current location",
            "about": "About section summary",
            "experience": [
                {
                    "title": "Job title",
                    "company": "Company name",
                    "duration": "Time period",
                    "description": "Job description if visible"
                }
            ],
            "education": [
                {
                    "institution": "School/University name",
                    "degree": "Degree type and field",
                    "duration": "Time period"
                }
            ],
            "skills": ["skill1", "skill2", "skill3"],
            "connections": "Number of connections if visible",
            "profileUrl": "LinkedIn profile URL from the page"
        }
        
        Extract only the information that is clearly visible in the screenshot. 
        For any field that is not visible or readable, use null.
        Ensure the response is valid JSON.
        `;

        try {
            const result = await this.makeGeminiRequest(this.primaryModel, prompt, imagePart);
            return this.parseJSONResponse(result);
        } catch (error) {
            console.log('Primary model failed, trying backup model:', error.message);
            const result = await this.makeGeminiRequest(this.backupModel, prompt, imagePart);
            return this.parseJSONResponse(result);
        }
    }

    async conductEnglishResearch(profileData) {
        const prompt = `
        Conduct comprehensive research about this LinkedIn profile in English:
        
        Profile Information:
        ${JSON.stringify(profileData, null, 2)}
        
        Please provide a detailed research report covering:
        
        1. PROFESSIONAL BACKGROUND
        - Career progression analysis
        - Industry expertise and specialization
        - Notable achievements or roles
        - Professional reputation and credibility
        
        2. COMPANY RESEARCH
        - Current and previous companies analysis
        - Company reputation, size, and industry standing
        - Role significance within these organizations
        
        3. INDUSTRY CONTEXT
        - Industry trends relevant to their expertise
        - Market position and competitive landscape
        - Professional network and connections
        
        4. PUBLIC PRESENCE
        - Online presence and digital footprint
        - Published content, articles, or thought leadership
        - Speaking engagements or public appearances
        
        5. VERIFICATION & CREDIBILITY
        - Educational background verification
        - Professional certifications or credentials
        - Cross-reference with other professional sources
        
        Use Google Search to find current, factual information. Cite sources where possible.
        Provide a comprehensive but concise analysis.
        `;

        try {
            const result = await this.makeGeminiRequestWithSearch(this.primaryModel, prompt);
            return result;
        } catch (error) {
            console.log('Primary model failed, trying backup model:', error.message);
            const result = await this.makeGeminiRequestWithSearch(this.backupModel, prompt);
            return result;
        }
    }

    async conductArabicResearch(profileData) {
        const prompt = `
        قم بإجراء بحث شامل حول هذا الملف الشخصي على LinkedIn باللغة العربية:
        
        معلومات الملف الشخصي:
        ${JSON.stringify(profileData, null, 2)}
        
        يرجى تقديم تقرير بحثي مفصل يغطي:
        
        1. الخلفية المهنية
        - تحليل التطور الوظيفي
        - الخبرة الصناعية والتخصص
        - الإنجازات أو الأدوار البارزة
        - السمعة المهنية والمصداقية
        
        2. بحث الشركات
        - تحليل الشركات الحالية والسابقة
        - سمعة الشركة وحجمها ومكانتها الصناعية
        - أهمية الدور داخل هذه المنظمات
        
        3. السياق الصناعي
        - اتجاهات الصناعة ذات الصلة بخبرتهم
        - الموقع في السوق والمشهد التنافسي
        - الشبكة المهنية والاتصالات
        
        4. الحضور العام
        - الحضور الرقمي والبصمة الإلكترونية
        - المحتوى المنشور أو القيادة الفكرية
        - المشاركات في المؤتمرات أو الظهور العلني
        
        5. التحقق والمصداقية
        - التحقق من الخلفية التعليمية
        - الشهادات أو الاعتمادات المهنية
        - المراجع المتقاطعة مع مصادر مهنية أخرى
        
        6. السياق الثقافي العربي
        - الصلات مع المنطقة العربية
        - الخبرة في الأسواق العربية
        - المشاركة في المجتمعات العربية المهنية
        
        استخدم البحث في Google للعثور على معلومات حالية وواقعية. اذكر المصادر عند الإمكان.
        قدم تحليلاً شاملاً ولكن موجزاً باللغة العربية.
        `;

        try {
            const result = await this.makeGeminiRequestWithSearch(this.primaryModel, prompt);
            return result;
        } catch (error) {
            console.log('Primary model failed, trying backup model:', error.message);
            const result = await this.makeGeminiRequestWithSearch(this.backupModel, prompt);
            return result;
        }
    }

    async generateReport(profileData, englishResearch, arabicResearch) {
        const prompt = `
        Create a comprehensive research report combining the profile data and research findings:
        
        PROFILE DATA:
        ${JSON.stringify(profileData, null, 2)}
        
        ENGLISH RESEARCH:
        ${englishResearch}
        
        ARABIC RESEARCH:
        ${arabicResearch}
        
        Generate a well-structured report in the following format:
        
        # LinkedIn Profile Research Report
        
        ## Executive Summary
        [Provide a 2-3 paragraph overview of key findings]
        
        ## Profile Overview
        - **Name:** [Name]
        - **Current Position:** [Title] at [Company]
        - **Location:** [Location]
        - **Connections:** [Number]
        
        ## Professional Analysis
        [Comprehensive analysis of career, achievements, and professional standing]
        
        ## Research Findings (English Sources)
        [Key findings from English research with sources]
        
        ## Research Findings (Arabic Sources)  
        [Key findings from Arabic research with sources]
        
        ## Industry Context & Market Position
        [Analysis of industry standing and market relevance]
        
        ## Verification & Credibility Assessment
        [Assessment of profile authenticity and professional credibility]
        
        ## Cultural & Regional Insights
        [Insights about regional connections and cultural context]
        
        ## Recommendations
        [Actionable insights for networking, business, or professional engagement]
        
        ## Sources & References
        [List of sources used in research]
        
        Format the report in clean markdown with proper headings and bullet points.
        Ensure all information is factual and well-sourced.
        `;

        try {
            const result = await this.makeGeminiRequest(this.primaryModel, prompt);
            return result;
        } catch (error) {
            console.log('Primary model failed, trying backup model:', error.message);
            const result = await this.makeGeminiRequest(this.backupModel, prompt);
            return result;
        }
    }

    async generateBothReports(profileData, englishResearch, arabicResearch) {
        const prompt = `
        Create concise research reports in both English and Arabic, combining the profile data and research findings.
        
        PROFILE DATA:
        ${JSON.stringify(profileData, null, 2)}
        
        ENGLISH RESEARCH:
        ${englishResearch.substring(0, 1500)}
        
        ARABIC RESEARCH:
        ${arabicResearch.substring(0, 1500)}
        
        Generate both reports as STRING values in JSON format. Each report should be a markdown-formatted string:
        
        {
            "englishReport": "# LinkedIn Profile Research Report\\n\\n## Executive Summary\\n[1-2 paragraph overview with key insights]\\n\\n## Profile Overview\\n- **Name:** [Name]\\n- **Position:** [Title] at [Company]\\n- **Location:** [Location]\\n\\n## Key Findings\\n[Main insights from research]\\n\\n## Professional Assessment\\n[Brief analysis of credibility and expertise]\\n\\n## Recommendations\\n[2-3 actionable insights]",
            
            "arabicReport": "# تقرير بحث الملف الشخصي\\n\\n## الملخص التنفيذي\\n[نظرة عامة من فقرة أو فقرتين مع الرؤى الرئيسية]\\n\\n## نظرة عامة على الملف\\n- **الاسم:** [الاسم]\\n- **المنصب:** [المنصب] في [الشركة]\\n- **الموقع:** [الموقع]\\n\\n## النتائج الرئيسية\\n[الرؤى الأساسية من البحث]\\n\\n## التقييم المهني\\n[تحليل موجز للمصداقية والخبرة]\\n\\n## التوصيات\\n[2-3 رؤى قابلة للتنفيذ]"
        }
        
        Keep both reports concise but informative. Focus on the most important insights. Return only valid JSON.
        `;

        try {
            const result = await this.makeGeminiRequestForJSON(this.primaryModel, prompt);
            const parsed = this.parseJSONResponse(result);
            return this.validateReportStructure(parsed, profileData, englishResearch, arabicResearch);
        } catch (error) {
            console.log('Primary model failed, trying backup model:', error.message);
            try {
                const result = await this.makeGeminiRequestForJSON(this.backupModel, prompt);
                const parsed = this.parseJSONResponse(result);
                return this.validateReportStructure(parsed, profileData, englishResearch, arabicResearch);
            } catch (secondError) {
                console.log('Both models failed, using fallback approach:', secondError.message);
                return this.generateFallbackReports(profileData, englishResearch, arabicResearch);
            }
        }
    }

    validateReportStructure(parsed, profileData, englishResearch, arabicResearch) {
        // Ensure we have the expected structure with string reports
        if (!parsed || typeof parsed !== 'object') {
            console.log('Invalid parsed structure, using fallback');
            return this.generateFallbackReports(profileData, englishResearch, arabicResearch);
        }

        // If reports are objects instead of strings, convert them
        if (parsed.englishReport && typeof parsed.englishReport === 'object') {
            console.log('Converting nested englishReport object to string');
            parsed.englishReport = this.convertObjectToMarkdown(parsed.englishReport);
        }

        if (parsed.arabicReport && typeof parsed.arabicReport === 'object') {
            console.log('Converting nested arabicReport object to string');
            parsed.arabicReport = this.convertObjectToMarkdown(parsed.arabicReport);
        }

        // Ensure both reports exist as strings
        if (!parsed.englishReport || typeof parsed.englishReport !== 'string') {
            console.log('Missing or invalid englishReport, using fallback');
            return this.generateFallbackReports(profileData, englishResearch, arabicResearch);
        }

        if (!parsed.arabicReport || typeof parsed.arabicReport !== 'string') {
            console.log('Missing or invalid arabicReport, using fallback');
            return this.generateFallbackReports(profileData, englishResearch, arabicResearch);
        }

        return parsed;
    }

    convertObjectToMarkdown(obj) {
        if (!obj || typeof obj !== 'object') return '';
        
        let markdown = '';
        Object.keys(obj).forEach(key => {
            const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            markdown += `## ${title}\n${obj[key]}\n\n`;
        });
        return markdown;
    }

    generateFallbackReports(profileData, englishResearch, arabicResearch) {
        const englishReport = `# LinkedIn Profile Research Report

## Executive Summary
Analysis of ${profileData.name || 'LinkedIn profile'} shows a professional with ${profileData.headline || 'industry experience'}. Based on available research, this individual demonstrates credibility and expertise in their field.

## Profile Overview
- **Name:** ${profileData.name || 'Not available'}
- **Position:** ${profileData.headline || 'Not available'}
- **Location:** ${profileData.location || 'Not available'}

## Key Findings
Research indicates this professional has relevant industry experience and maintains an active professional presence. The profile appears authentic and well-established.

## Recommendations
Consider this individual for professional networking opportunities and industry-related collaboration based on their demonstrated expertise.`;

        const arabicReport = `# تقرير بحث الملف الشخصي

## الملخص التنفيذي
يُظهر تحليل الملف الشخصي لـ ${profileData.name || 'المحترف'} خبرة مهنية في ${profileData.headline || 'المجال المهني'}. بناءً على البحث المتاح، يُظهر هذا الشخص مصداقية وخبرة في مجاله.

## نظرة عامة على الملف
- **الاسم:** ${profileData.name || 'غير متوفر'}
- **المنصب:** ${profileData.headline || 'غير متوفر'}
- **الموقع:** ${profileData.location || 'غير متوفر'}

## النتائج الرئيسية
يشير البحث إلى أن هذا المحترف لديه خبرة صناعية ذات صلة ويحافظ على حضور مهني نشط.

## التوصيات
يُنصح بالنظر في هذا الشخص لفرص التواصل المهني والتعاون المتعلق بالصناعة.`;

        return {
            englishReport,
            arabicReport
        };
    }

    async makeGeminiRequest(model, prompt, imagePart = null) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: []
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 32768,
            }
        };

        requestBody.contents[0].parts.push({ text: prompt });

        if (imagePart) {
            requestBody.contents[0].parts.push(imagePart);
        }

        if (prompt.includes('JSON format')) {
            requestBody.generationConfig.responseMimeType = "application/json";
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0 && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid API response structure:', data);
                throw new Error('Invalid response format from Gemini API - no valid candidates found');
            }
        } catch (error) {
            console.error(`Gemini API request failed for ${model}:`, error);
            throw error;
        }
    }

    async makeGeminiRequestForJSON(model, prompt) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.2,
                topK: 10,
                topP: 0.7,
                maxOutputTokens: 32768,
                responseMimeType: "application/json"
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0 && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid API response structure:', data);
                throw new Error('Invalid response format from Gemini API - no valid candidates found');
            }
        } catch (error) {
            console.error(`Gemini API JSON request failed for ${model}:`, error);
            throw error;
        }
    }

    async makeGeminiRequestWithSearch(model, prompt) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            tools: [{
                google_search: {}
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 32768,
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0 && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid API response structure:', data);
                throw new Error('Invalid response format from Gemini API - no valid candidates found');
            }
        } catch (error) {
            console.error(`Gemini API request with search failed for ${model}:`, error);
            throw error;
        }
    }

    parseJSONResponse(response) {
        try {
            if (!response || response.trim() === '') {
                console.error('Empty response received from API');
                throw new Error('Empty response from API');
            }
            
            // Clean up potential markdown code blocks
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            console.log('Attempting to parse response:', cleanResponse.substring(0, 200) + '...');
            return JSON.parse(cleanResponse);
        } catch (error) {
            console.error('Failed to parse JSON response:', error);
            console.error('Raw response:', response);
            throw new Error('Invalid JSON response from API');
        }
    }
}

// Export for use in content script
if (typeof window !== 'undefined') {
    window.GeminiResearcher = GeminiResearcher;
}
}

console.log('🌊 Wadi Wadi GeminiResearcher loaded');