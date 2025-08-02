import { useEffect } from 'react';

const GoogleAutoAds: React.FC = () => {
  // Your AdSense Publisher ID
  const ADSENSE_CLIENT_ID = 'ca-pub-2959602333047653';

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if AdSense script is already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    
    if (!existingScript) {
      // Create and load AdSense script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      script.crossOrigin = 'anonymous';
      
      // Add data-ad-client for auto ads
      script.setAttribute('data-ad-client', ADSENSE_CLIENT_ID);
      script.setAttribute('data-adbreak-test', 'on'); // Remove this line in production
      
      document.head.appendChild(script);
      
      console.log('✅ Google Auto Ads loaded - ads will appear automatically');
    }

    // Initialize adsbygoogle array for manual ads if needed
    window.adsbygoogle = window.adsbygoogle || [];

  }, []);

  // This component doesn't render anything visible - it just loads the auto ads script
  return null;
};

export default GoogleAutoAds;
