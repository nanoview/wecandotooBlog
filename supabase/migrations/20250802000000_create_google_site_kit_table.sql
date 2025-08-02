-- Create Google Site Kit configuration table
CREATE TABLE IF NOT EXISTS google_site_kit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- OAuth Configuration
  oauth_client_id TEXT,
  oauth_client_secret TEXT, -- Note: In production, encrypt this field
  oauth_redirect_uri TEXT DEFAULT 'http://localhost:8082/oauth/callback',
  oauth_access_token TEXT, -- Store encrypted in production
  oauth_refresh_token TEXT, -- Store encrypted in production
  oauth_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Google AdSense Configuration
  adsense_publisher_id TEXT, -- ca-pub-XXXXXXXXXXXXXXXX
  adsense_customer_id TEXT,
  adsense_account_id TEXT,
  adsense_site_id TEXT,
  
  -- Google Analytics Configuration
  analytics_property_id TEXT, -- G-XXXXXXXXXX
  analytics_view_id TEXT,
  analytics_measurement_id TEXT,
  
  -- Google Search Console Configuration
  search_console_site_url TEXT,
  search_console_verified BOOLEAN DEFAULT FALSE,
  
  -- Site Verification
  site_verification_code TEXT,
  site_verification_method TEXT DEFAULT 'meta_tag', -- meta_tag, html_file, dns
  
  -- API Scopes and Permissions
  enabled_apis TEXT[] DEFAULT ARRAY['adsense', 'analytics', 'search_console'],
  oauth_scopes TEXT[] DEFAULT ARRAY[
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'openid',
    'email',
    'profile'
  ],
  
  -- Feature Flags
  enable_adsense BOOLEAN DEFAULT TRUE,
  enable_analytics BOOLEAN DEFAULT TRUE,
  enable_search_console BOOLEAN DEFAULT TRUE,
  enable_auto_ads BOOLEAN DEFAULT FALSE,
  
  -- Connection Status
  is_connected BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT DEFAULT 'disconnected', -- disconnected, connected, error
  error_message TEXT,
  
  -- User Management
  configured_by UUID REFERENCES auth.users(id),
  
  -- Ensure only one configuration per site
  CONSTRAINT single_site_kit_config UNIQUE (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_site_kit_connection_status ON google_site_kit(connection_status);
CREATE INDEX IF NOT EXISTS idx_google_site_kit_is_connected ON google_site_kit(is_connected);
CREATE INDEX IF NOT EXISTS idx_google_site_kit_configured_by ON google_site_kit(configured_by);

-- Enable Row Level Security
ALTER TABLE google_site_kit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only admins can access)
CREATE POLICY "Admins can view Google Site Kit config" ON google_site_kit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      JOIN user_roles ON profiles.user_id = user_roles.user_id 
      WHERE profiles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert Google Site Kit config" ON google_site_kit
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      JOIN user_roles ON profiles.user_id = user_roles.user_id 
      WHERE profiles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update Google Site Kit config" ON google_site_kit
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      JOIN user_roles ON profiles.user_id = user_roles.user_id 
      WHERE profiles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_site_kit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_google_site_kit_updated_at
  BEFORE UPDATE ON google_site_kit
  FOR EACH ROW
  EXECUTE FUNCTION update_google_site_kit_updated_at();

-- Insert default configuration
INSERT INTO google_site_kit (
  adsense_publisher_id,
  adsense_customer_id,
  oauth_client_id,
  oauth_redirect_uri,
  analytics_property_id,
  site_verification_code,
  configured_by
) VALUES (
  'ca-pub-2959602333047653',
  '9592425312',
  '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',
  'http://localhost:8082/oauth/callback',
  'G-XXXXXXXXXX',
  'your_verification_code',
  (SELECT id FROM auth.users LIMIT 1) -- Use first admin user
) ON CONFLICT (id) DO NOTHING;
