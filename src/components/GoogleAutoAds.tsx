import { useEffect, useState } from 'react';

const GoogleAutoAds: React.FC = () => {
  // Your AdSense Publisher ID
  const ADSENSE_CLIENT_ID = 'ca-pub-2959602333047653';
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);

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
      
      // Handle script load success
      script.onload = () => {
        console.log('✅ Google Auto Ads loaded successfully');
        setAdBlockerDetected(false);
      };
      
      // Handle script load error (likely ad blocker)
      script.onerror = () => {
        console.log('⚠️ Google Ads blocked (likely by ad blocker) - this is normal');
        setAdBlockerDetected(true);
      };
      
      document.head.appendChild(script);
    }

    // Additional ad blocker detection
    setTimeout(() => {
      // Check if adsbygoogle is available
      if (typeof window.adsbygoogle === 'undefined') {
        console.log('⚠️ AdSense not available - ads may be blocked');
        setAdBlockerDetected(true);
      }
    }, 2000);

    // Initialize adsbygoogle array for manual ads if needed
    window.adsbygoogle = window.adsbygoogle || [];

  }, []);

  // This component doesn't render anything visible - it just loads the auto ads script
  return null;
};

export default GoogleAutoAds;
