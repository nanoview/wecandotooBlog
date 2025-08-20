# 🚀 Complete Google Services Setup Guide - Step by Step

## Overview
This guide will help you obtain all Google API credentials needed for your blog. You already have some values configured, but we'll verify and complete everything.

---

## 📋 Current Status Check

Based on your `.env` file, you have:
- ✅ **OAuth Client ID & Secret** (for Google Site Kit)
- ✅ **AdSense Publisher ID**
- ✅ **Analytics ID** 
- ❌ **Missing proper Google API Key**
- ❌ **Site Verification needs proper format**

---

## 🎯 **STEP 1: Google Cloud Console - Project Setup**

### 1.1 Access Google Cloud Console
1. **Go to:** https://console.cloud.google.com/
2. **Sign in** with your Google account (same one used for AdSense/Analytics)

### 1.2 Select Your Project
1. **Click the project dropdown** at the top (next to "Google Cloud Console")
2. **Look for project ID:** `622861962504` 
3. **If you don't see it:**
   - Click **"Select a project"**
   - Look for **"wecandotoo"** or project ID `622861962504`
   - If not found, click **"New Project"** and create one

### 1.3 Create New Project (if needed)
1. **Click "New Project"**
2. **Project Name:** `wecandotoo`
3. **Project ID:** `wecandotoo-[random-numbers]` (or keep suggested)
4. **Click "Create"**

---

## 🔑 **STEP 2: Google API Key (Missing)**

### 2.1 Navigate to Credentials
1. **In Google Cloud Console**, click **☰ (hamburger menu)** top-left
2. **Click "APIs & Services"**
3. **Click "Credentials"**

### 2.2 Create API Key
1. **Click "+ CREATE CREDENTIALS"** (blue button at top)
2. **Select "API Key"**
3. **Copy the API key** that appears (starts with `AIza...`)
4. **Click "RESTRICT KEY"** (recommended for security)

### 2.3 Restrict API Key (Security)
1. **Application restrictions:**
   - Select **"HTTP referrers (web sites)"**
   - Add: `https://wecandotoo.com/*`
   - Add: `https://*.wecandotoo.com/*`

2. **API restrictions:**
   - Select **"Restrict key"**
   - Enable these APIs:
     - ✅ **YouTube Data API v3**
     - ✅ **Google Analytics Reporting API**
     - ✅ **Google Search Console API**
     - ✅ **Google AdSense Management API**

3. **Click "Save"**

### 2.4 Update Your .env File
Replace this line in your `.env`:
```bash
VITE_GOOGLE_API_KEY=your_google_api_key_here
```
With:
```bash
VITE_GOOGLE_API_KEY=AIza[your-actual-api-key]
```

---

## 🔐 **STEP 3: OAuth Consent Screen (For Verification)**

### 3.1 Configure OAuth Consent Screen
1. **In Google Cloud Console**, go to **"APIs & Services"** → **"OAuth consent screen"**
2. **Select "External"** (unless you have Google Workspace)
3. **Click "Create"**

### 3.2 App Information
**Fill out the form:**

**App name:** `wecandotoo`

**User support email:** `your-email@gmail.com`

**App logo:** (Optional - upload your logo)

**App domain information:**
- **Application home page:** `https://wecandotoo.com`
- **Application privacy policy link:** `https://wecandotoo.com/privacy-policy`
- **Application terms of service link:** `https://wecandotoo.com/privacy-policy`

**Authorized domains:**
- `wecandotoo.com`

**Developer contact information:** `your-email@gmail.com`

**Click "Save and Continue"**

### 3.3 Scopes (Step 2)
1. **Click "Add or Remove Scopes"**
2. **Select these scopes:**
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile` 
   - `../auth/analytics.readonly`
   - `../auth/adsense.readonly`
   - `../auth/webmasters.readonly`
3. **Click "Update"**
4. **Click "Save and Continue"**

### 3.4 Test Users (Step 3)
1. **Add your email** as a test user
2. **Click "Save and Continue"**

### 3.5 Summary (Step 4)
1. **Review all information**
2. **Click "Back to Dashboard"**

---

## 📊 **STEP 4: Google Analytics (Verify Configuration)**

### 4.1 Access Google Analytics
1. **Go to:** https://analytics.google.com/
2. **Sign in** with the same Google account

### 4.2 Find Your Analytics ID
1. **Click "Admin"** (gear icon, bottom left)
2. **In the "Property" column**, select your website property
3. **Click "Property Settings"**
4. **Copy the "Property ID"** (starts with `G-`)

### 4.3 Get Measurement ID
1. **In Admin → Property column**
2. **Click "Data Streams"**
3. **Click your web stream** (wecandotoo.com)
4. **Copy "Measurement ID"** (starts with `G-`)

**Update your .env:**
```bash
VITE_GOOGLE_ANALYTICS_ID=G-[your-measurement-id]
```

---

## 💰 **STEP 5: Google AdSense (Verify Configuration)**

### 5.1 Access AdSense
1. **Go to:** https://www.google.com/adsense/
2. **Sign in** with your Google account

### 5.2 Get Publisher ID
1. **Click "Account"** in left sidebar
2. **Click "Account information"**
3. **Copy "Publisher ID"** (starts with `ca-pub-`)

### 5.3 Get Customer ID (for advanced features)
1. **Still in Account section**
2. **Look for "Customer ID"** (numeric, like `9592425312`)

**Verify in your .env:**
```bash
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-2959602333047653  # ✅ You have this
VITE_GOOGLE_ADSENSE_CUSTOMER_ID=9592425312             # ✅ You have this
```

---

## 🔍 **STEP 6: Google Search Console (Site Verification)**

### 6.1 Access Search Console
1. **Go to:** https://search.google.com/search-console/
2. **Sign in** with your Google account

### 6.2 Add Property (if not added)
1. **Click "Add Property"**
2. **Select "URL prefix"**
3. **Enter:** `https://wecandotoo.com`
4. **Click "Continue"**

### 6.3 Verify Ownership
**Method 1 - HTML meta tag (Recommended):**
1. **Select "HTML tag" method**
2. **Copy the verification code** (looks like: `abc123def456...`)
3. **NOT the API key format!**

**Method 2 - HTML file:**
1. **Download the HTML file**
2. **Upload to your website root**

### 6.4 Get Verification Code
The verification meta tag looks like:
```html
<meta name="google-site-verification" content="abc123def456..." />
```

**Copy only the content value** (not the API key!)

**Update your .env:**
```bash
VITE_GOOGLE_SITE_VERIFICATION=abc123def456...  # NOT the API key!
```

---

## 🔧 **STEP 7: Enable Required APIs**

### 7.1 Go to APIs & Services
1. **In Google Cloud Console**
2. **Click "APIs & Services"** → **"Library"**

### 7.2 Enable These APIs
**Search for and enable each:**

1. **"YouTube Data API v3"**
   - Click on it → Click "Enable"

2. **"Google Analytics Reporting API"**
   - Click on it → Click "Enable"

3. **"Google Search Console API"**
   - Click on it → Click "Enable"

4. **"AdSense Management API"**
   - Click on it → Click "Enable"

5. **"Google Analytics Data API"**
   - Click on it → Click "Enable"

---

## 📝 **STEP 8: Final .env Configuration**

Your complete `.env` should look like this:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://rowcloxlszwnowlggqon.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjAwMDQsImV4cCI6MjA2OTM5NjAwNH0.ZfSyOYsBhKkmYkPRecxPlItCLzu8tF5T9SiurZh9eis

# Google OAuth Configuration (REQUIRED for Google Site Kit)
VITE_GOOGLE_OAUTH_CLIENT_ID=622861962504-03mf67okv5b4ang1i4g65pr8c4aenrrl.apps.googleusercontent.com
VITE_GOOGLE_OAUTH_CLIENT_SECRET=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
VITE_GOOGLE_OAUTH_REDIRECT_URI=https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth

# Google API Key (NEW - get from Step 2)
VITE_GOOGLE_API_KEY=AIza[your-new-api-key-here]

# Google Services Configuration
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-2959602333047653
VITE_GOOGLE_ADSENSE_CUSTOMER_ID=9592425312
VITE_GOOGLE_ANALYTICS_ID=G-7TYX6KR8ZG
VITE_GOOGLE_SITE_VERIFICATION=[proper-verification-code-not-api-key]

# Site Configuration
VITE_SITE_URL=https://wecandotoo.com

# Feature Flags
VITE_ENABLE_GOOGLE_ANALYTICS=true
VITE_ENABLE_GOOGLE_ADSENSE=true
VITE_ENABLE_GOOGLE_SITE_VERIFICATION=true
```

---

## ✅ **STEP 9: Test Your Configuration**

### 9.1 Build Your Project
```bash
npm run build
```

### 9.2 Test Google APIs
1. **Go to your admin panel:** `/admin`
2. **Check Google Site Kit dashboard**
3. **Verify analytics data loads**

---

## 🚀 **STEP 10: Submit for OAuth Verification**

### 10.1 Go to OAuth Consent Screen
1. **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
2. **Click "Edit App"**

### 10.2 Verify All Information
- ✅ **App name:** wecandotoo
- ✅ **Homepage:** https://wecandotoo.com
- ✅ **Privacy Policy:** https://wecandotoo.com/privacy-policy (✅ Added!)
- ✅ **Authorized domains:** wecandotoo.com

### 10.3 Submit for Verification
1. **Go through all steps**
2. **Click "Submit for Verification"**
3. **Add note:** "Privacy policy link has been added to homepage footer as requested"

---

## 📞 **Need Help?**

### Common Issues:
- **Can't find project:** Use project ID `622861962504` to search
- **API key not working:** Check API restrictions and enabled APIs
- **OAuth verification failing:** Ensure privacy policy link is visible on homepage

### Verification Timeline:
- **Initial review:** 1-3 business days
- **Full verification:** 3-7 business days

**🎉 Follow this guide step by step and you'll have all Google services properly configured!**
