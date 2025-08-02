import React, { useState, useEffect } from 'react';
import { GoogleSiteKitService, GoogleSiteKitConfig } from '@/services/googleSiteKitService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Unlink
} from 'lucide-react';

export const GoogleSiteKitManager: React.FC = () => {
  const [config, setConfig] = useState<GoogleSiteKitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      const siteKitConfig = await GoogleSiteKitService.getConfig();
      setConfig(siteKitConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      console.error('Error loading Google Site Kit config:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiateOAuthConnection = async () => {
    try {
      setConnecting(true);
      setError(null);

      if (!config?.oauth_client_id) {
        throw new Error('OAuth Client ID not configured. Please run the database setup first.');
      }

      // Construct OAuth URL
      const authUrl = new URL('https://accounts.google.com/oauth/authorize');
      authUrl.searchParams.set('client_id', config.oauth_client_id);
      authUrl.searchParams.set('redirect_uri', config.oauth_redirect_uri || `${window.location.origin}/oauth/callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('scope', config.oauth_scopes?.join(' ') || '');

      // Redirect to Google OAuth
      window.location.href = authUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate OAuth connection');
      setConnecting(false);
    }
  };

  const disconnectGoogleServices = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Update connection status
      await GoogleSiteKitService.updateConnectionStatus('disconnected');
      
      // Reload configuration
      await loadConfiguration();
      
      // Clear any stored tokens (in a real implementation, you'd revoke them)
      console.log('Google services disconnected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Google services');
    } finally {
      setRefreshing(false);
    }
  };

  const refreshConnection = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await loadConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh connection');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading Google Site Kit configuration...</span>
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
            <AlertTitle>Configuration Not Found</AlertTitle>
            <AlertDescription>
              Google Site Kit is not configured. Please run the database setup script first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isConnected = config.is_connected && config.connection_status === 'connected';
  const hasError = config.connection_status === 'error';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Google Site Kit Manager
              </CardTitle>
              <CardDescription>
                Manage your Google services integration for AdSense, Analytics, and Search Console
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : hasError ? "destructive" : "secondary"}>
                {isConnected ? "Connected" : hasError ? "Error" : "Disconnected"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <div className="font-medium">
                    Google Services {isConnected ? 'Connected' : 'Not Connected'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {config.last_sync_at 
                      ? `Last synced: ${new Date(config.last_sync_at).toLocaleString()}`
                      : 'Never synced'
                    }
                  </div>
                  {config.error_message && (
                    <div className="text-sm text-red-600 mt-1">
                      Error: {config.error_message}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isConnected ? (
                  <Button 
                    onClick={initiateOAuthConnection}
                    disabled={connecting}
                    className="flex items-center gap-2"
                  >
                    {connecting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Link className="w-4 h-4" />
                    )}
                    Connect Google Services
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={refreshConnection}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={disconnectGoogleServices}
                      disabled={refreshing}
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="search">Search Console</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AdSense Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Google AdSense</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config.enable_adsense ? "Enabled" : "Disabled"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Publisher: {config.adsense_publisher_id || "Not configured"}
                </p>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Google Analytics</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config.enable_analytics ? "Enabled" : "Disabled"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Property: {config.analytics_property_id || "Not configured"}
                </p>
              </CardContent>
            </Card>

            {/* Search Console Card */}
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
                  Domain: {config.search_console_site_url || "Not configured"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Details */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>OAuth Client ID:</strong>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {config.oauth_client_id?.substring(0, 40)}...
                  </div>
                </div>
                <div>
                  <strong>Redirect URI:</strong>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {config.oauth_redirect_uri}
                  </div>
                </div>
                <div>
                  <strong>Site Verification:</strong>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {config.site_verification_code ? 'Configured' : 'Not configured'}
                  </div>
                </div>
                <div>
                  <strong>Enabled APIs:</strong>
                  <div className="flex gap-1 mt-1">
                    {config.enabled_apis?.map(api => (
                      <Badge key={api} variant="outline" className="text-xs">
                        {api}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adsense">
          <AdSensePanel config={config} isConnected={isConnected} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsPanel config={config} isConnected={isConnected} />
        </TabsContent>

        <TabsContent value="search">
          <SearchConsolePanel config={config} isConnected={isConnected} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// AdSense Panel Component
const AdSensePanel: React.FC<{ config: GoogleSiteKitConfig; isConnected: boolean }> = ({ config, isConnected }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Google AdSense Integration
      </CardTitle>
      <CardDescription>
        Manage your AdSense account and view earnings data
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Publisher ID</label>
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {config.adsense_publisher_id || 'Not configured'}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Customer ID</label>
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {config.adsense_customer_id || 'Not configured'}
          </div>
        </div>
      </div>
      
      {isConnected ? (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>AdSense Connected</AlertTitle>
            <AlertDescription>
              Your AdSense account is connected and ready to display earnings data.
            </AlertDescription>
          </Alert>
          
          <Button className="w-full" variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View AdSense Dashboard
          </Button>
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connect Required</AlertTitle>
          <AlertDescription>
            Connect to Google services to view AdSense data and manage your ads.
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

// Analytics Panel Component
const AnalyticsPanel: React.FC<{ config: GoogleSiteKitConfig; isConnected: boolean }> = ({ config, isConnected }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Google Analytics Integration
      </CardTitle>
      <CardDescription>
        Track website traffic and user behavior
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Property ID</label>
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {config.analytics_property_id || 'Not configured'}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Measurement ID</label>
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {config.analytics_measurement_id || 'Not configured'}
          </div>
        </div>
      </div>
      
      {isConnected ? (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Analytics Connected</AlertTitle>
            <AlertDescription>
              Your Google Analytics is connected and tracking website data.
            </AlertDescription>
          </Alert>
          
          <Button className="w-full" variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Analytics Dashboard
          </Button>
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connect Required</AlertTitle>
          <AlertDescription>
            Connect to Google services to view Analytics data and track your website performance.
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

// Search Console Panel Component
const SearchConsolePanel: React.FC<{ config: GoogleSiteKitConfig; isConnected: boolean }> = ({ config, isConnected }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        Google Search Console Integration
      </CardTitle>
      <CardDescription>
        Monitor search performance and SEO data
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Site URL</label>
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {config.search_console_site_url || 'Not configured'}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Verification Status</label>
          <div className="flex items-center gap-2">
            {config.search_console_verified ? (
              <Badge variant="default">Verified</Badge>
            ) : (
              <Badge variant="secondary">Not Verified</Badge>
            )}
          </div>
        </div>
      </div>
      
      {isConnected ? (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Search Console Connected</AlertTitle>
            <AlertDescription>
              Your Search Console is connected and monitoring search performance.
            </AlertDescription>
          </Alert>
          
          <Button className="w-full" variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Search Console Dashboard
          </Button>
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connect Required</AlertTitle>
          <AlertDescription>
            Connect to Google services to view Search Console data and monitor your SEO performance.
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

export default GoogleSiteKitManager;
