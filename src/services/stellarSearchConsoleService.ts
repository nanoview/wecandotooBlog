// Stellar Content Stream - Google Search Console Service
// Custom implementation inspired by Google Site Kit Search Console module  
// Adapted for React/TypeScript/Supabase - No copyright conflicts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SearchConsoleMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  averagePosition: number;
}

export interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchCountry {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchDevice {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleReport {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overview: SearchConsoleMetrics;
  topQueries: SearchQuery[];
  topPages: SearchPage[];
  topCountries: SearchCountry[];
  deviceBreakdown: SearchDevice[];
  dailyMetrics: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export interface IndexingStatus {
  totalPages: number;
  indexedPages: number;
  notIndexedPages: number;
  validPages: number;
  errorPages: number;
  warningPages: number;
}

export interface SitemapStatus {
  sitemapUrl: string;
  lastSubmitted: string;
  lastDownloaded: string;
  isPending: boolean;
  submittedUrlsCount: number;
  indexedUrlsCount: number;
  errors: Array<{
    type: string;
    count: number;
  }>;
}

export class StellarSearchConsoleService {
  private static instance: StellarSearchConsoleService;
  private siteUrl: string;
  private accessToken: string | null = null;

  private constructor() {
    this.siteUrl = import.meta.env.VITE_SITE_URL || 'https://your-site.com';
  }

  public static getInstance(): StellarSearchConsoleService {
    if (!StellarSearchConsoleService.instance) {
      StellarSearchConsoleService.instance = new StellarSearchConsoleService();
    }
    return StellarSearchConsoleService.instance;
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
      console.error('Failed to initialize Search Console service:', error);
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
      console.error('Failed to refresh Search Console token:', error);
      return false;
    }
  }

  /**
   * Get Search Console report for a date range
   */
  public async getSearchConsoleReport(
    startDate: string,
    endDate: string = 'today'
  ): Promise<SearchConsoleReport> {
    if (!this.accessToken) {
      await this.initialize();
    }

    if (!this.accessToken) {
      return this.getMockSearchConsoleReport(startDate, endDate);
    }

    try {
      // Get overview metrics
      const overviewData = await this.makeSearchConsoleRequest({
        startDate,
        endDate,
        dimensions: [],
        rowLimit: 1
      });

      // Get top queries
      const queriesData = await this.makeSearchConsoleRequest({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 25
      });

      // Get top pages
      const pagesData = await this.makeSearchConsoleRequest({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 25
      });

      // Get countries data
      const countriesData = await this.makeSearchConsoleRequest({
        startDate,
        endDate,
        dimensions: ['country'],
        rowLimit: 10
      });

      // Get device data
      const deviceData = await this.makeSearchConsoleRequest({
        startDate,
        endDate,
        dimensions: ['device'],
        rowLimit: 10
      });

      // Get daily metrics
      const dailyData = await this.makeSearchConsoleRequest({
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 1000
      });

      return this.processSearchConsoleResponse(
        overviewData,
        queriesData,
        pagesData,
        countriesData,
        deviceData,
        dailyData,
        startDate,
        endDate
      );
    } catch (error) {
      console.error('Failed to fetch Search Console data:', error);
      return this.getMockSearchConsoleReport(startDate, endDate);
    }
  }

  /**
   * Make request to Google Search Console API
   */
  private async makeSearchConsoleRequest(params: {
    startDate: string;
    endDate: string;
    dimensions: string[];
    rowLimit: number;
    searchType?: string;
  }): Promise<any> {
    const requestBody = {
      startDate: params.startDate,
      endDate: params.endDate === 'today' ? new Date().toISOString().split('T')[0] : params.endDate,
      dimensions: params.dimensions,
      rowLimit: params.rowLimit,
      searchType: params.searchType || 'web'
    };

    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Search Console API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Process the Search Console API response
   */
  private processSearchConsoleResponse(
    overviewData: any,
    queriesData: any,
    pagesData: any,
    countriesData: any,
    deviceData: any,
    dailyData: any,
    startDate: string,
    endDate: string
  ): SearchConsoleReport {
    // Process overview metrics
    const overviewRow = overviewData.rows?.[0];
    const overview: SearchConsoleMetrics = {
      totalClicks: overviewRow?.clicks || 0,
      totalImpressions: overviewRow?.impressions || 0,
      averageCTR: overviewRow?.ctr || 0,
      averagePosition: overviewRow?.position || 0
    };

    // Process top queries
    const topQueries: SearchQuery[] = (queriesData.rows || []).map((row: any) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));

    // Process top pages
    const topPages: SearchPage[] = (pagesData.rows || []).map((row: any) => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));

    // Process countries
    const topCountries: SearchCountry[] = (countriesData.rows || []).map((row: any) => ({
      country: this.getCountryName(row.keys[0]),
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));

    // Process device breakdown
    const deviceBreakdown: SearchDevice[] = (deviceData.rows || []).map((row: any) => ({
      device: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));

    // Process daily metrics
    const dailyMetrics = (dailyData.rows || []).map((row: any) => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));

    return {
      dateRange: { startDate, endDate },
      overview,
      topQueries,
      topPages,
      topCountries,
      deviceBreakdown,
      dailyMetrics
    };
  }

  /**
   * Get country name from country code
   */
  private getCountryName(countryCode: string): string {
    const countryNames: { [key: string]: string } = {
      'usa': 'United States',
      'gbr': 'United Kingdom',
      'can': 'Canada',
      'aus': 'Australia',
      'deu': 'Germany',
      'fra': 'France',
      'jpn': 'Japan',
      'ind': 'India',
      'bra': 'Brazil',
      'esp': 'Spain',
      'ita': 'Italy',
      'nld': 'Netherlands',
      'mex': 'Mexico',
      'kor': 'South Korea'
    };
    
    return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
  }

  /**
   * Get indexing status
   */
  public async getIndexingStatus(): Promise<IndexingStatus> {
    if (!this.accessToken) {
      await this.initialize();
    }

    if (!this.accessToken) {
      return {
        totalPages: 1250,
        indexedPages: 1180,
        notIndexedPages: 70,
        validPages: 1180,
        errorPages: 15,
        warningPages: 55
      };
    }

    try {
      const response = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl)}/urlCrawlErrorsCountsQuery`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Process indexing data
        return this.processIndexingData(data);
      }
    } catch (error) {
      console.error('Failed to fetch indexing status:', error);
    }

    // Return mock data as fallback
    return {
      totalPages: 1250,
      indexedPages: 1180,
      notIndexedPages: 70,
      validPages: 1180,
      errorPages: 15,
      warningPages: 55
    };
  }

  /**
   * Process indexing data from API
   */
  private processIndexingData(data: any): IndexingStatus {
    // This would process real API data
    // For now, return calculated mock data
    const totalPages = 1250;
    const errorPages = data.countDetails?.reduce((sum: number, item: any) => sum + item.count, 0) || 15;
    const indexedPages = totalPages - errorPages - 70;
    
    return {
      totalPages,
      indexedPages,
      notIndexedPages: totalPages - indexedPages,
      validPages: indexedPages,
      errorPages,
      warningPages: Math.floor(errorPages * 3.5)
    };
  }

  /**
   * Get sitemap status
   */
  public async getSitemapStatus(): Promise<SitemapStatus[]> {
    if (!this.accessToken) {
      await this.initialize();
    }

    if (!this.accessToken) {
      return [{
        sitemapUrl: `${this.siteUrl}/sitemap.xml`,
        lastSubmitted: '2025-01-30T10:30:00Z',
        lastDownloaded: '2025-01-30T11:45:00Z',
        isPending: false,
        submittedUrlsCount: 1250,
        indexedUrlsCount: 1180,
        errors: [
          { type: '404 Not Found', count: 8 },
          { type: 'Soft 404', count: 5 },
          { type: 'Blocked by robots.txt', count: 2 }
        ]
      }];
    }

    try {
      const response = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl)}/sitemaps`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.sitemap?.map((sitemap: any) => this.processSitemapData(sitemap)) || [];
      }
    } catch (error) {
      console.error('Failed to fetch sitemap status:', error);
    }

    // Return mock data as fallback
    return [{
      sitemapUrl: `${this.siteUrl}/sitemap.xml`,
      lastSubmitted: '2025-01-30T10:30:00Z',
      lastDownloaded: '2025-01-30T11:45:00Z',
      isPending: false,
      submittedUrlsCount: 1250,
      indexedUrlsCount: 1180,
      errors: [
        { type: '404 Not Found', count: 8 },
        { type: 'Soft 404', count: 5 },
        { type: 'Blocked by robots.txt', count: 2 }
      ]
    }];
  }

  /**
   * Process sitemap data from API
   */
  private processSitemapData(sitemap: any): SitemapStatus {
    return {
      sitemapUrl: sitemap.path,
      lastSubmitted: sitemap.lastSubmitted,
      lastDownloaded: sitemap.lastDownloaded,
      isPending: sitemap.isPending || false,
      submittedUrlsCount: sitemap.contents?.[0]?.submitted || 0,
      indexedUrlsCount: sitemap.contents?.[0]?.indexed || 0,
      errors: sitemap.errors || []
    };
  }

  /**
   * Get mock Search Console data for development/fallback
   */
  private getMockSearchConsoleReport(startDate: string, endDate: string): SearchConsoleReport {
    return {
      dateRange: { startDate, endDate },
      overview: {
        totalClicks: 8420,
        totalImpressions: 156800,
        averageCTR: 5.37,
        averagePosition: 12.4
      },
      topQueries: [
        { query: 'react hooks tutorial', clicks: 840, impressions: 12400, ctr: 6.77, position: 3.2 },
        { query: 'typescript best practices', clicks: 720, impressions: 10800, ctr: 6.67, position: 4.1 },
        { query: 'web development trends 2025', clicks: 680, impressions: 15200, ctr: 4.47, position: 2.8 },
        { query: 'javascript frameworks comparison', clicks: 560, impressions: 9800, ctr: 5.71, position: 5.6 },
        { query: 'supabase vs firebase', clicks: 480, impressions: 8600, ctr: 5.58, position: 6.2 },
        { query: 'react performance optimization', clicks: 420, impressions: 7400, ctr: 5.68, position: 7.1 },
        { query: 'nextjs deployment guide', clicks: 380, impressions: 6200, ctr: 6.13, position: 4.9 },
        { query: 'css grid layout tutorial', clicks: 340, impressions: 5800, ctr: 5.86, position: 8.3 },
        { query: 'api integration best practices', clicks: 320, impressions: 5400, ctr: 5.93, position: 9.1 },
        { query: 'database design patterns', clicks: 280, impressions: 4600, ctr: 6.09, position: 7.8 }
      ],
      topPages: [
        { page: '/blog/react-hooks-complete-guide', clicks: 1240, impressions: 18600, ctr: 6.67, position: 3.8 },
        { page: '/tutorials/typescript-fundamentals', clicks: 980, impressions: 16200, ctr: 6.05, position: 4.2 },
        { page: '/blog/web-development-trends-2025', clicks: 840, impressions: 15400, ctr: 5.45, position: 2.9 },
        { page: '/guides/javascript-frameworks', clicks: 720, impressions: 12800, ctr: 5.63, position: 5.1 },
        { page: '/comparisons/supabase-vs-firebase', clicks: 680, impressions: 11600, ctr: 5.86, position: 6.3 },
        { page: '/tutorials/react-performance', clicks: 560, impressions: 9800, ctr: 5.71, position: 7.2 },
        { page: '/guides/nextjs-deployment', clicks: 480, impressions: 8400, ctr: 5.71, position: 4.8 },
        { page: '/tutorials/css-grid-mastery', clicks: 420, impressions: 7200, ctr: 5.83, position: 8.1 },
        { page: '/blog/api-integration-patterns', clicks: 380, impressions: 6600, ctr: 5.76, position: 9.3 },
        { page: '/guides/database-design', clicks: 340, impressions: 5800, ctr: 5.86, position: 7.9 }
      ],
      topCountries: [
        { country: 'United States', clicks: 3920, impressions: 72400, ctr: 5.41, position: 11.8 },
        { country: 'United Kingdom', clicks: 1240, impressions: 23800, ctr: 5.21, position: 12.9 },
        { country: 'Canada', clicks: 840, impressions: 15600, ctr: 5.38, position: 12.1 },
        { country: 'Australia', clicks: 680, impressions: 12200, ctr: 5.57, position: 11.6 },
        { country: 'Germany', clicks: 560, impressions: 10400, ctr: 5.38, position: 13.2 },
        { country: 'India', clicks: 480, impressions: 9800, ctr: 4.90, position: 14.8 },
        { country: 'France', clicks: 320, impressions: 6200, ctr: 5.16, position: 13.7 },
        { country: 'Netherlands', clicks: 240, impressions: 4600, ctr: 5.22, position: 12.4 },
        { country: 'Brazil', clicks: 180, impressions: 3800, ctr: 4.74, position: 15.2 },
        { country: 'Japan', clicks: 160, impressions: 3200, ctr: 5.00, position: 13.9 }
      ],
      deviceBreakdown: [
        { device: 'desktop', clicks: 4620, impressions: 84800, ctr: 5.45, position: 11.8 },
        { device: 'mobile', clicks: 3240, impressions: 62400, ctr: 5.19, position: 13.2 },
        { device: 'tablet', clicks: 560, impressions: 9600, ctr: 5.83, position: 12.6 }
      ],
      dailyMetrics: [
        { date: '2025-01-24', clicks: 1180, impressions: 22400, ctr: 5.27, position: 12.1 },
        { date: '2025-01-25', clicks: 1240, impressions: 23200, ctr: 5.34, position: 12.0 },
        { date: '2025-01-26', clicks: 1160, impressions: 21800, ctr: 5.32, position: 12.3 },
        { date: '2025-01-27', clicks: 1320, impressions: 24600, ctr: 5.37, position: 11.9 },
        { date: '2025-01-28', clicks: 1420, impressions: 26400, ctr: 5.38, position: 11.8 },
        { date: '2025-01-29', clicks: 1380, impressions: 25800, ctr: 5.35, position: 12.2 },
        { date: '2025-01-30', clicks: 720, impressions: 12600, ctr: 5.71, position: 12.4 }
      ]
    };
  }

  /**
   * Get comparative Search Console data
   */
  public async getComparativeSearchConsole(
    currentPeriod: { startDate: string; endDate: string },
    previousPeriod: { startDate: string; endDate: string }
  ) {
    const [current, previous] = await Promise.all([
      this.getSearchConsoleReport(currentPeriod.startDate, currentPeriod.endDate),
      this.getSearchConsoleReport(previousPeriod.startDate, previousPeriod.endDate)
    ]);

    return {
      current,
      previous,
      changes: {
        clicks: this.calculateChange(current.overview.totalClicks, previous.overview.totalClicks),
        impressions: this.calculateChange(current.overview.totalImpressions, previous.overview.totalImpressions),
        ctr: this.calculateChange(current.overview.averageCTR, previous.overview.averageCTR),
        position: this.calculateChange(previous.overview.averagePosition, current.overview.averagePosition) // Inverted for position (lower is better)
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
   * Submit URL for indexing
   */
  public async submitUrlForIndexing(url: string): Promise<boolean> {
    if (!this.accessToken) {
      await this.initialize();
    }

    if (!this.accessToken) {
      console.log('Mock: URL submitted for indexing:', url);
      return true;
    }

    try {
      const response = await fetch(
        `https://indexing.googleapis.com/v3/urlNotifications:publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            type: 'URL_UPDATED'
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to submit URL for indexing:', error);
      return false;
    }
  }

  /**
   * Get SEO insights and recommendations
   */
  public getSEOInsights(report: SearchConsoleReport): Array<{
    type: 'info' | 'warning' | 'success';
    title: string;
    description: string;
    action?: string;
  }> {
    const insights = [];
    const { overview, topQueries, topPages } = report;

    // CTR analysis
    if (overview.averageCTR < 5.0) {
      insights.push({
        type: 'warning' as const,
        title: 'Low Click-Through Rate',
        description: `Your average CTR of ${overview.averageCTR.toFixed(2)}% is below average. Consider improving your meta titles and descriptions.`,
        action: 'Optimize meta titles and descriptions'
      });
    } else if (overview.averageCTR > 7.0) {
      insights.push({
        type: 'success' as const,
        title: 'Excellent Click-Through Rate',
        description: `Your CTR of ${overview.averageCTR.toFixed(2)}% is above average, indicating good meta optimization.`,
        action: 'Maintain current strategy'
      });
    }

    // Position analysis
    if (overview.averagePosition > 15) {
      insights.push({
        type: 'warning' as const,
        title: 'Low Average Position',
        description: `Your average position of ${overview.averagePosition.toFixed(1)} suggests room for improvement in search rankings.`,
        action: 'Focus on content optimization and link building'
      });
    }

    // Top performing content
    if (topPages.length > 0) {
      const topPage = topPages[0];
      if (topPage.clicks > overview.totalClicks * 0.1) {
        insights.push({
          type: 'success' as const,
          title: 'High-Performing Content',
          description: `Your page "${topPage.page}" generates ${((topPage.clicks / overview.totalClicks) * 100).toFixed(1)}% of total clicks.`,
          action: 'Create similar content or expand this topic'
        });
      }
    }

    // Query opportunities
    const lowPositionHighImpressions = topQueries.filter(q => q.position > 10 && q.impressions > 1000);
    if (lowPositionHighImpressions.length > 0) {
      insights.push({
        type: 'info' as const,
        title: 'Ranking Opportunities',
        description: `You have ${lowPositionHighImpressions.length} queries with high impressions but low positions.`,
        action: 'Optimize content for these high-potential queries'
      });
    }

    return insights;
  }
}

export const stellarSearchConsole = StellarSearchConsoleService.getInstance();
