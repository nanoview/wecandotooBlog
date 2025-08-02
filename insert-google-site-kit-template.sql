-- ⚠️ SECURITY NOTE: This file contains PLACEHOLDER values only
-- DO NOT commit actual OAuth secrets to git!
-- Use environment variables or Supabase dashboard for real credentials

-- Google Site Kit Database Setup with PLACEHOLDER credentials
-- Replace these values with your actual credentials in production

INSERT INTO google_site_kit (
  id,
  created_at,
  updated_at,
  
  -- OAuth Configuration (REPLACE WITH YOUR VALUES)
  oauth_client_id,
  oauth_client_secret,
  oauth_redirect_uri,
  oauth_access_token,
  oauth_refresh_token,
  oauth_expires_at,
  
  -- Google AdSense Configuration (REPLACE WITH YOUR VALUES)
  adsense_publisher_id,
  adsense_customer_id,
  adsense_account_id,
  adsense_site_id,
  
  -- Google Analytics Configuration (REPLACE WITH YOUR VALUES)
  analytics_property_id,
  analytics_view_id,
  analytics_measurement_id,
  
  -- Google Search Console Configuration (REPLACE WITH YOUR VALUES)
  search_console_site_url,
  search_console_verified,
  
  -- Site Verification (REPLACE WITH YOUR VALUES)
  site_verification_code,
  site_verification_method,
  
  -- API Configuration
  enabled_apis,
  oauth_scopes,
  
  -- Feature Flags
  enable_adsense,
  enable_analytics,
  enable_search_console,
  enable_auto_ads,
  
  -- Connection Status
  is_connected,
  last_sync_at,
  connection_status,
  error_message,
  
  -- User Management
  configured_by
) VALUES (
  'default',
  NOW(),
  NOW(),
  
  -- ⚠️ PLACEHOLDER OAuth Configuration - DO NOT USE IN PRODUCTION
  'YOUR_CLIENT_ID.apps.googleusercontent.com',
  'GOCSPX-YOUR_CLIENT_SECRET_HERE',  -- ⚠️ NEVER commit real secrets!
  'https://yourdomain.com/oauth/callback',
  NULL,  -- Will be set during OAuth flow
  NULL,  -- Will be set during OAuth flow
  NULL,  -- Will be set during OAuth flow
  
  -- ⚠️ PLACEHOLDER AdSense Configuration
  'ca-pub-YOUR_PUBLISHER_ID',
  'YOUR_CUSTOMER_ID',
  'YOUR_ACCOUNT_ID',
  'YOUR_SITE_ID',
  
  -- ⚠️ PLACEHOLDER Analytics Configuration
  'G-YOUR_PROPERTY_ID',
  'YOUR_VIEW_ID',
  'G-YOUR_MEASUREMENT_ID',
  
  -- ⚠️ PLACEHOLDER Search Console Configuration
  'https://yourdomain.com',
  FALSE,
  
  -- ⚠️ PLACEHOLDER Site Verification
  'YOUR_VERIFICATION_CODE',
  'META',
  
  -- API Configuration
  ARRAY['adsense', 'analytics', 'webmasters', 'searchconsole'],
  ARRAY[
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly'
  ],
  
  -- Feature Flags
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  
  -- Connection Status
  FALSE,
  NULL,
  'not_configured',
  'Please configure OAuth credentials',
  
  -- User Management
  'system'
) ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  oauth_client_id = EXCLUDED.oauth_client_id,
  oauth_client_secret = EXCLUDED.oauth_client_secret,
  oauth_redirect_uri = EXCLUDED.oauth_redirect_uri;

-- 🔒 SECURITY REMINDER:
-- 1. Never commit real OAuth secrets to git
-- 2. Use environment variables in production
-- 3. Set up proper secrets management
-- 4. Rotate compromised keys immediately
