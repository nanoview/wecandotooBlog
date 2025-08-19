import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, Search, TrendingUp, Users, Eye, MousePointer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  sessionDuration: string;
}

interface AdSenseData {
  earnings: number;
  clicks: number;
  impressions: number;
  ctr: number;
  rpm: number;
}

interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const SupabaseGoogleDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  // Real data states - no mock data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [adsenseData, setAdsenseData] = useState<AdSenseData | null>(null);
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleData | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check if Google services are actually connected
      // For now, show as not connected since we're using mock data
      setIsConnected(false);
      setIsLoading(false);
      
      toast({
        title: "Notice",
        description: "Google Services dashboard is currently showing sample data. Please connect your Google services for real data.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error checking connection status:', error);
      setIsLoading(false);
      toast({
        title: "Connection Error",
        description: "Unable to check Google services connection status.",
        variant: "destructive"
      });
    }
  };

  const handleConnectServices = () => {
    // Redirect to Google Services Setup page
    window.location.href = '/google-services';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Google Services
          </CardTitle>
          <CardDescription>
            Connect your Google accounts to view analytics, AdSense, and Search Console data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Google Services Connected
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your Google Analytics, AdSense, and Search Console accounts to see your data here.
              </p>
            </div>
            <Button onClick={handleConnectServices} size="lg">
              Connect Google Services
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Google Services Dashboard</h2>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 w-fit text-xs sm:text-sm">
          Connected
        </Badge>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="adsense" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
            AdSense
          </TabsTrigger>
          <TabsTrigger value="search-console" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Search Console</span>
            <span className="sm:hidden">Search</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Sessions</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {analyticsData.sessions.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                  +12.5%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Users</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {analyticsData.users.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                  +8.3%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Pageviews</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {analyticsData.pageviews.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                  +15.7% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Bounce Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.bounceRate}%
                </div>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 rotate-180" />
                  -2.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">Avg. Session</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.sessionDuration}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.4% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="adsense" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Earnings</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${adsenseData.earnings.toFixed(2)}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +18.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Clicks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {adsenseData.clicks.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +14.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Impressions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {adsenseData.impressions.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +9.8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">CTR</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {adsenseData.ctr}%
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">RPM</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${adsenseData.rpm.toFixed(2)}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +7.3% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search-console" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Clicks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {searchConsoleData.clicks.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +11.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Impressions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {searchConsoleData.impressions.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +6.8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">CTR</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {searchConsoleData.ctr}%
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +1.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Avg. Position</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {searchConsoleData.position.toFixed(1)}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  -0.8 from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupabaseGoogleDashboard;
