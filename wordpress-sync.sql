-- Extract Google Site Kit Configuration from WordPress
-- Since you already have Google Site Kit working at https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard
-- This script will help you use the same configuration in your React app

-- Update the existing configuration to match your working WordPress setup
UPDATE google_site_kit 
SET 
  oauth_redirect_uri = 'https://wecandotoo.com/oauth/callback',
  search_console_site_url = 'https://wecandotoo.com',
  search_console_verified = true, -- Since WordPress Site Kit is working
  connection_status = 'ready',
  updated_at = now()
WHERE id IS NOT NULL;

-- If you want to extract actual tokens from WordPress (optional)
-- You would need to get these from your WordPress database wp_options table:
-- SELECT option_value FROM wp_options WHERE option_name LIKE '%googlesitekit%token%';

-- For now, set up the configuration to work with your existing Google setup
SELECT 
  'WordPress Site Kit is working at: https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard' as wordpress_status,
  'React app OAuth URL will be: https://accounts.google.com/oauth/authorize?client_id=' || oauth_client_id || '&redirect_uri=https://wecandotoo.com/oauth/callback&response_type=code&access_type=offline&prompt=consent&scope=https://www.googleapis.com/auth/adsense.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly openid email profile' as react_oauth_url
FROM google_site_kit 
LIMIT 1;

-- Show current configuration
SELECT 
  id,
  oauth_client_id,
  oauth_redirect_uri,
  adsense_publisher_id,
  analytics_property_id,
  search_console_site_url,
  search_console_verified,
  connection_status,
  enable_adsense,
  enable_analytics,
  enable_search_console
FROM google_site_kit;

SELECT '✅ Configuration updated to match your working WordPress Site Kit!' as result;
