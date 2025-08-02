// WordPress-style Google Services Integration
// This allows the site owner to access Google data without requiring visitors to authenticate

import { googleConfig } from '@/config/google';

export class WordPressStyleGoogleServices {
  private static instance: WordPressStyleGoogleServices;

  static getInstance(): WordPressStyleGoogleServices {
    if (!WordPressStyleGoogleServices.instance) {
      WordPressStyleGoogleServices.instance = new WordPressStyleGoogleServices();
    }
    return WordPressStyleGoogleServices.instance;
  }

  // Initialize Google AdSense script (similar to WordPress AdSense plugins)
  initializeAdSense(): void {
    // Only load if AdSense is enabled and we have a client ID
    if (!googleConfig.adsenseClientId || googleConfig.adsenseClientId === 'ca-pub-0000000000000000') {
      console.warn('AdSense not configured');
      return;
    }

    // Check if script is already loaded
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      return;
    }

    // Load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleConfig.adsenseClientId}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    // Initialize window.adsbygoogle array
    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
  }

  // Initialize Google Analytics (similar to WordPress GA plugins)
  initializeAnalytics(): void {
    if (!googleConfig.analyticsId || googleConfig.analyticsId === 'G-XXXXXXXXXX') {
      console.warn('Google Analytics not configured');
      return;
    }

    // Check if script is already loaded
    if (document.querySelector('script[src*="gtag/js"]')) {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleConfig.analyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleConfig.analyticsId}');
    `;
    document.head.appendChild(inlineScript);
  }

  // Add site verification meta tag (similar to WordPress SEO plugins)
  addSiteVerification(): void {
    if (!googleConfig.siteVerification || googleConfig.siteVerification === 'your_verification_code') {
      return;
    }

    // Check if meta tag already exists
    if (document.querySelector('meta[name="google-site-verification"]')) {
      return;
    }

    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = googleConfig.siteVerification;
    document.head.appendChild(meta);
  }

  // Initialize all WordPress-style Google services
  initializeAll(): void {
    this.initializeAdSense();
    this.initializeAnalytics();
    this.addSiteVerification();
  }

  // Track page views (similar to WordPress analytics plugins)
  trackPageView(path?: string): void {
    if (typeof (window as any).gtag !== 'function') return;

    (window as any).gtag('config', googleConfig.analyticsId, {
      page_path: path || window.location.pathname
    });
  }

  // Track custom events (similar to WordPress analytics plugins)
  trackEvent(eventName: string, parameters?: any): void {
    if (typeof (window as any).gtag !== 'function') return;

    (window as any).gtag('event', eventName, {
      ...parameters,
      event_category: 'Blog',
      event_label: window.location.pathname
    });
  }

  // Get AdSense configuration for components
  getAdSenseConfig() {
    return {
      clientId: googleConfig.adsenseClientId,
      customerId: googleConfig.adsenseCustomerId,
      isEnabled: !!googleConfig.adsenseClientId && googleConfig.adsenseClientId !== 'ca-pub-0000000000000000'
    };
  }

  // WordPress-style ad slot helpers
  createAdSlot(slot: string, format: string = 'auto', responsive: boolean = true) {
    const config = this.getAdSenseConfig();
    if (!config.isEnabled) return null;

    return {
      client: config.clientId,
      slot: slot,
      format: format,
      responsive: responsive
    };
  }
}

// Global instance for easy access (similar to WordPress global functions)
export const wpGoogleServices = WordPressStyleGoogleServices.getInstance();

// Auto-initialize when module loads (similar to WordPress hooks)
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      wpGoogleServices.initializeAll();
    });
  } else {
    wpGoogleServices.initializeAll();
  }
}
