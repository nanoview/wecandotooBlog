/**
 * Simple Google Site Kit Database Population
 * This script uses your existing Supabase client to populate the database
 */

import { supabase } from './src/integrations/supabase/client.js';

// Your Google Cloud Console data from .env
const GOOGLE_SITE_KIT_DATA = {
  // OAuth Configuration
  oauth_client_id: '622861962504-fokjrr569rbutuf3d894r5ldtvjestk9.apps.googleusercontent.com',
  oauth_client_secret: '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',
  oauth_redirect_uri: 'http://localhost:8080/oauth/callback',
  
  // Google AdSense Configuration  
  adsense_publisher_id: 'ca-pub-2959602333047653',
  adsense_customer_id: '9592425312',
  
  // Google Analytics Configuration (update with your actual IDs)
  analytics_property_id: 'G-XXXXXXXXXX', // Update with your actual GA4 property ID
  analytics_measurement_id: 'G-XXXXXXXXXX', // Update with your actual measurement ID
  
  // Site Verification (update with your actual verification code)
  site_verification_code: 'your_verification_code', // Update with your actual code
  site_verification_method: 'meta_tag',
  
  // Search Console Configuration (update with your domain)
  search_console_site_url: 'https://stellar-content-stream.com', // Update with your actual domain
  search_console_verified: false,
  
  // Feature Flags
  enable_adsense: true,
  enable_analytics: true,
  enable_search_console: true,
  enable_auto_ads: false,
  
  // OAuth Scopes
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

async function populateDatabase() {
  console.log('🚀 Populating Google Site Kit configuration...');
  
  try {
    // Check if configuration exists
    const { data: existingConfig, error: fetchError } = await supabase
      .from('google_site_kit')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('Error checking existing config:', fetchError);
      return;
    }
    
    if (existingConfig && existingConfig.length > 0) {
      console.log('📝 Updating existing configuration...');
      
      const { data, error } = await supabase
        .from('google_site_kit')
        .update(GOOGLE_SITE_KIT_DATA)
        .eq('id', existingConfig[0].id)
        .select();
      
      if (error) {
        console.error('Error updating:', error);
        return;
      }
      
      console.log('✅ Configuration updated successfully!');
      console.log('Updated data:', data[0]);
      
    } else {
      console.log('🆕 Creating new configuration...');
      
      const { data, error } = await supabase
        .from('google_site_kit')
        .insert([GOOGLE_SITE_KIT_DATA])
        .select();
      
      if (error) {
        console.error('Error inserting:', error);
        return;
      }
      
      console.log('✅ Configuration created successfully!');
      console.log('Inserted data:', data[0]);
    }
    
    console.log('');
    console.log('🎉 Database population completed!');
    console.log('📋 Configuration Summary:');
    console.log(`  - OAuth Client ID: ${GOOGLE_SITE_KIT_DATA.oauth_client_id}`);
    console.log(`  - AdSense Publisher: ${GOOGLE_SITE_KIT_DATA.adsense_publisher_id}`);
    console.log(`  - Analytics Property: ${GOOGLE_SITE_KIT_DATA.analytics_property_id}`);
    console.log(`  - Redirect URI: ${GOOGLE_SITE_KIT_DATA.oauth_redirect_uri}`);
    console.log(`  - AdSense Enabled: ${GOOGLE_SITE_KIT_DATA.enable_adsense}`);
    console.log(`  - Analytics Enabled: ${GOOGLE_SITE_KIT_DATA.enable_analytics}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the population
populateDatabase();
