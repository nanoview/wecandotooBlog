import React, { useState, useEffect } from 'react';
import { googleDataService } from '@/services/googleDataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  DollarSign, 
  MousePointer, 
  Search,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoogleDashboardProps {
  className?: string;
}

const GoogleDataDashboard: React.FC<GoogleDashboardProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [adsenseData, setAdsenseData] = useState<any>(null);
  const [searchConsoleData, setSearchConsoleData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    setIsAuthenticated(googleDataService.isAuthenticated());
    if (googleDataService.isAuthenticated()) {
      fetchAllData();
    }
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [analytics, adsense, searchConsole] = await Promise.allSettled([
        googleDataService.getAnalyticsData(dateRange),
        googleDataService.getAdSenseData(dateRange),
        googleDataService.getSearchConsoleData(dateRange)
      ]);

      if (analytics.status === 'fulfilled') {
        setAnalyticsData(analytics.value);
      } else {
        console.error('Analytics error:', analytics.reason);
      }

      if (adsense.status === 'fulfilled') {
        setAdsenseData(adsense.value);
      } else {
        console.error('AdSense error:', adsense.reason);
      }

      if (searchConsole.status === 'fulfilled') {
        setSearchConsoleData(searchConsole.value);
      } else {
        console.error('Search Console error:', searchConsole.reason);
      }

    } catch (error) {
      console.error('Error fetching Google data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Google data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = () => {
    googleDataService.authenticate();
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (!isAuthenticated) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Google Services Not Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect your Google account to view Analytics, AdSense, and Search Console data.
            </p>
            <Button onClick={handleAuthenticate} className="bg-blue-600 hover:bg-blue-700">
              Connect Google Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Google Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time insights from your Google services</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Google Services Connected</span>
            <Badge variant="secondary" className="ml-2">Live Data</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.page_views)}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.date_range}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.sessions)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(analyticsData.users)} unique users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(analyticsData.bounce_rate)}</div>
              <p className="text-xs text-muted-foreground">
                Avg. session: {Math.round(analyticsData.avg_session_duration)}s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData.users)}</div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AdSense Data */}
      {adsenseData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              AdSense Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(adsenseData.estimated_earnings)}
                </div>
                <p className="text-sm text-green-600">Estimated Earnings</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {formatNumber(adsenseData.page_views)}
                </div>
                <p className="text-sm text-blue-600">Page Views</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {formatNumber(adsenseData.clicks)}
                </div>
                <p className="text-sm text-purple-600">Ad Clicks</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {formatPercentage(adsenseData.ctr)}
                </div>
                <p className="text-sm text-orange-600">Click-through Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Console Data */}
      {searchConsoleData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Search Console Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {formatNumber(searchConsoleData.impressions)}
                </div>
                <p className="text-sm text-blue-600">Impressions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {formatNumber(searchConsoleData.clicks)}
                </div>
                <p className="text-sm text-green-600">Clicks</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {formatPercentage(searchConsoleData.ctr)}
                </div>
                <p className="text-sm text-purple-600">Click-through Rate</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {searchConsoleData.average_position.toFixed(1)}
                </div>
                <p className="text-sm text-orange-600">Avg. Position</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://analytics.google.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.google.com/adsense', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open AdSense
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://search.google.com/search-console', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Search Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleDataDashboard;
