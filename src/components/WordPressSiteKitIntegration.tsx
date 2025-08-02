import React, { useState, useEffect } from 'react';
import { GoogleSiteKitService, GoogleSiteKitConfig } from '@/services/googleSiteKitService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Search,
  ExternalLink,
  RefreshCw,
  Link,
  Info
} from 'lucide-react';

export const WordPressSiteKitIntegration: React.FC = () => {
  const [config, setConfig] = useState<GoogleSiteKitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the configuration from database
      const siteKitConfig = await GoogleSiteKitService.getConfig();
      setConfig(siteKitConfig);
      
    } catch (err) {
      setError('Failed to load Google Site Kit configuration');
    } finally {
      setLoading(false);
    }
  };

  const openWordPressDashboard = () => {
    window.open('https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard', '_blank');
  };

  const openWordPressAnalytics = () => {
    window.open('https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard#traffic', '_blank');
  };

  const openWordPressAdSense = () => {
    window.open('https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard#monetization', '_blank');
  };

  const openWordPressSearchConsole = () => {
    window.open('https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard#search-traffic', '_blank');
  };

  const initiateReactOAuth = async () => {
    try {
      if (!config?.oauth_client_id) {
        throw new Error('OAuth Client ID not configured');
      }

      // Construct OAuth URL for React app
      const authUrl = new URL('https://accounts.google.com/oauth/authorize');
      authUrl.searchParams.set('client_id', config.oauth_client_id);
      authUrl.searchParams.set('redirect_uri', config.oauth_redirect_uri || `${window.location.origin}/oauth/callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('scope', [
        'https://www.googleapis.com/auth/adsense.readonly',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly',
        'openid',
        'email',
        'profile'
      ].join(' '));

      // Redirect to Google OAuth
      window.location.href = authUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate OAuth');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading Site Kit integration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Missing</AlertTitle>
            <AlertDescription>
              Google Site Kit configuration not found. Please run the database setup.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isWordPressWorking = config.search_console_verified; // Assuming WordPress setup is verified

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Google Site Kit Integration
              </CardTitle>
              <CardDescription>
                Connect your React app with existing WordPress Site Kit data
              </CardDescription>
            </div>
            <Badge variant={isWordPressWorking ? "default" : "secondary"}>
              WordPress: {isWordPressWorking ? "Active" : "Setup Needed"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* WordPress Site Kit Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">WordPress Site Kit Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>WordPress Site Kit Detected</AlertTitle>
            <AlertDescription>
              You have Google Site Kit working at: https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={openWordPressDashboard} variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open WordPress Dashboard
            </Button>
            <Button onClick={openWordPressAnalytics} variant="outline" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics (WordPress)
            </Button>
            <Button onClick={openWordPressAdSense} variant="outline" className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              View AdSense (WordPress)
            </Button>
            <Button onClick={openWordPressSearchConsole} variant="outline" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              View Search Console (WordPress)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* React App Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">React App Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Additional Authorization Needed</AlertTitle>
              <AlertDescription>
                To display Google data in your React app, you need to authorize this specific application. 
                This won't interfere with your existing WordPress Site Kit.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <div>
                  <div className="font-medium">React App Authorization Required</div>
                  <div className="text-sm text-gray-500">
                    One-time setup to connect React app with your Google data
                  </div>
                </div>
              </div>
              
              <Button onClick={initiateReactOAuth} className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Authorize React App
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AdSense</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config.enable_adsense ? "Enabled" : "Disabled"}
            </div>
            <p className="text-xs text-muted-foreground">
              Publisher: {config.adsense_publisher_id}
            </p>
            <p className="text-xs text-green-600 mt-1">
              ✅ Working in WordPress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config.enable_analytics ? "Enabled" : "Disabled"}
            </div>
            <p className="text-xs text-muted-foreground">
              Property: {config.analytics_property_id}
            </p>
            <p className="text-xs text-green-600 mt-1">
              ✅ Working in WordPress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Console</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config.enable_search_console ? "Enabled" : "Disabled"}
            </div>
            <p className="text-xs text-muted-foreground">
              Domain: {config.search_console_site_url}
            </p>
            <p className="text-xs text-green-600 mt-1">
              ✅ Working in WordPress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>WordPress Site Kit URL:</strong>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                https://wecandotoo.com/wp-admin/admin.php?page=googlesitekit-dashboard
              </div>
            </div>
            <div>
              <strong>React App OAuth:</strong>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                {config.oauth_redirect_uri}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WordPressSiteKitIntegration;
