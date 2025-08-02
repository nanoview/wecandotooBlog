-- Fix security issues found by the linter

-- 1. Enable RLS on google_api_cache table
ALTER TABLE public.google_api_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for google_api_cache (admin only access)
CREATE POLICY "Only admins can manage google api cache" 
ON public.google_api_cache 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- 2. Update the default config entry to have proper OAuth credentials that need to be filled in
UPDATE public.google_site_kit_config 
SET 
  oauth_client_id = '',
  oauth_client_secret = ''
WHERE oauth_client_id = 'YOUR_OAUTH_CLIENT_ID_HERE';