-- Production deployment script
-- Run this in your Supabase SQL Editor to switch to production domain

-- Update existing OAuth redirect URI to production domain
UPDATE google_site_kit 
SET 
  oauth_redirect_uri = 'https://wecandotoo.com/oauth/callback',
  updated_at = now()
WHERE oauth_redirect_uri LIKE '%localhost%';

-- Verify the update
SELECT 
  id,
  oauth_client_id,
  oauth_redirect_uri,
  adsense_publisher_id,
  analytics_property_id,
  search_console_site_url,
  connection_status,
  updated_at
FROM google_site_kit;

-- Show the production OAuth URL
SELECT CONCAT(
  'https://accounts.google.com/oauth/authorize?',
  'client_id=', oauth_client_id,
  '&redirect_uri=', encode(oauth_redirect_uri::bytea, 'escape'),
  '&response_type=code',
  '&access_type=offline',
  '&prompt=consent',
  '&scope=', encode('https://www.googleapis.com/auth/adsense.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly openid email profile'::bytea, 'escape')
) as production_oauth_url
FROM google_site_kit
LIMIT 1;

SELECT '🚀 Production configuration updated! Use the OAuth URL above.' as result;
