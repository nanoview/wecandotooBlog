#!/usr/bin/env node

/**
 * Direct Google Site Kit Database Population Script
 * 
 * This script directly inserts your Google Cloud Console configuration
 * into the Supabase google_site_kit table without requiring admin login.
 * 
 * Usage: node populate-google-site-kit.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Your Google Cloud Console configuration data from .env
const GOOGLE_SITE_KIT_DATA = {
  // OAuth Configuration from your .env
  oauth_client_id: process.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
  oauth_client_secret: process.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET,
  oauth_redirect_uri: process.env.VITE_GOOGLE_OAUTH_REDIRECT_URI,
  
  // Google AdSense Configuration from your .env
  adsense_publisher_id: process.env.VITE_GOOGLE_ADSENSE_CLIENT_ID,
  adsense_customer_id: process.env.VITE_GOOGLE_ADSENSE_CUSTOMER_ID,
  
  // Google Analytics Configuration from your .env
  analytics_property_id: process.env.VITE_GOOGLE_ANALYTICS_ID,
  analytics_measurement_id: process.env.VITE_GOOGLE_ANALYTICS_ID, // Same as property ID for GA4
  
  // Site Verification from your .env
  site_verification_code: process.env.VITE_GOOGLE_SITE_VERIFICATION,
  site_verification_method: 'meta_tag',
  
  // Search Console Configuration (assuming your domain)
  search_console_site_url: 'https://stellar-content-stream.com', // Update with your actual domain
  search_console_verified: false,
  
  // Feature Flags from your .env
  enable_adsense: process.env.VITE_ENABLE_GOOGLE_ADSENSE === 'true',
  enable_analytics: process.env.VITE_ENABLE_GOOGLE_ANALYTICS === 'true',
  enable_search_console: true,
  enable_auto_ads: false,
  
  // OAuth Scopes required for Google Site Kit
  oauth_scopes: [
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'openid',
    'email',
    'profile'
  ],
  
  // Enabled APIs
  enabled_apis: ['adsense', 'analytics', 'search_console'],
  
  // Connection Status
  is_connected: false,
  connection_status: 'disconnected',
  error_message: null,
  last_sync_at: null
};

async function populateGoogleSiteKitData() {
  console.log('🚀 Populating Google Site Kit database with your configuration...');
  
  try {
    // Step 1: Validate configuration data
    console.log('📋 Validating configuration data...');
    validateConfiguration(GOOGLE_SITE_KIT_DATA);
    console.log('✅ Configuration validation passed');
    
    // Step 2: Check if configuration already exists
    console.log('🔍 Checking for existing configuration...');
    const { data: existingConfig, error: fetchError } = await supabase
      .from('google_site_kit')
      .select('*')
      .limit(1)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error checking existing configuration: ${fetchError.message}`);
    }
    
    if (existingConfig) {
      console.log('📝 Existing configuration found, updating...');
      
      // Update existing configuration
      const { data: updatedData, error: updateError } = await supabase
        .from('google_site_kit')
        .update({
          ...GOOGLE_SITE_KIT_DATA,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id)
        .select()
        .single();
      
      if (updateError) {
        throw new Error(`Error updating configuration: ${updateError.message}`);
      }
      
      console.log('✅ Configuration updated successfully!');
      displayConfigurationSummary(updatedData);
      
    } else {
      console.log('🆕 No existing configuration found, creating new...');
      
      // Insert new configuration
      const { data: insertedData, error: insertError } = await supabase
        .from('google_site_kit')
        .insert([GOOGLE_SITE_KIT_DATA])
        .select()
        .single();
      
      if (insertError) {
        throw new Error(`Error inserting configuration: ${insertError.message}`);
      }
      
      console.log('✅ Configuration inserted successfully!');
      displayConfigurationSummary(insertedData);
    }
    
    console.log('🎉 Google Site Kit database population completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. Your configuration is now stored in the database');
    console.log('  2. The OAuth credentials are ready for authentication');
    console.log('  3. AdSense and Analytics IDs are configured');
    console.log('  4. You can now use the GoogleSiteKitService in your application');
    console.log('  5. Test the configuration using: await GoogleSiteKitService.getConfig()');
    
  } catch (error) {
    console.error('❌ Population failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting tips:');
    console.error('  1. Make sure your Supabase database is running');
    console.error('  2. Verify the google_site_kit table exists (run migrations)');
    console.error('  3. Check your .env file has all required variables');
    console.error('  4. Ensure you have proper database permissions');
    process.exit(1);
  }
}

function validateConfiguration(config) {
  const errors = [];
  
  // Required OAuth fields
  if (!config.oauth_client_id) {
    errors.push('VITE_GOOGLE_OAUTH_CLIENT_ID is missing from .env');
  }
  
  if (!config.oauth_client_secret) {
    errors.push('VITE_GOOGLE_OAUTH_CLIENT_SECRET is missing from .env');
  }
  
  if (!config.oauth_redirect_uri) {
    errors.push('VITE_GOOGLE_OAUTH_REDIRECT_URI is missing from .env');
  }
  
  // AdSense validation
  if (config.enable_adsense) {
    if (!config.adsense_publisher_id) {
      errors.push('VITE_GOOGLE_ADSENSE_CLIENT_ID is missing from .env');
    } else if (!config.adsense_publisher_id.startsWith('ca-pub-')) {
      errors.push('VITE_GOOGLE_ADSENSE_CLIENT_ID must start with "ca-pub-"');
    }
  }
  
  // Analytics validation
  if (config.enable_analytics) {
    if (!config.analytics_property_id) {
      errors.push('VITE_GOOGLE_ANALYTICS_ID is missing from .env');
    }
  }
  
  // URL validation
  if (config.oauth_redirect_uri && !isValidUrl(config.oauth_redirect_uri)) {
    errors.push('VITE_GOOGLE_OAUTH_REDIRECT_URI must be a valid URL');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Configuration validation failed');
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function displayConfigurationSummary(config) {
  console.log('');
  console.log('📊 Configuration Summary:');
  console.log('═'.repeat(50));
  console.log(`🆔 ID: ${config.id}`);
  console.log(`🔑 OAuth Client ID: ${config.oauth_client_id}`);
  console.log(`🔗 Redirect URI: ${config.oauth_redirect_uri}`);
  console.log(`💰 AdSense Publisher: ${config.adsense_publisher_id || 'Not configured'}`);
  console.log(`📈 Analytics Property: ${config.analytics_property_id || 'Not configured'}`);
  console.log(`🔍 Search Console: ${config.search_console_site_url || 'Not configured'}`);
  console.log(`✅ AdSense Enabled: ${config.enable_adsense}`);
  console.log(`📊 Analytics Enabled: ${config.enable_analytics}`);
  console.log(`🔍 Search Console Enabled: ${config.enable_search_console}`);
  console.log(`🔌 Connection Status: ${config.connection_status}`);
  console.log(`📅 Created: ${config.created_at}`);
  console.log(`📅 Updated: ${config.updated_at}`);
  console.log('═'.repeat(50));
}

// Run the population if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('populate-google-site-kit.js')) {
  populateGoogleSiteKitData();
}

export { populateGoogleSiteKitData };
