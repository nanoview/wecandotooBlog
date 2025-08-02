import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  DollarSign, 
  Eye, 
  Search, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { googleConfig, isGoogleServicesEnabled } from '@/config/google';
import { getOAuthStatus } from '@/config/environment';
import { 
  GoogleOAuth, 
  GoogleAdSenseAPI, 
  GoogleAnalyticsAPI, 
  GoogleSearchConsoleAPI 
} from '@/services/googleAPI';
import { useToast } from '@/hooks/use-toast';

interface GoogleSiteKitProps {
  isAdmin?: boolean;
}

interface ServiceStatus {
  connected: boolean;
  lastSync?: string;
  error?: string;
}

interface AnalyticsData {
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: string;
}

interface AdSenseData {
  revenue: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

const GoogleSiteKit: React.FC<GoogleSiteKitProps> = ({ isAdmin = false }) => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  const [serviceStatus, setServiceStatus] = useState<{
    analytics: ServiceStatus;
    adsense: ServiceStatus;
    searchConsole: ServiceStatus;
  }>({
    analytics: { connected: false },
    adsense: { connected: false },
    searchConsole: { connected: false }
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pageViews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionDuration: '0:00'
  });

  const [adsenseData, setAdsenseData] = useState<AdSenseData>({
    revenue: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0
  });

  const [configValues, setConfigValues] = useState({
    analyticsId: googleConfig.analyticsId,
    adsenseClientId: googleConfig.adsenseClientId,
    siteVerification: googleConfig.siteVerification
  });

  const oauth = GoogleOAuth.getInstance();
  const adsenseAPI = new GoogleAdSenseAPI();
  const analyticsAPI = new GoogleAnalyticsAPI();
  const searchConsoleAPI = new GoogleSearchConsoleAPI();
  const googleServices = isGoogleServicesEnabled();
  const oauthStatus = getOAuthStatus();

  useEffect(() => {
    checkAuthStatus();
    handleOAuthCallback();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = () => {
    const authenticated = oauth.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      // Get user info from token (in production, you'd decode the JWT or call userinfo endpoint)
      const storedUser = localStorage.getItem('google_user_info');
      if (storedUser) {
        setGoogleUser(JSON.parse(storedUser));
      }
    }
  };

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      setLoading(true);
      try {
        const success = await oauth.handleCallback(code, state);
        if (success) {
          setIsAuthenticated(true);
          await fetchUserInfo();
          toast({
            title: "Google Account Connected",
            description: "Successfully connected to your Google account.",
          });
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          throw new Error('OAuth callback failed');
        }
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to Google account. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = await oauth.getAccessToken();
      if (!token) return;

      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
        const user: GoogleUser = {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        };
        setGoogleUser(user);
        localStorage.setItem('google_user_info', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchAdSenseData(),
        fetchAnalyticsData(),
        fetchSearchConsoleData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchAdSenseData = async () => {
    try {
      const accounts = await adsenseAPI.getAccount();
      if (accounts.accounts && accounts.accounts.length > 0) {
        const accountId = accounts.accounts[0].name;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const reports = await adsenseAPI.getReports(accountId, startDate, endDate);
        
        if (reports.rows && reports.rows.length > 0) {
          const earnings = parseFloat(reports.rows[0].cells[0].value || '0');
          const pageViews = parseInt(reports.rows[0].cells[1].value || '0');
          const clicks = parseInt(reports.rows[0].cells[2].value || '0');
          
          setAdsenseData({
            revenue: earnings,
            impressions: pageViews,
            clicks: clicks,
            ctr: pageViews > 0 ? (clicks / pageViews) * 100 : 0
          });
        }
        
        setServiceStatus(prev => ({
          ...prev,
          adsense: { connected: true, lastSync: new Date().toISOString() }
        }));
      }
    } catch (error) {
      console.error('AdSense API error:', error);
      setServiceStatus(prev => ({
        ...prev,
        adsense: { connected: false, error: 'Failed to fetch AdSense data' }
      }));
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      // Note: In production, you'd need to get the view ID from the user or configuration
      const viewId = 'YOUR_VIEW_ID'; // This would come from configuration
      const reports = await analyticsAPI.getReports(viewId);
      
      if (reports.reports && reports.reports.length > 0) {
        const report = reports.reports[0];
        if (report.data && report.data.rows) {
          // Aggregate data from the last 30 days
          let totalSessions = 0;
          let totalPageViews = 0;
          let totalBounceRate = 0;
          let totalSessionDuration = 0;
          
          report.data.rows.forEach((row: any) => {
            totalSessions += parseInt(row.metrics[0].values[0]);
            totalPageViews += parseInt(row.metrics[0].values[1]);
            totalBounceRate += parseFloat(row.metrics[0].values[2]);
            totalSessionDuration += parseFloat(row.metrics[0].values[3]);
          });
          
          const rowCount = report.data.rows.length;
          setAnalyticsData({
            sessions: totalSessions,
            pageViews: totalPageViews,
            bounceRate: totalBounceRate / rowCount,
            avgSessionDuration: `${Math.floor(totalSessionDuration / rowCount / 60)}:${Math.floor((totalSessionDuration / rowCount) % 60)}`
          });
        }
      }
      
      setServiceStatus(prev => ({
        ...prev,
        analytics: { connected: true, lastSync: new Date().toISOString() }
      }));
    } catch (error) {
      console.error('Analytics API error:', error);
      setServiceStatus(prev => ({
        ...prev,
        analytics: { connected: false, error: 'Failed to fetch Analytics data' }
      }));
    }
  };

  const fetchSearchConsoleData = async () => {
    try {
      const sites = await searchConsoleAPI.getSites();
      if (sites.siteEntry && sites.siteEntry.length > 0) {
        const siteUrl = sites.siteEntry[0].siteUrl;
        await searchConsoleAPI.getSearchAnalytics(siteUrl);
        
        setServiceStatus(prev => ({
          ...prev,
          searchConsole: { connected: true, lastSync: new Date().toISOString() }
        }));
      }
    } catch (error) {
      console.error('Search Console API error:', error);
      setServiceStatus(prev => ({
        ...prev,
        searchConsole: { connected: false, error: 'Failed to fetch Search Console data' }
      }));
    }
  };

  const handleConnect = () => {
    if (!oauthStatus.isConfigured) {
      toast({
        title: "OAuth Configuration Required",
        description: "Please configure your Google OAuth credentials. Check GOOGLE_OAUTH_SETUP.md for instructions.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    oauth.initiateOAuth();
  };

  const handleDisconnect = () => {
    oauth.signOut();
    setIsAuthenticated(false);
    setGoogleUser(null);
    setServiceStatus({
      analytics: { connected: false },
      adsense: { connected: false },
      searchConsole: { connected: false }
    });
    
    // Reset data
    setAnalyticsData({
      pageViews: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: '0:00'
    });
    setAdsenseData({
      revenue: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0
    });
    
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Google account.",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully.`,
    });
  };

  const openGoogleService = (service: string) => {
    const urls = {
      analytics: 'https://analytics.google.com/',
      adsense: 'https://www.google.com/adsense/',
      searchConsole: 'https://search.google.com/search-console/'
    };
    window.open(urls[service as keyof typeof urls], '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Site Kit</h2>
          <p className="text-gray-600">Manage your Google services integration</p>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button 
              onClick={handleDisconnect}
              variant="outline" 
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          )}
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Authentication Status */}
      {!oauthStatus.isConfigured ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">OAuth Configuration Required</h3>
              <p className="text-gray-600 mb-6">
                To connect your Google account and access real-time data, you need to configure OAuth credentials.
              </p>
            </div>
            
            <Alert className="mb-6 text-left">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Setup Required:</strong> Follow these steps to configure Google OAuth:
                <ol className="mt-2 space-y-1 text-sm">
                  <li>1. Go to <a href="https://console.cloud.google.com/apis/credentials" className="underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                  <li>2. Create OAuth 2.0 Client ID credentials</li>
                  <li>3. Add your domain to authorized origins</li>
                  <li>4. Set environment variables in your .env file</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-medium mb-2">Required Environment Variables:</h4>
              <code className="text-xs text-gray-700 whitespace-pre-wrap">
{`VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
VITE_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8080/oauth/callback`}
              </code>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline"
                onClick={() => window.open('/GOOGLE_OAUTH_SETUP.md', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Setup Guide
              </Button>
              <Button 
                onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Google Cloud Console
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !isAuthenticated ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Google Account</h3>
              <p className="text-gray-600 mb-6">
                Connect your Google account to access real-time data from AdSense, Analytics, and Search Console.
              </p>
            </div>
            
            <Button 
              onClick={handleConnect}
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect with Google
                </>
              )}
            </Button>
            
            <Alert className="mt-6 text-left">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Required permissions:</strong> We'll request access to read your AdSense earnings, 
                Analytics data, and Search Console information. Your data remains secure and private.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* User Info */}
          {googleUser && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={googleUser.picture} 
                    alt={googleUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{googleUser.name}</p>
                    <p className="text-sm text-gray-600">{googleUser.email}</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800 ml-auto">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Analytics</span>
                  </div>
                  {serviceStatus.analytics.connected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {serviceStatus.analytics.error || 'Not Connected'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium">AdSense</span>
                  </div>
                  {serviceStatus.adsense.connected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {serviceStatus.adsense.error || 'Not Connected'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Search Console</span>
                  </div>
                  {serviceStatus.searchConsole.connected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {serviceStatus.searchConsole.error || 'Not Connected'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="adsense">AdSense</TabsTrigger>
              <TabsTrigger value="setup">Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              {dataLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Loading your Google data...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Page Views</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{analyticsData.pageViews.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <BarChart className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Sessions</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{analyticsData.sessions.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Ad Revenue</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">${adsenseData.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Ad Clicks</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{adsenseData.clicks.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">CTR: {adsenseData.ctr.toFixed(2)}%</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Google Analytics Dashboard</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openGoogleService('analytics')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Analytics
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceStatus.analytics.connected ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Page Views</Label>
                          <div className="text-3xl font-bold">{analyticsData.pageViews.toLocaleString()}</div>
                        </div>
                        <div className="space-y-2">
                          <Label>Bounce Rate</Label>
                          <div className="text-3xl font-bold">{analyticsData.bounceRate.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Alert>
                        <AlertDescription>
                          Real-time data from your connected Google Analytics account.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Analytics Data Unavailable</h3>
                      <p className="text-gray-600 mb-4">
                        {serviceStatus.analytics.error || 'Unable to fetch Analytics data'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adsense" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Google AdSense Dashboard</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openGoogleService('adsense')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open AdSense
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceStatus.adsense.connected ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Revenue (30 days)</Label>
                          <div className="text-3xl font-bold text-green-600">${adsenseData.revenue.toFixed(2)}</div>
                        </div>
                        <div className="space-y-2">
                          <Label>Impressions</Label>
                          <div className="text-3xl font-bold">{adsenseData.impressions.toLocaleString()}</div>
                        </div>
                      </div>
                      <Alert>
                        <AlertDescription>
                          Real-time data from your connected Google AdSense account.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">AdSense Data Unavailable</h3>
                      <p className="text-gray-600 mb-4">
                        {serviceStatus.adsense.error || 'Unable to fetch AdSense data'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="setup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>OAuth Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Settings className="w-4 h-4" />
                    <AlertDescription>
                      Configure OAuth settings to enable Google account connection.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oauth-client">Google OAuth Client ID</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="oauth-client"
                          placeholder="your_client_id.apps.googleusercontent.com"
                          value={oauthStatus.clientId || ''}
                          readOnly
                          className={oauthStatus.isConfigured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(oauthStatus.clientId || '', 'OAuth Client ID')}
                          disabled={!oauthStatus.clientId}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {oauthStatus.isConfigured ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not Configured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Create OAuth credentials at <a href="https://console.cloud.google.com/apis/credentials" className="underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="oauth-secret">OAuth Client Secret Status</Label>
                      <div className="flex items-center space-x-2">
                        {oauthStatus.hasClientSecret ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Client Secret Configured
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Client Secret Missing
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Client secret is configured in environment variables (not displayed for security)
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="oauth-redirect">OAuth Redirect URI</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="oauth-redirect"
                          placeholder="http://localhost:8080/oauth/callback"
                          value={oauthStatus.redirectUri || ''}
                          readOnly
                          className={oauthStatus.redirectUri ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(oauthStatus.redirectUri || '', 'Redirect URI')}
                          disabled={!oauthStatus.redirectUri}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Add this URI to your OAuth client's authorized redirect URIs
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Complete Setup Instructions:</strong>
                      <ol className="mt-2 space-y-1 text-sm">
                        <li>1. Go to <a href="https://console.cloud.google.com/apis/credentials" className="underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a> and create OAuth 2.0 credentials</li>
                        <li>2. Add your domain to authorized JavaScript origins</li>
                        <li>3. Add your redirect URI to authorized redirect URIs</li>
                        <li>4. Enable AdSense, Analytics, and Search Console APIs</li>
                        <li>5. Copy credentials to your .env file</li>
                        <li>6. See <strong>GOOGLE_OAUTH_SETUP.md</strong> for detailed instructions</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 p-4 rounded-lg text-left">
                    <h4 className="font-medium mb-2">Add to your .env file:</h4>
                    <code className="text-xs text-gray-700 whitespace-pre-wrap">
{`VITE_GOOGLE_OAUTH_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
VITE_GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-your_client_secret_here
VITE_GOOGLE_OAUTH_REDIRECT_URI=${window.location.origin}/admin`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default GoogleSiteKit;
