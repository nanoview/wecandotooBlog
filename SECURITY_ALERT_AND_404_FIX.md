# 🚨 SECURITY ALERT & 404 OAUTH FIX

## Security Alert: OAuth Keys Exposed
GitGuardian detected exposed Google OAuth2 keys in commit `bca9baa`. **Immediate action required!**

## 🔒 URGENT Security Steps:

### 1. Revoke Exposed Credentials
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Find OAuth 2.0 client ID: `622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com`
3. **DELETE** or **REGENERATE** the client secret immediately
4. Generate a new client secret

### 2. Update Repository
1. Remove any files containing secrets from git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch client_secret_*.json' --prune-empty --tag-name-filter cat -- --all
   ```
2. Add sensitive files to `.gitignore`
3. Never commit OAuth secrets again

## 🔧 Fixing 404 OAuth Error:

The 404 error occurs because Google can't find your redirect URI. Here's how to fix it:

### Step 1: Update Google Cloud Console
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 client ID
3. In "Authorized redirect URIs", add:
   ```
   https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth
   ```
4. Save the changes

### Step 2: Verify APIs are Enabled
Make sure these APIs are enabled in [Google Cloud Console](https://console.cloud.google.com/apis/library):
- ✅ Google Analytics Data API
- ✅ Google Analytics Reporting API  
- ✅ Google AdSense Management API
- ✅ Google Search Console API
- ✅ Google OAuth2 API

### Step 3: Test OAuth Flow
1. Start your development server: `npm run dev`
2. Go to Admin panel → Google Analytics tab
3. Click "Connect Google Account"
4. Should now redirect properly without 404 error

## 🛡️ Security Best Practices:

### Environment Variables Only
```bash
# ✅ GOOD - In .env file (never commit)
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_secret_here

# ❌ BAD - Never commit client_secret_*.json files
```

### Add to .gitignore
```
# Google OAuth secrets
client_secret_*.json
google-credentials.json
.env.local
.env.production
```

### Use Supabase Vault for Production
```sql
-- Store secrets in Supabase Vault
INSERT INTO vault.secrets (name, secret) 
VALUES ('google_oauth_client_secret', 'your_secret_here');
```

## 🔄 Recovery Steps:

1. **Immediate**: Revoke exposed OAuth credentials
2. **Security**: Clean git history and update .gitignore
3. **Configuration**: Update Google Cloud Console redirect URIs
4. **Testing**: Verify OAuth flow works without 404 errors
5. **Production**: Use secure secret management

## 📞 Need Help?
If you continue to see 404 errors:
1. Check browser network tab for exact failing URL
2. Verify edge function logs in Supabase dashboard
3. Ensure Google Cloud Console has correct redirect URI
4. Test OAuth flow in incognito mode to clear cache

---
*Security Incident: 2025-08-07 08:01:11 PM UTC*
*Status: Remediation in progress*
