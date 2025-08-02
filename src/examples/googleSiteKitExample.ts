/**
 * Example usage of GoogleSiteKitService to save required data to database
 * This demonstrates how to configure and save Google Site Kit data
 */

import { GoogleSiteKitService } from '../services/googleSiteKitService';

// Example 1: Save minimal required configuration for OAuth setup
export async function saveMinimalConfig() {
  try {
    const requiredData = {
      // Required for OAuth authentication
      oauth_client_id: '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',
      oauth_client_secret: 'your_oauth_client_secret', // Get from Google Cloud Console
      oauth_redirect_uri: 'http://localhost:8082/oauth/callback',
      
      // OAuth scopes needed for Site Kit
      oauth_scopes: [
        'https://www.googleapis.com/auth/adsense.readonly',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly',
        'openid',
        'email',
        'profile'
      ]
    };

    const config = await GoogleSiteKitService.saveRequiredData(requiredData);
    console.log('Minimal configuration saved:', config);
    return config;
  } catch (error) {
    console.error('Error saving minimal config:', error);
    throw error;
  }
}

// Example 2: Save complete configuration for all Google services
export async function saveCompleteConfig() {
  try {
    const completeData = {
      // OAuth Configuration (Required)
      oauth_client_id: '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',
      oauth_client_secret: 'GOCSPX-your_actual_client_secret',
      oauth_redirect_uri: 'http://localhost:8082/oauth/callback',
      
      // Google AdSense Configuration
      adsense_publisher_id: 'ca-pub-2959602333047653',
      adsense_customer_id: '9592425312',
      
      // Google Analytics Configuration
      analytics_property_id: 'G-1234567890',
      analytics_measurement_id: 'G-1234567890',
      
      // Google Search Console Configuration
      search_console_site_url: 'https://your-domain.com',
      
      // Site Verification
      site_verification_code: 'your_meta_verification_code',
      site_verification_method: 'meta_tag',
      
      // Feature Flags (Control which services to enable)
      enable_adsense: true,
      enable_analytics: true,
      enable_search_console: true,
      enable_auto_ads: false,
      
      // API Configuration
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

    const config = await GoogleSiteKitService.saveRequiredData(completeData);
    console.log('Complete configuration saved:', config);
    return config;
  } catch (error) {
    console.error('Error saving complete config:', error);
    throw error;
  }
}

// Example 3: Initialize and save OAuth tokens after authentication
export async function saveOAuthTokens(authResponse: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  try {
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (authResponse.expires_in * 1000)).toISOString();
    
    // Store tokens
    const success = await GoogleSiteKitService.storeOAuthTokens({
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
      expires_at: expiresAt
    });

    if (success) {
      console.log('OAuth tokens saved successfully');
      
      // Update connection status
      await GoogleSiteKitService.updateConnectionStatus('connected');
      
      return true;
    } else {
      throw new Error('Failed to save OAuth tokens');
    }
  } catch (error) {
    console.error('Error saving OAuth tokens:', error);
    await GoogleSiteKitService.updateConnectionStatus('error', error.message);
    throw error;
  }
}

// Example 4: Check and ensure configuration exists
export async function ensureConfigurationExists() {
  try {
    // This will create default configuration if none exists
    const config = await GoogleSiteKitService.ensureConfigExists();
    console.log('Configuration ensured:', config);
    return config;
  } catch (error) {
    console.error('Error ensuring configuration:', error);
    throw error;
  }
}

// Example 5: Update specific configuration fields
export async function updateSpecificFields() {
  try {
    // Update only specific fields
    const updatedConfig = await GoogleSiteKitService.saveConfig({
      analytics_property_id: 'G-NEW-PROPERTY-ID',
      adsense_publisher_id: 'ca-pub-NEW-PUBLISHER-ID',
      enable_auto_ads: true
    });

    console.log('Specific fields updated:', updatedConfig);
    return updatedConfig;
  } catch (error) {
    console.error('Error updating specific fields:', error);
    throw error;
  }
}

// Example 6: Complete setup workflow
export async function completeSetupWorkflow() {
  try {
    console.log('Starting Google Site Kit setup workflow...');
    
    // Step 1: Ensure configuration exists
    await ensureConfigurationExists();
    
    // Step 2: Save required OAuth configuration
    const config = await saveCompleteConfig();
    
    // Step 3: Update connection status
    await GoogleSiteKitService.updateConnectionStatus('disconnected');
    
    console.log('Setup workflow completed successfully');
    return config;
  } catch (error) {
    console.error('Error in setup workflow:', error);
    await GoogleSiteKitService.updateConnectionStatus('error', error.message);
    throw error;
  }
}

// Helper function to validate required data before saving
export function validateRequiredData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.oauth_client_id) {
    errors.push('OAuth Client ID is required');
  }
  
  if (!data.oauth_redirect_uri) {
    errors.push('OAuth Redirect URI is required');
  }
  
  if (data.enable_adsense && !data.adsense_publisher_id) {
    errors.push('AdSense Publisher ID is required when AdSense is enabled');
  }
  
  if (data.enable_analytics && !data.analytics_property_id) {
    errors.push('Analytics Property ID is required when Analytics is enabled');
  }
  
  if (data.enable_search_console && !data.search_console_site_url) {
    errors.push('Search Console Site URL is required when Search Console is enabled');
  }
  
  return errors;
}

// Export all functions for easy use
export default {
  saveMinimalConfig,
  saveCompleteConfig,
  saveOAuthTokens,
  ensureConfigurationExists,
  updateSpecificFields,
  completeSetupWorkflow,
  validateRequiredData
};
