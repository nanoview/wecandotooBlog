-- Direct Google Site Kit Configuration Insert
-- This SQL script inserts your Google Cloud Console data directly into the database
-- Run this in your Supabase SQL Editor

-- First, delete any existing configuration (optional)
-- DELETE FROM google_site_kit;

-- Insert your Google Cloud Console configuration
INSERT INTO google_site_kit (
  -- OAuth Configuration (from your .env)
  oauth_client_id,
  oauth_client_secret,
  oauth_redirect_uri,
  
  -- Google AdSense Configuration (from your .env)
  adsense_publisher_id,
  adsense_customer_id,
  
  -- Google Analytics Configuration (from your .env)
  analytics_property_id,
  analytics_measurement_id,
  
  -- Site Verification
  site_verification_code,
  site_verification_method,
  
  -- Search Console Configuration (update with your domain)
  search_console_site_url,
  search_console_verified,
  
  -- Feature Flags (based on your .env)
  enable_adsense,
  enable_analytics,
  enable_search_console,
  enable_auto_ads,
  
  -- OAuth Scopes
  oauth_scopes,
  
  -- Enabled APIs
  enabled_apis,
  
  -- Connection Status
  is_connected,
  connection_status,
  error_message,
  last_sync_at,
  
  -- Timestamps
  created_at,
  updated_at
) VALUES (
  -- OAuth Configuration (YOUR ACTUAL VALUES)
  '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',  -- oauth_client_id
  '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',  -- oauth_client_secret
  'http://localhost:8080/oauth/callback',  -- oauth_redirect_uri
  
  -- Google AdSense Configuration (YOUR ACTUAL VALUES)
  'ca-pub-2959602333047653',  -- adsense_publisher_id
  '9592425312',  -- adsense_customer_id
  
  -- Google Analytics Configuration (UPDATE WITH YOUR ACTUAL GA4 PROPERTY ID)
  'G-XXXXXXXXXX',  -- analytics_property_id (UPDATE THIS)
  'G-XXXXXXXXXX',  -- analytics_measurement_id (UPDATE THIS)
  
  -- Site Verification (UPDATE WITH YOUR ACTUAL VERIFICATION CODE)
  'your_verification_code',  -- site_verification_code (UPDATE THIS)
  'meta_tag',  -- site_verification_method
  
  -- Search Console Configuration (UPDATE WITH YOUR ACTUAL DOMAIN)
  'https://stellar-content-stream.com',  -- search_console_site_url (UPDATE THIS)
  false,  -- search_console_verified
  
  -- Feature Flags (based on your .env settings)
  true,   -- enable_adsense
  true,   -- enable_analytics
  true,   -- enable_search_console
  false,  -- enable_auto_ads
  
  -- OAuth Scopes (required for Google Site Kit)
  ARRAY[
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'openid',
    'email',
    'profile'
  ],
  
  -- Enabled APIs
  ARRAY['adsense', 'analytics', 'search_console'],
  
  -- Connection Status
  false,  -- is_connected
  'disconnected',  -- connection_status
  null,   -- error_message
  null,   -- last_sync_at
  
  -- Timestamps
  timezone('utc'::text, now()),  -- created_at
  timezone('utc'::text, now())   -- updated_at
)
ON CONFLICT (id) DO UPDATE SET
  -- Update existing configuration if it exists
  oauth_client_id = EXCLUDED.oauth_client_id,
  oauth_client_secret = EXCLUDED.oauth_client_secret,
  oauth_redirect_uri = EXCLUDED.oauth_redirect_uri,
  adsense_publisher_id = EXCLUDED.adsense_publisher_id,
  adsense_customer_id = EXCLUDED.adsense_customer_id,
  analytics_property_id = EXCLUDED.analytics_property_id,
  analytics_measurement_id = EXCLUDED.analytics_measurement_id,
  site_verification_code = EXCLUDED.site_verification_code,
  site_verification_method = EXCLUDED.site_verification_method,
  search_console_site_url = EXCLUDED.search_console_site_url,
  enable_adsense = EXCLUDED.enable_adsense,
  enable_analytics = EXCLUDED.enable_analytics,
  enable_search_console = EXCLUDED.enable_search_console,
  enable_auto_ads = EXCLUDED.enable_auto_ads,
  oauth_scopes = EXCLUDED.oauth_scopes,
  enabled_apis = EXCLUDED.enabled_apis,
  updated_at = timezone('utc'::text, now());

-- Verify the insert
SELECT 
  id,
  oauth_client_id,
  oauth_redirect_uri,
  adsense_publisher_id,
  analytics_property_id,
  enable_adsense,
  enable_analytics,
  connection_status,
  created_at,
  updated_at
FROM google_site_kit;

-- Display success message
SELECT 'Google Site Kit configuration inserted successfully!' AS status;
