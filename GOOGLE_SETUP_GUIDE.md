# 🚀 Google API Setup Guide

This guide will help you configure Google API access for your React app to work like WordPress Google Site Kit.

## 📋 Prerequisites

- Google account with access to:
  - Google Analytics
  - Google AdSense (optional)
  - Google Search Console
- Admin access to your React application

## 🔧 Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your Project ID

### 1.2 Enable Required APIs

Navigate to **APIs & Services > Library** and enable:

- **Google Analytics Data API**
- **Google Analytics Reporting API**
- **Google AdSense Management API**
- **Google Search Console API**

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: `React App Google Integration`
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/oauth/callback` (development)
     - `https://yourdomain.com/oauth/callback` (production)

5. Save the **Client ID** and **Client Secret**

## 🔗 Step 2: Google Analytics Setup

### 2.1 Get Analytics Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin > Property Settings**
4. Copy the **Property ID** (format: `123456789`)

### 2.2 Link Analytics Account

1. In Google Analytics, go to **Admin > Property > Property Access Management**
2. Add your Google Cloud project service account email
3. Grant **Viewer** permissions

## 💰 Step 3: Google AdSense Setup

### 3.1 Get AdSense Client ID

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Navigate to **Account > Settings**
3. Copy your **Publisher ID** (format: `ca-pub-xxxxxxxxxxxxxxxxx`)

### 3.2 Get Customer ID

1. In AdSense, go to **Payments**
2. Find your **Customer ID** (numeric value)

## 🔍 Step 4: Google Search Console Setup

### 4.1 Verify Your Website

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add your website property
3. Verify ownership using one of the methods
4. Copy the verification code if using HTML tag method

## ⚙️ Step 5: Configure Environment Variables

Update your `.env` file:

```bash
# Google OAuth Configuration
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
VITE_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback

# Google Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_ANALYTICS_PROPERTY_ID=123456789

# Google AdSense
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxxx
VITE_GOOGLE_ADSENSE_CUSTOMER_ID=123456789

# Google Search Console
VITE_GOOGLE_SITE_VERIFICATION=your_verification_code

# Site Configuration
VITE_SITE_URL=https://yourdomain.com

# Feature Flags
VITE_ENABLE_GOOGLE_ANALYTICS=true
VITE_ENABLE_GOOGLE_ADSENSE=true
VITE_ENABLE_GOOGLE_SITE_VERIFICATION=true
```

## 🚀 Step 6: Testing Your Setup

### 6.1 Start Development Server

```bash
npm run dev
```

### 6.2 Test OAuth Flow

1. Navigate to `/admin` in your app
2. Go to the **Google Analytics** tab
3. Click **Connect Google Services**
4. Complete the OAuth flow
5. Verify data appears in the dashboard

### 6.3 Verify API Access

The dashboard should show:
- ✅ Analytics data (sessions, page views, users)
- ✅ AdSense data (earnings, clicks, CTR)
- ✅ Search Console data (impressions, clicks, position)

## 🛠️ Step 7: Production Deployment

### 7.1 Update Redirect URIs

In Google Cloud Console, add your production URLs:
- `https://yourdomain.com/oauth/callback`

### 7.2 Update Environment Variables

```bash
VITE_GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/oauth/callback
VITE_SITE_URL=https://yourdomain.com
```

### 7.3 Deploy Your App

```bash
npm run build
npm run sync:deploy  # Deploy edge functions if using Supabase
```

## 🔧 Troubleshooting

### Common Issues

**1. "OAuth Error: invalid_grant"**
- Check redirect URI matches exactly
- Ensure client ID is correct
- Verify time synchronization

**2. "Analytics API Error: 403"**
- Enable Analytics Data API in Google Cloud
- Add service account to Analytics property
- Check property ID is correct

**3. "AdSense API Error: 404"**
- Verify AdSense account is approved
- Check Publisher ID format
- Ensure AdSense API is enabled

**4. "Search Console API Error: 403"**
- Verify website is verified in Search Console
- Check site URL matches exactly
- Ensure Search Console API is enabled

### Debug Mode

Set environment variable for detailed logs:
```bash
VITE_DEBUG_GOOGLE_API=true
```

## 📚 Additional Resources

- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Google AdSense Management API](https://developers.google.com/adsense/management)
- [Google Search Console API](https://developers.google.com/webmaster-tools)
- [OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)

## 🎯 Success Criteria

When properly configured, your React app will:

✅ **Authenticate with Google** like WordPress Site Kit  
✅ **Display real-time Analytics data** with sessions, users, page views  
✅ **Show AdSense earnings** with revenue, clicks, and CTR  
✅ **Present Search Console metrics** with impressions and rankings  
✅ **Update data automatically** with configurable refresh intervals  
✅ **Handle token refresh** seamlessly in the background  

Your React app now has WordPress-level Google integration! 🎉
