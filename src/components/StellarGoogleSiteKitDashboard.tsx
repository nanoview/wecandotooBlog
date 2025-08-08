// Stellar Content Stream - Google Site Kit Dashboard
// Comprehensive dashboard integrating all Google services
// Adapted for React/TypeScript/Supabase - No copyright conflicts

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  MousePointer, 
  Eye,
  DollarSign,
  Search,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Zap,
  Target,
  Activity
} from 'lucide-react';

import { stellarAnalytics, type AnalyticsReport } from '../services/stellarAnalyticsService';
import { stellarAdSense, type AdSenseReport } from '../services/stellarAdSenseService';
import { stellarSearchConsole, type SearchConsoleReport } from '../services/stellarSearchConsoleService';
import { stellarSiteKitConfig, type ServiceStatus, type SetupStep } from '../services/stellarSiteKitConfig';

interface SiteKitData {
  analytics?: AnalyticsReport;
  adsense?: AdSenseReport;
  searchConsole?: SearchConsoleReport;
  servicesStatus: ServiceStatus[];
  setupSteps: SetupStep[];
  isLoading: boolean;
  lastUpdated?: string;
}

const StellarGoogleSiteKit: React.FC = () => {
  const [data, setData] = useState<SiteKitData>({
    servicesStatus: [],
    setupSteps: [],
    isLoading: true
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '28days' | '90days'>('28days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Calculate date range based on selected period
   */
  const getDateRange = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '28days':
        startDate.setDate(endDate.getDate() - 28);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, [selectedPeriod]);

  /**
   * Load all Site Kit data
   */
  const loadSiteKitData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Initialize services
      await stellarSiteKitConfig.initialize();
      await stellarAnalytics.initialize();
      await stellarAdSense.initialize();
      await stellarSearchConsole.initialize();

      const { startDate, endDate } = getDateRange();

      // Load data from all services in parallel
      const [
        analyticsData,
        adsenseData,
        searchConsoleData,
        servicesStatus,
        setupSteps
      ] = await Promise.all([
        stellarAnalytics.getAnalyticsReport(startDate, endDate),
        stellarAdSense.getAdSenseReport(startDate, endDate),
        stellarSearchConsole.getSearchConsoleReport(startDate, endDate),
        stellarSiteKitConfig.getServicesStatus(),
        stellarSiteKitConfig.getSetupSteps()
      ]);

      setData({
        analytics: analyticsData,
        adsense: adsenseData,
        searchConsole: searchConsoleData,
        servicesStatus,
        setupSteps,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load Site Kit data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsRefreshing(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    loadSiteKitData();
  }, [loadSiteKitData]);

  /**
   * Format number with proper separators
   */
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  /**
   * Format percentage
   */
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  /**
   * Get trend icon and color
   */
  const getTrendDisplay = (trend: 'up' | 'down' | 'neutral', percentage: number) => {
    const color = trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-600';
    const Icon = trend === 'up' ? TrendingUp : 
                 trend === 'down' ? TrendingDown : Activity;
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">{Math.abs(percentage).toFixed(1)}%</span>
      </div>
    );
  };

  /**
   * Render service status badge
   */
  const renderServiceStatus = (status: ServiceStatus) => {
    const variant = status.connected && status.configured ? 'default' : 'secondary';
    const icon = status.connected && status.configured ? 
      <CheckCircle className="h-3 w-3 mr-1" /> : 
      <AlertCircle className="h-3 w-3 mr-1" />;

    return (
      <Badge variant={variant} className="text-xs">
        {icon}
        {status.connected && status.configured ? 'Connected' : 'Setup Required'}
      </Badge>
    );
  };

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Site Kit Dashboard...</p>
        </div>
      </div>
    );
  }

  const setupProgress = data.setupSteps.filter(step => step.completed).length / data.setupSteps.length * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Kit Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your Google services performance overview
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7days">Last 7 days</option>
            <option value="28days">Last 28 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          <Button 
            variant="outline" 
            onClick={loadSiteKitData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Setup Progress */}
      {setupProgress < 100 && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between mb-2">
              <span>Setup Progress: {Math.round(setupProgress)}% complete</span>
              <Button variant="link" size="sm">
                Continue Setup <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <Progress value={setupProgress} className="w-full" />
          </AlertDescription>
        </Alert>
      )}

      {/* Services Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.servicesStatus.map((service) => (
          <Card key={service.service}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="capitalize">{service.service}</span>
                {renderServiceStatus(service)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {service.hasData ? `Last updated: ${service.lastDataFetch ? 'Just now' : 'Never'}` : 'No data available'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="search">Search Console</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Analytics Overview */}
            {data.analytics && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.analytics.overview.sessions)}</div>
                    <p className="text-xs text-muted-foreground">Total sessions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.analytics.overview.pageViews)}</div>
                    <p className="text-xs text-muted-foreground">Total page views</p>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Search Console Overview */}
            {data.searchConsole && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Search Clicks</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.searchConsole.overview.totalClicks)}</div>
                    <p className="text-xs text-muted-foreground">From search results</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Search Impressions</CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.searchConsole.overview.totalImpressions)}</div>
                    <p className="text-xs text-muted-foreground">In search results</p>
                  </CardContent>
                </Card>
              </>
            )}

            {/* AdSense Overview */}
            {data.adsense && (
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AdSense Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.adsense.overview.estimatedEarnings)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(data.adsense.overview.clickThroughRate)} CTR • 
                    {formatCurrency(data.adsense.overview.costPerClick)} CPC
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Content Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages by Traffic */}
            {data.analytics?.topPages && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Pages by Traffic</CardTitle>
                  <CardDescription>Most visited pages in the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.analytics.topPages.slice(0, 5).map((page, index) => (
                      <div key={page.pagePath} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{page.pageTitle}</p>
                          <p className="text-xs text-muted-foreground truncate">{page.pagePath}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatNumber(page.pageViews)}</p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Search Queries */}
            {data.searchConsole?.topQueries && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Search Queries</CardTitle>
                  <CardDescription>Most clicked search queries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.searchConsole.topQueries.slice(0, 5).map((query, index) => (
                      <div key={query.query} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{query.query}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercentage(query.ctr)} CTR • Pos. {query.position.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatNumber(query.clicks)}</p>
                          <p className="text-xs text-muted-foreground">clicks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {data.analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.analytics.overview.sessions)}</div>
                    <div className="flex items-center mt-2">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-muted-foreground">Unique visits</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(data.analytics.overview.bounceRate)}</div>
                    <div className="flex items-center mt-2">
                      <Target className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-sm text-muted-foreground">Single page visits</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.analytics.overview.avgSessionDuration}</div>
                    <div className="flex items-center mt-2">
                      <Activity className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-muted-foreground">Time on site</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.analytics.trafficSources.slice(0, 5).map((source) => {
                        const Icon = source.medium === 'organic' ? Search :
                                   source.medium === 'referral' ? ExternalLink : Globe;
                        
                        return (
                          <div key={`${source.source}-${source.medium}`} className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{source.source} / {source.medium}</span>
                                <span className="text-sm text-muted-foreground">{source.percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={source.percentage} className="h-2" />
                            </div>
                            <span className="text-sm font-medium">{formatNumber(source.sessions)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Pages by Views */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages by Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.analytics.topPages.slice(0, 5).map((page) => (
                        <div key={page.pagePath} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{page.pageTitle}</p>
                              <p className="text-xs text-muted-foreground">{page.averageTimeOnPage} avg time</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">{formatNumber(page.pageViews)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Analytics data is not available. Please ensure Google Analytics is properly configured.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Search Console Tab */}
        <TabsContent value="search" className="space-y-6">
          {data.searchConsole ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.searchConsole.overview.totalClicks)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.searchConsole.overview.totalImpressions)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(data.searchConsole.overview.averageCTR)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.searchConsole.overview.averagePosition.toFixed(1)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Queries */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Search Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.searchConsole.topQueries.slice(0, 8).map((query) => (
                        <div key={query.query} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{query.query}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(query.impressions)} impressions • Pos. {query.position.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatNumber(query.clicks)}</p>
                            <p className="text-xs text-muted-foreground">{formatPercentage(query.ctr)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Search Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.searchConsole.topPages.slice(0, 8).map((page) => (
                        <div key={page.page} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{page.page}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(page.impressions)} impressions • Pos. {page.position.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatNumber(page.clicks)}</p>
                            <p className="text-xs text-muted-foreground">{formatPercentage(page.ctr)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Search Console data is not available. Please ensure Google Search Console is properly configured.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* AdSense Tab */}
        <TabsContent value="adsense" className="space-y-6">
          {data.adsense ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.adsense.overview.estimatedEarnings)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(data.adsense.overview.pageViews)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(data.adsense.overview.clickThroughRate)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Cost Per Click</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.adsense.overview.costPerClick)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Earning Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Earning Pages</CardTitle>
                  <CardDescription>Pages generating the most ad revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.adsense.topEarningPages.map((page) => (
                      <div key={page.pagePath} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{page.pageTitle}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {page.pagePath} • {formatNumber(page.pageViews)} views
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(page.earnings)}</p>
                          <p className="text-xs text-muted-foreground">
                            {page.clicks} clicks • {formatPercentage(page.ctr)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                AdSense data is not available. Please ensure Google AdSense is properly configured.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        {data.lastUpdated && (
          <p>Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
        )}
        <p className="mt-1">Powered by Stellar Content Stream Site Kit</p>
      </div>
    </div>
  );
};

export default StellarGoogleSiteKit;
