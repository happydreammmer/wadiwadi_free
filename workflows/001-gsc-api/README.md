# 🚀 GSC API Quick Wins - n8n Workflow

An intelligent n8n workflow that automatically analyzes your Google Search Console data using AI to identify SEO "quick wins" - high-impact, low-effort optimization opportunities.

## 📋 What This Workflow Does

This workflow:
1. **Fetches GSC Data**: Pulls search performance data from Google Search Console API
2. **AI Analysis**: Uses Google Gemini AI to analyze the data for optimization opportunities
3. **Automated Reporting**: Writes structured findings to Google Sheets for easy review and action

The AI identifies three key types of SEO opportunities:
- **🎯 Striking Distance Keywords**: Pages ranking positions 8-20 that could easily reach page 1
- **👀 High Impression/Low CTR**: Pages getting visibility but poor click-through rates
- **🔗 Keyword Consolidation**: Related queries that could be better optimized together

## 🛠️ Prerequisites

Before setting up this workflow, ensure you have:

- **n8n instance** (self-hosted or n8n.cloud)
- **Google account** with access to:
  - Google Search Console (with verified website property)
  - Google Sheets
  - Google AI Studio (for Gemini API)

## 📦 Setup Instructions

### Step 1: Import the Workflow

1. Download the `gsc-api-quick-wins.json` file
2. In your n8n interface, go to **Workflows** → **Import from File**
3. Select the downloaded JSON file
4. Click **Import**

### Step 2: Configure Credentials

You'll need to set up three credential types in n8n:

#### A. Google OAuth2 API (for Search Console access)
1. Go to **Settings** → **Credentials** → **Add Credential**
2. Select **Google OAuth2 API**
3. Fill in your Google OAuth2 credentials:
   - **Client ID**: Your Google Cloud Console OAuth2 client ID
   - **Client Secret**: Your Google Cloud Console OAuth2 client secret
   - **Scope**: `https://www.googleapis.com/auth/webmasters.readonly`
4. Save and test the connection

#### B. Google Sheets OAuth2 API
1. Add another credential for **Google Sheets OAuth2 API**
2. Use the same or different Google account
3. Ensure it has access to create/edit spreadsheets

#### C. Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. In n8n, add **Google PaLM API** credential
4. Enter your Gemini API key

### Step 3: Update Workflow Parameters

After importing, you need to configure several placeholders:

#### Update Domain
In the **HTTP Request** node:
- Replace `{{YOUR_DOMAIN}}` with your actual domain (e.g., `example.com`)

#### Update Google Sheets
1. Create a new Google Sheets document
2. Name the first sheet "SEO Quick Wins" 
3. Add these column headers in row 1:
   - A1: ID
   - B1: Analysis Type  
   - C1: Page URL
   - D1: Keyword
   - E1: Impressions
   - F1: Clicks
   - G1: Position
   - H1: Description

4. Copy the Google Sheets ID from the URL (the long string between `/d/` and `/edit`)
5. In the **writeSheets** node, replace `{{YOUR_GOOGLE_SHEETS_ID}}` with your sheet ID

#### Assign Credentials
For each node that has credential placeholders:
- **HTTP Request** node: Assign your Google OAuth2 API credential
- **writeSheets** node: Assign your Google Sheets OAuth2 API credential  
- **Gemini 2.5 Pro** and **Gemini 2.5 Flash** nodes: Assign your Google PaLM API credential

### Step 4: Enable Required APIs

In Google Cloud Console, ensure these APIs are enabled:
1. **Google Search Console API**
2. **Google Sheets API** 
3. **Google AI Platform API** (for Gemini)

### Step 5: Verify Search Console Access

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Ensure your domain is verified and has data
3. The workflow pulls data from the last 30 days (excluding the most recent 3 days)

## 🎯 How to Use

### Manual Execution
1. Open the workflow in n8n
2. Click the **Execute Workflow** button
3. The workflow will:
   - Fetch your GSC data
   - Analyze it with AI
   - Write findings to your Google Sheet

### Schedule Execution (Optional)
1. Replace the **Manual Trigger** with a **Schedule Trigger**
2. Set your preferred schedule (e.g., weekly on Mondays)
3. Activate the workflow

## 📊 Understanding the Results

The workflow writes results to your Google Sheet with these columns:

- **ID**: Unique identifier for each finding
- **Analysis Type**: Category of opportunity (Striking Distance, Low CTR, Consolidation)
- **Page URL**: The specific page that needs attention
- **Keyword**: The search query/keyword involved
- **Impressions**: How many times the page appeared in search results
- **Clicks**: How many times users clicked on the result
- **Position**: Average ranking position for this keyword
- **Description**: AI-generated explanation and recommendation

## 🔧 Troubleshooting

### Common Issues

**"Access denied" errors**
- Verify your domain is properly verified in Google Search Console
- Check that OAuth credentials have the correct scopes
- Ensure the Google account has access to both Search Console and Sheets

**"No data found"**
- Your site might not have enough search data yet (needs 30+ days)
- Try adjusting the date range in the HTTP Request body
- Verify your domain format in the URL (use `example.com`, not `www.example.com`)

**Google Sheets errors**
- Ensure the sheet exists and is accessible to your OAuth account
- Check that column headers match exactly
- Verify the sheet ID is correct in the URL

**AI analysis failures**
- Check your Gemini API key is valid and has quota
- The workflow has fallback from Gemini Pro to Flash if needed
- Monitor your API usage in Google AI Studio

### Data Range Modification

To change the analysis period, edit the JSON body in the **HTTP Request** node:
```json
{
  "startDate": "{{ $today.minus(60, 'days').toFormat('yyyy-MM-dd')}}",
  "endDate": "{{ $today.minus(3, 'days').toFormat('yyyy-MM-dd')}}",
  "dimensions": ["page", "query"],
  "rowLimit": 100
}
```

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to:
1. Open an issue describing the problem
2. Submit a pull request with improvements
3. Share your customizations with the community

## 📜 License

This workflow is provided as-is under MIT license. Feel free to modify and redistribute.

## 🙋‍♀️ Support

If you need help setting up this workflow:
1. Check the troubleshooting section above
2. Review n8n's documentation for credential setup
3. Ensure all APIs are properly enabled in Google Cloud Console

---

**Happy optimizing!** 🎉 This workflow should help you quickly identify and prioritize your most impactful SEO improvements.