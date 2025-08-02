import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  trackingId: string;
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ trackingId }) => {
  let location;
  
  try {
    location = useLocation();
  } catch (error) {
    // Fallback if useLocation is not available (outside Router context)
    location = { pathname: window.location.pathname };
  }

  useEffect(() => {
    // Don't load if tracking ID is not valid
    if (!trackingId || trackingId === 'G-XXXXXXXXXX') {
      return;
    }

    // Check if already loaded
    if (document.querySelector(`script[src*="${trackingId}"]`)) {
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);

    return () => {
      // Only remove if they exist
      if (script1.parentNode) {
        document.head.removeChild(script1);
      }
      if (script2.parentNode) {
        document.head.removeChild(script2);
      }
    };
  }, [trackingId]);

  // Track page views on route changes
  useEffect(() => {
    if (window.gtag && trackingId && trackingId !== 'G-XXXXXXXXXX') {
      window.gtag('config', trackingId, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }
  }, [location, trackingId]);

  return null;
};

export default GoogleAnalytics;
