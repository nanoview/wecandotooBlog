# Google OAuth Setup Instructions

## Current Issue
The OAuth URL is pointing to port 8080, but your development server is running on port 8082.

## Corrected OAuth URL
```
https://accounts.google.com/oauth/authorize?client_id=622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8082%2Foauth%2Fcallback&response_type=code&access_type=offline&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fadsense.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fanalytics.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fwebmasters.readonly+openid+email+profile
```

## Required Steps

### 1. Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID: `622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com`
4. Under "Authorized redirect URIs", add:
   - `http://localhost:8082/oauth/callback`
   - `http://localhost:8080/oauth/callback` (keep this for fallback)

### 2. Run Database Setup
Execute the SQL script in your Supabase SQL Editor:
```sql
-- Copy and paste the content from complete-google-site-kit-setup.sql
```

### 3. Test the Integration
1. Go to: http://localhost:8082/admin
2. Navigate to the "Google Services" tab
3. Click "Connect Google Services"

## Files Updated
- ✅ .env (redirect URI updated to port 8082)
- ✅ googleAPI.ts (uses environment variable for redirect URI)
- ✅ complete-google-site-kit-setup.sql (updated to port 8082)
- ✅ GoogleSiteKitManager.tsx (comprehensive management interface)
- ✅ OAuthCallback.tsx (complete OAuth callback handler)

## Test URL
Visit: http://localhost:8082/oauth-test.html for OAuth testing
