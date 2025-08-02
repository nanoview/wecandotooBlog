#!/usr/bin/env node

/**
 * Google Site Kit Database Setup Script
 * 
 * This script helps you set up the required Google Site Kit configuration
 * data in your Supabase database.
 * 
 * Usage:
 *   node setup-google-site-kit.js
 *   npm run setup:google-site-kit
 */

import { GoogleSiteKitService } from './src/services/googleSiteKitService.js';

// Configuration data - UPDATE THESE VALUES WITH YOUR ACTUAL DATA
const GOOGLE_SITE_KIT_CONFIG = {
  // Required OAuth Configuration
  oauth_client_id: '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',
  oauth_client_secret: 'YOUR_ACTUAL_CLIENT_SECRET', // Get from Google Cloud Console
  oauth_redirect_uri: 'http://localhost:8082/oauth/callback',
  
  // Google AdSense Configuration (if using AdSense)
  adsense_publisher_id: 'ca-pub-2959602333047653',
  adsense_customer_id: '9592425312',
  
  // Google Analytics Configuration (if using Analytics)
  analytics_property_id: 'G-XXXXXXXXXX', // Replace with your actual GA4 property ID
  analytics_measurement_id: 'G-XXXXXXXXXX', // Replace with your actual measurement ID
  
  // Google Search Console Configuration (if using Search Console)
  search_console_site_url: 'https://your-domain.com', // Replace with your actual domain
  
  // Site Verification
  site_verification_code: 'your_verification_code', // Get from Google Search Console
  site_verification_method: 'meta_tag',
  
  // Feature Flags - Enable/disable services as needed
  enable_adsense: true,
  enable_analytics: true,
  enable_search_console: true,
  enable_auto_ads: false,
  
  // OAuth Scopes (required for API access)
  oauth_scopes: [
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'openid',
    'email',
    'profile'
  ],
  
  // Enabled APIs
  enabled_apis: ['adsense', 'analytics', 'search_console']
};

async function setupGoogleSiteKit() {
  console.log('🚀 Setting up Google Site Kit configuration...');
  
  try {
    // Step 1: Validate configuration
    console.log('📋 Validating configuration...');
    const validationErrors = validateConfiguration(GOOGLE_SITE_KIT_CONFIG);
    
    if (validationErrors.length > 0) {
      console.error('❌ Configuration validation failed:');
      validationErrors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    
    console.log('✅ Configuration validation passed');
    
    // Step 2: Check if configuration already exists
    console.log('🔍 Checking existing configuration...');
    const existingConfig = await GoogleSiteKitService.getConfig();
    
    if (existingConfig) {
      console.log('📝 Existing configuration found, updating...');
    } else {
      console.log('🆕 No existing configuration found, creating new...');
    }
    
    // Step 3: Save configuration to database
    console.log('💾 Saving configuration to database...');
    const savedConfig = await GoogleSiteKitService.saveRequiredData(GOOGLE_SITE_KIT_CONFIG);
    
    console.log('✅ Configuration saved successfully!');
    console.log('📊 Configuration details:');
    console.log(`  - ID: ${savedConfig.id}`);
    console.log(`  - OAuth Client ID: ${savedConfig.oauth_client_id}`);
    console.log(`  - AdSense Enabled: ${savedConfig.enable_adsense}`);
    console.log(`  - Analytics Enabled: ${savedConfig.enable_analytics}`);
    console.log(`  - Search Console Enabled: ${savedConfig.enable_search_console}`);
    console.log(`  - Connection Status: ${savedConfig.connection_status}`);
    console.log(`  - Created: ${savedConfig.created_at}`);
    console.log(`  - Updated: ${savedConfig.updated_at}`);
    
    // Step 4: Set initial connection status
    console.log('🔗 Setting initial connection status...');
    await GoogleSiteKitService.updateConnectionStatus('disconnected');
    
    console.log('🎉 Google Site Kit setup completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. Update oauth_client_secret with your actual Google Cloud Console secret');
    console.log('  2. Update analytics_property_id with your actual GA4 property ID');
    console.log('  3. Update search_console_site_url with your actual domain');
    console.log('  4. Update site_verification_code with your actual verification code');
    console.log('  5. Configure OAuth consent screen in Google Cloud Console');
    console.log('  6. Test the OAuth connection using your application');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

function validateConfiguration(config) {
  const errors = [];
  
  // Required OAuth fields
  if (!config.oauth_client_id) {
    errors.push('oauth_client_id is required');
  }
  
  if (!config.oauth_redirect_uri) {
    errors.push('oauth_redirect_uri is required');
  }
  
  if (config.oauth_client_secret === 'YOUR_ACTUAL_CLIENT_SECRET') {
    errors.push('oauth_client_secret must be updated with your actual Google Cloud Console secret');
  }
  
  // Service-specific validation
  if (config.enable_adsense) {
    if (!config.adsense_publisher_id) {
      errors.push('adsense_publisher_id is required when AdSense is enabled');
    }
    
    if (!config.adsense_publisher_id.startsWith('ca-pub-')) {
      errors.push('adsense_publisher_id must start with "ca-pub-"');
    }
  }
  
  if (config.enable_analytics) {
    if (!config.analytics_property_id) {
      errors.push('analytics_property_id is required when Analytics is enabled');
    }
    
    if (config.analytics_property_id === 'G-XXXXXXXXXX') {
      errors.push('analytics_property_id must be updated with your actual GA4 property ID');
    }
  }
  
  if (config.enable_search_console) {
    if (!config.search_console_site_url) {
      errors.push('search_console_site_url is required when Search Console is enabled');
    }
    
    if (config.search_console_site_url === 'https://your-domain.com') {
      errors.push('search_console_site_url must be updated with your actual domain');
    }
  }
  
  // Validate URLs
  if (config.oauth_redirect_uri && !isValidUrl(config.oauth_redirect_uri)) {
    errors.push('oauth_redirect_uri must be a valid URL');
  }
  
  if (config.search_console_site_url && !isValidUrl(config.search_console_site_url)) {
    errors.push('search_console_site_url must be a valid URL');
  }
  
  return errors;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupGoogleSiteKit();
}

export { setupGoogleSiteKit, validateConfiguration };
