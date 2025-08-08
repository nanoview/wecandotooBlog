# 🚨 403 OAuth Error - Troubleshooting Guide

## 403 Error Causes and Solutions

### 1. 🔑 **OAuth Client Secret Issue (Most Likely)**
**After GitGuardian detected your secret, it may have been automatically revoked.**

**Solution:**
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 client: `622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com`
3. **Generate a new client secret**
4. Update your configuration with the new secret

### 2. 📋 **Missing Redirect URI**
**Google returns 403 if redirect URI is not authorized.**

**Solution:**
1. In Google Cloud Console → OAuth 2.0 Client ID settings
2. Add to "Authorized redirect URIs":
   ```
   https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth
   ```

### 3. 🔌 **APIs Not Enabled**
**Required Google APIs must be enabled in your project.**

**Enable these APIs:**
- [Google Analytics Data API](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)
- [Google Analytics Reporting API](https://console.cloud.google.com/apis/library/analyticsreporting.googleapis.com)
- [Google AdSense Management API](https://console.cloud.google.com/apis/library/adsense.googleapis.com)
- [Google Search Console API](https://console.cloud.google.com/apis/library/searchconsole.googleapis.com)

### 4. 👤 **OAuth Consent Screen**
**Your OAuth consent screen must be properly configured.**

**Check:**
1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Ensure app is published or you're added as a test user
3. Verify scopes are approved:
   - `https://www.googleapis.com/auth/adsense.readonly`
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/webmasters.readonly`

### 5. 🏢 **Project Permissions**
**Your Google Cloud project must have proper permissions.**

**Verify:**
1. You have Editor/Owner access to the project `wecandotoo`
2. Billing is enabled (required for some APIs)
3. Project is not suspended

## 🔧 **Immediate Action Plan:**

### Step 1: Generate New OAuth Credentials
```bash
# After creating new credentials in Google Cloud Console
# Update these values in your .env file:
VITE_GOOGLE_OAUTH_CLIENT_ID=your_new_client_id
VITE_GOOGLE_OAUTH_CLIENT_SECRET=your_new_client_secret
```

### Step 2: Update Supabase Configuration
```sql
-- Update the database with new credentials
UPDATE google_site_kit 
SET 
  oauth_client_id = 'your_new_client_id',
  oauth_client_secret = 'your_new_client_secret',
  updated_at = NOW()
WHERE id = (SELECT id FROM google_site_kit LIMIT 1);
```

### Step 3: Test with Minimal Scopes
Try with just one scope first to isolate the issue:
```
https://accounts.google.com/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=openid%20email&access_type=offline&prompt=consent
```

## 🐛 **Debug Steps:**

1. **Check Browser Network Tab**: Look for exact error response
2. **Test OAuth Consent**: Try with a different Google account
3. **Verify Project Status**: Ensure Google Cloud project is active
4. **Check API Quotas**: Verify you haven't exceeded rate limits

## 📞 **If Still Failing:**

1. Create a completely new OAuth 2.0 client ID
2. Use a different Google Cloud project
3. Check if your account has restrictions
4. Try OAuth with just `openid email` scope first

---
**Error Context:** 403 Forbidden during Google OAuth flow
**Timestamp:** 2025-08-08
**Status:** Troubleshooting in progress
