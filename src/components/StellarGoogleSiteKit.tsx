// Stellar Content Stream - Google Site Kit Integration
// Custom implementation inspired by Google Site Kit
// Adapted for React/TypeScript/Supabase stack
// No copyright conflicts - original implementation

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  DollarSign, 
  Search, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Target,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ServiceStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: string;
  data?: any;
  error?: string;
}

interface DashboardMetrics {
  analytics: {
    sessions: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: string;
    topPages: Array<{ page: string; views: number; }>;
    realTimeUsers?: number;
  };
  adsense: {
    earnings: number;
    clicks: number;
    impressions: number;
    ctr: number;
    rpm: number;
  };
  searchConsole: {
    impressions: number;
    clicks: number;
    ctr: number;
    avgPosition: number;
    topQueries: Array<{ query: string; clicks: number; impressions: number; }>;
  };
}

export const StellarGoogleSiteKit: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: 'analytics',
      name: 'Google Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      connected: false
    },
    {
      id: 'adsense',
      name: 'Google AdSense',
      icon: <DollarSign className="h-5 w-5" />,
      connected: false
    },
    {
      id: 'search-console',
      name: 'Search Console',
      icon: <Search className="h-5 w-5" />,
      connected: false
    }
  ]);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncing, setSyncing] = useState(false);

  // Initialize and check connection status
  useEffect(() => {
    initializeSiteKit();
  }, []);

  const initializeSiteKit = async () => {
    try {
      setLoading(true);
      
      // Check existing connections
      const { data: config } = await supabase
        .from('google_site_kit')
        .select('*')
        .limit(1);

      if (config && config.length > 0) {
        const siteKitConfig = config[0];
        updateServiceStatus(siteKitConfig);
        await loadMetrics();
      }
    } catch (error) {
      console.error('Failed to initialize Site Kit:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateServiceStatus = (config: any) => {
    setServices(prev => prev.map(service => ({
      ...service,
      connected: config.oauth_access_token ? true : false,
      lastSync: config.updated_at
    })));
  };

  const loadMetrics = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockMetrics: DashboardMetrics = {
        analytics: {
          sessions: 8542,
          pageViews: 15420,
          bounceRate: 42.5,
          avgSessionDuration: '2:45',
          realTimeUsers: 23,
          topPages: [
            { page: '/blog/web-development-trends', views: 2840 },
            { page: '/tutorials/react-hooks', views: 1920 },
            { page: '/about', views: 1450 },
            { page: '/contact', views: 980 },
            { page: '/services', views: 750 }
          ]
        },
        adsense: {
          earnings: 425.80,
          clicks: 125,
          impressions: 15420,
          ctr: 0.81,
          rpm: 3.40
        },
        searchConsole: {
          impressions: 45200,
          clicks: 1840,
          ctr: 4.07,
          avgPosition: 12.8,
          topQueries: [
            { query: 'react tutorials', clicks: 340, impressions: 5200 },
            { query: 'web development', clicks: 285, impressions: 4800 },
            { query: 'javascript guide', clicks: 220, impressions: 3900 },
            { query: 'next.js tutorial', clicks: 195, impressions: 3400 },
            { query: 'typescript tips', clicks: 160, impressions: 2800 }
          ]
        }
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const initiateOAuth = async () => {
    try {
      setSyncing(true);
      
      // Build OAuth URL
      const authUrl = new URL('https://accounts.google.com/oauth2/auth');
      authUrl.searchParams.set('client_id', import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '');
      authUrl.searchParams.set('redirect_uri', 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/adsense.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly'
      ].join(' '));
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      // Open OAuth popup
      const popup = window.open(authUrl.toString(), 'oauth', 'width=500,height=600');
      
      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'oauth_success') {
          window.removeEventListener('message', handleMessage);
          initializeSiteKit();
          setSyncing(false);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
    } catch (error) {
      console.error('OAuth initialization failed:', error);
      setSyncing(false);
    }
  };

  const syncData = async () => {
    setSyncing(true);
    await loadMetrics();
    setSyncing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const connectedServices = services.filter(s => s.connected);
  const connectionProgress = (connectedServices.length / services.length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Stellar Site Kit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Kit Dashboard</h1>
          <p className="text-gray-600">Manage your Google services integration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={syncData} disabled={syncing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Refresh Data'}
          </Button>
          {connectedServices.length === 0 && (
            <Button onClick={initiateOAuth} disabled={syncing}>
              <Shield className="h-4 w-4 mr-2" />
              Connect Services
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Service Connections</span>
          </CardTitle>
          <CardDescription>
            Connect your Google services to get insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Connection Progress</span>
                <span className="text-sm text-gray-500">
                  {connectedServices.length} of {services.length} connected
                </span>
              </div>
              <Progress value={connectionProgress} className="h-2" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {service.icon}
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <Badge variant={service.connected ? 'default' : 'secondary'}>
                    {service.connected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </Badge>
                </div>
              ))}
            </div>

            {connectedServices.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your Google services to see analytics data, AdSense earnings, and search performance.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      {metrics && connectedServices.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="adsense">AdSense</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.analytics.sessions)}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12.3% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.analytics.pageViews)}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +8.7% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AdSense Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.adsense.earnings)}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +15.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Search Clicks</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.searchConsole.clicks)}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +5.4% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.analytics.topPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm truncate flex-1">{page.page}</span>
                        <span className="text-sm font-medium">{formatNumber(page.views)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Search Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.searchConsole.topQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm truncate flex-1">{query.query}</span>
                        <span className="text-sm font-medium">{formatNumber(query.clicks)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumber(metrics.analytics.sessions)}</div>
                  <p className="text-sm text-muted-foreground">Total sessions this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bounce Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatPercentage(metrics.analytics.bounceRate)}</div>
                  <p className="text-sm text-muted-foreground">Average bounce rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.analytics.avgSessionDuration}</div>
                  <p className="text-sm text-muted-foreground">Average session length</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="adsense" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Estimated Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(metrics.adsense.earnings)}</div>
                  <p className="text-sm text-muted-foreground">This month's earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ad Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumber(metrics.adsense.clicks)}</div>
                  <p className="text-sm text-muted-foreground">Total ad clicks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Click-Through Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatPercentage(metrics.adsense.ctr)}</div>
                  <p className="text-sm text-muted-foreground">Ad CTR performance</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.searchConsole.impressions)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.searchConsole.clicks)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average CTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(metrics.searchConsole.ctr)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.searchConsole.avgPosition.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StellarGoogleSiteKit;
