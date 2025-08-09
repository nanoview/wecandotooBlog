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
  
  // Mock data - replace with actual API calls
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    sessions: 12543,
    users: 8721,
    pageviews: 23456,
    bounceRate: 45.2,
    sessionDuration: "2m 34s"
  });

  const [adsenseData, setAdsenseData] = useState<AdSenseData>({
    earnings: 234.56,
    clicks: 892,
    impressions: 45231,
    ctr: 1.97,
    rpm: 5.18
  });

  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleData>({
    clicks: 1234,
    impressions: 56789,
    ctr: 2.17,
    position: 12.4
  });

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check if Google services are connected
      // Replace with actual Supabase check
      setIsConnected(true); // Mock connection status
      setIsLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Google Services Dashboard</h2>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Connected
        </Badge>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="adsense" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            AdSense
          </TabsTrigger>
          <TabsTrigger value="search-console" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Console
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Sessions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.sessions.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Users</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.users.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Pageviews</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.pageviews.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
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
