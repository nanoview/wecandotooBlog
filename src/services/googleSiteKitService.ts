import { supabase } from '@/integrations/supabase/client';

export interface GoogleSiteKitConfig {
  id?: string;
  created_at?: string;
  updated_at?: string;
  
  // OAuth Configuration
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_redirect_uri?: string;
  oauth_access_token?: string;
  oauth_refresh_token?: string;
  oauth_expires_at?: string;
  
  // Google AdSense Configuration
  adsense_publisher_id?: string;
  adsense_customer_id?: string;
  adsense_account_id?: string;
  adsense_site_id?: string;
  
  // Google Analytics Configuration
  analytics_property_id?: string;
  analytics_view_id?: string;
  analytics_measurement_id?: string;
  
  // Google Search Console Configuration
  search_console_site_url?: string;
  search_console_verified?: boolean;
  
  // Site Verification
  site_verification_code?: string;
  site_verification_method?: string;
  
  // API Configuration
  enabled_apis?: string[];
  oauth_scopes?: string[];
  
  // Feature Flags
  enable_adsense?: boolean;
  enable_analytics?: boolean;
  enable_search_console?: boolean;
  enable_auto_ads?: boolean;
  
  // Connection Status
  is_connected?: boolean;
  last_sync_at?: string;
  connection_status?: string; // Allow any string from database
  error_message?: string;
  
  // User Management
  configured_by?: string;
}

export interface AdSenseData {
  earnings: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
  };
  performance: {
    pageViews: number;
    clicks: number;
    ctr: number;
    cpm: number;
  };
}

export interface AnalyticsData {
  overview: {
    sessions: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: string;
  };
  topPages: Array<{
    page: string;
    pageViews: number;
    uniquePageViews: number;
  }>;
}

export interface SearchConsoleData {
  overview: {
    totalClicks: number;
    totalImpressions: number;
    averageCTR: number;
    averagePosition: number;
  };
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export class GoogleSiteKitService {
  private static instance: GoogleSiteKitService;
  private baseUrl: string;

  constructor() {
    // Use Supabase Edge Functions as backend
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  }

  static getInstance(): GoogleSiteKitService {
    if (!GoogleSiteKitService.instance) {
      GoogleSiteKitService.instance = new GoogleSiteKitService();
    }
    return GoogleSiteKitService.instance;
  }

  private async getAuthHeaders(): Promise<Headers> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    });
    
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    
    return headers;
  }
  // Fetch Google Site Kit configuration
  static async getConfig(): Promise<GoogleSiteKitConfig | null> {
    try {
      const { data, error } = await supabase
        .from('google_site_kit')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching Google Site Kit config:', error);
        return null;
      }

      // Return first row if exists, otherwise null
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getConfig:', error);
      return null;
    }
  }

  // Update Google Site Kit configuration
  static async updateConfig(config: Partial<GoogleSiteKitConfig>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('google_site_kit')
        .upsert({
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id || 'default');

      if (error) {
        console.error('Error updating Google Site Kit config:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateConfig:', error);
      return false;
    }
  }

  // Fetch AdSense data from Supabase Edge Function
  async getAdSenseData(): Promise<AdSenseData | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/google-adsense`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`AdSense API error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch AdSense data');
      }

      // Transform the API response to match our interface
      return this.transformAdSenseData(result.data);
    } catch (error) {
      console.error('Error fetching AdSense data:', error);
      return null;
    }
  }

  // Fetch Analytics data from Supabase Edge Function
  async getAnalyticsData(): Promise<AnalyticsData | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/google-analytics`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch Analytics data');
      }

      return this.transformAnalyticsData(result.data);
    } catch (error) {
      console.error('Error fetching Analytics data:', error);
      return null;
    }
  }

  // Fetch Search Console data from Supabase Edge Function
  async getSearchConsoleData(): Promise<SearchConsoleData | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/google-search-console`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Search Console API error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch Search Console data');
      }

      return this.transformSearchConsoleData(result.data);
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      return null;
    }
  }

  // Transform AdSense API response to our data structure
  private transformAdSenseData(apiData: any): AdSenseData {
    // Transform Google AdSense API response to our interface
    const rows = apiData.rows || [];
    const headers = apiData.headers || [];
    
    // Extract metrics from the response
    const earnings = rows.length > 0 ? parseFloat(rows[0].cells[0]?.value || '0') : 0;
    const pageViews = rows.length > 0 ? parseInt(rows[0].cells[1]?.value || '0') : 0;
    const clicks = rows.length > 0 ? parseInt(rows[0].cells[2]?.value || '0') : 0;
    const adRequests = rows.length > 0 ? parseInt(rows[0].cells[3]?.value || '0') : 0;
    const ctr = rows.length > 0 ? parseFloat(rows[0].cells[4]?.value || '0') : 0;

    return {
      earnings: {
        today: earnings,
        yesterday: 0, // You may need additional API calls for historical data
        thisMonth: earnings,
        lastMonth: 0
      },
      performance: {
        pageViews,
        clicks,
        ctr,
        cpm: adRequests > 0 ? (earnings / adRequests) * 1000 : 0
      }
    };
  }

  // Transform Analytics API response
  private transformAnalyticsData(apiData: any): AnalyticsData {
    return {
      overview: {
        sessions: apiData.sessions || 0,
        pageViews: apiData.pageViews || 0,
        bounceRate: apiData.bounceRate || 0,
        avgSessionDuration: apiData.avgSessionDuration || '0:00'
      },
      topPages: apiData.topPages || []
    };
  }

  // Transform Search Console API response
  private transformSearchConsoleData(apiData: any): SearchConsoleData {
    return {
      overview: {
        totalClicks: apiData.totalClicks || 0,
        totalImpressions: apiData.totalImpressions || 0,
        averageCTR: apiData.averageCTR || 0,
        averagePosition: apiData.averagePosition || 0
      },
      topQueries: apiData.topQueries || []
    };
  }

  // Store OAuth tokens
  static async storeOAuthTokens(tokens: {
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('google_site_kit')
        .update({
          oauth_access_token: tokens.access_token,
          oauth_refresh_token: tokens.refresh_token,
          oauth_expires_at: tokens.expires_at,
          is_connected: true,
          connection_status: 'connected',
          last_sync_at: new Date().toISOString(),
          error_message: null
        })
        .single();

      if (error) {
        console.error('Error storing OAuth tokens:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in storeOAuthTokens:', error);
      return false;
    }
  }

  // Get stored OAuth tokens
  static async getOAuthTokens(): Promise<{
    access_token?: string;
    refresh_token?: string;
    expires_at?: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('google_site_kit')
        .select('oauth_access_token, oauth_refresh_token, oauth_expires_at')
        .single();

      if (error) {
        console.error('Error fetching OAuth tokens:', error);
        return null;
      }

      return {
        access_token: data.oauth_access_token,
        refresh_token: data.oauth_refresh_token,
        expires_at: data.oauth_expires_at
      };
    } catch (error) {
      console.error('Error in getOAuthTokens:', error);
      return null;
    }
  }

  // Update connection status
  static async updateConnectionStatus(
    status: 'disconnected' | 'connected' | 'error',
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config) {
        // Initialize default config if none exists
        await this.initializeDefaultConfig();
      }

      const { error } = await supabase
        .from('google_site_kit')
        .update({
          connection_status: status,
          is_connected: status === 'connected',
          error_message: errorMessage || null,
          last_sync_at: status === 'connected' ? new Date().toISOString() : null
        })
        .eq('id', config?.id || 'default');

      if (error) {
        console.error('Error updating connection status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateConnectionStatus:', error);
      return false;
    }
  }

  // Mock AdSense data (replace with real API calls)
  static async getAdSenseData(): Promise<AdSenseData> {
    // TODO: Replace with real Google AdSense API calls using stored tokens
    return {
      earnings: {
        today: 24.50,
        yesterday: 18.75,
        thisMonth: 642.30,
        lastMonth: 578.90
      },
      performance: {
        pageViews: 15420,
        clicks: 234,
        ctr: 1.52,
        cpm: 2.85
      }
    };
  }

  // Mock Analytics data (replace with real API calls)
  static async getAnalyticsData(): Promise<AnalyticsData> {
    // TODO: Replace with real Google Analytics API calls using stored tokens
    return {
      overview: {
        sessions: 8945,
        pageViews: 15420,
        bounceRate: 45.2,
        avgSessionDuration: '2m 34s'
      },
      topPages: [
        { page: '/blog/react-tips', pageViews: 2340, uniquePageViews: 1980 },
        { page: '/blog/javascript-guide', pageViews: 1890, uniquePageViews: 1654 },
        { page: '/blog/css-tricks', pageViews: 1234, uniquePageViews: 1098 }
      ]
    };
  }

  // Mock Search Console data (replace with real API calls)
  static async getSearchConsoleData(): Promise<SearchConsoleData> {
    // TODO: Replace with real Google Search Console API calls using stored tokens
    return {
      overview: {
        totalClicks: 1234,
        totalImpressions: 45678,
        averageCTR: 2.7,
        averagePosition: 12.4
      },
      topQueries: [
        { query: 'react tutorial', clicks: 234, impressions: 5670, ctr: 4.13, position: 8.2 },
        { query: 'javascript guide', clicks: 189, impressions: 4320, ctr: 4.38, position: 6.7 },
        { query: 'css tips', clicks: 156, impressions: 3890, ctr: 4.01, position: 9.1 }
      ]
    };
  }

  // Save configuration (alias for updateConfig)
  static async saveConfig(config: Partial<GoogleSiteKitConfig>): Promise<GoogleSiteKitConfig> {
    try {
      const existingConfig = await this.getConfig();
      
      if (existingConfig) {
        // Update existing
        const { data, error } = await supabase
          .from('google_site_kit')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('google_site_kit')
          .insert([{
            ...config,
            configured_by: (await supabase.auth.getUser()).data.user?.id
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving Google Site Kit config:', error);
      throw error;
    }
  }

  // Initialize with default configuration
  static async initializeDefaultConfig(): Promise<GoogleSiteKitConfig> {
    const defaultConfig: Partial<GoogleSiteKitConfig> = {
      adsense_publisher_id: 'ca-pub-2959602333047653',
      adsense_customer_id: '9592425312',
      oauth_client_id: '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',
      oauth_redirect_uri: 'http://localhost:8082/oauth/callback',
      analytics_property_id: 'G-XXXXXXXXXX',
      site_verification_code: 'your_verification_code',
      enable_adsense: true,
      enable_analytics: true,
      enable_search_console: true,
      enable_auto_ads: false,
      connection_status: 'disconnected',
      is_connected: false,
      enabled_apis: ['adsense', 'analytics', 'search_console'],
      oauth_scopes: [
        'https://www.googleapis.com/auth/adsense.readonly',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly',
        'openid',
        'email',
        'profile'
      ]
    };

    return await this.saveConfig(defaultConfig);
  }

  // Ensure Google Site Kit configuration exists in database
  static async ensureConfigExists(): Promise<GoogleSiteKitConfig> {
    try {
      let config = await this.getConfig();
      
      if (!config) {
        console.log('No Google Site Kit configuration found, creating default...');
        config = await this.initializeDefaultConfig();
      }
      
      return config;
    } catch (error) {
      console.error('Error ensuring config exists:', error);
      throw error;
    }
  }

  // Save all required Google Site Kit data to database
  static async saveRequiredData(requiredData: {
    // OAuth Configuration (Required for API access)
    oauth_client_id: string;
    oauth_client_secret?: string;
    oauth_redirect_uri: string;
    
    // Google AdSense Configuration (Required if using AdSense)
    adsense_publisher_id?: string;
    adsense_customer_id?: string;
    
    // Google Analytics Configuration (Required if using Analytics)
    analytics_property_id?: string;
    analytics_measurement_id?: string;
    
    // Google Search Console Configuration (Required if using Search Console)
    search_console_site_url?: string;
    
    // Site Verification (Required for domain verification)
    site_verification_code?: string;
    site_verification_method?: string;
    
    // Feature Flags (Control which services to enable)
    enable_adsense?: boolean;
    enable_analytics?: boolean;
    enable_search_console?: boolean;
    enable_auto_ads?: boolean;
    
    // API Configuration
    enabled_apis?: string[];
    oauth_scopes?: string[];
  }): Promise<GoogleSiteKitConfig> {
    try {
      // Ensure config exists first
      await this.ensureConfigExists();
      
      // Validate required fields
      if (!requiredData.oauth_client_id) {
        throw new Error('OAuth Client ID is required');
      }
      
      if (!requiredData.oauth_redirect_uri) {
        throw new Error('OAuth Redirect URI is required');
      }
      
      // Save the configuration
      const savedConfig = await this.saveConfig(requiredData);
      
      console.log('Google Site Kit required data saved successfully');
      return savedConfig;
    } catch (error) {
      console.error('Error saving required Google Site Kit data:', error);
      throw error;
    }
  }
}

export default GoogleSiteKitService;
