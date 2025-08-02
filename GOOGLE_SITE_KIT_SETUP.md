# Google Site Kit Database Configuration

This guide explains how to save Google Site Kit required data to your Supabase database using the `GoogleSiteKitService`.

## Overview

The Google Site Kit service allows you to store and manage configuration for:
- **Google AdSense** - Display ads and track earnings
- **Google Analytics** - Track website traffic and user behavior  
- **Google Search Console** - Monitor search performance and indexing
- **OAuth Authentication** - Secure API access to Google services
- **Site Verification** - Verify domain ownership with Google

## Database Schema

The `google_site_kit` table stores all configuration data:

```sql
-- Core configuration fields
oauth_client_id          TEXT    -- Required for OAuth
oauth_client_secret      TEXT    -- Required for OAuth (encrypted)
oauth_redirect_uri       TEXT    -- OAuth callback URL
adsense_publisher_id     TEXT    -- ca-pub-XXXXXXXXXXXXXXXX
analytics_property_id    TEXT    -- G-XXXXXXXXXX
search_console_site_url  TEXT    -- https://your-domain.com
site_verification_code   TEXT    -- Meta tag verification code

-- Feature flags
enable_adsense          BOOLEAN  -- Enable/disable AdSense
enable_analytics        BOOLEAN  -- Enable/disable Analytics
enable_search_console   BOOLEAN  -- Enable/disable Search Console
enable_auto_ads         BOOLEAN  -- Enable/disable Auto Ads

-- Connection status
is_connected           BOOLEAN   -- Current connection status
connection_status      TEXT      -- 'connected', 'disconnected', 'error'
last_sync_at          TIMESTAMP  -- Last successful sync
error_message         TEXT       -- Error details if any
```

## Quick Setup

### 1. Automated Setup (Recommended)

Run the setup script to initialize your configuration:

```bash
# Update the configuration values in setup-google-site-kit.js first
npm run setup:google-site-kit
```

### 2. Manual Setup via Code

```typescript
import { GoogleSiteKitService } from './src/services/googleSiteKitService';

// Save minimal required configuration
const minimalConfig = await GoogleSiteKitService.saveRequiredData({
  oauth_client_id: 'your-oauth-client-id',
  oauth_redirect_uri: 'http://localhost:8082/oauth/callback'
});

// Save complete configuration
const completeConfig = await GoogleSiteKitService.saveRequiredData({
  // OAuth (Required)
  oauth_client_id: '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',
  oauth_client_secret: 'GOCSPX-your-actual-secret',
  oauth_redirect_uri: 'http://localhost:8082/oauth/callback',
  
  // AdSense
  adsense_publisher_id: 'ca-pub-2959602333047653',
  adsense_customer_id: '9592425312',
  
  // Analytics
  analytics_property_id: 'G-1234567890',
  analytics_measurement_id: 'G-1234567890',
  
  // Search Console
  search_console_site_url: 'https://your-domain.com',
  
  // Site Verification
  site_verification_code: 'your-verification-code',
  
  // Feature Flags
  enable_adsense: true,
  enable_analytics: true,
  enable_search_console: true,
  enable_auto_ads: false
});
```

### 3. UI Configuration

Use the React component for visual configuration:

```typescript
import GoogleSiteKitConfigPanel from './src/components/GoogleSiteKitConfigPanel';

function AdminPage() {
  return (
    <div>
      <h1>Google Site Kit Configuration</h1>
      <GoogleSiteKitConfigPanel />
    </div>
  );
}
```

## Required Configuration Steps

### 1. Google Cloud Console Setup

1. **Create a project** at [Google Cloud Console](https://console.cloud.google.com)
2. **Enable APIs**:
   - Google AdSense Management API
   - Google Analytics Reporting API
   - Google Search Console API
3. **Create OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8082/oauth/callback`
4. **Configure OAuth consent screen**
5. **Get your Client ID and Client Secret**

### 2. Google AdSense Setup (if using)

1. **Get Publisher ID**:
   - Go to [Google AdSense](https://www.google.com/adsense/)
   - Find your publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
2. **Get Customer ID**:
   - Available in AdSense account settings

### 3. Google Analytics Setup (if using)

1. **Create GA4 Property**:
   - Go to [Google Analytics](https://analytics.google.com)
   - Create a new GA4 property
   - Get your Property ID (G-XXXXXXXXXX)

### 4. Google Search Console Setup (if using)

1. **Add and verify your site**:
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your domain
   - Verify ownership using meta tag method

### 5. Site Verification

1. **Get verification code**:
   - From Google Search Console verification page
   - Copy the meta tag verification code
2. **Add to your site**:
   - Use the `GoogleSiteVerification` component
   - Or manually add the meta tag to your HTML head

## Service Methods

### Core Configuration Methods

```typescript
// Get current configuration
const config = await GoogleSiteKitService.getConfig();

// Save/update configuration
const updated = await GoogleSiteKitService.saveRequiredData({
  oauth_client_id: 'your-client-id',
  // ... other fields
});

// Ensure configuration exists (creates default if none)
const config = await GoogleSiteKitService.ensureConfigExists();
```

### OAuth Token Management

```typescript
// Store OAuth tokens after authentication
await GoogleSiteKitService.storeOAuthTokens({
  access_token: 'token',
  refresh_token: 'refresh',
  expires_at: '2024-12-31T23:59:59Z'
});

// Get stored tokens
const tokens = await GoogleSiteKitService.getOAuthTokens();
```

### Connection Status

```typescript
// Update connection status
await GoogleSiteKitService.updateConnectionStatus('connected');
await GoogleSiteKitService.updateConnectionStatus('error', 'Connection failed');
await GoogleSiteKitService.updateConnectionStatus('disconnected');
```

### Data Retrieval (Mock - Replace with Real APIs)

```typescript
// Get AdSense data
const adSenseData = await GoogleSiteKitService.getAdSenseData();

// Get Analytics data  
const analyticsData = await GoogleSiteKitService.getAnalyticsData();

// Get Search Console data
const searchData = await GoogleSiteKitService.getSearchConsoleData();
```

## Security Considerations

### Production Security

1. **Encrypt sensitive data**:
   - `oauth_client_secret`
   - `oauth_access_token` 
   - `oauth_refresh_token`

2. **Use environment variables**:
   ```typescript
   const config = {
     oauth_client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
     // Never hardcode secrets in source code
   };
   ```

3. **Implement proper RLS policies**:
   - Only admins can access configuration
   - Policies are already set up in the migration

### Row Level Security

The table has RLS enabled with admin-only access:

```sql
-- Only admins can view/modify configuration
CREATE POLICY "Admins can view Google Site Kit config" ON google_site_kit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      JOIN user_roles ON profiles.user_id = user_roles.user_id 
      WHERE profiles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );
```

## Troubleshooting

### Common Issues

1. **"OAuth Client ID is required" error**:
   - Make sure you've set the `oauth_client_id` field
   - Verify the client ID format is correct

2. **"Configuration validation failed"**:
   - Check all required fields are provided
   - Ensure URLs are valid format
   - Verify AdSense publisher ID starts with "ca-pub-"

3. **"Failed to save configuration"**:
   - Check database connection
   - Verify user has admin role
   - Check Supabase logs for detailed errors

4. **OAuth authentication fails**:
   - Verify redirect URI matches exactly in Google Cloud Console
   - Check OAuth consent screen is configured
   - Ensure all required scopes are requested

### Debug Mode

Enable detailed logging:

```typescript
// Set before calling service methods
localStorage.setItem('google-site-kit-debug', 'true');

// All service methods will log detailed information
const config = await GoogleSiteKitService.saveRequiredData(data);
```

## Integration Examples

### React Component Integration

```typescript
import { useEffect, useState } from 'react';
import { GoogleSiteKitService } from '../services/googleSiteKitService';

function MyComponent() {
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    async function loadConfig() {
      const siteKitConfig = await GoogleSiteKitService.getConfig();
      setConfig(siteKitConfig);
    }
    loadConfig();
  }, []);
  
  const handleSave = async (newData) => {
    await GoogleSiteKitService.saveRequiredData(newData);
    // Reload configuration
    const updated = await GoogleSiteKitService.getConfig();
    setConfig(updated);
  };
  
  return (
    <div>
      {config ? (
        <div>Configuration loaded: {config.oauth_client_id}</div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
```

### OAuth Flow Integration

```typescript
// 1. Redirect to Google OAuth
const authUrl = `https://accounts.google.com/oauth/authorize?` +
  `client_id=${config.oauth_client_id}&` +
  `redirect_uri=${config.oauth_redirect_uri}&` +
  `scope=${config.oauth_scopes.join(' ')}&` +
  `response_type=code&` +
  `access_type=offline`;

window.location.href = authUrl;

// 2. Handle callback
const handleOAuthCallback = async (code) => {
  // Exchange code for tokens (implement token exchange)
  const tokens = await exchangeCodeForTokens(code);
  
  // Store tokens
  await GoogleSiteKitService.storeOAuthTokens(tokens);
  
  // Update connection status
  await GoogleSiteKitService.updateConnectionStatus('connected');
};
```

## Next Steps

1. **Configure Google Cloud Console** with your OAuth credentials
2. **Update configuration values** in the setup script or UI
3. **Run the setup script** to save data to database
4. **Implement OAuth flow** for user authentication
5. **Replace mock data methods** with real Google API calls
6. **Add error handling** and user feedback
7. **Implement token refresh** logic for expired tokens

For more detailed API integration, refer to:
- [Google AdSense Management API](https://developers.google.com/adsense/management)
- [Google Analytics Reporting API](https://developers.google.com/analytics/devguides/reporting)
- [Google Search Console API](https://developers.google.com/webmaster-tools)
