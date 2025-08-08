import React, { useState, useEffect } from 'react';
import { GoogleSiteKitService } from '@/services/googleSiteKitService';
import { GoogleSiteKit } from './GoogleSiteKit';
import { GoogleSiteKitSetup } from './GoogleSiteKitSetup';
import { GoogleSiteKitConfigPanel } from './GoogleSiteKitConfigPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  BarChart3, 
  Wrench, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Activity
} from 'lucide-react';

export const GoogleSiteKitManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const existingConfig = await GoogleSiteKitService.getConfig();
      setConfig(existingConfig);
      
      // Auto-navigate to setup if not configured
      if (!existingConfig?.is_connected) {
        setActiveTab('setup');
      }
    } catch (err) {
      console.error('Error loading configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadConfiguration();
      // Force refresh of child components by updating a timestamp
      setConfig(prev => prev ? { ...prev, _refreshed: Date.now() } : null);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getConnectionStatus = () => {
    if (!config) return { status: 'unknown', color: 'secondary' };
    
    if (config.is_connected) {
      return { status: 'connected', color: 'default' };
    } else if (config.connection_status === 'error') {
      return { status: 'error', color: 'destructive' };
    } else {
      return { status: 'disconnected', color: 'secondary' };
    }
  };

  const getSetupProgress = () => {
    if (!config) return 0;
    
    let completed = 0;
    const total = 4;
    
    if (config.is_connected) completed++;
    if (config.enable_analytics && config.analytics_property_id) completed++;
    if (config.enable_adsense && config.adsense_publisher_id) completed++;
    if (config.enable_search_console && config.search_console_site_url) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading Site Kit Manager...</span>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus();
  const setupProgress = getSetupProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Kit Manager</h1>
          <p className="text-muted-foreground">
            Manage your Google services integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connectionStatus.color as any}>
            {connectionStatus.status}
          </Badge>
          <Button onClick={refreshData} disabled={refreshing} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            {config?.is_connected ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{connectionStatus.status}</div>
            <p className="text-xs text-muted-foreground">
              {config?.last_sync_at 
                ? `Last sync: ${new Date(config.last_sync_at).toLocaleDateString()}`
                : 'Never synced'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setup Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{setupProgress}%</div>
            <p className="text-xs text-muted-foreground">
              {setupProgress === 100 ? 'Fully configured' : 'Configuration in progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[
                config?.enable_analytics,
                config?.enable_adsense,
                config?.enable_search_console
              ].filter(Boolean).length}
            </div>
            <p className="text-xs text-muted-foreground">of 3 services enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {config?.connection_status === 'error' && config?.error_message && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connection Error: {config.error_message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {config?.is_connected ? (
            <GoogleSiteKit key={config._refreshed} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Not Available</CardTitle>
                <CardDescription>
                  Complete the setup process to view your Google services dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab('setup')}>
                  Start Setup
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="setup">
          <GoogleSiteKitSetup />
        </TabsContent>

        <TabsContent value="settings">
          <GoogleSiteKitConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoogleSiteKitManager;