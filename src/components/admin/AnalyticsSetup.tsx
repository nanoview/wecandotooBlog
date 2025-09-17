import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsSetupProps {
  onSetupComplete?: () => void;
}

const AnalyticsSetup = ({ onSetupComplete }: AnalyticsSetupProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const cleanSetupSQL = `-- =====================================================
-- CLEAN VISITOR ANALYTICS SETUP (RECOMMENDED)
-- This will drop existing tables and recreate them
-- WARNING: This will delete any existing analytics data
-- =====================================================

-- Drop existing tables
DROP TABLE IF EXISTS public.visitor_analytics_summary CASCADE;
DROP TABLE IF EXISTS public.post_impressions CASCADE;
DROP TABLE IF EXISTS public.visitor_sessions CASCADE;

-- Create visitor_sessions table
CREATE TABLE public.visitor_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    ip_address INET,
    country TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    os TEXT,
    referrer TEXT,
    first_visit TIMESTAMPTZ DEFAULT NOW(),
    last_visit TIMESTAMPTZ DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_impressions table
CREATE TABLE public.post_impressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    post_id INTEGER,
    post_slug TEXT,
    view_duration INTEGER DEFAULT 0,
    scroll_depth INTEGER DEFAULT 0,
    is_bounce BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create visitor_analytics_summary table
CREATE TABLE public.visitor_analytics_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    total_visitors INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create admin-accessible policies
CREATE POLICY "Anyone can insert visitor data" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view visitor data" ON public.visitor_sessions FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'editor')
);

CREATE POLICY "Anyone can insert impressions" ON public.post_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view impressions" ON public.post_impressions FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'editor')
);

CREATE POLICY "System can manage summary" ON public.visitor_analytics_summary FOR ALL USING (true);
CREATE POLICY "Admin can view summary" ON public.visitor_analytics_summary FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'editor')
);

-- Grant permissions
GRANT ALL ON public.visitor_sessions TO anon, authenticated, service_role;
GRANT ALL ON public.post_impressions TO anon, authenticated, service_role;
GRANT ALL ON public.visitor_analytics_summary TO anon, authenticated, service_role;

-- Add sample data for testing
INSERT INTO public.visitor_sessions (session_id, country, device_type, browser, os) VALUES 
    ('demo_session_1', 'United States', 'desktop', 'Chrome', 'Windows'),
    ('demo_session_2', 'United Kingdom', 'mobile', 'Safari', 'iOS'),
    ('demo_session_3', 'Canada', 'desktop', 'Firefox', 'macOS');

INSERT INTO public.post_impressions (session_id, post_id, view_duration, scroll_depth, is_bounce) VALUES 
    ('demo_session_1', 1, 120, 75, false),
    ('demo_session_2', 1, 45, 30, true),
    ('demo_session_3', 1, 200, 90, false);

INSERT INTO public.visitor_analytics_summary (date, total_visitors, total_sessions, total_page_views) VALUES 
    (CURRENT_DATE, 3, 3, 3);

-- Verify setup
SELECT 'SETUP COMPLETE! Analytics tables created successfully' as status;`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the SQL manually",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Analytics tables are not set up yet. Follow the simple setup below to enable visitor tracking.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Quick Analytics Setup
          </CardTitle>
          <CardDescription>
            Set up visitor analytics in your Supabase database with admin access permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Clean Setup SQL (Recommended)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(cleanSetupSQL, "Clean Setup SQL")}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied === "Clean Setup SQL" ? "Copied!" : "Copy SQL"}
              </Button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Recommended:</strong> Copy the SQL below and run it in your Supabase SQL Editor. This will drop existing tables and recreate them cleanly:
              </p>
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono max-h-60 overflow-y-auto">
                {cleanSetupSQL}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Setup Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Open your Supabase Dashboard</li>
              <li>Go to the "SQL Editor" section</li>
              <li>Create a new query</li>
              <li>Paste the SQL from above and run it</li>
              <li>Come back here and refresh analytics</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Supabase Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => onSetupComplete?.()}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              I've run the SQL, refresh analytics
            </Button>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              The SQL above creates the tables with proper admin access permissions using your existing user roles system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export { AnalyticsSetup };
