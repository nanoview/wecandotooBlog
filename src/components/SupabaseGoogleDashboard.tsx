import React, { useState, useEffect } from 'react';
import { GoogleSiteKitService } from '@/services/googleSiteKitService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, DollarSign, Eye, Mouse, TrendingUp } from 'lucide-react';

export const SupabaseGoogleDashboard: React.FC = () => {
  const [adSenseData, setAdSenseData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [searchData, setSearchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleService = GoogleSiteKitService.getInstance();

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch data from Supabase Edge Functions
      const [adsense, analytics, search] = await Promise.all([
        googleService.getAdSenseData(),
        googleService.getAnalyticsData(),
        googleService.getSearchConsoleData()
      ]);

      setAdSenseData(adsense);
      setAnalyticsData(analytics);
      setSearchData(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Google Site Kit Dashboard</h2>
        <Button onClick={fetchAllData} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* AdSense Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${adSenseData?.earnings?.today?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              From AdSense API via Supabase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adSenseData?.performance?.pageViews?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Clicks</CardTitle>
            <Mouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adSenseData?.performance?.clicks?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              CTR: {adSenseData?.performance?.ctr?.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPM</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${adSenseData?.performance?.cpm?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost per thousand impressions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Data */}
      {analyticsData && (
        <Card>
          <CardHeader>
            <CardTitle>Google Analytics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{analyticsData.overview.sessions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{analyticsData.overview.pageViews}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.bounceRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Session</p>
                <p className="text-2xl font-bold">{analyticsData.overview.avgSessionDuration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Console Data */}
      {searchData && (
        <Card>
          <CardHeader>
            <CardTitle>Search Console Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{searchData.overview.totalClicks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold">{searchData.overview.totalImpressions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average CTR</p>
                <p className="text-2xl font-bold">{searchData.overview.averageCTR}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Position</p>
                <p className="text-2xl font-bold">{searchData.overview.averagePosition}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription>
          <strong>Backend:</strong> All data is fetched from Supabase Edge Functions. 
          No separate backend server needed! Your Google APIs are called securely 
          from Supabase's serverless functions.
        </AlertDescription>
      </Alert>
    </div>
  );
};
