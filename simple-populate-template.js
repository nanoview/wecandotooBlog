// ⚠️ SECURITY WARNING: This is a TEMPLATE file with PLACEHOLDER values
// DO NOT commit actual OAuth secrets to git!

// Simple Google Site Kit Data Population Script
// Replace placeholder values with your actual credentials

const { createClient } = require('@supabase/supabase-js');

// ⚠️ Use environment variables in production - these are PLACEHOLDERS only
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

const supabase = createClient(supabaseUrl, supabaseKey);

const googleSiteKitData = {
  id: 'default',
  
  // ⚠️ PLACEHOLDER OAuth Configuration - REPLACE WITH YOUR VALUES
  oauth_client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  oauth_client_secret: 'GOCSPX-YOUR_CLIENT_SECRET_HERE',  // ⚠️ NEVER commit real secrets!
  oauth_redirect_uri: 'https://yourdomain.com/oauth/callback',
  
  // ⚠️ PLACEHOLDER Google AdSense Configuration
  adsense_publisher_id: 'ca-pub-YOUR_PUBLISHER_ID',
  adsense_customer_id: 'YOUR_CUSTOMER_ID',
  adsense_account_id: 'YOUR_ACCOUNT_ID',
  
  // ⚠️ PLACEHOLDER Google Analytics Configuration  
  analytics_property_id: 'G-YOUR_PROPERTY_ID',
  analytics_measurement_id: 'G-YOUR_MEASUREMENT_ID',
  
  // ⚠️ PLACEHOLDER Search Console Configuration
  search_console_site_url: 'https://yourdomain.com',
  search_console_verified: false,
  
  // ⚠️ PLACEHOLDER Site Verification
  site_verification_code: 'YOUR_VERIFICATION_CODE',
  site_verification_method: 'META',
  
  // API Configuration
  enabled_apis: ['adsense', 'analytics', 'webmasters', 'searchconsole'],
  oauth_scopes: [
    'https://www.googleapis.com/auth/adsense.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly'
  ],
  
  // Feature Flags
  enable_adsense: true,
  enable_analytics: true,
  enable_search_console: true,
  enable_auto_ads: true,
  
  // Connection Status
  is_connected: false,
  connection_status: 'not_configured',
  error_message: 'Please configure OAuth credentials',
  configured_by: 'system'
};

async function populateGoogleSiteKit() {
  try {
    console.log('🔒 SECURITY REMINDER: Replace placeholder values with your actual credentials!');
    console.log('📝 Inserting Google Site Kit configuration...');
    
    const { data, error } = await supabase
      .from('google_site_kit')
      .upsert(googleSiteKitData, { onConflict: 'id' });

    if (error) {
      console.error('❌ Error inserting data:', error);
      return;
    }

    console.log('✅ Google Site Kit configuration inserted successfully!');
    console.log('⚠️  REMEMBER: Update the OAuth credentials with your actual values');
    console.log('🔐 NEVER commit real secrets to git - use environment variables!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 🔒 SECURITY CHECKLIST:
// [ ] Replace placeholder OAuth client ID with your actual value
// [ ] Replace placeholder OAuth client secret with your actual value  
// [ ] Set up environment variables for production
// [ ] Never commit real secrets to version control
// [ ] Use Supabase dashboard for secure credential storage

if (require.main === module) {
  populateGoogleSiteKit();
}

module.exports = { populateGoogleSiteKit, googleSiteKitData };
