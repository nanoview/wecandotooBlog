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
    // Redirect to Google OAuth with our edge function as callback
    const authUrl = new URL('https://accounts.google.com/oauth2/auth');
    authUrl.searchParams.set('client_id', import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '');
    authUrl.searchParams.set('redirect_uri', 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/adsense.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    window.open(authUrl.toString(), '_blank', 'width=500,height=600');
  }

  /**
   * Sign out from Google services
   */
  signOut(): void {
    this.oauth.signOut();
  }

  /**
   * Get Google Analytics data
   */
  async getAnalyticsData(dateRange: '7d' | '30d' | '90d' = '30d'): Promise<GoogleAnalyticsData> {
    const accessToken = await this.oauth.getAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token available. Please authenticate with Google.');
    }

    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    try {
      // Get basic metrics using Google Analytics 4 API
      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
          }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const metrics = data.rows?.[0]?.metricValues || [];

      return {
        page_views: parseInt(metrics[0]?.value || '0'),
        sessions: parseInt(metrics[1]?.value || '0'),
        users: parseInt(metrics[2]?.value || '0'),
        bounce_rate: parseFloat(metrics[3]?.value || '0'),
        avg_session_duration: parseFloat(metrics[4]?.value || '0'),
        date_range: dateRange,
        cached: false,
        cached_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Analytics data:', error);
      throw error;
    }
  }

  /**
   * Get Google Search Console data
   */
  async getSearchConsoleData(dateRange: '7d' | '30d' | '90d' = '30d'): Promise<GoogleSearchConsoleData> {
    const accessToken = await this.oauth.getAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token available. Please authenticate with Google.');
    }

    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    try {
      const response = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          aggregationType: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`Search Console API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const summary = data.rows?.[0] || {};

      return {
        impressions: summary.impressions || 0,
        clicks: summary.clicks || 0,
        ctr: summary.ctr || 0,
        average_position: summary.position || 0,
        date_range: dateRange,
        cached: false,
        cached_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      throw error;
    }
  }

  /**
   * Get Google AdSense data
   */
  async getAdSenseData(dateRange: '7d' | '30d' | '90d' = '30d'): Promise<GoogleAdSenseData> {
    const accessToken = await this.oauth.getAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token available. Please authenticate with Google.');
    }

    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    try {
      // Get AdSense account first
      const accountsResponse = await fetch('https://adsense.googleapis.com/v2/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!accountsResponse.ok) {
        throw new Error(`AdSense Accounts API error: ${accountsResponse.status}`);
      }

      const accountsData = await accountsResponse.json();
      const account = accountsData.accounts?.[0];
      
      if (!account) {
        throw new Error('No AdSense account found');
      }

      // Get earnings report
      const reportsResponse = await fetch(`https://adsense.googleapis.com/v2/${account.name}/reports:generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRange: {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
          },
          metrics: ['ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'CLICKS', 'AD_REQUESTS', 'CTR']
        })
      });

      if (!reportsResponse.ok) {
        throw new Error(`AdSense Reports API error: ${reportsResponse.status}`);
      }

      const reportsData = await reportsResponse.json();
      const row = reportsData.rows?.[0] || {};

      return {
        estimated_earnings: parseFloat(row.cells?.[0]?.value || '0'),
        page_views: parseInt(row.cells?.[1]?.value || '0'),
        clicks: parseInt(row.cells?.[2]?.value || '0'),
        ad_requests: parseInt(row.cells?.[3]?.value || '0'),
        ctr: parseFloat(row.cells?.[4]?.value || '0'),
        date_range: dateRange,
        cached: false,
        cached_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching AdSense data:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string): Promise<boolean> {
    return this.oauth.handleCallback(code, state);
  }
}

// Export singleton instance
export const googleDataService = new GoogleDataService();
