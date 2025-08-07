-- Update Google OAuth configuration with new client credentials
-- Date: 2025-08-07

-- First, let's update the existing google_site_kit table with the new OAuth credentials
UPDATE google_site_kit 
SET 
  oauth_client_id = '622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com',
  oauth_client_secret = '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',
  oauth_redirect_uri = 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth',
  updated_at = timezone('utc'::text, now())
WHERE id IN (SELECT id FROM google_site_kit LIMIT 1);

-- If no row exists, insert a new configuration
INSERT INTO google_site_kit (
  oauth_client_id,
  oauth_client_secret,
  oauth_redirect_uri,
  oauth_scopes,
  enabled_apis,
  enable_adsense,
  enable_analytics,
  enable_search_console
)
SELECT 
  '622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com',
  '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',
  'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth',
  ARRAY[
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'openid',
    'email',
    'profile'
  ],
  ARRAY['adsense', 'analytics', 'search_console'],
  TRUE,
  TRUE,
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM google_site_kit);

-- Update environment variables in a separate table for easy reference
CREATE TABLE IF NOT EXISTS environment_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE
);

-- Insert or update environment configuration
INSERT INTO environment_config (key, value, description, is_secret)
VALUES 
  ('VITE_GOOGLE_OAUTH_CLIENT_ID', '622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com', 'Google OAuth Client ID', FALSE),
  ('GOOGLE_OAUTH_CLIENT_SECRET', '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', 'Google OAuth Client Secret', TRUE),
  ('VITE_GOOGLE_OAUTH_REDIRECT_URI', 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth', 'Google OAuth Redirect URI', FALSE),
  ('GOOGLE_PROJECT_ID', 'wecandotoo', 'Google Cloud Project ID', FALSE)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = timezone('utc'::text, now());

-- Create a function to get Google OAuth configuration securely
CREATE OR REPLACE FUNCTION get_google_oauth_config()
RETURNS TABLE(
  client_id TEXT,
  redirect_uri TEXT,
  project_id TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gsk.oauth_client_id,
    gsk.oauth_redirect_uri,
    'wecandotoo'::TEXT as project_id
  FROM google_site_kit gsk
  ORDER BY gsk.created_at DESC
  LIMIT 1;
END;
$$;

-- Create a function to get client secret (for edge functions only)
CREATE OR REPLACE FUNCTION get_google_client_secret()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret TEXT;
BEGIN
  SELECT oauth_client_secret INTO secret
  FROM google_site_kit
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN secret;
END;
$$;

-- Grant permissions for these functions
GRANT EXECUTE ON FUNCTION get_google_oauth_config() TO authenticated;
GRANT EXECUTE ON FUNCTION get_google_client_secret() TO service_role;

-- Add RLS policies for environment_config
ALTER TABLE environment_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read non-secret environment config
CREATE POLICY "Allow authenticated users to read public environment config"
ON environment_config
FOR SELECT
TO authenticated
USING (is_secret = FALSE);

-- Allow service role to read all environment config
CREATE POLICY "Allow service role to read all environment config"
ON environment_config
FOR ALL
TO service_role
USING (TRUE);

COMMENT ON TABLE google_site_kit IS 'Stores Google Site Kit configuration including OAuth credentials';
COMMENT ON TABLE environment_config IS 'Stores environment configuration variables with security flags';
COMMENT ON FUNCTION get_google_oauth_config() IS 'Returns public Google OAuth configuration for frontend use';
COMMENT ON FUNCTION get_google_client_secret() IS 'Returns Google OAuth client secret (edge functions only)';
