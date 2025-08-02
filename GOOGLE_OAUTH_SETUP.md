# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project and OAuth Credentials

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create or Select a Project
- Click "Select a project" dropdown at the top
- Click "New Project" if you don't have one
- Give it a name like "stellar-content-stream"
- Click "Create"

### 1.3 Enable Required APIs
Go to "APIs & Services" → "Library" and enable these APIs:
- **Google AdSense Management API** - for AdSense data
- **Google Analytics Reporting API** - for Analytics data  
- **Google Search Console API** - for Search Console data

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in app name: "Stellar Content Stream"
   - Add your email as developer contact
   - Add scopes: AdSense, Analytics, Search Console
4. For Application type, select "Web application"
5. Set the name: "Stellar Content Stream Web Client"
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
7. Add Authorized redirect URIs:
   - `http://localhost:5173/admin` (for development)
   - `https://yourdomain.com/admin` (for production)
8. Click "Create"

### 1.5 Copy Your Credentials
After creation, you'll see a popup with:
- **Client ID**: Something like `123456789-abcdefgh.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abcdefghijklmnop`

## Step 2: Configure Environment Variables

### 2.1 Create .env file
In your project root, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2.2 Add OAuth Credentials
Edit your `.env` file and replace the placeholder values:

```env
# Google OAuth Configuration (REQUIRED for Google Site Kit)
VITE_GOOGLE_OAUTH_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
VITE_GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
VITE_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5173/admin

# Google Services Configuration (Optional - for static tracking)
# Use your actual AdSense Publisher ID from: https://adsense.google.com/adsense/u/0/settings/account-information
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-2959602333047653
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=your_verification_code

# Feature Flags
VITE_ENABLE_GOOGLE_ANALYTICS=true
VITE_ENABLE_GOOGLE_ADSENSE=true
VITE_ENABLE_GOOGLE_SITE_VERIFICATION=true
```

### 2.3 Finding Your Real AdSense Publisher ID
Your AdSense Publisher ID is visible in the URL when you're in your AdSense dashboard:
- Go to: https://adsense.google.com/adsense/u/0/settings/account-information
- Look at the URL path: `/pub-XXXXXXXXXXXXXXXX/`
- Your Publisher ID is: `ca-pub-XXXXXXXXXXXXXXXX`

**Your account details:**
- Publisher ID: `ca-pub-2959602333047653`
- Customer ID: `9592425312`
- AdSense URL: `https://adsense.google.com/adsense/u/0/pub-2959602333047653/`

## Step 3: Test the Integration

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Access Admin Panel
1. Go to `http://localhost:5173/admin`
2. Log in as an administrator
3. Click "Google Site Kit" tab
4. Click "Connect with Google"
5. Complete the OAuth flow

## Troubleshooting

### Common Issues:

**"redirect_uri_mismatch" error:**
- Make sure your redirect URI in Google Cloud Console exactly matches your .env file
- Check for trailing slashes or protocol mismatches

**"invalid_client" error:**
- Verify your Client ID and Client Secret are correct
- Make sure you're using the web application credentials

**API not enabled errors:**
- Go back to Google Cloud Console and enable the required APIs
- Wait a few minutes for the APIs to activate

**Scope permission errors:**
- Make sure your OAuth consent screen includes the required scopes
- You may need to verify your app if using sensitive scopes

### Required Scopes:
The application requests these permissions:
- `https://www.googleapis.com/auth/adsense.readonly` - Read AdSense data
- `https://www.googleapis.com/auth/analytics.readonly` - Read Analytics data  
- `https://www.googleapis.com/auth/webmasters.readonly` - Read Search Console data
- `openid email profile` - Basic user information

## Security Notes

### For Production:
1. **Never commit your .env file** - it's already in .gitignore
2. **Use environment variables** on your hosting platform
3. **Restrict your OAuth credentials** to your actual domain
4. **Enable additional security** like API key restrictions in Google Cloud Console

### Client Secret Handling:
⚠️ **Important**: The client secret is used for server-side OAuth flows. Since this is a client-side application, consider using PKCE (Proof Key for Code Exchange) flow for enhanced security in production.

## Need Help?
If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Google Cloud project has the required APIs enabled
4. Double-check your OAuth consent screen configuration
