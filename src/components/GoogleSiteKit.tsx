import React, { useState, useEffect } from 'react';
import { GoogleSiteKitService } from '@/services/googleSiteKitService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Activity
} from 'lucide-react';

interface DashboardData {
  adsense: any;
  analytics: any;
  searchConsole: any;
  isConnected: boolean;
  lastSync: string | null;
}

export const GoogleSiteKit: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getMockData = () => ({
    adsense: {
      earnings: { today: 12.45, yesterday: 15.30, thisMonth: 425.80, lastMonth: 380.25 },
      performance: { pageViews: 15420, clicks: 125, ctr: 0.81, cpm: 3.40 }
    },
    analytics: {
      overview: { sessions: 8542, pageViews: 15420, bounceRate: 42.5, avgSessionDuration: '2:45' },
      topPages: [
        { page: '/blog/web-development-trends', pageViews: 2840 },
        { page: '/tutorials/react-hooks', pageViews: 1920 },
        { page: '/about', pageViews: 1580 },
        { page: '/contact', pageViews: 1240 },
        { page: '/blog/javascript-tips', pageViews: 980 }
      ]
    },
    searchConsole: {
      overview: { totalClicks: 3250, totalImpressions: 45800, averageCTR: 7.1, averagePosition: 12.4 },
      topQueries: [
        { query: 'web development', clicks: 450, impressions: 6200, ctr: 7.3, position: 8.2 },
        { query: 'react tutorial', clicks: 320, impressions: 4100, ctr: 7.8, position: 9.1 },
        { query: 'javascript tips', clicks: 280, impressions: 3800, ctr: 7.4, position: 11.5 },
        { query: 'coding best practices', clicks: 210, impressions: 2900, ctr: 7.2, position: 13.2 },
        { query: 'frontend development', clicks: 190, impressions: 2600, ctr: 7.3, position: 10.8 }
      ]
    }
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check connection status
      const config = await GoogleSiteKitService.getConfig();
      const isConnected = config?.is_connected || false;

      // Use mock data for now
      const mockData = getMockData();

      setData({
        adsense: mockData.adsense,
        analytics: mockData.analytics,
        searchConsole: mockData.searchConsole,
        isConnected,
        lastSync: config?.last_sync_at || null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const connectToGoogle = () => {
    // This would trigger the OAuth flow
    const authUrl = `https://accounts.google.com/oauth2/auth?` +
      `client_id=622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com&` +
      `redirect_uri=https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/adsense.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.open(authUrl, '_blank', 'width=500,height=600');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading Site Kit...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Kit by Google</h1>
          <p className="text-muted-foreground">
            Get insights about how your site is performing and being discovered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={data?.isConnected ? "default" : "secondary"}>
            {data?.isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {!data?.isConnected && (
            <Button onClick={connectToGoogle}>
              Connect to Google
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!data?.isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect your Google account to see real data from Analytics, AdSense, and Search Console.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="search">Search Console</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.analytics?.overview?.sessions?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.analytics?.overview?.pageViews?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Search Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.searchConsole?.overview?.totalClicks?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AdSense Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data?.adsense?.earnings?.thisMonth?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Performance */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pages</CardTitle>
                <CardDescription>Most viewed pages in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.analytics?.topPages?.slice(0, 5).map((page: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{page.page}</p>
                      </div>
                      <Badge variant="secondary">{page.pageViews.toLocaleString()} views</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
                <CardDescription>Most clicked queries from Search Console</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.searchConsole?.topQueries?.slice(0, 5).map((query: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{query.query}</p>
                        <p className="text-xs text-muted-foreground">Position {query.position.toFixed(1)}</p>
                      </div>
                      <Badge variant="secondary">{query.clicks} clicks</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Google Analytics
              </CardTitle>
              <CardDescription>Website traffic and user behavior insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.analytics?.overview?.sessions?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.analytics?.overview?.pageViews?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Page Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.analytics?.overview?.bounceRate?.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Bounce Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.analytics?.overview?.avgSessionDuration}</div>
                  <div className="text-sm text-muted-foreground">Avg. Session Duration</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Top Content</h4>
                <div className="space-y-2">
                  {data?.analytics?.topPages?.map((page: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm">{page.page}</span>
                      <div className="text-sm font-medium">{page.pageViews.toLocaleString()} views</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AdSense Tab */}
        <TabsContent value="adsense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Google AdSense
              </CardTitle>
              <CardDescription>Monetization and ad performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">${data?.adsense?.earnings?.today?.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${data?.adsense?.earnings?.yesterday?.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Yesterday</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${data?.adsense?.earnings?.thisMonth?.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${data?.adsense?.earnings?.lastMonth?.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Last Month</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Page Views</span>
                      <span className="font-medium">{data?.adsense?.performance?.pageViews?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clicks</span>
                      <span className="font-medium">{data?.adsense?.performance?.clicks?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CTR</span>
                      <span className="font-medium">{data?.adsense?.performance?.ctr?.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CPM</span>
                      <span className="font-medium">${data?.adsense?.performance?.cpm?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Console Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Google Search Console
              </CardTitle>
              <CardDescription>Search performance and SEO insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.searchConsole?.overview?.totalClicks?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.searchConsole?.overview?.totalImpressions?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.searchConsole?.overview?.averageCTR?.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Average CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data?.searchConsole?.overview?.averagePosition?.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Average Position</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Top Queries</h4>
                <div className="space-y-2">
                  {data?.searchConsole?.topQueries?.map((query: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <div className="text-sm font-medium">{query.query}</div>
                        <div className="text-xs text-muted-foreground">
                          Position {query.position.toFixed(1)} • {query.ctr.toFixed(1)}% CTR
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{query.clicks} clicks</div>
                        <div className="text-xs text-muted-foreground">{query.impressions.toLocaleString()} impressions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Sync Info */}
      {data?.lastSync && (
        <div className="text-center text-sm text-muted-foreground">
          Last synced: {new Date(data.lastSync).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default GoogleSiteKit;