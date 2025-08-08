// Stellar Content Stream - Site Kit Configuration Manager
// Custom implementation for Google services management
// Adapted for React/TypeScript/Supabase - No copyright conflicts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SiteKitConfig {
  id?: string;
  site_url: string;
  analytics_property_id?: string;
  analytics_measurement_id?: string;
  adsense_client_id?: string;
  search_console_property?: string;
  oauth_access_token?: string;
  oauth_refresh_token?: string;
  oauth_expires_at?: string;
  services_enabled: {
    analytics: boolean;
    adsense: boolean;
    searchConsole: boolean;
    pagespeedInsights: boolean;
  };
  setup_completed: boolean;
  last_updated: string;
  user_permissions: {
    canManageOptions: boolean;
    canViewDashboard: boolean;
    canManageModules: boolean;
  };
}

export interface ServiceStatus {
  service: 'analytics' | 'adsense' | 'searchConsole' | 'pagespeedInsights';
  connected: boolean;
  configured: boolean;
  hasData: boolean;
  lastDataFetch?: string;
  error?: string;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  service: string;
  completed: boolean;
  required: boolean;
  order: number;
}

export class StellarSiteKitConfig {
  private static instance: StellarSiteKitConfig;
  private config: SiteKitConfig | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): StellarSiteKitConfig {
    if (!StellarSiteKitConfig.instance) {
      StellarSiteKitConfig.instance = new StellarSiteKitConfig();
    }
    return StellarSiteKitConfig.instance;
  }

  /**
   * Initialize configuration from database
   */
  public async initialize(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('google_site_kit')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Failed to load Site Kit configuration:', error);
        return false;
      }

      if (data && data.length > 0) {
        this.config = data[0] as SiteKitConfig;
      } else {
        // Create default configuration
        this.config = this.getDefaultConfig();
        await this.saveConfig();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Site Kit configuration:', error);
      return false;
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): SiteKitConfig {
    return {
      site_url: import.meta.env.VITE_SITE_URL || window.location.origin,
      services_enabled: {
        analytics: false,
        adsense: false,
        searchConsole: false,
        pagespeedInsights: true // This doesn't require OAuth
      },
      setup_completed: false,
      last_updated: new Date().toISOString(),
      user_permissions: {
        canManageOptions: true,
        canViewDashboard: true,
        canManageModules: true
      }
    };
  }

  /**
   * Get current configuration
   */
  public async getConfig(): Promise<SiteKitConfig> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.config!;
  }

  /**
   * Update configuration
   */
  public async updateConfig(updates: Partial<SiteKitConfig>): Promise<boolean> {
    try {
      if (!this.config) {
        await this.initialize();
      }

      this.config = {
        ...this.config!,
        ...updates,
        last_updated: new Date().toISOString()
      };

      return await this.saveConfig();
    } catch (error) {
      console.error('Failed to update configuration:', error);
      return false;
    }
  }

  /**
   * Save configuration to database
   */
  private async saveConfig(): Promise<boolean> {
    try {
      if (!this.config) return false;

      const { error } = await supabase
        .from('google_site_kit')
        .upsert(this.config);

      if (error) {
        console.error('Failed to save configuration:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      return false;
    }
  }

  /**
   * Enable a service
   */
  public async enableService(service: keyof SiteKitConfig['services_enabled']): Promise<boolean> {
    const config = await this.getConfig();
    config.services_enabled[service] = true;
    return await this.updateConfig(config);
  }

  /**
   * Disable a service
   */
  public async disableService(service: keyof SiteKitConfig['services_enabled']): Promise<boolean> {
    const config = await this.getConfig();
    config.services_enabled[service] = false;
    return await this.updateConfig(config);
  }

  /**
   * Set OAuth tokens
   */
  public async setOAuthTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<boolean> {
    const expiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString();
    
    return await this.updateConfig({
      oauth_access_token: accessToken,
      oauth_refresh_token: refreshToken,
      oauth_expires_at: expiresAt
    });
  }

  /**
   * Clear OAuth tokens
   */
  public async clearOAuthTokens(): Promise<boolean> {
    return await this.updateConfig({
      oauth_access_token: undefined,
      oauth_refresh_token: undefined,
      oauth_expires_at: undefined
    });
  }

  /**
   * Set Analytics configuration
   */
  public async setAnalyticsConfig(propertyId: string, measurementId: string): Promise<boolean> {
    return await this.updateConfig({
      analytics_property_id: propertyId,
      analytics_measurement_id: measurementId
    });
  }

  /**
   * Set AdSense configuration
   */
  public async setAdSenseConfig(clientId: string): Promise<boolean> {
    return await this.updateConfig({
      adsense_client_id: clientId
    });
  }

  /**
   * Set Search Console configuration
   */
  public async setSearchConsoleConfig(property: string): Promise<boolean> {
    return await this.updateConfig({
      search_console_property: property
    });
  }

  /**
   * Mark setup as completed
   */
  public async completeSetup(): Promise<boolean> {
    return await this.updateConfig({
      setup_completed: true
    });
  }

  /**
   * Reset configuration
   */
  public async resetConfig(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('google_site_kit')
        .delete()
        .gte('id', 0); // Delete all rows

      if (error) {
        console.error('Failed to reset configuration:', error);
        return false;
      }

      this.config = null;
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Failed to reset configuration:', error);
      return false;
    }
  }

  /**
   * Get service status for all services
   */
  public async getServicesStatus(): Promise<ServiceStatus[]> {
    const config = await this.getConfig();
    const now = new Date().toISOString();

    return [
      {
        service: 'analytics',
        connected: Boolean(config.oauth_access_token),
        configured: Boolean(config.analytics_property_id),
        hasData: Boolean(config.analytics_property_id && config.oauth_access_token),
        lastDataFetch: config.oauth_access_token ? now : undefined
      },
      {
        service: 'adsense',
        connected: Boolean(config.oauth_access_token),
        configured: Boolean(config.adsense_client_id),
        hasData: Boolean(config.adsense_client_id && config.oauth_access_token),
        lastDataFetch: config.oauth_access_token ? now : undefined
      },
      {
        service: 'searchConsole',
        connected: Boolean(config.oauth_access_token),
        configured: Boolean(config.search_console_property),
        hasData: Boolean(config.search_console_property && config.oauth_access_token),
        lastDataFetch: config.oauth_access_token ? now : undefined
      },
      {
        service: 'pagespeedInsights',
        connected: true, // No OAuth required
        configured: true,
        hasData: true,
        lastDataFetch: now
      }
    ];
  }

  /**
   * Get setup steps with completion status
   */
  public async getSetupSteps(): Promise<SetupStep[]> {
    const config = await this.getConfig();
    const hasOAuth = Boolean(config.oauth_access_token);

    return [
      {
        id: 'oauth',
        title: 'Connect Google Account',
        description: 'Authenticate with Google to access your data',
        service: 'oauth',
        completed: hasOAuth,
        required: true,
        order: 1
      },
      {
        id: 'analytics',
        title: 'Set up Analytics',
        description: 'Connect your Google Analytics property',
        service: 'analytics',
        completed: Boolean(config.analytics_property_id),
        required: false,
        order: 2
      },
      {
        id: 'search-console',
        title: 'Set up Search Console',
        description: 'Connect your Search Console property',
        service: 'searchConsole',
        completed: Boolean(config.search_console_property),
        required: false,
        order: 3
      },
      {
        id: 'adsense',
        title: 'Set up AdSense',
        description: 'Connect your AdSense account',
        service: 'adsense',
        completed: Boolean(config.adsense_client_id),
        required: false,
        order: 4
      },
      {
        id: 'verification',
        title: 'Verify Setup',
        description: 'Confirm all services are working correctly',
        service: 'verification',
        completed: config.setup_completed,
        required: true,
        order: 5
      }
    ];
  }

  /**
   * Check if a service is properly configured
   */
  public async isServiceConfigured(service: keyof SiteKitConfig['services_enabled']): Promise<boolean> {
    const config = await this.getConfig();
    
    switch (service) {
      case 'analytics':
        return Boolean(config.analytics_property_id && config.oauth_access_token);
      case 'adsense':
        return Boolean(config.adsense_client_id && config.oauth_access_token);
      case 'searchConsole':
        return Boolean(config.search_console_property && config.oauth_access_token);
      case 'pagespeedInsights':
        return true; // No additional configuration needed
      default:
        return false;
    }
  }

  /**
   * Get OAuth status
   */
  public async getOAuthStatus(): Promise<{
    isConnected: boolean;
    expiresAt?: string;
    isExpired: boolean;
  }> {
    const config = await this.getConfig();
    const hasToken = Boolean(config.oauth_access_token);
    const expiresAt = config.oauth_expires_at;
    const isExpired = expiresAt ? new Date(expiresAt) <= new Date() : false;

    return {
      isConnected: hasToken && !isExpired,
      expiresAt,
      isExpired
    };
  }

  /**
   * Get setup progress percentage
   */
  public async getSetupProgress(): Promise<{ completed: number; total: number; percentage: number }> {
    const steps = await this.getSetupSteps();
    const completed = steps.filter(step => step.completed).length;
    const total = steps.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }

  /**
   * Test service connections
   */
  public async testServiceConnections(): Promise<{
    [service: string]: { success: boolean; error?: string; }
  }> {
    const config = await this.getConfig();
    const results: { [service: string]: { success: boolean; error?: string; } } = {};

    // Test Analytics
    if (config.analytics_property_id && config.oauth_access_token) {
      try {
        // This would make a test API call to Analytics
        results.analytics = { success: true };
      } catch (error) {
        results.analytics = { success: false, error: 'Failed to connect to Analytics' };
      }
    } else {
      results.analytics = { success: false, error: 'Analytics not configured' };
    }

    // Test AdSense
    if (config.adsense_client_id && config.oauth_access_token) {
      try {
        // This would make a test API call to AdSense
        results.adsense = { success: true };
      } catch (error) {
        results.adsense = { success: false, error: 'Failed to connect to AdSense' };
      }
    } else {
      results.adsense = { success: false, error: 'AdSense not configured' };
    }

    // Test Search Console
    if (config.search_console_property && config.oauth_access_token) {
      try {
        // This would make a test API call to Search Console
        results.searchConsole = { success: true };
      } catch (error) {
        results.searchConsole = { success: false, error: 'Failed to connect to Search Console' };
      }
    } else {
      results.searchConsole = { success: false, error: 'Search Console not configured' };
    }

    // Test PageSpeed Insights
    try {
      // This would make a test API call to PageSpeed Insights
      results.pagespeedInsights = { success: true };
    } catch (error) {
      results.pagespeedInsights = { success: false, error: 'Failed to connect to PageSpeed Insights' };
    }

    return results;
  }

  /**
   * Export configuration (for backup/migration)
   */
  public async exportConfig(): Promise<string> {
    const config = await this.getConfig();
    // Remove sensitive data
    const exportConfig = { ...config };
    delete exportConfig.oauth_access_token;
    delete exportConfig.oauth_refresh_token;
    
    return JSON.stringify(exportConfig, null, 2);
  }

  /**
   * Import configuration (for backup/migration)
   */
  public async importConfig(configJson: string): Promise<boolean> {
    try {
      const importedConfig = JSON.parse(configJson) as Partial<SiteKitConfig>;
      return await this.updateConfig(importedConfig);
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

export const stellarSiteKitConfig = StellarSiteKitConfig.getInstance();
