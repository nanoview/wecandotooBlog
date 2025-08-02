-- Create Google Site Kit configuration table
CREATE TABLE public.google_site_kit_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_url TEXT NOT NULL DEFAULT 'https://wecandotoo.com',
    oauth_client_id TEXT NOT NULL,
    oauth_client_secret TEXT NOT NULL,
    oauth_redirect_uri TEXT NOT NULL DEFAULT 'https://wecandotoo.com/oauth/callback',
    
    -- Google AdSense Configuration
    enable_adsense BOOLEAN DEFAULT true,
    adsense_publisher_id TEXT,
    adsense_customer_id TEXT,
    
    -- Google Analytics Configuration  
    enable_analytics BOOLEAN DEFAULT true,
    analytics_property_id TEXT,
    analytics_view_id TEXT,
    
    -- Google Search Console Configuration
    enable_search_console BOOLEAN DEFAULT true,
    search_console_site_url TEXT DEFAULT 'https://wecandotoo.com',
    search_console_verified BOOLEAN DEFAULT false,
    
    -- Connection Status
    connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- OAuth Tokens (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_site_kit_config ENABLE ROW LEVEL SECURITY;

-- Create policies for Google Site Kit config
CREATE POLICY "Users can view their own google site kit config" 
ON public.google_site_kit_config 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

CREATE POLICY "Users can create their own google site kit config" 
ON public.google_site_kit_config 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

CREATE POLICY "Users can update their own google site kit config" 
ON public.google_site_kit_config 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

CREATE POLICY "Admins can delete google site kit config" 
ON public.google_site_kit_config 
FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_google_site_kit_config_updated_at
BEFORE UPDATE ON public.google_site_kit_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration for wecandotoo.com
INSERT INTO public.google_site_kit_config (
    site_url,
    oauth_client_id,
    oauth_client_secret,
    oauth_redirect_uri,
    adsense_publisher_id,
    adsense_customer_id,
    analytics_property_id,
    search_console_site_url
) VALUES (
    'https://wecandotoo.com',
    'YOUR_OAUTH_CLIENT_ID_HERE',
    'YOUR_OAUTH_CLIENT_SECRET_HERE', 
    'https://wecandotoo.com/oauth/callback',
    'ca-pub-2959602333047653',
    '9592425312',
    'G-XXXXXXXXXX',
    'https://wecandotoo.com'
);