// Google OAuth and API configuration
export const googleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URI || `http://localhost:5173/oauth/callback`,
  scopes: [
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'openid',
    'email',
    'profile'
  ].join(' '),
  
  // API endpoints
  apiEndpoints: {
    adsense: 'https://adsense.googleapis.com/v2',
    analytics: 'https://analyticsreporting.googleapis.com/v4',
    searchConsole: 'https://searchconsole.googleapis.com/webmasters/v3'
  }
};

// Google OAuth utilities
export class GoogleOAuth {
  private static instance: GoogleOAuth;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  static getInstance(): GoogleOAuth {
    if (!GoogleOAuth.instance) {
      GoogleOAuth.instance = new GoogleOAuth();
    }
    return GoogleOAuth.instance;
  }

  // Initialize OAuth flow
  initiateOAuth(): void {
    const authUrl = new URL('https://accounts.google.com/oauth2/auth');
    authUrl.searchParams.set('client_id', googleOAuthConfig.clientId);
    authUrl.searchParams.set('redirect_uri', googleOAuthConfig.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', googleOAuthConfig.scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', this.generateState());

    // Store state for verification
    localStorage.setItem('google_oauth_state', authUrl.searchParams.get('state')!);
    
    window.location.href = authUrl.toString();
  }

  // Handle OAuth callback
  async handleCallback(code: string, state: string): Promise<boolean> {
    try {
      const storedState = localStorage.getItem('google_oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      const tokenResponse = await this.exchangeCodeForToken(code);
      this.setTokens(tokenResponse);
      
      // Store tokens securely (in production, consider using httpOnly cookies)
      localStorage.setItem('google_access_token', this.accessToken!);
      localStorage.setItem('google_refresh_token', this.refreshToken!);
      localStorage.setItem('google_expires_at', this.expiresAt!.toString());
      
      localStorage.removeItem('google_oauth_state');
      return true;
    } catch (error) {
      console.error('OAuth callback error:', error);
      return false;
    }
  }

  // Exchange authorization code for tokens
  private async exchangeCodeForToken(code: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleOAuthConfig.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: googleOAuthConfig.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  // Set tokens from response
  private setTokens(tokenResponse: any): void {
    this.accessToken = tokenResponse.access_token;
    this.refreshToken = tokenResponse.refresh_token;
    this.expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    this.loadTokensFromStorage();
    return !!(this.accessToken && this.expiresAt && Date.now() < this.expiresAt);
  }

  // Load tokens from storage
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('google_access_token');
    this.refreshToken = localStorage.getItem('google_refresh_token');
    const expiresAt = localStorage.getItem('google_expires_at');
    this.expiresAt = expiresAt ? parseInt(expiresAt) : null;
  }

  // Get access token (refresh if needed)
  async getAccessToken(): Promise<string | null> {
    this.loadTokensFromStorage();
    
    if (!this.accessToken) return null;
    
    // Check if token needs refresh
    if (this.expiresAt && Date.now() >= this.expiresAt - 60000) { // Refresh 1 min before expiry
      await this.refreshAccessToken();
    }
    
    return this.accessToken;
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleOAuthConfig.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenResponse = await response.json();
    this.accessToken = tokenResponse.access_token;
    this.expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    
    // Update storage
    localStorage.setItem('google_access_token', this.accessToken);
    localStorage.setItem('google_expires_at', this.expiresAt.toString());
  }

  // Sign out
  signOut(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_expires_at');
    localStorage.removeItem('google_oauth_state');
  }

  // Generate random state for OAuth
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// API service classes
export class GoogleAdSenseAPI {
  private oauth: GoogleOAuth;

  constructor() {
    this.oauth = GoogleOAuth.getInstance();
  }

  async getAccount(): Promise<any> {
    const token = await this.oauth.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    // Use the Customer ID from environment if available
    const customerId = import.meta.env.VITE_GOOGLE_ADSENSE_CUSTOMER_ID;
    const endpoint = customerId 
      ? `${googleOAuthConfig.apiEndpoints.adsense}/accounts/${customerId}`
      : `${googleOAuthConfig.apiEndpoints.adsense}/accounts`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch AdSense account');
    return response.json();
  }

  async getReports(accountId: string, startDate: string, endDate: string): Promise<any> {
    const token = await this.oauth.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const url = new URL(`${googleOAuthConfig.apiEndpoints.adsense}/accounts/${accountId}/reports:generate`);
    url.searchParams.set('dateRange', 'CUSTOM');
    url.searchParams.set('startDate.year', startDate.split('-')[0]);
    url.searchParams.set('startDate.month', startDate.split('-')[1]);
    url.searchParams.set('startDate.day', startDate.split('-')[2]);
    url.searchParams.set('endDate.year', endDate.split('-')[0]);
    url.searchParams.set('endDate.month', endDate.split('-')[1]);
    url.searchParams.set('endDate.day', endDate.split('-')[2]);
    url.searchParams.set('metrics', 'ESTIMATED_EARNINGS,PAGE_VIEWS,CLICKS');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch AdSense reports');
    return response.json();
  }
}

export class GoogleAnalyticsAPI {
  private oauth: GoogleOAuth;

  constructor() {
    this.oauth = GoogleOAuth.getInstance();
  }

  async getReports(viewId: string): Promise<any> {
    const token = await this.oauth.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const requestBody = {
      reportRequests: [
        {
          viewId: viewId,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { expression: 'ga:sessions' },
            { expression: 'ga:pageviews' },
            { expression: 'ga:bounceRate' },
            { expression: 'ga:avgSessionDuration' }
          ],
          dimensions: [{ name: 'ga:date' }]
        }
      ]
    };

    const response = await fetch(`${googleOAuthConfig.apiEndpoints.analytics}/reports:batchGet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error('Failed to fetch Analytics reports');
    return response.json();
  }
}

export class GoogleSearchConsoleAPI {
  private oauth: GoogleOAuth;

  constructor() {
    this.oauth = GoogleOAuth.getInstance();
  }

  async getSites(): Promise<any> {
    const token = await this.oauth.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${googleOAuthConfig.apiEndpoints.searchConsole}/sites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch Search Console sites');
    return response.json();
  }

  async getSearchAnalytics(siteUrl: string): Promise<any> {
    const token = await this.oauth.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const requestBody = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      dimensions: ['date'],
      rowLimit: 1000
    };

    const response = await fetch(
      `${googleOAuthConfig.apiEndpoints.searchConsole}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch Search Console analytics');
    return response.json();
  }
}
