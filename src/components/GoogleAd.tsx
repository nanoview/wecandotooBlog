import { useEffect, useState, useRef } from 'react';

// Declare adsbygoogle on window
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  slot?: string;
  layout?: 'banner' | 'rectangle' | 'responsive';
  className?: string;
}

const GoogleAd = ({ slot = 'default', layout = 'responsive', className = '' }: GoogleAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adFailed, setAdFailed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Use a ref to track initialization
  const initializedRef = useRef(false);

  // Add global error handler for AdSense errors
  useEffect(() => {
    const handleAdError = (error: any) => {
      console.error('GoogleAd: Global AdSense error caught:', error);
      if (error.message && error.message.includes('availableWidth=0')) {
        console.warn('GoogleAd: Width issue detected, marking ad as failed');
        setAdFailed(true);
      }
    };

    // Listen for uncaught errors that might be AdSense related
    window.addEventListener('error', handleAdError);
    
    return () => {
      window.removeEventListener('error', handleAdError);
    };
  }, []);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const loadAd = () => {
      try {
        if (adRef.current && window.adsbygoogle) {
          // Check if container has width before proceeding
          const containerWidth = adRef.current.offsetWidth;
          if (containerWidth === 0) {
            console.warn('GoogleAd: Container width is 0, delaying ad load');
            // Retry after a short delay to allow layout to settle
            setTimeout(() => {
              initializedRef.current = false; // Reset to allow retry
              loadAd();
            }, 500);
            return;
          }
          
          // Clear any existing content
          adRef.current.innerHTML = '';
          
          // Create new ins element
          const adElement = document.createElement('ins');
          adElement.className = 'adsbygoogle';
          adElement.style.display = 'block';
          adElement.setAttribute('data-ad-client', 'ca-pub-2959602333047653');
          adElement.setAttribute('data-ad-slot', slot);
          
          if (layout === 'banner') {
            adElement.style.width = '728px';
            adElement.style.height = '90px';
          } else if (layout === 'rectangle') {
            adElement.style.width = '300px';
            adElement.style.height = '250px';
          } else {
            adElement.setAttribute('data-ad-format', 'auto');
            adElement.setAttribute('data-full-width-responsive', 'true');
            // Ensure minimum dimensions for responsive ads
            adElement.style.minWidth = '300px';
            adElement.style.minHeight = '250px';
          }
          
          // Append the ad element to our ref
          adRef.current.appendChild(adElement);
          
          // Push the ad to adsbygoogle for display with error handling
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            console.log('GoogleAd: Ad pushed successfully for slot:', slot);
          } catch (adError) {
            console.error('GoogleAd: Error pushing ad to adsbygoogle:', adError);
            setAdFailed(true);
            return;
          }
          
          // Mark as loaded after a delay
          setTimeout(() => setAdLoaded(true), 1000);
        }
      } catch (error) {
        console.error('Error loading Google Ad:', error);
        setAdFailed(true);
      }
    };

    // Check if adsbygoogle is loaded
    if (window.adsbygoogle) {
      loadAd();
    } else {
      // Set a timeout to check again
      const timer = setTimeout(() => {
        if (window.adsbygoogle) {
          loadAd();
        } else {
          setAdFailed(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [slot, layout]);

  // Render placeholder when ads fail to load
  if (adFailed) {
    return (
      <div className={`ad-placeholder ${className}`}>
        {layout === 'banner' ? (
          <div className="h-24 bg-gray-100 rounded flex items-center justify-center border border-gray-200 px-4">
            <span className="text-gray-400 text-sm">Advertisement</span>
          </div>
        ) : layout === 'rectangle' ? (
          <div className="h-64 w-full max-w-xs bg-gray-100 rounded flex items-center justify-center border border-gray-200">
            <span className="text-gray-400 text-sm">Advertisement</span>
          </div>
        ) : (
          <div className="h-32 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
            <span className="text-gray-400 text-sm">Advertisement</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={adRef} 
      className={`google-ad ${adLoaded ? 'ad-loaded' : 'ad-loading'} ${className}`}
      style={{
        minWidth: layout === 'responsive' ? '300px' : undefined,
        minHeight: layout === 'responsive' ? '250px' : undefined,
        width: layout === 'banner' ? '728px' : layout === 'rectangle' ? '300px' : '100%',
        height: layout === 'banner' ? '90px' : layout === 'rectangle' ? '250px' : 'auto'
      }}
    />
  );
};

export default GoogleAd;
