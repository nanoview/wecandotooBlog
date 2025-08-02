import { useEffect } from 'react';

interface GoogleSiteVerificationProps {
  verificationCode?: string;
  adsenseClientId?: string;
}

const GoogleSiteVerification: React.FC<GoogleSiteVerificationProps> = ({
  verificationCode,
  adsenseClientId
}) => {
  useEffect(() => {
    // Add Google Site Verification meta tag
    if (verificationCode) {
      const existingMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!existingMeta) {
        const meta = document.createElement('meta');
        meta.name = 'google-site-verification';
        meta.content = verificationCode;
        document.head.appendChild(meta);
      }
    }

    // Add AdSense script
    if (adsenseClientId) {
      const existingScript = document.querySelector('script[data-ad-client]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-ad-client', adsenseClientId);
        document.head.appendChild(script);
      }
    }
  }, [verificationCode, adsenseClientId]);

  return null;
};

export default GoogleSiteVerification;
