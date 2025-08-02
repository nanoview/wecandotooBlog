import { useEffect } from 'react';
import { googleConfig } from '@/config/google';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  slot: string;
  layout?: 'banner' | 'rectangle' | 'responsive';
  style?: React.CSSProperties;
  className?: string;
}

const GoogleAd = ({
  slot,
  layout = 'responsive',
  style = {},
  className = ''
}: GoogleAdProps) => {
  const adConfig = {
    isEnabled: !!googleConfig.adsenseClientId,
    clientId: googleConfig.adsenseClientId || 'ca-pub-2959602333047653'
  };

  const getAdSize = () => {
    switch (layout) {
      case 'banner':
        return { width: 610, height: 280 };
      case 'rectangle':
        return { width: 300, height: 250 };
      case 'responsive':
      default:
        return { width: 'auto', height: 'auto' };
    }
  };

  useEffect(() => {
    if (adConfig.isEnabled) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [adConfig.isEnabled]);

  if (!adConfig.isEnabled) {
    const size = getAdSize();
    return (
      <div 
        className={`border-2 border-dashed border-gray-300 p-4 text-center text-gray-500 ${className}`}
        style={{
          width: size.width,
          height: size.height,
          ...style
        }}
      >
        <p className="text-sm">Ad Space</p>
        <p className="text-xs mt-1">Layout: {layout}</p>
      </div>
    );
  }

  const size = getAdSize();
  const adStyle = {
    display: 'block',
    textAlign: 'center' as const,
    ...style,
    ...(layout !== 'responsive' ? size : {})
  };

  return (
    <div className={className} style={adStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adConfig.clientId}
        data-ad-slot={slot}
        data-ad-layout={layout === 'responsive' ? 'in-article' : undefined}
        data-ad-format={layout === 'responsive' ? 'fluid' : 'auto'}
        data-full-width-responsive={layout === 'responsive' ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAd;
