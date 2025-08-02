import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AutoAdSenseProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AutoAdSense: React.FC<AutoAdSenseProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = ''
}) => {
  // Your AdSense Publisher ID - replace with your actual one
  const ADSENSE_CLIENT_ID = 'ca-pub-2959602333047653'; // Your actual AdSense ID

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize adsbygoogle array
    window.adsbygoogle = window.adsbygoogle || [];

    // Push ad configuration after a short delay to ensure script is loaded
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle.push({});
      } catch (error) {
        console.log('AdSense not ready yet, will retry...');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AutoAdSense;
