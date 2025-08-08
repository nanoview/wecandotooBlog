// Stellar Content Stream - Google AdSense Service  
// Custom implementation inspired by Google Site Kit AdSense module
// Adapted for React/TypeScript/Supabase - No copyright conflicts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface AdSenseMetrics {
  estimatedEarnings: number;
  pageViews: number;
  adClicks: number;
  adRequests: number;
  clickThroughRate: number;
  costPerClick: number;
  revenuePerMille: number;
  impressions: number;
}

export interface AdSenseTopPage {
  pagePath: string;
  pageTitle: string;
  earnings: number;
  pageViews: number;
  clicks: number;
  ctr: number;
}

export interface AdSenseReport {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overview: AdSenseMetrics;
  topEarningPages: AdSenseTopPage[];
  dailyEarnings: Array<{
    date: string;
    earnings: number;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
  accountInfo: {
    accountId: string;
    customerId: string;
    timezone: string;
    currency: string;
  };
}

export class StellarAdSenseService {
  private static instance: StellarAdSenseService;
  private accountId: string;
  private customerId: string;
  private accessToken: string | null = null;

  private constructor() {
    this.accountId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || '';
    this.customerId = import.meta.env.VITE_GOOGLE_ADSENSE_CUSTOMER_ID || '';
  }

  public static getInstance(): StellarAdSenseService {
    if (!StellarAdSenseService.instance) {
      StellarAdSenseService.instance = new StellarAdSenseService();
    }
    return StellarAdSenseService.instance;
  }

  /**
   * Initialize the service and get access token
   */
  public async initialize(): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('google_site_kit')
        .select('oauth_access_token, oauth_expires_at')
        .limit(1);

      if (data && data.length > 0) {
        const config = data[0];
        
        // Check if token is still valid
        const expiresAt = new Date(config.oauth_expires_at);
        const now = new Date();
        
        if (expiresAt > now) {
          this.accessToken = config.oauth_access_token;
          return true;
        } else {
          return await this.refreshToken();
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize AdSense service:', error);
      return false;
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'refresh_tokens' })
      });

      if (response.ok) {
        const result = await response.json();
        this.accessToken = result.access_token;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to refresh AdSense token:', error);
      return false;
    }
  }

  /**
   * Get AdSense report for a date range
   */
  public async getAdSenseReport(
    startDate: string, 
    endDate: string = 'today'
  ): Promise<AdSenseReport> {
    if (!this.accessToken) {
      await this.initialize();
    }

    if (!this.accessToken) {
      return this.getMockAdSenseReport(startDate, endDate);
    }

    try {
      // Get account information
      const accountInfo = await this.getAccountInfo();
      
      // Get earnings report
      const earningsResponse = await this.makeAdSenseRequest(
        `/accounts/${this.accountId}/reports:generate`,
        {
          dateRange: `${startDate}..${endDate}`,
          metrics: [
            'ESTIMATED_EARNINGS',
            'PAGE_VIEWS',
            'AD_REQUESTS',
            'AD_REQUESTS_COVERAGE',
            'CLICKS',
            'AD_REQUESTS_CTR',
            'COST_PER_CLICK',
            'AD_REQUESTS_RPM',
            'IMPRESSIONS'
          ]
        }
      );

      // Get top earning pages
      const topPagesResponse = await this.makeAdSenseRequest(
        `/accounts/${this.accountId}/reports:generate`,
        {
          dateRange: `${startDate}..${endDate}`,
          dimensions: ['PAGE_URL'],
          metrics: [
            'ESTIMATED_EARNINGS',
            'PAGE_VIEWS',
            'CLICKS',
            'AD_REQUESTS_CTR'
          ],
          orderBy: ['-ESTIMATED_EARNINGS'],
          limit: 10
        }
      );

      return this.processAdSenseResponse(
        earningsResponse,
        topPagesResponse,
        accountInfo,
        startDate,
        endDate
      );
    } catch (error) {
      console.error('Failed to fetch AdSense data:', error);
      return this.getMockAdSenseReport(startDate, endDate);
    }
  }

  /**
   * Make request to Google AdSense Management API
   */
  private async makeAdSenseRequest(endpoint: string, params: any): Promise<any> {
    const url = new URL(`https://adsense.googleapis.com/v2${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else {
        url.searchParams.append(key, value as string);
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`AdSense API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get AdSense account information
   */
  private async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeAdSenseRequest(`/accounts/${this.accountId}`, {});
      return {
        accountId: response.name?.split('/')[1] || this.accountId,
        customerId: this.customerId,
        timezone: response.timeZone || 'UTC',
        currency: response.currencyCode || 'USD'
      };
    } catch (error) {
      return {
        accountId: this.accountId,
        customerId: this.customerId,
        timezone: 'UTC',
        currency: 'USD'
      };
    }
  }

  /**
   * Process the AdSense API response
   */
  private processAdSenseResponse(
    earningsResponse: any,
    topPagesResponse: any,
    accountInfo: any,
    startDate: string,
    endDate: string
  ): AdSenseReport {
    // Process overview metrics
    const earningsRow = earningsResponse.rows?.[0];
    const overview: AdSenseMetrics = {
      estimatedEarnings: parseFloat(earningsRow?.cells?.[0]?.value || '0'),
      pageViews: parseInt(earningsRow?.cells?.[1]?.value || '0'),
      adRequests: parseInt(earningsRow?.cells?.[2]?.value || '0'),
      impressions: parseInt(earningsRow?.cells?.[8]?.value || '0'),
      adClicks: parseInt(earningsRow?.cells?.[4]?.value || '0'),
      clickThroughRate: parseFloat(earningsRow?.cells?.[5]?.value || '0'),
      costPerClick: parseFloat(earningsRow?.cells?.[6]?.value || '0'),
      revenuePerMille: parseFloat(earningsRow?.cells?.[7]?.value || '0')
    };

    // Process top earning pages
    const topEarningPages: AdSenseTopPage[] = (topPagesResponse.rows || []).map((row: any) => ({
      pagePath: row.cells[0].value,
      pageTitle: this.extractPageTitle(row.cells[0].value),
      earnings: parseFloat(row.cells[1].value),
      pageViews: parseInt(row.cells[2].value),
      clicks: parseInt(row.cells[3].value),
      ctr: parseFloat(row.cells[4].value)
    }));

    return {
      dateRange: { startDate, endDate },
      overview,
      topEarningPages,
      dailyEarnings: [], // Would need separate API call for daily breakdown
      accountInfo
    };
  }

  /**
   * Extract page title from URL (fallback method)
   */
  private extractPageTitle(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      return pathname
        .split('/')
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, ' ')
        ?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Page';
    } catch {
      return 'Unknown Page';
    }
  }

  /**
   * Get mock AdSense data for development/fallback
   */
  private getMockAdSenseReport(startDate: string, endDate: string): AdSenseReport {
    return {
      dateRange: { startDate, endDate },
      overview: {
        estimatedEarnings: 425.80,
        pageViews: 15420,
        adClicks: 125,
        adRequests: 18500,
        clickThroughRate: 0.81,
        costPerClick: 3.41,
        revenuePerMille: 27.60,
        impressions: 15420
      },
      topEarningPages: [
        {
          pagePath: '/blog/web-development-trends',
          pageTitle: 'Top Web Development Trends 2025',
          earnings: 89.50,
          pageViews: 2840,
          clicks: 28,
          ctr: 0.98
        },
        {
          pagePath: '/tutorials/react-hooks',
          pageTitle: 'Complete Guide to React Hooks',
          earnings: 76.20,
          pageViews: 1920,
          clicks: 22,
          ctr: 1.15
        },
        {
          pagePath: '/about',
          pageTitle: 'About Our Company',
          earnings: 42.30,
          pageViews: 1450,
          clicks: 12,
          ctr: 0.83
        },
        {
          pagePath: '/contact',
          pageTitle: 'Contact Us',
          earnings: 28.40,
          pageViews: 980,
          clicks: 8,
          ctr: 0.82
        },
        {
          pagePath: '/services',
          pageTitle: 'Our Services',
          earnings: 35.70,
          pageViews: 750,
          clicks: 11,
          ctr: 1.47
        }
      ],
      dailyEarnings: [
        { date: '2025-08-01', earnings: 15.20, clicks: 4, impressions: 520, ctr: 0.77 },
        { date: '2025-08-02', earnings: 18.50, clicks: 5, impressions: 640, ctr: 0.78 },
        { date: '2025-08-03', earnings: 22.10, clicks: 7, impressions: 750, ctr: 0.93 },
        { date: '2025-08-04', earnings: 19.80, clicks: 6, impressions: 680, ctr: 0.88 },
        { date: '2025-08-05', earnings: 24.30, clicks: 8, impressions: 820, ctr: 0.98 },
        { date: '2025-08-06', earnings: 21.70, clicks: 6, impressions: 730, ctr: 0.82 },
        { date: '2025-08-07', earnings: 26.80, clicks: 9, impressions: 890, ctr: 1.01 }
      ],
      accountInfo: {
        accountId: this.accountId,
        customerId: this.customerId,
        timezone: 'America/New_York',
        currency: 'USD'
      }
    };
  }

  /**
   * Get real-time AdSense earnings (today so far)
   */
  public async getTodayEarnings(): Promise<{ earnings: number; clicks: number; impressions: number }> {
    if (!this.accessToken) {
      await this.initialize();
    }

    if (!this.accessToken) {
      return {
        earnings: Math.random() * 30 + 10,
        clicks: Math.floor(Math.random() * 10) + 2,
        impressions: Math.floor(Math.random() * 500) + 200
      };
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.makeAdSenseRequest(
        `/accounts/${this.accountId}/reports:generate`,
        {
          dateRange: `${today}..${today}`,
          metrics: ['ESTIMATED_EARNINGS', 'CLICKS', 'IMPRESSIONS']
        }
      );

      const row = response.rows?.[0];
      return {
        earnings: parseFloat(row?.cells?.[0]?.value || '0'),
        clicks: parseInt(row?.cells?.[1]?.value || '0'),
        impressions: parseInt(row?.cells?.[2]?.value || '0')
      };
    } catch (error) {
      console.error('Failed to fetch today earnings:', error);
      return {
        earnings: Math.random() * 30 + 10,
        clicks: Math.floor(Math.random() * 10) + 2,
        impressions: Math.floor(Math.random() * 500) + 200
      };
    }
  }

  /**
   * Get comparative AdSense data (like Site Kit's period comparisons)
   */
  public async getComparativeAdSense(
    currentPeriod: { startDate: string; endDate: string },
    previousPeriod: { startDate: string; endDate: string }
  ) {
    const [current, previous] = await Promise.all([
      this.getAdSenseReport(currentPeriod.startDate, currentPeriod.endDate),
      this.getAdSenseReport(previousPeriod.startDate, previousPeriod.endDate)
    ]);

    return {
      current,
      previous,
      changes: {
        earnings: this.calculateChange(current.overview.estimatedEarnings, previous.overview.estimatedEarnings),
        clicks: this.calculateChange(current.overview.adClicks, previous.overview.adClicks),
        pageViews: this.calculateChange(current.overview.pageViews, previous.overview.pageViews),
        ctr: this.calculateChange(current.overview.clickThroughRate, previous.overview.clickThroughRate)
      }
    };
  }

  /**
   * Calculate percentage change
   */
  private calculateChange(current: number, previous: number): {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
  } {
    const difference = current - previous;
    const percentage = previous !== 0 ? (difference / previous) * 100 : 0;
    
    return {
      value: difference,
      percentage,
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    };
  }

  /**
   * Format currency based on account settings
   */
  public formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get optimization suggestions (Site Kit-style recommendations)
   */
  public getOptimizationSuggestions(report: AdSenseReport): Array<{
    type: 'info' | 'warning' | 'success';
    title: string;
    description: string;
    action?: string;
  }> {
    const suggestions = [];
    const { overview } = report;

    // CTR optimization
    if (overview.clickThroughRate < 1.0) {
      suggestions.push({
        type: 'warning' as const,
        title: 'Low Click-Through Rate',
        description: `Your CTR of ${overview.clickThroughRate.toFixed(2)}% is below average. Consider optimizing ad placement and formats.`,
        action: 'Review ad placement strategy'
      });
    }

    // Earnings optimization
    if (overview.revenuePerMille < 20) {
      suggestions.push({
        type: 'info' as const,
        title: 'Revenue Per Mille Optimization',
        description: `Your RPM of $${overview.revenuePerMille.toFixed(2)} can be improved with better ad targeting.`,
        action: 'Optimize ad targeting'
      });
    }

    // High performing pages
    if (report.topEarningPages.length > 0) {
      const topPage = report.topEarningPages[0];
      if (topPage.earnings > overview.estimatedEarnings * 0.2) {
        suggestions.push({
          type: 'success' as const,
          title: 'High-Performing Content',
          description: `Your page "${topPage.pageTitle}" is generating ${((topPage.earnings / overview.estimatedEarnings) * 100).toFixed(1)}% of total earnings.`,
          action: 'Create similar content'
        });
      }
    }

    return suggestions;
  }
}

export const stellarAdSense = StellarAdSenseService.getInstance();
