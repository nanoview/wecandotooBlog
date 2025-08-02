// Google Services Configuration
// Replace these values with your actual Google service IDs

export const googleConfig = {
  // Google Analytics 4 Tracking ID
  // Get this from: https://analytics.google.com/
  // Format: G-XXXXXXXXXX
  analyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',

  // Google AdSense Client ID  
  // Get this from: https://www.google.com/adsense/
  // Format: ca-pub-XXXXXXXXXXXXXXXX
  adsenseClientId: import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || '',

  // Google AdSense Customer ID
  // Get this from your AdSense account settings
  adsenseCustomerId: import.meta.env.VITE_GOOGLE_ADSENSE_CUSTOMER_ID || '',

  // Google Site Verification Code
  // Get this from: https://search.google.com/search-console/
  siteVerification: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '',

  // AdSense Ad Slots
  // Get these from your AdSense dashboard after creating ad units
  adSlots: {
    // Banner ad (top of page)
    banner: import.meta.env.VITE_ADSENSE_BANNER_SLOT || '',
    
    // Sidebar ad
    sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT || '',
    
    // In-article ad
    inArticle: import.meta.env.VITE_ADSENSE_ARTICLE_SLOT || '',
    
    // Footer ad
    footer: import.meta.env.VITE_ADSENSE_FOOTER_SLOT || '',
  }
};

// Helper function to check if Google services are enabled
export const isGoogleServicesEnabled = () => {
  return {
    analytics: !!googleConfig.analyticsId && import.meta.env.VITE_ENABLE_GOOGLE_ANALYTICS === 'true',
    adsense: !!googleConfig.adsenseClientId && import.meta.env.VITE_ENABLE_GOOGLE_ADSENSE === 'true',
    siteVerification: !!googleConfig.siteVerification && import.meta.env.VITE_ENABLE_GOOGLE_SITE_VERIFICATION === 'true',
  };
};
