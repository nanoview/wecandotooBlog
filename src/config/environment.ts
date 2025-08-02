// Environment Configuration Checker
// This helps verify that all required environment variables are properly set

export const checkEnvironmentSetup = () => {
  const requiredVars = {
    // OAuth Configuration (Required for Google Site Kit)
    'VITE_GOOGLE_OAUTH_CLIENT_ID': import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
    'VITE_GOOGLE_OAUTH_CLIENT_SECRET': import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET,
    'VITE_GOOGLE_OAUTH_REDIRECT_URI': import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URI,
    
    // Supabase Configuration
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const optionalVars = {
    // Google Services (Optional - can be configured via OAuth)
    'VITE_GOOGLE_ANALYTICS_ID': import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    'VITE_GOOGLE_ADSENSE_CLIENT_ID': import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID,
    'VITE_GOOGLE_SITE_VERIFICATION': import.meta.env.VITE_GOOGLE_SITE_VERIFICATION,
  };

  const results = {
    oauth: {
      configured: false,
      missing: [] as string[],
      instructions: 'Follow GOOGLE_OAUTH_SETUP.md to get OAuth credentials from Google Cloud Console'
    },
    supabase: {
      configured: false,
      missing: [] as string[],
      instructions: 'Get these from your Supabase project dashboard'
    },
    googleServices: {
      configured: false,
      missing: [] as string[],
      instructions: 'These are optional - can be fetched via OAuth or configured manually'
    }
  };

  // Check required OAuth variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      if (key.includes('OAUTH')) {
        results.oauth.missing.push(key);
      } else if (key.includes('SUPABASE')) {
        results.supabase.missing.push(key);
      }
    }
  });

  // Check optional Google service variables
  Object.entries(optionalVars).forEach(([key, value]) => {
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      results.googleServices.missing.push(key);
    }
  });

  // Set configured status
  results.oauth.configured = results.oauth.missing.length === 0;
  results.supabase.configured = results.supabase.missing.length === 0;
  results.googleServices.configured = results.googleServices.missing.length === 0;

  return results;
};

// Console helper for debugging
export const logEnvironmentStatus = () => {
  const status = checkEnvironmentSetup();
  
  console.group('🔧 Environment Configuration Status');
  
  // OAuth Status
  console.group('🔐 Google OAuth (Required for Site Kit)');
  if (status.oauth.configured) {
    console.log('✅ OAuth is properly configured');
  } else {
    console.log('❌ OAuth configuration missing:', status.oauth.missing);
    console.log('📖 Instructions:', status.oauth.instructions);
  }
  console.groupEnd();
  
  // Supabase Status
  console.group('🗄️ Supabase Configuration');
  if (status.supabase.configured) {
    console.log('✅ Supabase is properly configured');
  } else {
    console.log('❌ Supabase configuration missing:', status.supabase.missing);
    console.log('📖 Instructions:', status.supabase.instructions);
  }
  console.groupEnd();
  
  // Google Services Status
  console.group('📊 Google Services (Optional)');
  if (status.googleServices.configured) {
    console.log('✅ All Google services configured');
  } else {
    console.log('⚠️ Some Google services not configured:', status.googleServices.missing);
    console.log('📖 Instructions:', status.googleServices.instructions);
  }
  console.groupEnd();
  
  console.groupEnd();
  
  return status;
};

// Export environment status for use in components
export const getOAuthStatus = () => {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URI;
  
  return {
    isConfigured: !!(clientId && clientSecret && redirectUri && 
                    !clientId.includes('your_') && 
                    !clientSecret.includes('your_') && 
                    !redirectUri.includes('localhost') === false), // Allow localhost for dev
    clientId,
    redirectUri,
    hasClientSecret: !!clientSecret,
    setupInstructions: 'See GOOGLE_OAUTH_SETUP.md for detailed setup instructions'
  };
};
