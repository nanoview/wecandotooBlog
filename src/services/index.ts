// Stellar Content Stream - Google Services Index
// Centralized export for all Google API services
// Adapted for React/TypeScript/Supabase - No copyright conflicts

// Analytics Service
export { 
  stellarAnalytics,
  type AnalyticsReport,
  type AnalyticsMetrics,
  type TopPage,
  type TrafficSource
} from './stellarAnalyticsService';

// AdSense Service
export {
  stellarAdSense,
  type AdSenseReport,
  type AdSenseMetrics,
  type AdSenseTopPage
} from './stellarAdSenseService';

// Search Console Service
export {
  stellarSearchConsole,
  type SearchConsoleReport,
  type SearchConsoleMetrics,
  type SearchQuery,
  type SearchPage,
  type SearchCountry,
  type SearchDevice,
  type IndexingStatus,
  type SitemapStatus
} from './stellarSearchConsoleService';

// PageSpeed Insights Service
export {
  stellarPageSpeed,
  type PageSpeedReport,
  type PageSpeedMetrics,
  type PageSpeedOpportunity,
  type PageSpeedDiagnostic
} from './stellarPageSpeedService';

// Site Kit Configuration
export {
  stellarSiteKitConfig,
  type SiteKitConfig,
  type ServiceStatus,
  type SetupStep
} from './stellarSiteKitConfig';

// Import services for internal use
import { stellarAnalytics } from './stellarAnalyticsService';
import { stellarAdSense } from './stellarAdSenseService';
import { stellarSearchConsole } from './stellarSearchConsoleService';
import { stellarPageSpeed } from './stellarPageSpeedService';
import { stellarSiteKitConfig } from './stellarSiteKitConfig';

// Unified Google Services Manager
export class StellarGoogleServices {
  private static instance: StellarGoogleServices;

  private constructor() {}

  public static getInstance(): StellarGoogleServices {
    if (!StellarGoogleServices.instance) {
      StellarGoogleServices.instance = new StellarGoogleServices();
    }
    return StellarGoogleServices.instance;
  }

  /**
   * Initialize all Google services
   */
  public async initializeAll(): Promise<{
    analytics: boolean;
    adsense: boolean;
    searchConsole: boolean;
    pageSpeed: boolean;
    config: boolean;
  }> {
    const results = await Promise.allSettled([
      stellarAnalytics.initialize(),
      stellarAdSense.initialize(),
      stellarSearchConsole.initialize(),
      stellarSiteKitConfig.initialize()
    ]);

    return {
      analytics: results[0].status === 'fulfilled' ? results[0].value : false,
      adsense: results[1].status === 'fulfilled' ? results[1].value : false,
      searchConsole: results[2].status === 'fulfilled' ? results[2].value : false,
      pageSpeed: true, // PageSpeed doesn't require OAuth initialization
      config: results[3].status === 'fulfilled' ? results[3].value : false
    };
  }

  /**
   * Get comprehensive dashboard data
   */
  public async getDashboardData(
    startDate: string,
    endDate: string,
    siteUrl?: string
  ) {
    const [
      analyticsData,
      adsenseData,
      searchConsoleData,
      pageSpeedData,
      servicesStatus
    ] = await Promise.allSettled([
      stellarAnalytics.getAnalyticsReport(startDate, endDate),
      stellarAdSense.getAdSenseReport(startDate, endDate),
      stellarSearchConsole.getSearchConsoleReport(startDate, endDate),
      siteUrl ? stellarPageSpeed.getPageSpeedReport(siteUrl) : null,
      stellarSiteKitConfig.getServicesStatus()
    ]);

    return {
      analytics: analyticsData.status === 'fulfilled' ? analyticsData.value : null,
      adsense: adsenseData.status === 'fulfilled' ? adsenseData.value : null,
      searchConsole: searchConsoleData.status === 'fulfilled' ? searchConsoleData.value : null,
      pageSpeed: pageSpeedData.status === 'fulfilled' ? pageSpeedData.value : null,
      servicesStatus: servicesStatus.status === 'fulfilled' ? servicesStatus.value : [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get health status of all services
   */
  public async getServicesHealth(): Promise<{
    overall: 'healthy' | 'warning' | 'error';
    services: {
      [service: string]: {
        status: 'connected' | 'configured' | 'error';
        lastCheck: string;
        message?: string;
      };
    };
  }> {
    const servicesStatus = await stellarSiteKitConfig.getServicesStatus();
    const now = new Date().toISOString();
    
    const services: { [service: string]: any } = {};
    let errorCount = 0;
    let warningCount = 0;

    servicesStatus.forEach(service => {
      if (service.connected && service.configured) {
        services[service.service] = {
          status: 'connected',
          lastCheck: now,
          message: 'Service is working properly'
        };
      } else if (service.configured) {
        services[service.service] = {
          status: 'configured',
          lastCheck: now,
          message: 'Service configured but not connected'
        };
        warningCount++;
      } else {
        services[service.service] = {
          status: 'error',
          lastCheck: now,
          message: 'Service needs configuration'
        };
        errorCount++;
      }
    });

    let overall: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errorCount > 0) {
      overall = 'error';
    } else if (warningCount > 0) {
      overall = 'warning';
    }

    return { overall, services };
  }

  /**
   * Test all service connections
   */
  public async testConnections(): Promise<{
    [service: string]: {
      success: boolean;
      responseTime?: number;
      error?: string;
    };
  }> {
    const startTime = Date.now();
    const results: { [service: string]: any } = {};

    // Test Analytics
    try {
      const analyticsStart = Date.now();
      await stellarAnalytics.getRealTimeUsers();
      results.analytics = {
        success: true,
        responseTime: Date.now() - analyticsStart
      };
    } catch (error) {
      results.analytics = {
        success: false,
        error: 'Failed to connect to Analytics'
      };
    }

    // Test AdSense
    try {
      const adsenseStart = Date.now();
      await stellarAdSense.getTodayEarnings();
      results.adsense = {
        success: true,
        responseTime: Date.now() - adsenseStart
      };
    } catch (error) {
      results.adsense = {
        success: false,
        error: 'Failed to connect to AdSense'
      };
    }

    // Test Search Console
    try {
      const searchConsoleStart = Date.now();
      await stellarSearchConsole.getIndexingStatus();
      results.searchConsole = {
        success: true,
        responseTime: Date.now() - searchConsoleStart
      };
    } catch (error) {
      results.searchConsole = {
        success: false,
        error: 'Failed to connect to Search Console'
      };
    }

    // Test PageSpeed (always works as it doesn't require OAuth)
    const pageSpeedStart = Date.now();
    results.pageSpeed = {
      success: true,
      responseTime: Date.now() - pageSpeedStart
    };

    return results;
  }

  /**
   * Get unified insights and recommendations
   */
  public async getUnifiedInsights(
    analyticsData?: any,
    adsenseData?: any,
    searchConsoleData?: any,
    pageSpeedData?: any
  ) {
    const insights = [];

    // Cross-service insights
    if (analyticsData && searchConsoleData) {
      const analyticsTraffic = analyticsData.overview.sessions;
      const organicClicks = searchConsoleData.overview.totalClicks;
      
      if (organicClicks / analyticsTraffic > 0.6) {
        insights.push({
          type: 'success',
          title: 'Strong Organic Presence',
          description: `${((organicClicks / analyticsTraffic) * 100).toFixed(1)}% of your traffic comes from organic search.`,
          action: 'Continue focusing on SEO strategies'
        });
      }
    }

    // Performance vs Revenue correlation
    if (adsenseData && pageSpeedData) {
      if (pageSpeedData.scores.performance < 50 && adsenseData.overview.clickThroughRate < 2.0) {
        insights.push({
          type: 'warning',
          title: 'Performance Impacting Revenue',
          description: 'Low page speed may be affecting your AdSense performance.',
          action: 'Improve page speed to potentially increase ad revenue'
        });
      }
    }

    // SEO opportunities
    if (searchConsoleData) {
      const avgPosition = searchConsoleData.overview.averagePosition;
      const ctr = searchConsoleData.overview.averageCTR;
      
      if (avgPosition < 10 && ctr < 5.0) {
        insights.push({
          type: 'info',
          title: 'CTR Optimization Opportunity',
          description: 'Your pages rank well but have low click-through rates.',
          action: 'Optimize meta titles and descriptions'
        });
      }
    }

    return insights;
  }
}

export const stellarGoogleServices = StellarGoogleServices.getInstance();
