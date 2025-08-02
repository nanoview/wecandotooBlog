import { useEffect, useRef } from 'react';

interface SimpleAdProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'banner' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

const SimpleAd: React.FC<SimpleAdProps> = ({
  slot = '',
  format = 'auto',
  style = {},
  className = ''
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const ADSENSE_CLIENT_ID = 'ca-pub-2959602333047653';

  useEffect(() => {
    // Make sure AdSense script is loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      
      // Initialize after script loads
      script.onload = () => {
        window.adsbygoogle = window.adsbygoogle || [];
        setTimeout(() => {
          try {
            window.adsbygoogle.push({});
          } catch (error) {
            console.log('AdSense initialization error:', error);
          }
        }, 100);
      };
    } else {
      // Script already loaded, just push the ad
      try {
        window.adsbygoogle.push({});
      } catch (error) {
        console.log('AdSense push error:', error);
      }
    }
  }, []);

  const adStyles = {
    display: 'block',
    minHeight: format === 'banner' ? '90px' : format === 'rectangle' ? '250px' : '300px',
    ...style
  };

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={adStyles}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default SimpleAd;
