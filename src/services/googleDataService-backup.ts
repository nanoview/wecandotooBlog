// Enhanced Google Data Service with Direct API Access
// This service provides WordPress-like Google data access

import { GoogleOAuth } from './googleAPI';

export interface GoogleAdSenseData {
  estimated_earnings: number;
  page_views: number;
  clicks: number;
  ad_requests: number;
  ctr: number;
  date_range: string;
  cached?: boolean;
  cached_at?: string;
}

export interface GoogleAnalyticsData {
  sessions: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  users: number;
  date_range: string;
  cached?: boolean;
  cached_at?: string;
  top_pages?: Array<{
    path: string;
    views: number;
    title?: string;
  }>;
  traffic_sources?: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
}

export interface GoogleSearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  average_position: number;
  date_range: string;
  cached?: boolean;
  cached_at?: string;
  top_queries?: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export class GoogleDataService {
  private oauth: GoogleOAuth;
  private propertyId: string;
  private siteUrl: string;

  constructor() {
    this.oauth = GoogleOAuth.getInstance();
    this.propertyId = import.meta.env.VITE_GOOGLE_ANALYTICS_PROPERTY_ID || '';
    this.siteUrl = import.meta.env.VITE_SITE_URL || 'https://wecandotoo.com';
  }

  /**
   * Check if user is authenticated with Google
   */
  isAuthenticated(): boolean {
    return this.oauth.isAuthenticated();
  }

  /**
   * Initiate Google OAuth authentication
   */
  authenticate(): void {
    this.oauth.initiateOAuth();
  }

  /**
   * Sign out from Google services
   */
  signOut(): void {
    this.oauth.signOut();
  }
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(`Backend API error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown backend error');
      }

      return data;
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      throw error;
    }
  }

  // Fetch AdSense earnings data
  static async getAdSenseData(): Promise<GoogleAdSenseData> {
    try {
      const response = await this.callBackendAPI('google-adsense');
      
      // Transform Google API response to our format
      const rawData = response.data;
      
      return {
        estimated_earnings: this.extractMetricValue(rawData, 'ESTIMATED_EARNINGS'),
        page_views: this.extractMetricValue(rawData, 'PAGE_VIEWS'),
        clicks: this.extractMetricValue(rawData, 'CLICKS'),
        ad_requests: this.extractMetricValue(rawData, 'AD_REQUESTS'),
        ctr: this.extractMetricValue(rawData, 'AD_REQUESTS_CTR'),
        date_range: 'Last 7 days',
        cached: response.cached || false,
        cached_at: response.cached_at
      };
    } catch (error) {
      console.error('Error fetching AdSense data:', error);
      throw error;
    }
  }

  // Fetch Analytics traffic data
  static async getAnalyticsData(): Promise<GoogleAnalyticsData> {
    try {
      const response = await this.callBackendAPI('google-analytics');
      const rawData = response.data;
      
      return {
        sessions: this.extractAnalyticsMetric(rawData, 'ga:sessions'),
        page_views: this.extractAnalyticsMetric(rawData, 'ga:pageviews'),
        bounce_rate: this.extractAnalyticsMetric(rawData, 'ga:bounceRate'),
        avg_session_duration: this.extractAnalyticsMetric(rawData, 'ga:avgSessionDuration'),
        date_range: 'Last 30 days',
        cached: response.cached || false,
        cached_at: response.cached_at
      };
    } catch (error) {
      console.error('Error fetching Analytics data:', error);
      throw error;
    }
  }

  // Fetch Search Console performance data
  static async getSearchConsoleData(): Promise<GoogleSearchConsoleData> {
    try {
      const response = await this.callBackendAPI('google-search-console');
      const rawData = response.data;
      
      return {
        impressions: rawData.impressions || 0,
        clicks: rawData.clicks || 0,
        ctr: rawData.ctr || 0,
        average_position: rawData.position || 0,
        date_range: 'Last 30 days',
        cached: response.cached || false,
        cached_at: response.cached_at
      };
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      throw error;
    }
  }

  // Check Google services connection status
  static async getConnectionStatus(): Promise<{
    is_connected: boolean;
    last_sync: string | null;
    services: {
      adsense: boolean;
      analytics: boolean;
      search_console: boolean;
    }
  }> {
    try {
      const response = await this.callBackendAPI('google-status');
      return response.data;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return {
        is_connected: false,
        last_sync: null,
        services: {
          adsense: false,
          analytics: false,
          search_console: false
        }
      };
    }
  }

  // Refresh Google OAuth tokens
  static async refreshTokens(): Promise<boolean> {
    try {
      const response = await this.callBackendAPI('google-refresh-tokens');
      return response.success;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    }
  }

  // Helper methods to extract data from Google API responses
  private static extractMetricValue(data: any, metric: string): number {
    try {
      if (data?.rows && data.rows.length > 0) {
        const metricIndex = data.headers?.findIndex((h: any) => h.name === metric);
        if (metricIndex >= 0 && data.rows[0].cells[metricIndex]) {
          return parseFloat(data.rows[0].cells[metricIndex].value) || 0;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private static extractAnalyticsMetric(data: any, metric: string): number {
    try {
      if (data?.reports && data.reports.length > 0) {
        const report = data.reports[0];
        if (report.data?.totals && report.data.totals.length > 0) {
          const metricIndex = report.columnHeader?.metricHeader?.metricHeaderEntries
            ?.findIndex((m: any) => m.name === metric);
          if (metricIndex >= 0) {
            return parseFloat(report.data.totals[0].values[metricIndex]) || 0;
          }
        }
      }
      return 0;
    } catch {
      return 0;
    }
  }
}

// React Hook for Google Data
export const useGoogleData = () => {
  const [adsenseData, setAdSenseData] = React.useState<GoogleAdSenseData | null>(null);
  const [analyticsData, setAnalyticsData] = React.useState<GoogleAnalyticsData | null>(null);
  const [searchConsoleData, setSearchConsoleData] = React.useState<GoogleSearchConsoleData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check connection status first
      const status = await GoogleDataService.getConnectionStatus();
      
      if (!status.is_connected) {
        throw new Error('Google services not connected');
      }

      // Fetch all data in parallel
      const [adsense, analytics, searchConsole] = await Promise.allSettled([
        GoogleDataService.getAdSenseData(),
        GoogleDataService.getAnalyticsData(),
        GoogleDataService.getSearchConsoleData()
      ]);

      // Set data based on results
      if (adsense.status === 'fulfilled') {
        setAdSenseData(adsense.value);
      }
      if (analytics.status === 'fulfilled') {
        setAnalyticsData(analytics.value);
      }
      if (searchConsole.status === 'fulfilled') {
        setSearchConsoleData(searchConsole.value);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Google data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => fetchAllData();

  React.useEffect(() => {
    fetchAllData();
  }, []);

  return {
    adsenseData,
    analyticsData,
    searchConsoleData,
    loading,
    error,
    refreshData
  };
};
