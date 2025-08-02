import { useEffect } from 'react';
import { wpGoogleServices } from '@/services/wordpressStyleGoogle';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = ''
}) => {
  const adConfig = wpGoogleServices.getAdSenseConfig();
  
  // Don't render if AdSense is disabled or not configured
  if (!adConfig.isEnabled) {
    return (
      <div className={`border-2 border-dashed border-gray-300 p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">Ad Space - Configure AdSense in .env</p>
        <p className="text-xs mt-1">Publisher ID: {adConfig.clientId || 'Not set'}</p>
      </div>
    );
  }

  useEffect(() => {
    try {
      // Push ad to AdSense queue (WordPress-style)
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={adConfig.clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
};

export default GoogleAd;
